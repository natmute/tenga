import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_BASE = "https://api.resend.com";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await supabaseAuth.auth.getUser();
    if (!caller) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const shopId = body?.shop_id ?? body?.shopId;
    const subject = body?.subject;
    const messageBody = body?.body ?? body?.html ?? body?.text ?? "";
    const audience = body?.audience ?? ["followers"]; // 'followers' | 'customers' or array of both

    if (!shopId || typeof shopId !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing shop_id in body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return new Response(
        JSON.stringify({ error: "Subject is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (typeof messageBody !== "string" || !messageBody.trim()) {
      return new Response(
        JSON.stringify({ error: "Message body is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audiences = Array.isArray(audience) ? audience : [audience];
    const wantFollowers = audiences.some((a: string) => String(a).toLowerCase() === "followers");
    const wantCustomers = audiences.some((a: string) => String(a).toLowerCase() === "customers");
    if (!wantFollowers && !wantCustomers) {
      return new Response(
        JSON.stringify({ error: "audience must include 'followers' and/or 'customers'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: shop } = await supabaseAdmin
      .from("shops")
      .select("id, owner_id, name")
      .eq("id", shopId)
      .maybeSingle();
    if (!shop || shop.owner_id !== caller.id) {
      return new Response(
        JSON.stringify({ error: "Shop not found or you are not the owner" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailsSet = new Set<string>();

    if (wantFollowers) {
      const { data: followers } = await supabaseAdmin
        .from("shop_followers")
        .select("user_id")
        .eq("shop_id", shopId);
      const userIds = [...new Set((followers ?? []).map((r: { user_id: string }) => r.user_id))];
      for (const uid of userIds) {
        const { data: u } = await supabaseAdmin.auth.admin.getUserById(uid);
        const email = u?.data?.user?.email;
        if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) emailsSet.add(email);
      }
    }

    if (wantCustomers) {
      const { data: orders } = await supabaseAdmin
        .from("orders")
        .select("customer_email")
        .eq("shop_id", shopId)
        .not("customer_email", "is", null);
      for (const row of orders ?? []) {
        const email = (row as { customer_email: string | null }).customer_email;
        if (email && typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          emailsSet.add(email);
        }
      }
    }

    const emails = [...emailsSet];
    if (emails.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: "No recipients found for the selected audience(s)." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const from = Deno.env.get("PROMO_FROM_EMAIL") || "Tenga <onboarding@resend.dev>";
    const html = messageBody.includes("<") ? messageBody : `<p>${messageBody.replace(/\n/g, "<br/>")}</p>`;

    const BATCH_SIZE = 100;
    let sent = 0;
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const chunk = emails.slice(i, i + BATCH_SIZE);
      const batchPayload = chunk.map((to) => ({
        from,
        to: [to],
        subject: subject.trim(),
        html,
      }));
      const res = await fetch(`${RESEND_BASE}/emails/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify(batchPayload),
      });
      if (!res.ok) {
        const errText = await res.text();
        return new Response(
          JSON.stringify({ error: "Resend error", details: errText, sent }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const result = await res.json();
      const ids = result?.data ?? [];
      sent += Array.isArray(ids) ? ids.length : 0;
    }

    return new Response(
      JSON.stringify({ sent, message: `Promotional email sent to ${sent} recipient(s).` }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

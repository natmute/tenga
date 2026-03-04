# Edge Functions

## send-shop-confirmation

Sends the "Your shop is being set up" email when someone submits the Open Shop form. Uses [Resend](https://resend.com) (same approach as Supabase’s email examples).

### 1. Get a Resend API key

1. Sign up at [resend.com](https://resend.com).
2. In the dashboard, go to **API Keys** and create a key.
3. Copy the key (starts with `re_`).

### 2. Add the secret in Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Project Settings** (gear) → **Edge Functions**.
3. Under **Secrets**, add:
   - **Name:** `RESEND_API_KEY`
   - **Value:** your Resend API key

### 3. Deploy the function

From your project root (where `supabase/` is):

```bash
npx supabase functions deploy send-shop-confirmation
```

If the Supabase CLI isn’t linked yet:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy send-shop-confirmation
```

Find **Project ref** in Dashboard → Project Settings → General.

### 4. Sender address

The function sends from `Tenga <onboarding@resend.dev>`. Resend’s free tier allows this for testing. For production, verify your own domain in Resend and change the `from` address in `send-shop-confirmation/index.ts` to e.g. `Tenga <noreply@yourdomain.com>`.

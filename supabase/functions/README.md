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

## send-promotional-email

Sends promotional emails to a shop’s followers and/or past customers. Uses the same Resend API key (`RESEND_API_KEY`). Only the shop owner can call this function.

### Body (JSON)

- `shop_id` (required) – UUID of the shop.
- `subject` (required) – Email subject.
- `body` (required) – Message body (plain text or HTML).
- `audience` (optional) – `"followers"`, `"customers"`, or both in an array. Default: `["followers"]`.

### Recipients

- **Followers**: users in `shop_followers` for this shop; emails are resolved via Auth Admin.
- **Past customers**: distinct `customer_email` from `orders` for this shop.

### Deploy

```bash
npx supabase functions deploy send-promotional-email
```

Optional secret for sender address (defaults to `Tenga <onboarding@resend.dev>`):

- **Name:** `PROMO_FROM_EMAIL`  
- **Value:** e.g. `Your Shop <noreply@yourdomain.com>`

## send-admin-promo-to-store-owners

Admin-only. Sends a promotional or announcement email to **store owners** (shop owners). Optionally filter by **pricing tier** (Starter, Growth, Enterprise) so you can target e.g. only Growth tier sellers.

### Body (JSON)

- `subject` (required) – Email subject.
- `body` (required) – Message body (plain text or HTML).
- `tier` (optional) – `"all"` (default), `"starter"`, `"growth"`, or `"enterprise"`. Only shop owners whose shop has that `pricing_tier` receive the email.

Uses the same `RESEND_API_KEY` and optional `PROMO_FROM_EMAIL` as above.

### Deploy

```bash
npx supabase functions deploy send-admin-promo-to-store-owners
```

### 4. Sender address

The function sends from `Tenga <onboarding@resend.dev>`. Resend’s free tier allows this for testing. For production, verify your own domain in Resend and change the `from` address in `send-shop-confirmation/index.ts` to e.g. `Tenga <noreply@yourdomain.com>`.

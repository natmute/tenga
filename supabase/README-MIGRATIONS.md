# Running migrations / seed SQL

Your Supabase database changes live in **`supabase/migrations/`**. To apply them, use one of the options below.

**Migrations included:**
- **Seed categories** (`20260303000000_seed_categories.sql`) – inserts the 8 categories for the Open Shop form.
- **Storage policies for shop-assets** (`20260303100000_storage_shop_assets_policies.sql`) – lets authenticated users upload logos/banners and allows public read. Create the bucket first: Storage → New bucket → name `shop-assets`, Public: ON, then run this migration.

---

## Option 1: Supabase Dashboard (no CLI, recommended)

Use this if you just want to run the categories seed (or any migration) once.

1. Open **[Supabase Dashboard](https://supabase.com/dashboard)** and sign in.
2. Select your **project** (the one used by this app).
3. In the left sidebar, click **SQL Editor**.
4. Click **New query**.
5. Copy the contents of **`supabase/migrations/20260303000000_seed_categories.sql`** and paste them into the editor.
6. Click **Run** (or press Ctrl+Enter / Cmd+Enter).
7. You should see a success message. The categories table will now have the 8 categories (Fashion, Electronics, etc.) so the Open Shop form can set `category_id` correctly.

You can run the same SQL again later; it only inserts rows when a slug is missing, so it won’t create duplicates.

---

## Option 2: Supabase CLI

Use this if you use the Supabase CLI and want to apply all pending migrations (including the seed).

1. Install the CLI if needed:
   ```bash
   npm install -g supabase
   ```
2. In your project folder (where `supabase/` lives), link to your remote project once:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   (Find **Project ref** in Dashboard → Project Settings → General.)
3. Push migrations to the remote database:
   ```bash
   supabase db push
   ```
   This runs any migration in `supabase/migrations/` that hasn’t been applied yet (including the categories seed).

---

## If the `categories` table doesn’t exist

The seed file only **inserts** into `public.categories`. If that table doesn’t exist yet, create it first in the SQL Editor (Dashboard → SQL Editor) with the same columns as in `src/integrations/supabase/types.ts` (e.g. `id`, `name`, `slug`, `icon`, `created_at`), then run the seed SQL as in Option 1.

# Tenga — Documentation

**Tenga** is a social e-commerce web app that brings your favorite shops into one place. Shoppers can discover shops and products, follow shops, manage a cart and wishlist, and place orders. Sellers can open and manage shops, list products, and fulfill orders. Admins can approve shops and manage the platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Features](#features)
7. [Routes & Pages](#routes--pages)
8. [Data Model](#data-model)
9. [Backend (Supabase)](#backend-supabase)
10. [Testing](#testing)
11. [Build & Deploy](#build--deploy)

---

## Overview

- **Name:** Tenga  
- **Tagline:** Your favorite shops, all in one place  
- **Purpose:** A single place to browse shops, products, and categories; follow shops; add to cart and wishlist; checkout; and (for sellers) run a shop and (for admins) moderate the platform.

**User roles:**

- **Shopper** — Browse, search, follow shops, cart, wishlist, checkout, orders, profile.  
- **Seller** — Everything a shopper can do, plus open a shop, manage products, and view a seller dashboard and orders.  
- **Admin** — Approve shops, manage users/shops, and access the admin dashboard.

---

## Tech Stack

| Layer        | Technology |
|-------------|------------|
| Framework   | React 18   |
| Build       | Vite 5     |
| Language    | TypeScript |
| Styling     | Tailwind CSS |
| UI          | shadcn/ui (Radix primitives) |
| Routing     | React Router 6 |
| Data / API  | Supabase (PostgreSQL, Auth, Storage) |
| State       | React Query (TanStack Query), React Context (cart, wishlist, theme) |
| Forms       | React Hook Form + Zod |
| Icons       | Lucide React |
| Animations  | Framer Motion |

---

## Project Structure

```
shop-social/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images, logos
│   ├── components/
│   │   ├── home/           # Hero, categories, featured shops, trending, promo
│   │   ├── layout/         # Header, Footer, CartDrawer
│   │   ├── shop/           # ShopCard, etc.
│   │   └── ui/             # shadcn components (button, card, dialog, etc.)
│   ├── context/            # CartContext, WishlistContext, ThemeContext
│   ├── data/               # Mock/seed data (mockData, reviewsData)
│   ├── hooks/              # useAuth, useToast, use-mobile
│   ├── integrations/
│   │   └── supabase/       # client.ts, types.ts
│   ├── pages/              # Route-level pages (see Routes & Pages)
│   ├── types/              # Shared TypeScript types (Shop, Product, CartItem, etc.)
│   ├── lib/                # utils (e.g. cn)
│   ├── App.tsx             # Router + providers
│   ├── main.tsx            # Entry point
│   └── index.css           # Global + Tailwind
├── supabase/
│   ├── migrations/         # SQL migrations (schema, RLS, seeds)
│   ├── functions/          # Edge functions (e.g. delete-user)
│   └── config.toml         # Local Supabase config
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── DOCUMENTATION.md        # This file
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (recommended: install via [nvm](https://github.com/nvm-sh/nvm))
- **npm** (or yarn/pnpm)
- A **Supabase** project (for auth, database, storage)

### Install and run

```bash
# Clone the repo
git clone <YOUR_GIT_URL>
cd shop-social

# Install dependencies
npm install

# Configure environment (see Environment Variables)
cp .env.example .env
# Edit .env and set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY

# Start dev server (default: http://localhost:8080)
npm run dev
```

### Optional: Supabase locally

To run Supabase locally (e.g. for migrations or edge functions):

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase (from project root)
supabase start
```

Use the local URL and anon key in `.env` when developing against local Supabase.

---

## Environment Variables

Create a `.env` file in the project root. The app expects:

| Variable                     | Description |
|-----------------------------|-------------|
| `VITE_SUPABASE_URL`         | Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous/public key (safe for frontend) |

All client-side env vars must be prefixed with `VITE_` so Vite exposes them to the app.

---

## Features

### Shoppers

- **Home:** Hero, categories, featured shops, trending products, promo banner.  
- **Discover / Search:** Search and filter products and shops.  
- **Shops & categories:** Browse by shop and category.  
- **Product pages:** Product detail, variants, add to cart, add to wishlist, reviews.  
- **Cart:** Cart drawer, update quantity, remove items, go to checkout.  
- **Wishlist:** Saved products (persisted when logged in).  
- **Checkout:** Shipping and contact info, place order.  
- **Orders:** Order history and confirmation.  
- **Following:** Shops the user follows.  
- **Profile:** Account and preferences (when logged in).  
- **Auth:** Sign up / sign in (Supabase Auth).

### Sellers

- **Open a shop:** Apply to create a shop (name, logo, banner, bio, category, etc.).  
- **Seller dashboard:** Manage shop, products, and orders.  
- **Orders:** View and update order status, shipping, and customer details.

### Admins

- **Admin dashboard:** Overview of shops, users, and approvals.  
- **Shop approval:** Approve or reject pending shops.  
- **Policies:** Admin-only RLS and roles (see `supabase/migrations`).

### Global

- **Theme:** Light/dark mode (ThemeContext).  
- **Responsive layout:** Header, footer, mobile menu.  
- **Toasts:** Success/error feedback (Sonner + custom toasts).

---

## Routes & Pages

| Path | Page | Description |
|------|------|-------------|
| `/` | Index | Home (hero, categories, featured shops, trending, promo) |
| `/shops` | ShopsPage | List of shops |
| `/shop/:slug` | ShopPage | Single shop and its products |
| `/discover` | DiscoverPage | Discover products/shops |
| `/search` | SearchPage | Search (query param `?q=`) |
| `/product/:slug` | ProductPage | Product detail |
| `/product/:slug/reviews` | ReviewPage | Product reviews |
| `/categories` | CategoriesPage | Categories listing |
| `/trending` | TrendingPage | Trending products |
| `/checkout` | CheckoutPage | Checkout flow |
| `/order-confirmation` | OrderConfirmationPage | Post-checkout confirmation |
| `/open-shop` | OpenShopPage | Apply to open a shop |
| `/auth` | AuthPage | Sign in / sign up |
| `/help-center` | HelpCenterPage | Help content |
| `/contact-us` | ContactUsPage | Contact form |
| `/contact-sales` | ContactSalesPage | Sales contact |
| `/privacy-policy` | PrivacyPolicyPage | Privacy policy |
| `/terms-of-service` | TermsOfServicePage | Terms of service |
| `/seller-dashboard` | SellerDashboardPage | Seller dashboard |
| `/admin` | AdminDashboardPage | Admin dashboard |
| `/pricing` | PricingPage | Pricing info |
| `/success-stories` | SuccessStoriesPage | Success stories |
| `/wishlist` | WishlistPage | User wishlist |
| `/orders` | OrderHistoryPage | Order history |
| `/following` | FollowingPage | Followed shops |
| `/profile` | ProfilePage | User profile |
| `*` | NotFound | 404 page |

---

## Data Model

Main concepts (see `src/types/index.ts` and `src/integrations/supabase/types.ts` for full definitions):

- **Shop** — Name, slug, logo, banner, bio, category, rating, follower count, product count, verification, location, contact.  
- **Product** — Name, slug, price, images, description, category, variants, stock, rating, likes.  
- **CartItem** — Product, shop, quantity, selected variants.  
- **Category** — Name, slug, icon, product count.  
- **Review** — Product, user, rating, comment, images.  
- **Order** — User, shop, status, total, shipping/contact fields, order number.

Database tables (Supabase) include: `profiles`, `shops`, `products`, `product_images`, `categories`, `cart_items`, `orders`, `order_items`, `reviews`, `shop_followers`, `product_likes`, and related policies (RLS). See `supabase/migrations/` and `src/integrations/supabase/types.ts` for the full schema.

---

## Backend (Supabase)

- **Auth:** Supabase Auth (email/password, session in `localStorage`, `onAuthStateChange` in `useAuth`).  
- **Database:** PostgreSQL with Row Level Security (RLS). Policies control access by role (user, seller, admin) and resource ownership.  
- **Storage:** e.g. `shop-assets` bucket for shop logos/banners (see migrations for policies).  
- **Migrations:** All schema/RLS changes live in `supabase/migrations/`.  
  - Apply via **Supabase Dashboard → SQL Editor** (paste and run each migration), or  
  - Use **Supabase CLI:** `supabase link --project-ref YOUR_REF` then `supabase db push`.  
- **Seeds:** e.g. `20260303000000_seed_categories.sql` seeds categories for the Open Shop form.  
- **Edge functions:** e.g. `delete-user` for account deletion.  
- **Docs:** See `supabase/README-MIGRATIONS.md` for migration and seed instructions.

---

## Testing

- **Runner:** Vitest.  
- **Commands:**  
  - `npm run test` — single run.  
  - `npm run test:watch` — watch mode.  
- **Location:** Tests live next to source or in `src/test/` (e.g. `example.test.ts`).  
- **Lint:** `npm run lint` (ESLint).

---

## Build & Deploy

- **Production build:**  
  `npm run build`  
  Output: `dist/` (default Vite output).

- **Development build:**  
  `npm run build:dev`  
  Uses Vite `--mode development`.

- **Preview production build locally:**  
  `npm run preview`

- **Deploy:** Serve the `dist/` folder with any static host (Vercel, Netlify, Cloudflare Pages, etc.). Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set in the host’s environment for the build.

---

## Quick Reference

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Test | `npm run test` |
| Build | `npm run build` |
| Preview build | `npm run preview` |

For migration and database setup details, see **Backend (Supabase)** and `supabase/README-MIGRATIONS.md`.

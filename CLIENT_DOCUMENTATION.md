# Tenga Virtual Mall — Client Overview

**Document purpose:** This document gives you a clear picture of how the Tenga app works, what has been delivered so far, and what remains to reach a full launch. It is aligned with our 30-day agile development journal.

---

## 1. How the App Works

Tenga is a **virtual mall**: one place where shoppers discover multiple shops and products, and where sellers run their own “stalls” (shops). Below is how each type of user experiences the app.

---

### Shoppers (Buyers)

| Step | What they do |
|------|-------------------------------|
| **Discover** | Land on the homepage (hero, categories, featured shops, trending products). Use **Discover** and **Search** to find products and shops. |
| **Browse** | Open **Shops** or **Categories**, click into a shop or product to see details, images, variants, and reviews. |
| **Save & follow** | Add products to **Wishlist** and **follow** shops they like. |
| **Cart** | Add items to the cart (with variants when available). Open the cart drawer to change quantity or remove items. |
| **Checkout** | Go to **Checkout**, enter shipping and contact details, choose shipping method. Place order and see **Order Confirmation**. |
| **Orders** | View **Order History** and order status. |
| **Account** | Sign up / sign in (**Auth**). Manage **Profile** and see **Following** (shops they follow). |

So far, **payment at checkout is not yet connected** to a bank or payment gateway: the flow captures the order and shipping details; payment is currently described as “collected upon delivery or at pickup” (placeholder).

---

### Sellers (Vendors / Shop Owners)

| Step | What they do |
|------|-------------------------------|
| **Open a shop** | Use **Open Shop**: enter shop details, upload logo and banner, pick a category, review and submit. New shops wait for **admin approval** before going live. |
| **Seller dashboard** | Once approved, manage the shop: **Products** (add, edit, images), **Orders** (view, update status, see customer/shipping info), **Reviews** (see and reply to product reviews), and **Shop contact** (email, phone). |
| **Visibility** | Shops appear in the mall (homepage, Discover, Shops, Categories). Shoppers can follow the shop and buy products. |

Subscription billing (e.g. “rent” for the stall) and automatic commission/payout are **not yet implemented**; the app is ready for that logic to be plugged in.

---

### Admins (Tenga Team)

| Step | What they do |
|------|-------------------------------|
| **Admin dashboard** | View **pending shops** (awaiting approval), **all shops**, and **users**. Approve or reject new shops. Manage user roles and delete users/shops when needed. |
| **Control** | Only users with the **admin** role can access the admin dashboard; permissions are enforced in the database (Row Level Security). |

---

## 2. What Has Been Accomplished

The following reflects what is **built and working** in the current codebase, mapped to the 30-day plan where relevant.

---

### Week 1 — Design & Frontend Foundations ✅

| Delivered | Status |
|-----------|--------|
| **Tech stack** | Vite, TypeScript, Tailwind CSS, React, shadcn/ui — project set up with strict typing and no lint errors. |
| **UI component library** | Reusable components (buttons, cards, inputs, dialogs, tabs, etc.) used across the app. |
| **Landing page / “Mall entrance”** | Homepage with hero, category section, featured shops, trending products, and promo banner — responsive. |
| **Data–component mapping** | Clear types for Shop, Product, Cart, Category, Review, Order; frontend is wired to these. |

---

### Week 2 — Frontend Logic & Supabase Integration ✅

| Delivered | Status |
|-----------|--------|
| **Navigation & routing** | Full routing: Home, Shops, Shop by slug, Discover, Search, Product, Reviews, Categories, Trending, Checkout, Order Confirmation, Open Shop, Auth, Help, Contact, Legal pages, Seller Dashboard, Admin, Pricing, Success Stories, Wishlist, Orders, Following, Profile, 404. |
| **Supabase & auth** | Supabase project connected. **Sign up, login, logout** work; session is persisted; auth state is used across the app (e.g. cart, wishlist, protected routes). |
| **Database & security (RLS)** | Core tables and Row Level Security in place: profiles (with role), shops, products, product_images, categories, cart_items, orders, order_items, reviews, shop_followers, product_likes, seller policies, admin policies. Migrations are versioned and documented. |
| **Live data** | Product cards, shop listings, and product/shop detail pages load from Supabase (no static mock data for core flows). Loading and error handling (e.g. skeletons, toasts) in place. |
| **Vendor product uploads** | Sellers can **add products** (name, price, description, image) from the Seller Dashboard; images go to Supabase Storage; data is saved to the database. |
| **Roles** | **User**, **Seller** (shop owner), and **Admin** roles implemented in the database and used in the UI (e.g. admin dashboard, open-shop flow). |

---

### Week 3 — Monetization & Bank API (Partial) ⚠️

| Delivered | Status |
|-----------|--------|
| **Checkout UI** | Checkout page built: cart summary, shipping/contact form (validation), shipping method selection, order total. **Place order** creates an order in the database and redirects to Order Confirmation. |
| **Order management** | Orders stored with order number, customer and shipping details. Shoppers see **Order History**; sellers see orders in the **Seller Dashboard** and can update status. |
| **Pricing page** | Pricing tiers (Basic / Premium / Enterprise) and commission structure (e.g. 2% / 1.5% / 1%) are **designed and displayed**; no automated billing yet. |
| **Bank API integration** | **Not implemented.** No handshake, no payment processing, no commission/payout logic, no subscription billing, no bank webhooks. |

So: **shopping and order flow work end-to-end except real payment**; money movement and subscription “rent” are still to do.

---

### Week 4 — Polish & Launch (Partial) ⚠️

| Delivered | Status |
|-----------|--------|
| **UI polish & animations** | Framer Motion and Tailwind used for transitions and hover states; layout is responsive (including mobile menu). |
| **TypeScript & robustness** | Typed data flows; 404 and auth guards in place; form validation (e.g. Zod on checkout). |
| **Search** | Search page and query parameter (`?q=`) work; results are driven by existing Supabase data. (Advanced full-text search / typo tolerance can be added later.) |
| **SEO / meta** | Basic meta tags (title, description, OG) on the main HTML; per-store or per-product meta can be extended. |
| **Vendor onboarding** | Open Shop is a clear multi-step flow (details → branding → category → review). A separate “Quick Start” tutorial (e.g. 3-step modal) is **not** built yet. |
| **Deployment** | App can be built (`npm run build`) and served as a static frontend; production deployment (e.g. Vercel) and Supabase production mode are **environment/config** steps. |
| **E2E testing & launch** | No automated E2E suite or formal “Day 28” full-flow test documented here; manual testing is assumed. |

---

## 3. What Still Needs to Be Accomplished

These items are **outstanding** to reach the full vision described in the development journal.

---

### High priority (money & trust)

| # | Item | Notes |
|---|------|--------|
| 1 | **Bank API integration** | Secure handshake and session with the bank API; credentials via env/secrets, never stored in the app. |
| 2 | **Payment at checkout** | Replace “payment on delivery/pickup” with real payment (e.g. redirect or embedded flow) using the Bank API or chosen payment provider. |
| 3 | **Commission & payout logic** | Server-side (e.g. Supabase Edge Functions) calculation of Tenga’s commission and vendor share; store split amounts with the transaction; avoid rounding errors (e.g. work in cents). |
| 4 | **Transaction confirmation** | When the bank confirms payment (e.g. via webhook), update order status and optionally notify user/seller; target &lt; 2s from confirmation to UI update (e.g. using Supabase Realtime). |
| 5 | **Subscription billing (“rent”)** | Recurring billing for shop subscriptions (e.g. Basic/Premium) via Bank API; handle failed payments and retries; notify vendors. |

---

### Medium priority (product completeness)

| # | Item | Notes |
|---|------|--------|
| 6 | **Vendor onboarding tutorial** | In-dashboard “Quick Start” (e.g. 3-step modal) so new vendors can set up in under a few minutes. |
| 7 | **Full-text search** | Improve search with Postgres full-text (e.g. GIN index) for speed and better matching as data grows. |
| 8 | **SEO per store/product** | Dynamic meta tags (and optionally structured data) for each shop and product page for better indexing. |

---

### Before go-live

| # | Item | Notes |
|---|------|--------|
| 9 | **Production deployment** | Deploy frontend to production (e.g. Vercel), point to production Supabase, use production Bank API credentials from a secret manager. |
| 10 | **End-to-end testing** | Formal pass: “Brand signup → open shop → admin approval → add product → customer purchase → payment → confirmation” on the live stack. |
| 11 | **Launch materials** | Demo video and any marketing assets as in “Day 29” of the journal. |

---

## 4. Summary Table

| Area | Accomplished | Remaining |
|------|--------------|-----------|
| **Design & frontend** | Landing, components, routing, responsive layout, animations | Optional extra polish |
| **Auth & users** | Sign up, login, logout, roles (user/seller/admin) | — |
| **Shops & products** | Open Shop, approval, product CRUD, images, categories | Vendor onboarding tutorial |
| **Shopping** | Browse, search, cart, wishlist, follow shops, checkout UI, order creation | **Real payment** |
| **Orders** | Create order, order history, seller order list, status updates | **Payment confirmation & webhooks** |
| **Admin** | Approve/reject shops, view users/shops, role management | — |
| **Money** | Pricing page, commission tiers (display only) | **Bank API, payments, commission/payout, subscription billing** |
| **Launch** | Build, preview, docs | **Deploy, E2E, launch materials** |

---

## 5. Document Control

- **Title:** Tenga Virtual Mall — Client Overview  
- **Audience:** Client / stakeholder  
- **Source:** Development journal (30-day agile) + current codebase  
- **Last aligned:** With codebase and `DOCUMENTATION.md` (technical reference for developers)

For technical details (setup, env vars, routes, data model, Supabase), see **DOCUMENTATION.md**.

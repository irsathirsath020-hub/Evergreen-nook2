# Evergreen Nook — Vercel-ready storefront

Self-contained Vite/React export of the Evergreen Nook luxury natural beauty storefront.

## Run locally

```bash
pnpm install
pnpm dev
```

## Deploy with GitHub + Vercel

Push this folder to GitHub, then import the repository in Vercel. The included `vercel.json` sets the Vite build command, output directory, and SPA fallback.

```bash
gh repo create evergreen-nook-vercel --private --source . --remote origin --push
pnpm install
pnpm build
```

## Static export note

Cart, product guides, newsletter feedback, and the text-only Nook Expert demo work in the browser. The demo checkout does not process payments or send live dashboard/WhatsApp alerts. Connect a Vercel Function, Shopify checkout, Stripe, or another backend before accepting live orders.

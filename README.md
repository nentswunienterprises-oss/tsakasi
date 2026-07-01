# Tsa Kasi Logistics Site

Multi-page React + TypeScript site for Tsa Kasi Logistics' Waterberg validation stage.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Routes

- `/` problem-led homepage
- `/businesses` merchant-focused case
- `/partners` platform and courier case
- `/model` infrastructure model
- `/pilot` Business Delivery Interview Form
- `/pilot/thank-you` submission confirmation

## Deployment notes

- The frontend is built with Vite and React Router.
- `vercel.json` rewrites SPA routes to `index.html`.
- The form posts to `/api/business-pilot`.
- Set `PILOT_WEBHOOK_URL` in Vercel to forward submissions into Airtable, HubSpot, Zapier, Make, or another workflow endpoint.
- In local `vite` development, the form falls back to browser storage if the API route is unavailable.
- For sent email logo rendering across Gmail/mobile, set `VITE_EMAIL_LOGO_URL` to a public `https://` image URL (PNG recommended), e.g. `https://www.tsakasilogistics.co.za/brand/tsa-kasi-logo.png`.
- Draft persistence now syncs to Supabase via `api/document-drafts`. Ensure `SUPABASE_SERVICE_KEY` and `VITE_SUPABASE_URL` are set in production, and apply migration `supabase/migrations/002_create_document_composer_drafts.sql`.

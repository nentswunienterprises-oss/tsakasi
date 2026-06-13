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

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# VED-TRAVELS Permanent Architecture & Consumer Design Directives

## 1. Aesthetic Direction: Daylight Consumer Marketplace
- **Theme:** Bright, Clean, Trustworthy Daylight Consumer UI (inspired by Airbnb, Turo, Zoomcar, and Royal Brothers).
- NO dark/black background canvas, NO sharp 0px edges, NO techy/crypto vibe.
- Clean white cards, smooth rounded corners, soft natural shadows, and friendly accessible controls.

## 2. Color Palette
- **Page Canvas:** Crisp Warm Alabaster/Slate (`#F8FAFC`).
- **Cards & Surfaces:** Pure White (`#FFFFFF`).
- **Primary Brand Accent:** Zoomcar/Mobility Emerald Green (`#059669` / `#10B981`) for primary CTA buttons, trust badges, instant booking, and active filters.
- **Secondary Accent:** Warm Sunset Amber / Coral (`#F59E0B` / `#EA580C`) for "Host & Earn" highlights, popular badges, and special promotions.
- **Typography Colors:**
  - Deep Slate (`#0F172A`) for primary headings and prominent titles.
  - Muted Slate (`#475569` / `#64748B`) for specs, secondary labels, and descriptive text.
- **Borders & Dividers:** Clean, subtle hairline slate (`1px solid #E2E8F0`).

## 3. Shapes & Elevation
- Smooth rounded corners (`rounded-2xl` and `rounded-3xl`).
- Soft natural card shadows (`shadow-sm hover:shadow-xl transition-all duration-300`).
- Touch-friendly button heights (`h-11`, `h-12`) with smooth micro-interactions.

## 4. Typography
- **Headings & Body:** 'Plus Jakarta Sans' and 'Inter' — clean, friendly, consumer-grade typography with high legibility across mobile and desktop.
- **Currency & Numbers:** Tabular numbers for prices (`₹`) and 4-digit handover OTPs.

## 5. Single Pickup Hub Rule
- All vehicles belong to our single central hub:
  **Vadodara Main Hub (Sayajigunj / Alkapuri Central Hub, Vadodara)** (Opposite Vadodara Junction / RC Dutt Road).
- Optional Add-on: **"Add Doorstep Delivery (+₹199)"** available at checkout for Home / Railway Station delivery anywhere in Vadodara.

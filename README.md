# Ledgerly invoice automation UI

React 18, TypeScript, Vite, React Router DOM, Tailwind CSS, Radix-backed Shadcn-style UI primitives, and Tremor data components.

## Run locally

```sh
npm install
npm run dev
```

The production build is `npm run build`; preview it with `npm run preview`.

## Routes and test flow

- `/login` - first page; sign in or switch to the demo account-creation form.
- `/landing` - product landing page shown after demo sign-in.
- `/capture` - landing page call to action opens invoice upload and review.
- `/pairing` - enter a short code and view simulated workstation connection states.
- `/dashboard` - view invoice KPIs and Tremor table, run the fixed-menu query preview, and export CSV.

## Project structure

```text
src/
  components/ui.tsx       Radix-backed buttons, inputs, cards, dialogs, and toast provider
  context/InvoiceContext.tsx
  lib/utils.ts            Tailwind class helper
  pages/
    auth/LoginPage.tsx
    marketing/LandingPage.tsx
    workspace/PairingPage.tsx
    workspace/CapturePage.tsx
    workspace/DashboardPage.tsx
  types.ts                Invoice and extraction confidence types plus demo data
  App.tsx                 Shared workspace layout and route definitions
  main.tsx                Providers and application entry point
  index.css               Tailwind and Shadcn CSS variables
tailwind.config.cjs       Tailwind and Tremor theme
postcss.config.cjs
```

## Prototype boundaries

This is a frontend-only MVP preview. Pairing accepts any six-character code and does not perform an agent handshake. The capture page demonstrates review using sample extraction data; it does not run OCR or save the original file. Confirmed invoice records are stored in browser local storage rather than a PC agent or SQLite database. Chat suggestions use deterministic local handlers; overdue and cash-paid answers require due-date and settlement fields that are not in the invoice schema.

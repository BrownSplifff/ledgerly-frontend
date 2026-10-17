# Ledgerly frontend

React, TypeScript, Vite, Tailwind CSS, React Router, Shadcn-style UI primitives, and Tremor components for an invoice capture and review interface.

## Run locally

- `npm install`
- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm run preview`

## Routes

- `/login` — sign-in and account creation UI. Authentication is not connected.
- `/landing` — product overview and links into invoice workflows.
- `/pairing` — workstation pairing UI. The desktop agent and pairing service are not connected.
- `/capture` — attach a PDF or image, manually enter invoice data, review totals, and save the record. OCR/extraction is not connected.
- `/dashboard` — search and filter saved invoices, view metrics, use supported read-only queries, and export CSV.

## Current data behavior

Invoice records are stored in this browser's local storage. Clearing browser storage removes them, and they do not sync between devices. The app contains no seeded invoice records or simulated extraction or pairing. Sign-in uses a fixed local-only test account (`account@ledgerly.local` / `Ledgerly123!`) and is not secure authentication. Uploaded documents remain in the browser session and are not uploaded to a server.

This frontend is not ready for production financial data: authentication, server-side storage, desktop-agent pairing, document extraction, and deployment security still need implementation and review.

## API boundary

`src/api/client.ts` contains the frontend service functions. Replace the unavailable authentication, pairing, and extraction operations with calls to the backend when it is ready. Invoice persistence currently uses browser storage.

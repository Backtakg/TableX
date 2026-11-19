# TABLEX

**Find your table.** TABLEX is a Nepal-first restaurant table discovery and reservation marketplace. Restaurants publish available tables and diners discover and request a reservation.

## Product direction

The first release focuses on the pure marketplace model:
- Restaurants list specific available tables and time slots.
- Diners discover participating restaurants and request a table.
- Restaurants control inventory, availability windows and pricing.
- TABLEX can earn a commission on completed reservations.

## Current prototype

The current frontend is an interactive, responsive product prototype built with:
- React 18 + TypeScript
- Vite
- Framer Motion
- Lucide icons
- Custom responsive CSS

### Included in this first UI build
- Restaurant discovery landing page
- Search by restaurant, cuisine or area
- Cuisine / area category filters
- Sort by recommended, price, deal and rating
- Restaurant cards with availability, pricing and sample discounts
- Restaurant detail and reservation-request preview modal
- Guest-count stepper
- Saved restaurants interaction
- Restaurant partner onboarding form
- Responsive mobile layout and reduced-motion support

## Run locally

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
npm run preview
```

## Prototype demo mode

Demo mode is enabled by default (`VITE_DEMO_MODE=true`). It is designed for presentations and safe walkthroughs:
- Shows six illustrative Bharatpur restaurant listings even when Supabase credentials are configured.
- Reservation requests display a local success state only; they never create a database record or contact a restaurant.
- The interface displays a persistent prototype notice so viewers know the data is illustrative.
- Partner interest form remains frontend-only. Owner and admin workspaces remain protected Supabase-backed areas for internal testing.
- No payment collection is implemented.

To test the connected marketplace flow, set `VITE_DEMO_MODE=false` in the environment and provide the Supabase variables. Do not use real customer data during demonstrations.

## Next engineering milestones

1. Polish the guided customer, restaurant-partner and admin demonstration flows.
2. Prepare a repeatable demo dataset and a short presentation walkthrough.
3. Validate the prototype with a few restaurant owners and collect feedback.
4. Keep payments, paid notifications and production infrastructure out of scope until validation.

## Product principles

- Never show sample availability as live inventory.
- A table slot must be held atomically before confirming a reservation.
- A restaurant must be able to close or edit its inventory quickly.
- Make fees, cancellation rules and any deposit clear before the customer confirms.
- Launch with a small, verified restaurant pilot before expanding across Nepal.

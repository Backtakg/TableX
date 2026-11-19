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

## Important prototype notes

- Restaurant listings, prices, ratings, images and availability are illustrative demo data, not live inventory.
- Reservation actions currently show a local prototype confirmation only. They do not contact a restaurant or create a real booking.
- The partner form is frontend-only and does not yet submit data to a backend.
- No payment collection is implemented.

## Next engineering milestones

1. Connect a backend and database (restaurants, branches, tables, availability slots, customers, reservations).
2. Add restaurant owner authentication and a protected inventory dashboard.
3. Implement atomic slot holds and booking confirmation to prevent double-booking.
4. Add customer authentication, reservation history and cancellation rules.
5. Add notifications (email/SMS/WhatsApp, subject to provider and cost).
6. Add admin review, restaurant verification and booking reconciliation.
7. Add analytics and production monitoring.

## Product principles

- Never show sample availability as live inventory.
- A table slot must be held atomically before confirming a reservation.
- A restaurant must be able to close or edit its inventory quickly.
- Make fees, cancellation rules and any deposit clear before the customer confirms.
- Launch with a small, verified restaurant pilot before expanding across Nepal.

# TABLEX Supabase setup

This repository contains the initial marketplace database schema at
`supabase/migrations/20261119150000_tablex_marketplace.sql`.

## Before applying

Use a **dedicated Supabase project for TABLEX**. The connected Supabase account currently has a project named
"The Daily Canvas"; it has not been modified because it does not appear to be a TABLEX project.

## Apply the schema

1. Create a Supabase project for TABLEX (Asia Pacific region is a sensible choice for Nepal).
2. Open **SQL Editor** in that project.
3. Paste and run the migration SQL.
4. In **Project Settings → API**, copy the project URL and publishable key.
5. Add them to your local `.env` file as:
   `VITE_SUPABASE_URL=...`
   `VITE_SUPABASE_ANON_KEY=...`
6. Never put a service-role or secret key in a Vite `VITE_*` variable.

## Current schema

- `restaurants`: owner-owned restaurant profiles; new registrations are pending approval.
- `table_offers`: dated table/time inventory and discounted prices.
- `reservations`: customer requests, one reservation per table offer.
- RLS is enabled on every exposed table. Public discovery only sees approved restaurants and live offers.

## Important MVP limitation

The initial schema prevents two customers from claiming the same offer by making `reservations.offer_id` unique.
The reservation creation flow should be implemented as a database RPC in the next backend step so offer availability,
price, seat count, and reservation insertion are checked atomically. Payments are not included yet.

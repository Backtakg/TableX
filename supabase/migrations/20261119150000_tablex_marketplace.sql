-- TABLEX marketplace schema
-- Apply to a dedicated TABLEX Supabase project. Do not run in an unrelated project.

create extension if not exists pgcrypto;

create type public.restaurant_status as enum ('pending', 'approved', 'rejected', 'suspended');
create type public.offer_status as enum ('live', 'paused', 'sold_out', 'expired');
create type public.reservation_status as enum ('pending', 'confirmed', 'declined', 'cancelled', 'completed');

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique,
  description text not null default '',
  cuisine text not null default '',
  address text not null,
  area text not null,
  city text not null default 'Bharatpur',
  phone text not null,
  cover_image_url text,
  status public.restaurant_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index restaurants_owner_id_idx on public.restaurants(owner_id);
create index restaurants_discovery_idx on public.restaurants(city, area, status);

create table public.table_offers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 80),
  seats integer not null check (seats between 1 and 30),
  service_date date not null,
  starts_at time not null,
  ends_at time not null,
  original_price numeric(10,2) not null check (original_price >= 0),
  offer_price numeric(10,2) not null check (offer_price >= 0 and offer_price <= original_price),
  status public.offer_status not null default 'live',
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index table_offers_discovery_idx
  on public.table_offers(service_date, starts_at, status, restaurant_id);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null unique references public.table_offers(id) on delete restrict,
  restaurant_id uuid not null references public.restaurants(id) on delete restrict,
  customer_id uuid not null references auth.users(id) on delete restrict,
  guest_name text not null check (char_length(guest_name) between 2 and 100),
  guest_phone text not null,
  party_size integer not null check (party_size between 1 and 30),
  total_price numeric(10,2) not null check (total_price >= 0),
  status public.reservation_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reservations_customer_idx on public.reservations(customer_id, created_at desc);
create index reservations_restaurant_idx on public.reservations(restaurant_id, created_at desc);

-- RLS is mandatory for every exposed table.
alter table public.restaurants enable row level security;
alter table public.table_offers enable row level security;
alter table public.reservations enable row level security;

-- Public discovery is limited to approved restaurants and live offers.
create policy "Anyone can discover approved restaurants"
on public.restaurants for select to anon, authenticated
using (status = 'approved');

create policy "Owners can read their own restaurants"
on public.restaurants for select to authenticated
using ((select auth.uid()) = owner_id);

create policy "Authenticated users can register a restaurant"
on public.restaurants for insert to authenticated
with check ((select auth.uid()) = owner_id and status = 'pending');

create policy "Owners can update their own pending or approved restaurants"
on public.restaurants for update to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "Anyone can discover live offers at approved restaurants"
on public.table_offers for select to anon, authenticated
using (
  status = 'live'
  and exists (
    select 1 from public.restaurants r
    where r.id = restaurant_id and r.status = 'approved'
  )
);

create policy "Owners can read all offers for their restaurants"
on public.table_offers for select to authenticated
using (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_id and r.owner_id = (select auth.uid())
  )
);

create policy "Owners can create offers for their restaurants"
on public.table_offers for insert to authenticated
with check (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_id
      and r.owner_id = (select auth.uid())
      and r.status = 'approved'
  )
);

create policy "Owners can update offers for their restaurants"
on public.table_offers for update to authenticated
using (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_id and r.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_id and r.owner_id = (select auth.uid())
  )
);

-- Customers can create a reservation only for a live offer that has enough seats.
-- A unique offer_id prevents two reservations claiming the same table/time offer.
create policy "Customers can create reservations for live offers"
on public.reservations for insert to authenticated
with check (
  customer_id = (select auth.uid())
  and status = 'pending'
  and exists (
    select 1
    from public.table_offers o
    join public.restaurants r on r.id = o.restaurant_id
    where o.id = offer_id
      and o.restaurant_id = restaurant_id
      and o.status = 'live'
      and r.status = 'approved'
      and o.service_date >= current_date
      and party_size <= o.seats
      and total_price = o.offer_price
  )
);

create policy "Customers can read their own reservations"
on public.reservations for select to authenticated
using (customer_id = (select auth.uid()));

create policy "Restaurant owners can read reservations"
on public.reservations for select to authenticated
using (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_id and r.owner_id = (select auth.uid())
  )
);

create policy "Restaurant owners can update reservation status"
on public.reservations for update to authenticated
using (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_id and r.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.restaurants r
    where r.id = restaurant_id and r.owner_id = (select auth.uid())
  )
);

-- Explicit grants are required on projects where Data API exposure is not automatic.
grant select on public.restaurants, public.table_offers to anon, authenticated;
grant insert, update on public.restaurants to authenticated;
grant insert, update on public.table_offers to authenticated;
grant select, insert, update on public.reservations to authenticated;


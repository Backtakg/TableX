drop policy if exists "Anyone can discover approved restaurants" on public.restaurants;
drop policy if exists "Owners can read their own restaurants" on public.restaurants;
create policy "Discover approved restaurants and owner records"
on public.restaurants for select to anon, authenticated
using (status = 'approved' or owner_id = (select auth.uid()));

drop policy if exists "Anyone can discover live offers at approved restaurants" on public.table_offers;
drop policy if exists "Owners can read all offers for their restaurants" on public.table_offers;
create policy "Discover live offers and owner inventory"
on public.table_offers for select to anon, authenticated
using (
  (status = 'live' and exists (
    select 1 from public.restaurants r where r.id = restaurant_id and r.status = 'approved'
  ))
  or exists (
    select 1 from public.restaurants r where r.id = restaurant_id and r.owner_id = (select auth.uid())
  )
);

drop policy if exists "Customers can read their own reservations" on public.reservations;
drop policy if exists "Restaurant owners can read reservations" on public.reservations;
create policy "Customers and restaurant owners can read reservations"
on public.reservations for select to authenticated
using (
  customer_id = (select auth.uid())
  or exists (
    select 1 from public.restaurants r where r.id = restaurant_id and r.owner_id = (select auth.uid())
  )
);

create index if not exists table_offers_restaurant_id_idx on public.table_offers(restaurant_id);

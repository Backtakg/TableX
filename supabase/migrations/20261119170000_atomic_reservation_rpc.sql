-- Atomic TABLEX reservation creation.
create or replace function public.create_reservation(
  p_offer_id uuid, p_guest_name text, p_guest_phone text, p_party_size integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_offer public.table_offers%rowtype;
  v_reservation_id uuid;
begin
  if v_user_id is null then
    raise exception 'You must be signed in to reserve a table.' using errcode = '28000';
  end if;
  if p_party_size is null or p_party_size < 1 or p_party_size > 30 then
    raise exception 'Invalid party size.' using errcode = '22023';
  end if;
  if length(trim(coalesce(p_guest_name, ''))) < 2 or length(trim(coalesce(p_guest_phone, ''))) < 7 then
    raise exception 'Please provide a valid guest name and phone number.' using errcode = '22023';
  end if;
  select o.* into v_offer
  from public.table_offers o
  join public.restaurants r on r.id = o.restaurant_id
  where o.id = p_offer_id and o.status = 'live' and r.status = 'approved'
    and o.service_date >= (now() at time zone 'Asia/Kathmandu')::date
  for update of o;
  if not found then
    raise exception 'This table is no longer available.' using errcode = 'P0001';
  end if;
  if p_party_size > v_offer.seats then
    raise exception 'This table does not have enough seats.' using errcode = '22023';
  end if;
  insert into public.reservations (
    offer_id, restaurant_id, customer_id, guest_name, guest_phone, party_size, total_price, status
  ) values (
    v_offer.id, v_offer.restaurant_id, v_user_id, trim(p_guest_name),
    trim(p_guest_phone), p_party_size, v_offer.offer_price, 'pending'
  ) returning id into v_reservation_id;
  return v_reservation_id;
exception when unique_violation then
  raise exception 'This table has already been reserved.' using errcode = '23505';
end;
$$;
revoke all on function public.create_reservation(uuid, text, text, integer) from public;
grant execute on function public.create_reservation(uuid, text, text, integer) to authenticated;

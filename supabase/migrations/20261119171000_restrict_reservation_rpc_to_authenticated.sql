revoke execute on function public.create_reservation(uuid, text, text, integer) from anon;
grant execute on function public.create_reservation(uuid, text, text, integer) to authenticated;

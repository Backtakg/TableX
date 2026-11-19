-- TABLEX admin access. Set app_metadata.role = 'admin' for trusted users
-- through Supabase Dashboard or a trusted server using the service role.
-- Never set this claim from a client.
create policy "Admins can read all restaurant applications"
on public.restaurants for select to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins can update restaurant approval status"
on public.restaurants for update to authenticated
using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
grant select on public.restaurants to authenticated;
grant update (status) on public.restaurants to authenticated;

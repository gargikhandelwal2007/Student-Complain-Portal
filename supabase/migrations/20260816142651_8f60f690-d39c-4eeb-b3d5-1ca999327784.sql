drop policy if exists "Admins can read all complaints" on public.complaints;
create policy "Admins can read all complaints"
on public.complaints
for select
to authenticated
using (
  exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  )
);

drop policy if exists "Admins can update all complaints" on public.complaints;
create policy "Admins can update all complaints"
on public.complaints
for update
to authenticated
using (
  exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  )
);

drop policy if exists "Admins can read all notes" on public.complaint_notes;
create policy "Admins can read all notes"
on public.complaint_notes
for select
to authenticated
using (
  exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  )
);

drop policy if exists "Admins can insert notes" on public.complaint_notes;
create policy "Admins can insert notes"
on public.complaint_notes
for insert
to authenticated
with check (
  exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  )
);

revoke execute on function public.has_role(uuid, public.app_role) from authenticated;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to service_role;
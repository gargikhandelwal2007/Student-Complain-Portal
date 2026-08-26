create policy "Users can read own roles"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

grant execute on function public.has_role(uuid, public.app_role) to authenticated;
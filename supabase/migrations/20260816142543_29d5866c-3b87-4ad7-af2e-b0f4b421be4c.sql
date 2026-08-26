revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
revoke execute on function public.handle_new_user() from public, authenticated, anon;
revoke execute on function public.update_updated_at_column() from public, authenticated, anon;

grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;
grant execute on function public.handle_new_user() to service_role;
grant execute on function public.update_updated_at_column() to service_role;
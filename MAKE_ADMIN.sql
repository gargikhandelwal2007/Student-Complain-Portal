-- Run this in Supabase Dashboard -> SQL Editor after creating your account.
-- Replace the email below with the email you used to sign up.

insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'gkhandelwal2007@gmail.com'
on conflict (user_id, role) do nothing;

-- Verify:
select u.email, r.role
from auth.users u
join public.user_roles r on r.user_id = u.id
order by u.email;

create type public.app_role as enum ('student', 'admin');

create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  student_id text unique,
  department text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  status text not null check (status in ('open', 'in_progress', 'resolved', 'closed')) default 'open',
  priority text not null check (priority in ('low', 'medium', 'high')) default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.complaints to authenticated;
grant all on public.complaints to service_role;

alter table public.complaints enable row level security;

create policy "Students can read own complaints"
on public.complaints
for select
to authenticated
using (auth.uid() = student_id);

create policy "Students can insert own complaints"
on public.complaints
for insert
to authenticated
with check (auth.uid() = student_id);

create policy "Students can update own complaints"
on public.complaints
for update
to authenticated
using (auth.uid() = student_id)
with check (auth.uid() = student_id);

create policy "Admins can read all complaints"
on public.complaints
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update all complaints"
on public.complaints
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create table public.complaint_notes (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  note text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.complaint_notes to authenticated;
grant all on public.complaint_notes to service_role;

alter table public.complaint_notes enable row level security;

create policy "Students can read public notes on own complaints"
on public.complaint_notes
for select
to authenticated
using (
  exists (
    select 1 from public.complaints
    where complaints.id = complaint_notes.complaint_id
    and complaints.student_id = auth.uid()
  )
  and is_internal = false
);

create policy "Admins can read all notes"
on public.complaint_notes
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert notes"
on public.complaint_notes
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));

  insert into public.user_roles (user_id, role)
  values (new.id, 'student');

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_complaints_updated_at
before update on public.complaints
for each row
execute function public.update_updated_at_column();

create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute function public.update_updated_at_column();

insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where not exists (
  select 1 from public.user_roles
)
on conflict (user_id, role) do nothing;

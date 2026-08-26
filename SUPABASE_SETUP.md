# Supabase Setup

This project is configured for:
`https://mudnjkoiraasdyklnhbt.supabase.co`

## 1. Create database tables and policies
In Supabase Dashboard -> SQL Editor, run the SQL migration files in this order:

1. `supabase/migrations/20260816142511_e7a3bff2-7777-42c0-88aa-6fc9631bbaea.sql`
2. `supabase/migrations/20260816142543_29d5866c-3b87-4ad7-af2e-b0f4b421be4c.sql`
3. `supabase/migrations/20260816142616_86586690-3227-41f1-b9f7-72d6774624c2.sql`
4. `supabase/migrations/20260816142651_8f60f690-d39c-4eeb-b3d5-1ca999327784.sql`
5. `supabase/migrations/20260816142729_fcc41058-e3bd-4555-972e-69115938bed4.sql`

## 2. Start the project
Run:
`npm install`
`npm run dev`

## 3. Create your admin user
- Open `/auth`
- Create an account
- Confirm the user appears in Supabase -> Authentication -> Users
- Run `MAKE_ADMIN.sql` in Supabase SQL Editor after replacing the email.

## Fixed in this copy
- All environment variables point to the same Supabase project.
- Complaint category validation accepts the actual category IDs.
- Dashboard In Progress status uses `in_progress` consistently.
- Unused third-party OAuth/branding code was removed from the app source.

# News Platform
1. Create a Supabase project, run `supabase/migrations/001_schema.sql` in the SQL editor.
2. Copy `.env.example` to `apps/web/.env.local` (NEXT_PUBLIC_*) and `apps/mobile/.env` (EXPO_PUBLIC_*).
3. `npm install`, then `npm run web` and `npm run mobile`.
4. Sign up on /admin: the FIRST account becomes super_admin. It assigns roles/permissions in Admin > Users.
Workflow: anyone but super_admin who publishes is saved as "pending_review"; super_admin approves in Admin > Review.

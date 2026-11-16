# News Platform
1. Create a Supabase project, run `supabase/migrations/001_schema.sql` in the SQL editor.
2. Copy `.env.example` to `apps/web/.env.local` (NEXT_PUBLIC_*) and `apps/mobile/.env` (EXPO_PUBLIC_*).
3. `npm install`, then `npm run web` and `npm run mobile`.
4. Sign up on /admin: the FIRST account becomes super_admin. It assigns roles/permissions in Admin > Users.
Workflow: anyone but super_admin who publishes is saved as "pending_review"; super_admin approves in Admin > Review.
Push: `supabase functions deploy send-push` (uses Expo push; needs a dev/production build, not Expo Go, for tokens).
Add PNG icons (192/512) to apps/web/public and list them in app/manifest.js to make the site installable.
## New features setup
1. Supabase SQL editor: run `supabase/migrations/002_features.sql` (promoted flag, subscribers, comments).
2. Google sign-in: Google Cloud Console > OAuth client (Web). Authorized redirect URI: https://YOUR-PROJECT.supabase.co/auth/v1/callback. Put its Client ID/Secret in Supabase > Authentication > Providers > Google. Add your site URL to Authentication > URL Configuration (Site URL + Redirect URLs).
3. Email: create a Resend account, verify your domain, then `supabase secrets set RESEND_API_KEY=... FROM_EMAIL="The Daily <news@yourdomain.com>" SITE_URL=https://yourdomain.com` and `supabase functions deploy send-newsletter`.

## Web push + hardening
1. Run `supabase/migrations/003_push.sql`.
2. `npx web-push generate-vapid-keys` -> put the PUBLIC key in Vercel as NEXT_PUBLIC_VAPID_PUBLIC_KEY; set Supabase function secrets VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:you@domain.com), SITE_URL; redeploy function `send-push`.
3. Supabase > Authentication: enable CAPTCHA (Turnstile), min password length 10+, email confirmation; enable MFA for admin accounts.
## Mobile app (apps/mobile)
Copy `apps/mobile` to its own folder (e.g. C:\dev\news-app), copy `.env.example` to `.env` and fill it, then `npm install` and `npx expo start` (Expo Go for a quick test).
Android APK: `npx eas-cli login`, `npx eas-cli init`, `npx eas-cli build -p android --profile preview`. Push needs this real build, not Expo Go. Change `com.example.thedaily` to your own package id first.

### OTA updates (no new APK for code changes)
One time: fill `env` in eas.json, `npx eas-cli init`, `npx eas-cli update:configure`, then build once: `npx eas-cli build -p android --profile preview`.
After any JS/UI change: `npx eas-cli update --channel preview --message "what changed"` (keep your local .env in place). Rebuild only when native things change (new native package, app.json icon/permissions/package id, Expo SDK upgrade) and bump `version` in app.json when you do.

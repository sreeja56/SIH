<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/94685db7-5fd8-4667-8893-680c4853bde7

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Supabase backend

1. Create a Supabase project.
2. In Supabase SQL Editor, run `supabase/migrations/001_curo_backend.sql`.
3. Copy `.env.example` to `.env` and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
4. Keep the service-role key server-side only. Never prefix it with `VITE_`.
5. Start Curo with `npm run dev`.

The Node/Express backend now persists profiles (with bcrypt-style `pgcrypto` PIN hashes), permissions, doctors/slots, appointments with atomic slot reservation, medical documents, feedback, chat messages, and triage results. The existing localStorage layer remains as an offline-first cache, so the prototype still works if Supabase is temporarily unavailable.

> Production note: the current prototype still uses the existing username + 4-digit PIN UX. For a production healthcare deployment, migrate the session layer to Supabase Auth (phone OTP/passwordless), add `auth.uid()` RLS policies, audit logging, encrypted/private document storage, and rate limiting.

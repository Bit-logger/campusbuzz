## 2026-10-29 - Hardcoded Supabase Credentials and Configuration
**Vulnerability:** Supabase Project URL and public anon JWT were hardcoded directly in `lib/supabase.js` and tracked in version control without `.env` support or `.gitignore` rules for environment secrets.
**Learning:** Expo projects support client-side environment variables prefixed with `EXPO_PUBLIC_` which bundle safely at build time. When initializing Supabase or BaaS clients, relying on hardcoded strings locks configurations into public source control.
**Prevention:** Always read client API keys and endpoints from `process.env.EXPO_PUBLIC_*`, provide `.env.example` with non-sensitive placeholder templates, and ignore `.env*` files in `.gitignore`.

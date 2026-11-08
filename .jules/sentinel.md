## 2025-05-18 - Hardcoded Supabase Credentials and Missing .env Gitignore
**Vulnerability:** Hardcoded Supabase URL and JWT anon key in `lib/supabase.js`, combined with `.gitignore` lacking patterns for `.env` files.
**Learning:** During prototype setup, credentials were baked directly into source control. Because Expo supports `EXPO_PUBLIC_` prefixes for client-facing environment configuration, developers can safely configure environment variables per deployment environment without leaking production or staging keys directly in the Git history.
**Prevention:** Always ensure `.env` and `.env*.local` are tracked in `.gitignore`, provide an `.env.example` with generic placeholders, and reference configuration through `process.env.EXPO_PUBLIC_*`.

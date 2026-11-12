## 2025-05-18 - Hardcoded Supabase Credentials in Expo Client
**Vulnerability:** Supabase API URL and JWT anon key were hardcoded directly in `lib/supabase.js`.
**Learning:** Hardcoded credentials in source files are committed to version control and bundled into client assets. Relying on hardcoded secrets as fallback values in code still exposes them.
**Prevention:** Always read credentials from environment variables (`process.env.EXPO_PUBLIC_*` in Expo) without hardcoded fallbacks and provide `.env.example` templates with generic placeholders.

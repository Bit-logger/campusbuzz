## 2025-05-18 - Hardcoded Supabase Credentials Exposure
**Vulnerability:** Hardcoded Supabase URL and anonymous JWT key committed in `lib/supabase.js`.
**Learning:** Hardcoding project API credentials directly into source code risks leaking credentials to source control and public repositories, preventing per-environment key rotation.
**Prevention:** Always consume environment variables (`process.env.EXPO_PUBLIC_SUPABASE_URL` and `process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY`) for Expo/React Native projects without fallback credentials in source code, and ignore `.env*` files in `.gitignore`.

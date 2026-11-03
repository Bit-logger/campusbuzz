## 2026-11-03 - Hardcoded Supabase Credentials Exposure
**Vulnerability:** Hardcoded Supabase URL and anonymous JWT key committed directly in `lib/supabase.js`.
**Learning:** Hardcoding project API credentials directly into source code risks leaking credentials into version control and prevents environment-based credential rotation.
**Prevention:** Always consume environment variables (`process.env.EXPO_PUBLIC_SUPABASE_URL` and `process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY`) for Expo/React Native projects without fallback credentials in source code, and provide generic placeholders in `.env.example`.

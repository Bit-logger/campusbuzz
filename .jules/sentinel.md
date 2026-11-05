## 2026-11-02 - Hardcoded Supabase Credentials Exposure
**Vulnerability:** Supabase URL and anon JWT key were hardcoded directly in `lib/supabase.js`.
**Learning:** Hardcoded credentials in source files are committed to version control and bundled into client assets without allowing environment-specific key rotation.
**Prevention:** Always consume environment variables (`process.env.EXPO_PUBLIC_*` in Expo) for API endpoints and keys without hardcoded fallback secrets, and supply `.env.example` templates with generic placeholders.

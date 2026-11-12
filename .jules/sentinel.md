# Sentinel's Security Journal

## 2025-02-18 - Auth Input Validation and Storage Extension Sanitization
**Vulnerability:** Unsanitized email inputs in authentication calls and unsanitized file extension extraction from local URIs when uploading ID cards to storage.
**Learning:** Local image URIs or user input strings can contain query parameters, trailing spaces, or invalid characters that lead to unexpected auth errors or storage path manipulation in Supabase storage keys.
**Prevention:** Always validate and trim email addresses before passing to auth providers, and strictly sanitize file extensions using regex allowlists when generating storage paths.

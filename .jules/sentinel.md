# Sentinel's Security Journal

## 2026-03-31 - Standardize Error Sanitization for User Uploads
**Vulnerability:** Unhandled error messages in upload/auth catch blocks exposing raw error details (`err.message`) in alert popups.
**Learning:** Returning or alerting raw system error messages directly to end users can leak internal structural, path, or database details.
**Prevention:** Sanitize exception handling by displaying a non-sensitive user-facing message and logging detailed errors internally.

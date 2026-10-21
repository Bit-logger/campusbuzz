## 2026-10-21 - Authorization Bypass in Substring Email Matching
**Vulnerability:** Role authorization check used `user?.email?.includes('admin')` which incorrectly granted administrative status to any user whose email address contained the string 'admin' (e.g. `badminton@example.com`).
**Learning:** Using loose substring checks (`String.prototype.includes`) on email addresses or identity strings for authorization checks introduces privilege escalation vulnerabilities when unauthorized user input contains matching substrings.
**Prevention:** Perform exact string comparison (`===`) against expected admin credentials or, preferably, query role metadata from Supabase database/JWT claims.

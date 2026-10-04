## 2026-03-30 - O(N * D) Grid Iteration in React Native Calendar Screen

**Learning:** Calendar and grid components that call filtering helper functions inside cell rendering loops cause O(N * D) array iterations on every render frame (35+ cells * N events = thousands of string comparisons per frame).
**Action:** Pre-group items by date key (`YYYY-MM-DD`) into a `useMemo` hash map to allow O(1) cell lookups during grid rendering.

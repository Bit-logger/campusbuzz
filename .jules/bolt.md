## 2026-03-30 - Calendar Grid Event Lookup Optimization
**Learning:** In React Native screens with interactive forms/modals alongside grid renderings (such as calendar screens), performing array `.filter()` calls inside cell mapping functions causes O(GridSize * N) computations on every single render (e.g. on every keystroke when typing in a TextInput). Indexing events by date string into an O(1) `useMemo` map eliminates redundant array passes and prevents input lag.
**Action:** Always index queryable grid/list data into O(1) lookup objects with `useMemo` when rendering grid items.

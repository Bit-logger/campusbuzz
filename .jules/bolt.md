## 2024-05-19 - [Memoize and Optimize Array Filtering]
**Learning:** Found an O(N) redundant string allocation in `MarketplaceScreen.js` inside the `filteredItems` recalculation. `searchQuery.toLowerCase()` was executed for every single item on every render.
**Action:** Always hoist invariant variables out of `.filter` loops and wrap expensive derived state calculations in `useMemo`.

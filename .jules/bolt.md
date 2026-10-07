## 2025-05-18 - FlatList Callback State Dependencies
**Learning:** Passing state-dependent callbacks like `markAsSold` into memoized `FlatList` items can cause full list re-renders if the callback references state directly (e.g., `items.find`).
**Action:** Pass item-specific attributes (like `item.title`) directly from the child or use functional state updates so callbacks maintain empty `[]` dependency arrays, ensuring `React.memo` child components avoid re-renders.

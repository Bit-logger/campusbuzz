## 2025-05-23 - FlatList Optimization via React.memo & useCallback
**Learning:** Inline component rendering within `FlatList.renderItem` (like rendering complex Post items directly) causes O(N) re-renders when parent state updates.
**Action:** Extract complex list items into separate components wrapped with `React.memo()`. Ensure all passed callbacks (like `onLike`, `onDelete`) are wrapped in `useCallback()` to maintain referential equality across renders, avoiding unnecessary prop changes to memoized child components.

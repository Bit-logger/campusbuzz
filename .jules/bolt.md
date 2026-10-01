## 2026-10-01 - FlatList Re-renders during Modal State Updates

**Learning:** In FeedScreen, state updates for comment text inputs (`newComment`) in a modal were forcing full re-renders of all FlatList feed cards when `renderItem` was defined inline and item components were unmemoized.
**Action:** Extract list item rendering into a separate `React.memo` component (`PostItem`) and wrap event handlers with `useCallback` so FlatList items avoid re-rendering during state updates in parent components.

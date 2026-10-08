
## 2024-05-18 - Avoid breaking useCallback memoization with parent state
**Learning:** When memoizing React callbacks that need item-specific state (e.g., `isLiked` from a `Set`), directly accessing that state inside the callback requires adding the state to the dependency array. If this callback is passed to items in a `FlatList`, updating the state (like liking one post) causes the callback to recreate, which breaks `React.memo` on *all* list items, leading to O(N) re-renders instead of O(1).
**Action:** Pass the required state back up from the child component via the callback parameters (e.g., `onLike(item, isLiked)`) rather than reading it from the parent's closure. This keeps the dependency array empty (or stable) and allows proper memoization of the child components.

## 2024-05-18 - Memoizing FlatList Callbacks that need list-specific state

**Learning:** When memoizing React callbacks (like `handleLike`) that are passed to `FlatList` items (e.g. `PostItem`), checking item-specific state (like `likedPostIds.has(id)`) directly inside the callback makes it dependent on state that changes frequently. This breaks the `useCallback` and causes ALL list items to re-render whenever the parent state updates, eliminating the benefit of `React.memo`.

**Action:** When extracting complex list logic into a separate `React.memo` component, always pass the required list-specific state back up from the child component via the callback (e.g. `onLike(item, isLiked)`) rather than attempting to read it synchronously inside deferred state setter functions or keeping it in the callback's dependency array. This guarantees O(1) instead of O(N) re-renders.

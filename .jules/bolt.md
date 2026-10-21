## 2023-10-21 - Memoizing FlatList callbacks correctly
**Learning:** When using `useCallback` to memoize event handlers for list items, you can run into stale closure bugs if the handler references changing state (like an array of items).
**Action:** Always use functional state updates (e.g., `setPosts(prev => prev.map(...))`) and pass item-specific state (like `isLiked`) directly from the memoized child component back to the callback, instead of capturing parent state in the dependency array. This prevents the callback reference from changing while avoiding stale data.

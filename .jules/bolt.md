## 2023-10-25 - FlatList O(N) Re-render Optimization
**Learning:** In React Native, modifying a parent's state (like `likedPostIds`) to track item states in a `FlatList` causes an O(N) re-render of all items if the render function is defined inline.
**Action:** Extract the complex item logic into a separate `React.memo` component. To prevent breaking memoization due to parent state updates, pass required state (like `isLiked`) back up via the callback rather than including the state in the `useCallback` dependency array.

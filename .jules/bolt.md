## 2025-05-18 - FlatList Memoization in FeedScreen
**Learning:** React Native FlatList item renderers inside screens without memoization re-render every item (O(N) re-renders) on every screen state update (e.g., active comments modal or TextInput state changes). Extracting the item into a `React.memo` component and memoizing callbacks with `useCallback` eliminates these unnecessary re-renders.
**Action:** Always extract list items into `React.memo` components and pass `useCallback` memoized handlers when optimizing FlatList rendering performance.

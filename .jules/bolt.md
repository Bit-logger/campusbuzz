## 2026-10-06 - [FlatList React.memo Optimization]
**Learning:** React Native's FlatList can suffer from significant performance degradation if complex child components are rendered inline. In FeedScreen.js, whenever the parent state (like comments modal or input) updated, it triggered an O(N) re-render of all posts.
**Action:** Always extract complex `renderItem` functions into separate components wrapped in `React.memo` and ensure callbacks passed as props are stable using `useCallback`.

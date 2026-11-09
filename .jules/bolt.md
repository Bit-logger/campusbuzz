## 2024-05-18 - Extract FeedPost from FeedScreen and use React.memo

**Learning:** Extracted `renderPost` logic into a separate `FeedPost` component wrapped in `React.memo` inside `FeedScreen.js` to prevent unnecessary re-renders of all posts in the FlatList when likes, comments, or post counts change.
**Action:** Use `React.memo` combined with properly memoized callbacks (`useCallback`) when rendering complex items in long lists.

## 2025-05-18 - FlatList Item Handler Memoization Pattern
**Learning:** Extracting list items to standalone `React.memo` components prevents unnecessary O(N) re-renders across all list items when parent component state updates (such as active comment text input or modal visibility).
**Action:** Always extract list items to `React.memo` components and wrap action callbacks (`handleLike`, `onDelete`, etc.) in `useCallback` when optimizing list screens in React Native.

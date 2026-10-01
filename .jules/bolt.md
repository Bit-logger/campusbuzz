## 2023-10-24 - React Native FlatList Re-render Bottlenecks
**Learning:** React Native's `FlatList` will trigger O(N) re-renders across all items when the parent state changes (e.g., modifying likes on a single post), unless item render functions are extracted into `React.memo` components and provided with stable callback references via `useCallback`.
**Action:** Always extract complex `FlatList` item logic into a `React.memo` component and memoize any passed callbacks to avoid massive list-wide re-renders in React Native.

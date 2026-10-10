# Bolt's Journal - Critical Learnings

## 2025-05-18 - FlatList Item Re-rendering in React Native
**Learning:** Defining renderItem inline or passing state directly down to unmemoized FlatList items in React Native causes all items to re-render on every state change (e.g. toggling a like or changing a modal state), leading to O(N) re-renders across the list.
**Action:** Extract list item components into dedicated `React.memo` components outside the screen component, pass primitive props or memoized callbacks, and compute item-specific derived state (like `isLiked`) efficiently to prevent cascading re-renders across list items.

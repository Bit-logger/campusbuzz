## 2025-02-23 - Optimizing React Native FlatList

**Learning:** When using React Native \`FlatList\`, rendering complex interactive items inline causes O(N) re-renders across all items whenever parent state (like \`likedPostIds\`) changes.
**Action:** Extract complex list items into a separate component wrapped with \`React.memo()\`. Always pass item-specific state (e.g., \`isLiked\`) from the parent via props or back up from the child via \`useCallback\` to avoid breaking memoization dependency arrays.

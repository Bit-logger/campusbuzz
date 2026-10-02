## 2026-03-31 - FlatList Re-renders on Modal TextInput State Changes
**Learning:** In screens where a `Modal` with a controlled `TextInput` (e.g., comment input) shares state with a `FlatList`, state changes on every keystroke cause the parent screen to re-render, forcing all `FlatList` items to re-render ($O(N)$) unless item components are extracted into `React.memo` and callbacks are memoized with `useCallback`.
**Action:** Always extract list card JSX into standalone `React.memo` components when modal inputs or frequent screen-level state updates exist on the same screen.

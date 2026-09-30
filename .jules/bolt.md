# Bolt's Journal - Critical Performance Learnings

## 2025-05-18 - Animated.Value Lazy Initialization & Component Optimization
**Learning:** Writing `useRef(new Animated.Value(...))` still executes the constructor `new Animated.Value(...)` on every render pass because argument expressions evaluate prior to function execution, wasting allocations. To truly prevent allocation overhead on re-renders, use a lazy ref initialization pattern (`if (!ref.current) ref.current = new Animated.Value(...)`). Additionally, moving inline static styles to `StyleSheet.create` and wrapping reusable UI primitives with `React.memo` prevents unnecessary re-renders and object allocations when parent state updates.
**Action:** Always use lazy initialization checks for `Animated.Value` in `useRef`, move static styles to `StyleSheet.create`, and memoize component primitives.

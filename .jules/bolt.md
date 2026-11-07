# Bolt's Performance Journal

## 2026-10-29 - Lazy Animated.Value Initialization
**Learning:** Instantiating `new Animated.Value(...)` directly as an argument inside component bodies (like `useState(new Animated.Value(0))`) evaluates and allocates a new instance and its internal listeners on every single render pass, even though React only consumes the initial value on mount.
**Action:** Use lazy state initialization functions (e.g., `useState(() => new Animated.Value(...))`) so the `Animated.Value` instance is only constructed once on initial mount, avoiding wasteful allocations and garbage collection overhead during frequent re-renders.

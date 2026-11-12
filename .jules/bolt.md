## 2025-05-18 - Animated.Value Initialization in React Native
**Learning:** Passing `new Animated.Value(...)` directly as an argument to `useRef` or `useState` (without a function initializer) evaluates and creates a new object on every render pass, wasting allocations even though `useRef` returns the stored ref.
**Action:** Use lazy initialization pattern (`const ref = useRef(null); if (!ref.current) ref.current = new Animated.Value(...);`) or functional `useState` initializer (`useState(() => new Animated.Value(...))`) when instantiating `Animated.Value`.

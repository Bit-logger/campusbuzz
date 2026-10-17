## 2024-05-24 - Lazy Initialize Animated.Value
**Learning:** In React Native, passing `new Animated.Value(...)` directly into `useState` causes a new Animated instance to be created (and subsequently garbage collected) on every render, which is inefficient, particularly for widely-used UI components.
**Action:** Always use a lazy initializer function (e.g., `useState(() => new Animated.Value(...))`) or `useRef` to guarantee the instance is created exactly once per component mount.

## 2024-06-25 - React Native Animated.Value Initialization
**Learning:** Using `useState(new Animated.Value(1))` creates a new unused Animated instance on every single render pass before throwing it away.
**Action:** Use lazy initializers `useState(() => new Animated.Value(1))` or `useRef` null checks to prevent memory overhead, especially in frequently used UI components like custom buttons.

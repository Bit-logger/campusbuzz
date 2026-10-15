## 2023-10-15 - React Native Animated.Value Initialization
**Learning:** Using `useState(new Animated.Value(1))` creates a new instance of `Animated.Value` on every render, even though the state only accepts the first value. In frequently used components (like `SquishyButton`), this leads to high Garbage Collection (GC) overhead and potential stuttering on lower-end devices.
**Action:** Always use lazy initializers (`useState(() => new Animated.Value(1))`) or `useRef(new Animated.Value(1)).current` for `Animated.Value` inside functional components to ensure it's instantiated only once.

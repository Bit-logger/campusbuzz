## 2026-10-29 - Lazy initialization of Animated.Value in React Native components
**Learning:** Passing `new Animated.Value(...)` directly into `useState` causes a new Animated.Value instance to be allocated on every render pass, even though React discards it after initial mount. Using a lazy initializer function `useState(() => new Animated.Value(...))` prevents this unnecessary object allocation.
**Action:** Always wrap `new Animated.Value(...)` or other heavy initial state objects in callback functions when using `useState` in React Native components.

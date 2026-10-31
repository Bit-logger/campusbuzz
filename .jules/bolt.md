## 2024-10-31 - Lazy initialization of Animated.Value
**Learning:** Directly passing `new Animated.Value()` to `useState` inside a functional component causes the instance to be created on every render, even though `useState` discards the new instance. This creates unnecessary garbage collection overhead and memory spikes.
**Action:** Always use lazy initialization `useState(() => new Animated.Value())` or a ref with null check to prevent re-creation on every render.

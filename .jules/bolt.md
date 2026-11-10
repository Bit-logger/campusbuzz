
## 2025-02-12 - Animated.Value Lazy Initialization
**Learning:** Using `useState(new Animated.Value(...))` causes a new instance of `Animated.Value` to be evaluated and created on *every single render pass* before being immediately discarded by React (since it only uses the initial value once). This causes unnecessary memory overhead and garbage collection in high-frequency renders, which is a bottleneck for interactive components like `SquishyButton`.
**Action:** Always use lazy initializers with a callback `useState(() => new Animated.Value(...))` for `Animated.Value` in React functional components, or check for instance existence using `useRef`.

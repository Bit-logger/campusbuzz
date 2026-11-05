## 2026-10-29 - Lazy Animated.Value Initialization in Reusable Neo-Brutalist Components
**Learning:** Instantiating `new Animated.Value(...)` directly inside `useState(...)` or `useRef(...)` evaluates on every component re-render pass, needlessly allocating instances and listener graphs even when state is preserved.
**Action:** Always wrap `Animated.Value` instantiation in lazy initializers like `useState(() => new Animated.Value(...))` for frequently rendered UI primitives.

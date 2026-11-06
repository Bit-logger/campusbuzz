## 2025-02-17 - Lazy initialization of Animated.Value in SquishyButton
**Learning:** Instantiating `Animated.Value` directly inside `useState(new Animated.Value(...))` triggers constructor evaluation on every render pass, creating unused animation nodes and listener maps that immediately get discarded. In core UI primitives like SquishyButton rendered across lists and menus, this causes unnecessary garbage collection pressure and memory churn.
**Action:** Always use factory callbacks with `useState(() => new Animated.Value(...))` or ref initialization guards for animated values.

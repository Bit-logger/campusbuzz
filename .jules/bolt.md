## 2026-10-16 - Animated.Value instantiation in React components
**Learning:** Found `useState(new Animated.Value(...))` which unnecessarily creates an object on every single render. Using an initializer arrow function solves this.
**Action:** When dealing with Animated components or other complex state initializations, use lazy initializers `useState(() => new Object())` to prevent unnecessary allocations on re-renders.

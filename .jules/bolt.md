# Bolt's Performance Journal

## 2026-02-19 - SquishyButton Lazy Animated.Value & Memoization
**Learning:** `useRef(new Animated.Value(1))` still instantiates `new Animated.Value(1)` on every render cycle before passing it to `useRef`. Using lazy ref initialization (`if (!ref.current) ref.current = new Animated.Value(1)`) prevents object instantiation on subsequent renders. Combining this with `useMemo` for static container styles and wrapping with `React.memo` prevents unnecessary allocations and child re-renders.
**Action:** Always use lazy ref initialization when creating expensive object instances in React function components.

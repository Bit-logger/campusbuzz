## 2023-10-11 - Custom Component Accessibility
**Learning:** Custom interactive components like `SquishyButton` do not automatically forward accessibility props, which breaks screen reader support for all instances. Also, fallback logic for `accessibilityLabel` (e.g., `|| label`) must ensure `label` is a string to prevent React Native crashes from receiving a React Node.
**Action:** Always explicitly forward `accessibilityRole`, `accessibilityState`, and `accessibilityLabel` (with string type-checking) on the root interactive element of custom components.

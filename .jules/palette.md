## 2024-05-24 - Custom Animated Component Accessibility
**Learning:** When creating custom interactive components like SquishyButton that wrap animations (e.g. `TouchableWithoutFeedback` wrapping an `Animated.View`), the root interactive element needs to explicitly accept and forward accessibility props like `accessibilityLabel`, `accessibilityRole`, and `accessibilityState` to remain screen-reader compatible.
**Action:** Always verify custom wrapper components map ARIA equivalent props to React Native equivalents, especially using safe string fallbacks when relying on node properties.

## 2024-10-24 - Accessibility Labels for Custom Buttons
**Learning:** The custom `SquishyButton` component used throughout the app lacks an `accessibilityLabel` prop, meaning screen readers cannot properly announce the buttons. Additionally, the component wraps its content in a `TouchableWithoutFeedback` but doesn't pass accessibility props down.
**Action:** Always ensure that custom interactive components forward accessibility props (like `accessibilityLabel`, `accessibilityRole`, and `accessibilityState`) to the root interactive element.

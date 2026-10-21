
## 2024-05-24 - [Forwarding Accessibility Props in Custom Interactives]
**Learning:** Custom interactive components built with `TouchableWithoutFeedback` (like SquishyButton) need explicit accessibility prop forwarding, and string fallbacks for `accessibilityLabel` (e.g., `typeof label === 'string'`) to prevent crashes in React Native.
**Action:** Always forward `accessibilityRole`, `accessibilityState`, and a safe string `accessibilityLabel` to the root interactive element when creating custom buttons.

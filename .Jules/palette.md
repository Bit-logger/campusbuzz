## 2024-05-24 - Accessible SquishyButton
**Learning:** Custom interactive components in React Native (like SquishyButton using TouchableWithoutFeedback) must explicitly forward accessibility props (e.g., accessibilityLabel, accessibilityRole, accessibilityState) to their root interactive element to ensure screen reader compatibility. Additionally, fallback `accessibilityLabel` values must be strings, as passing React nodes causes errors.
**Action:** Always forward standard accessibility props to root touchable elements in custom UI components and ensure fallback labels are strictly strings.

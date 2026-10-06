## 2024-05-24 - Init

## 2024-05-24 - Accessibility explicitly forwarded
**Learning:** Custom interactive UI components like `SquishyButton` need to have accessibility props (e.g., `accessibilityLabel`, `accessibilityRole`, `accessibilityState`) forwarded explicitly to their underlying native elements (like `TouchableWithoutFeedback`). If not, screen readers may not read them as buttons or announce their states. Also, icon-only buttons need explicit `accessibilityLabel` properties so users with screen readers can understand their actions.
**Action:** When creating or modifying custom interactive components, explicitly forward accessibility props to the root interactive element. And always remember to provide descriptive labels for icon-only buttons.

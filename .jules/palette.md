## 2024-11-04 - Adding accessibilityLabel to icon-only buttons
**Learning:** Found multiple instances of icon-only `TouchableOpacity` buttons (like profile navigation, password visibility toggle, like, and comment buttons) lacking screen-reader accessible labels, making it hard for users who rely on assistive technologies to understand their purpose.
**Action:** Use `accessibilityLabel` with descriptive text and `accessibilityRole="button"` on custom interactive elements (like icon buttons) to ensure proper screen reader support and keyboard-navigation hints going forward.

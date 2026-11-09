## 2024-03-09 - Accessible Icon Buttons
**Learning:** Found a recurring pattern where emoji-based icon-only `TouchableOpacity` elements (like ❤️ and 💬) lack `accessibilityLabel` and `accessibilityRole`, making them unreadable for screen readers.
**Action:** Always explicitly set `accessibilityLabel` and `accessibilityRole="button"` on interactive elements containing only emojis or icons.

## 2025-02-18 - Missing Accessibility Labels on Top-Level Navigation Icon Buttons
**Learning:** Top-level navigation elements (like a generic user profile icon button in the header) often lack explicit accessibility labels, meaning screen readers cannot convey their purpose.
**Action:** Always provide explicit and descriptive `accessibilityLabel` and `accessibilityRole` properties for icon-only buttons so users interacting via screen readers can properly understand their actions.

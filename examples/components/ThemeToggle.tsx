/**
 * ThemeToggle — Reference Implementation
 *
 * Accessible toggle control for switching between light and dark themes.
 * Uses useTheme() hook from ThemeProvider.
 *
 * @see docs/DS-REFERENCE.md — Theming Guide
 */

import { useTheme } from "./ThemeProvider"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      data-testid="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      aria-pressed={isDark}
      className="inline-flex items-center justify-center rounded-md p-2 text-content-secondary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
    >
      {isDark ? "☀️" : "🌙"}
      <span className="sr-only">
        {isDark ? "Switch to light mode" : "Switch to dark mode"}
      </span>
    </button>
  )
}

export default ThemeToggle

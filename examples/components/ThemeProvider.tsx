/**
 * ThemeProvider — Reference Implementation
 *
 * Provides dark/light theme context with localStorage persistence.
 * Uses [data-theme] attribute on <html> for CSS custom property switching.
 *
 * @see docs/DS-REFERENCE.md — Theming Guide
 * @see examples/styles/tokens.css — Token definitions
 */

import { createContext, useContext, useEffect, useState, useCallback } from "react"

type Theme = "light" | "dark"

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = "theme"

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light"

  // Check localStorage first
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
  if (stored === "light" || stored === "dark") return stored

  // Fall back to system preference
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark"

  return "light"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    document.documentElement.style.colorScheme = theme
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div data-testid="theme-provider">{children}</div>
    </ThemeContext.Provider>
  )
}

/**
 * Hook to access theme context.
 * Must be used within a ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error("useTheme must be used within a <ThemeProvider>")
  }
  return ctx
}

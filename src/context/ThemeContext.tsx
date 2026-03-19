import React, { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'rose' | 'ocean' | 'dark' | 'cyberpunk'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_KEY = 'sparkle-hostel-theme'

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved && ['rose', 'ocean', 'dark', 'cyberpunk'].includes(saved)) {
      return saved as Theme
    }
  } catch {
    // localStorage not available (SSR / private browsing)
  }
  return 'rose'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  // Remove ALL theme classes first
  root.classList.remove('theme-rose', 'theme-ocean', 'theme-dark', 'theme-cyberpunk')
  root.setAttribute('data-theme', theme)
  root.classList.add(`theme-${theme}`)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)
  const [mounted, setMounted] = useState(false)

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    setMounted(true)
    applyTheme(theme)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem(THEME_KEY, newTheme)
    } catch {
      // ignore
    }
    applyTheme(newTheme)
  }

  // Prevent flash by applying stored theme immediately
  useEffect(() => {
    const saved = getInitialTheme()
    applyTheme(saved)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useAppTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useAppTheme must be used within a ThemeProvider')
  }
  return context
}

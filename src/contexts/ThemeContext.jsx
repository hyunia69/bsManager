import React, { createContext, useState, useEffect } from 'react';

// Create the ThemeContext with default values
export const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
});

/**
 * ThemeProvider Component
 *
 * Manages application theme state with:
 * - Initial theme detection (localStorage → system preference → default)
 * - System preference monitoring
 * - localStorage persistence
 * - DOM attribute updates
 *
 * @param {Object} props
 * @param {ReactNode} props.children - Child components
 * @param {string} [props.defaultTheme='dark'] - Default theme if no preference found
 */
export function ThemeProvider({ children, defaultTheme = 'dark' }) {
  // Initialize theme state with detection logic
  const [theme, setTheme] = useState(() => {
    // Priority 1: Check localStorage for saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    // Priority 2: Check system preference
    if (window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }

    // Priority 3: Use default theme
    return defaultTheme;
  });

  // Effect: Update DOM and localStorage when theme changes
  useEffect(() => {
    // Update DOM attribute for CSS variable switching
    document.documentElement.setAttribute('data-theme', theme);

    // Persist to localStorage
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }, [theme]);

  // Effect: Monitor system preference changes
  useEffect(() => {
    // Only monitor if matchMedia is supported
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    // Add listener (use deprecated addListener as fallback for older browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }

    // Cleanup listener
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

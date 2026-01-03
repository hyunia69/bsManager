import { useContext } from 'react';
import { ThemeContext } from '@contexts/ThemeContext';

/**
 * useTheme - Theme management hook
 *
 * Provides access to theme state and control functions.
 * Must be used within a ThemeProvider component.
 *
 * @returns {Object} Theme API object
 * @returns {string} theme - Current theme ('light' | 'dark')
 * @returns {function} setTheme - Directly set theme to a specific value
 * @returns {function} toggleTheme - Toggle between light and dark themes
 *
 * @throws {Error} If used outside of ThemeProvider
 *
 * @example
 * const { theme, toggleTheme } = useTheme();
 * <button onClick={toggleTheme}>
 *   {theme === 'dark' ? '☀️' : '🌙'}
 * </button>
 */
export function useTheme() {
  const context = useContext(ThemeContext);

  // Error handling: Ensure hook is used within ThemeProvider
  if (!context) {
    throw new Error(
      'useTheme must be used within ThemeProvider. ' +
      'Wrap your app with <ThemeProvider>...</ThemeProvider>'
    );
  }

  return context;
}

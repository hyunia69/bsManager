import React from 'react';
import { useTheme } from '@hooks/useTheme';
import styles from './ThemeToggle.module.css';

/**
 * ThemeToggle Component
 *
 * Accessible button for switching between light and dark themes.
 * Features:
 * - Visual icon representation (🌙 dark / ☀️ light)
 * - ARIA attributes for screen reader support
 * - Keyboard navigation support
 * - Focus indicators
 * - Respects prefers-reduced-motion
 *
 * @returns {JSX.Element} Theme toggle button
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';
  const icon = isDark ? '☀️' : '🌙';
  const label = `Switch to ${isDark ? 'light' : 'dark'} mode`;

  return (
    <button
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={isDark}
      role="switch"
      title={label}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
    </button>
  );
}

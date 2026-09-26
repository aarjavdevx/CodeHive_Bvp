import React, { useEffect, useState } from 'react';

/**
 * ThemeToggle Component
 * Allows switching between Dark Theme and Light/White Theme.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('codehive_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('codehive_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn-theme-toggle"
      title={`Switch to ${theme === 'dark' ? 'Light / White' : 'Dark'} theme`}
    >
      {theme === 'dark' ? (
        <>
          <span className="theme-icon">☀️</span>
          <span className="theme-text">Light Theme</span>
        </>
      ) : (
        <>
          <span className="theme-icon">🌙</span>
          <span className="theme-text">Dark Theme</span>
        </>
      )}
    </button>
  );
}

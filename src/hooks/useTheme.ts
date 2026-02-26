// Hook pour gérer le thème clair/sombre

import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

export default function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') {
        return saved as Theme;
      }
      // Default basé sur préférence système
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return isDark ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;

    // Appliquer la classe 'dark' à <html>
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      document.body.style.colorScheme = 'light';
    }

    // Sauvegarder en localStorage
    localStorage.setItem('theme', theme);
    
    console.log('[Theme] Applied:', theme, 'HTML classes:', root.classList.toString());
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      console.log('[Theme] Toggle:', prev, '→', newTheme);
      return newTheme;
    });
  }, []);

  const setSpecificTheme = useCallback((newTheme: Theme) => {
    console.log('[Theme] Set specific:', newTheme);
    setTheme(newTheme);
  }, []);

  return {
    theme,
    resolvedTheme: theme,
    toggleTheme,
    setTheme: setSpecificTheme,
    isDark: theme === 'dark',
  };
}

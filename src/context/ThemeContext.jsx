import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('cutie-theme');
    return saved || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light', 'reader', 'macchiato');
    if (theme === 'dark') root.classList.add('dark');
    else if (theme === 'light') root.classList.add('light');
    else if (theme === 'reader') root.classList.add('reader');
    else if (theme === 'macchiato') root.classList.add('macchiato');
    localStorage.setItem('cutie-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

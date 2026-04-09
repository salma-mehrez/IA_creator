"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme ="light"|"dark";

interface ThemeContextType {
 theme: Theme;
 toggleTheme: () => void;
 setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
 theme:"light",
 toggleTheme: () => {},
 setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
 const [theme, setThemeState] = useState<Theme>("light");
 const [mounted, setMounted] = useState(false);

 useEffect(() => {
  const stored = localStorage.getItem("tubeai-theme") as Theme | null;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initial = stored ?? (prefersDark ?"dark":"light");
  setThemeState(initial);
  applyTheme(initial);
  setMounted(true);
 }, []);

 const applyTheme = (t: Theme) => {
  const root = document.documentElement;
  if (t ==="dark") {
   root.classList.add("dark");
  } else {
   root.classList.remove("dark");
  }
 };

 const setTheme = (t: Theme) => {
  setThemeState(t);
  localStorage.setItem("tubeai-theme", t);
  applyTheme(t);
 };

 const toggleTheme = () => setTheme(theme ==="light"?"dark":"light");

 if (!mounted) return null;

 return (
  <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
   {children}
  </ThemeContext.Provider>
 );
}

export function useTheme() {
 return useContext(ThemeContext);
}

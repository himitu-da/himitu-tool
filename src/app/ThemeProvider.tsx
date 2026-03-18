"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "ocean";

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType>({ theme: "light", setTheme: () => {}, mounted: false });

function normalizeTheme(theme: string | null): Theme | null {
  switch (theme) {
    case "light":
    case "dark":
    case "ocean":
      return theme;
    case "default":
      return "light";
    default:
      return null;
  }
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = normalizeTheme(localStorage.getItem("globalTheme"));
    if (savedTheme) {
      setThemeState(savedTheme);
      localStorage.setItem("globalTheme", savedTheme);
    } else {
      const oldTimerTheme = normalizeTheme(localStorage.getItem("timerTheme"));
      if (oldTimerTheme) {
        setThemeState(oldTimerTheme);
        localStorage.setItem("globalTheme", oldTimerTheme);
      }
    }
    setMounted(true);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("globalTheme", t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "default" | "dark" | "ocean";

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType>({ theme: "default", setTheme: () => {}, mounted: false });

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>("default");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("globalTheme") as Theme;
    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      // 以前のタイマーアプリのテーマ設定を引き継ぐ（あれば）
      const oldTimerTheme = localStorage.getItem("timerTheme") as Theme;
      if (oldTimerTheme) {
        setThemeState(oldTimerTheme);
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

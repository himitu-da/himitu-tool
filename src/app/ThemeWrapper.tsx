"use client";

import React from "react";
import { useTheme } from "./ThemeProvider";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme, mounted } = useTheme();

  const getThemeClasses = () => {
    switch (theme) {
      case 'dark': return 'bg-gray-900 text-gray-100';
      case 'ocean': return 'bg-cyan-900 text-cyan-50';
      default: return 'bg-[#0A0A0A] text-gray-100';
    }
  };

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-300 ${mounted ? getThemeClasses() : 'bg-[#0A0A0A] text-gray-100'}`}>
      {children}
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { useTheme, Theme } from "./ThemeProvider";

export function GlobalHeader() {
  const { theme, setTheme, mounted } = useTheme();

  // Handle header colors based on theme
  const getHeaderStyle = () => {
    switch (theme) {
      case 'dark': return 'bg-gray-800 text-white';
      case 'ocean': return 'bg-cyan-800 text-white';
      default: return 'bg-gray-100 text-gray-900';
    }
  };

  const getLinkStyle = () => {
    switch (theme) {
      case 'dark': return 'text-blue-400 hover:text-blue-300';
      case 'ocean': return 'text-cyan-200 hover:text-cyan-100';
      default: return 'text-blue-600 hover:text-blue-800';
    }
  };

  const getSelectStyle = () => {
    switch (theme) {
      case 'dark': return 'bg-gray-700 text-white focus:ring-blue-500';
      case 'ocean': return 'bg-cyan-700 text-white focus:ring-cyan-400';
      default: return 'bg-white text-gray-900 focus:ring-blue-500';
    }
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 bg-gray-100 h-16 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center"></div>
      </header>
    );
  }

  return (
    <header className={`sticky top-0 z-50 shadow-sm transition-colors duration-300 ${getHeaderStyle()}`}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <Link href="/" className={`transition-colors ${getLinkStyle()}`}>
            ひみっちゃんのKAMIツール
          </Link>
        </h1>
        
        <div className="flex items-center gap-2">
          <label htmlFor="globalThemeSelect" className="text-sm font-medium opacity-80 hidden sm:block">
            テーマ:
          </label>
          <select
            id="globalThemeSelect"
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            className={`p-1.5 rounded-md text-sm outline-none transition-colors shadow-sm ${getSelectStyle()}`}
          >
            <option value="default">ライト</option>
            <option value="dark">ダーク</option>
            <option value="ocean">オーシャン</option>
          </select>
        </div>
      </div>
    </header>
  );
}

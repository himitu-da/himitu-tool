import React from "react";
import { useToolTheme } from "@/lib/useToolTheme";

export type ToolTab<T extends string = string> = {
  id: T;
  label: React.ReactNode;
};

export type ToolTabsProps<T extends string = string> = {
  tabs: ToolTab<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
};

/**
 * 簡易/詳細などのモード切替に使うタブコンポーネント。
 * クラシックテーマはフラットなボタン形式、それ以外はフローティングピル形式。
 */
export function ToolTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = "",
}: ToolTabsProps<T>) {
  const { theme, blockCls } = useToolTheme();
  const isClassic = theme === "classic";

  if (isClassic) {
    return (
      <div className={`flex items-center gap-0 border-2 border-gray-400 !rounded-none ${className}`.trim()}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex-1 py-2 text-sm font-semibold transition-colors border-r last:border-r-0 border-gray-400 ${
              activeTab === tab.id
                ? "bg-gray-300 text-black"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300 border-t-white border-l-white border-b-gray-600 border-r-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`p-1 flex items-center gap-1 rounded-2xl ${blockCls} ${className}`.trim()}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${
            activeTab === tab.id
              ? "bg-white dark:bg-zinc-800 shadow shadow-black/5 dark:shadow-black/20 text-blue-600 dark:text-blue-400"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

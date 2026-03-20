import React from "react";
import { useToolTheme } from "@/lib/useToolTheme";

export type ToolSelectCardProps = {
  /** アクティブかどうか */
  active: boolean;
  onClick: () => void;
  /** メインラベル */
  label: React.ReactNode;
  /** サブテキスト（小さく表示） */
  sub?: React.ReactNode;
  className?: string;
};

/**
 * 文字種・文字数といった択一/複数選択カード用コンポーネント。
 * クラシックテーマは従来の枠線スタイル、それ以外はモダンなカード形式。
 */
export function ToolSelectCard({ active, onClick, label, sub, className = "" }: ToolSelectCardProps) {
  const { theme } = useToolTheme();
  const isClassic = theme === "classic";

  let cardCls: string;
  if (isClassic) {
    cardCls = active
      ? "border-2 border-gray-600 bg-gray-300 !rounded-none"
      : "border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 bg-gray-200 !rounded-none hover:bg-gray-300";
  } else {
    cardCls = active
      ? "border-blue-500 bg-blue-500/10"
      : "border-transparent bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl p-4 text-center transition-colors border ${cardCls} ${className}`.trim()}
    >
      <div className="font-semibold">{label}</div>
      {sub && <div className="text-xs mt-1 opacity-75">{sub}</div>}
    </button>
  );
}

import React from "react";
import { useToolTheme } from "@/lib/useToolTheme";

export type ToolCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  /** サブテキスト（checkboxcard / card 時に表示） */
  description?: React.ReactNode;
  /**
   * "checkbox"     : シンプルなインラインチェックボックス（旧 simple）
   * "checkboxcard" : チェックボックス付きカード形式（旧 card）
   * "card"         : チェックボックスなしカード形式（旧 cardPlain）
   */
  variant?: "checkbox" | "checkboxcard" | "card";
  className?: string;
};

export function ToolCheckbox({
  checked,
  onChange,
  label,
  description,
  variant = "checkbox",
  className = "",
}: ToolCheckboxProps) {
  const { theme } = useToolTheme();
  const isClassic = theme === "classic";

  const checkboxCls = isClassic
    ? "h-5 w-5 rounded-none border-2 border-gray-600 accent-black shrink-0"
    : "h-5 w-5 rounded-md accent-blue-600 shrink-0";

  // ── "checkboxcard" / "card" 共通のカードアクティブスタイル ───────────────
  const getCardCls = () => {
    if (isClassic) {
      return checked
        ? "border-2 border-gray-600 bg-gray-300 !rounded-none"
        : "border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 bg-gray-200 !rounded-none hover:bg-gray-300";
    }
    return checked
      ? "border-blue-500 bg-blue-500/10 shadow-sm"
      : "border-transparent bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08]";
  };

  // ── "checkboxcard" : チェックボックス付きカード ──────────────────────────
  if (variant === "checkboxcard") {
    if (isClassic) {
      // クラシックはシンプルなインライン表示
      return (
        <label className={`inline-flex items-center gap-2 text-base font-semibold cursor-pointer ${className}`.trim()}>
          <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className={checkboxCls} />
          <span>
            {label}
            {description && <span className="block text-xs mt-0.5 opacity-70 font-normal">{description}</span>}
          </span>
        </label>
      );
    }
    return (
      <label className={`flex items-center gap-3 rounded-xl p-3 sm:p-4 cursor-pointer transition-colors border ${getCardCls()} ${className}`.trim()}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className={checkboxCls} />
        <div>
          <span className="block font-bold">{label}</span>
          {description && <span className="block text-xs mt-0.5 opacity-70">{description}</span>}
        </div>
      </label>
    );
  }

  // ── "card" : チェックボックスなしカード ─────────────────────────────
  if (variant === "card") {
    return (
      <label className={`rounded-2xl p-4 text-center block cursor-pointer transition-colors border ${getCardCls()} ${className}`.trim()}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
        <div className="font-bold">{label}</div>
        {description && <div className="text-xs mt-1 opacity-75">{description}</div>}
      </label>
    );
  }

  // ── "checkbox" : インラインチェックボックス（デフォルト）───────────────────
  return (
    <label className={`inline-flex items-center gap-2 text-base sm:text-lg font-bold cursor-pointer ${className}`.trim()}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className={checkboxCls} />
      <span>{label}</span>
    </label>
  );
}

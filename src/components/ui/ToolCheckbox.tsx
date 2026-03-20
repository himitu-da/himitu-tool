import React from "react";
import { useToolTheme } from "@/lib/useToolTheme";

export type ToolCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  /** サブテキスト（variant="card" 時に表示） */
  description?: React.ReactNode;
  /**
   * "default" : シンプルなインラインチェックボックス（デフォルト）
   * "card"    : クリック範囲が広い枠線付きカード形式
   */
  variant?: "default" | "card";
  className?: string;
};

export function ToolCheckbox({
  checked,
  onChange,
  label,
  description,
  variant = "default",
  className = "",
}: ToolCheckboxProps) {
  const { theme } = useToolTheme();
  const isClassic = theme === "classic";

  const checkboxCls = isClassic
    ? "h-5 w-5 rounded-none border-2 border-gray-600 accent-black shrink-0"
    : "h-5 w-5 rounded-md accent-blue-600 shrink-0";

  if (variant === "card") {
    // クラシックはシンプルなインライン表示（カード風にしない）
    if (isClassic) {
      return (
        <label className={`inline-flex items-center gap-2 text-base font-semibold cursor-pointer ${className}`.trim()}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className={checkboxCls}
          />
          <span>{label}{description && <span className="block text-xs mt-0.5 opacity-70 font-normal">{description}</span>}</span>
        </label>
      );
    }
    const cardActiveCls = checked
      ? "border-blue-500 bg-blue-500/10"
      : "border-transparent bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10";
    return (
      <label
        className={`flex items-center gap-3 rounded-xl p-3 sm:p-4 cursor-pointer transition-colors border ${cardActiveCls} ${className}`.trim()}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className={checkboxCls}
        />
        <div>
          <span className="block font-medium">{label}</span>
          {description && <span className="block text-xs mt-0.5 opacity-70">{description}</span>}
        </div>
      </label>
    );
  }

  // variant === "default"
  return (
    <label className={`inline-flex items-center gap-2 text-base sm:text-lg font-semibold cursor-pointer ${className}`.trim()}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={checkboxCls}
      />
      <span>{label}</span>
    </label>
  );
}

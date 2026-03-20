import React, { ReactNode } from "react";
import { useToolTheme } from "@/lib/useToolTheme";

export type ToolRadioProps = {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: ReactNode;
  /** サブテキスト（variant="card" 時に表示） */
  sub?: ReactNode;
  /**
   * "radio"     : 最小構成のラジオボタン
   * "radiocard" : 従来のボタン形式（旧 simple）
   * "card"      : チェックボックスのないカード形式（旧 card）
   */
  variant?: "radio" | "radiocard" | "card";
  className?: string;
};

export function ToolRadio({
  name,
  checked,
  onChange,
  label,
  sub,
  variant = "radiocard",
  className = "",
}: ToolRadioProps) {
  const { theme, radioLabelCls } = useToolTheme();
  const isClassic = theme === "classic";

  if (variant === "card") {
    const cardCls = isClassic
      ? checked
        ? "border-2 border-gray-600 bg-gray-300 !rounded-none"
        : "border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 bg-gray-200 !rounded-none hover:bg-gray-300"
      : checked
        ? "border-blue-500 bg-blue-500/10"
        : "border-transparent bg-black/[0.04] dark:bg-white/[0.04] hover:bg-black/[0.08] dark:hover:bg-white/[0.08]";

    return (
      <label
        className={`rounded-2xl p-4 text-center block cursor-pointer transition-colors border ${cardCls} ${className}`.trim()}
      >
        <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
        <div className="font-bold">{label}</div>
        {sub && <div className="text-xs mt-1 opacity-75">{sub}</div>}
      </label>
    );
  }

  if (variant === "radio") {
    const radioCircleCls = isClassic
      ? "w-4 h-4 border-2 border-gray-600 rounded-none accent-black"
      : "w-4 h-4 accent-blue-600 cursor-pointer";

    return (
      <label className={`inline-flex items-center gap-2 text-base cursor-pointer ${className}`.trim()}>
        <input
          type="radio"
          name={name}
          checked={checked}
          onChange={onChange}
          className={radioCircleCls}
        />
        <span className="font-bold">{label}</span>
      </label>
    );
  }

  // variant === "radiocard" (旧 simple)
  // useToolTheme の radioLabelCls は既に subtle なデザインに更新済み
  const activeClass = radioLabelCls(checked);
  return (
    <label className={`rounded-xl px-4 py-2.5 text-base cursor-pointer transition-all border ${activeClass} ${className}`.trim()}>
      <div className="flex items-center gap-2">
        <input type="radio" name={name} checked={checked} onChange={onChange} className="w-4 h-4 accent-blue-600" />
        <span className="font-bold whitespace-nowrap">{label}</span>
      </div>
    </label>
  );
}

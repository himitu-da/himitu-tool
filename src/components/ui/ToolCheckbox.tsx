import React from "react";
import { useToolTheme } from "@/lib/useToolTheme";

export type ToolCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  className?: string;
};

export function ToolCheckbox({ checked, onChange, label, className = "" }: ToolCheckboxProps) {
  const { theme } = useToolTheme();
  const isClassic = theme === "classic";
  return (
    <label className={`inline-flex items-center gap-2 text-base sm:text-lg font-semibold cursor-pointer ${className}`.trim()}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={isClassic ? "h-5 w-5 rounded-none border-2 border-gray-600 accent-black" : "h-5 w-5 rounded-md accent-blue-600"}
      />
      <span>{label}</span>
    </label>
  );
}

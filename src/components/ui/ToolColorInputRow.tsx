import React from "react";
import { useToolTheme } from "@/lib/useToolTheme";

export type ToolColorInputRowProps = {
  label: string;
  colorValue: string;
  textValue: string;
  onColorChange: (value: string) => void;
  onTextChange: (value: string) => void;
  onTextBlur: () => void;
  ariaLabel: string;
  placeholder: string;
};

export function ToolColorInputRow({
  label,
  colorValue,
  textValue,
  onColorChange,
  onTextChange,
  onTextBlur,
  ariaLabel,
  placeholder,
}: ToolColorInputRowProps) {
  const { theme, inputCls } = useToolTheme();
  const isClassic = theme === "classic";

  return (
    <div>
      <label className="block text-base font-semibold mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={colorValue}
          onChange={(e) => onColorChange(e.target.value)}
          className={isClassic ? "h-12 w-16 rounded-none border-2 border-gray-400 cursor-pointer" : "h-12 w-16 rounded-xl cursor-pointer"}
          aria-label={ariaLabel}
        />
        <input
          type="text"
          value={textValue}
          onChange={(e) => onTextChange(e.target.value)}
          onBlur={onTextBlur}
          className={`w-full p-3 rounded-xl border outline-none text-base sm:text-lg focus:ring-2 transition ${inputCls}`}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

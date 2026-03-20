import React, { ReactNode } from "react";
import { useToolTheme } from "@/lib/useToolTheme";

export type ToolRadioProps = {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: ReactNode;
  className?: string;
};

export function ToolRadio({ name, checked, onChange, label, className = "" }: ToolRadioProps) {
  const { radioLabelCls } = useToolTheme();
  const activeClass = radioLabelCls(checked);
  return (
    <label className={`rounded-xl px-3 py-3 text-base cursor-pointer transition-colors ${activeClass} ${className}`.trim()}>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="mr-2" />
      {label}
    </label>
  );
}

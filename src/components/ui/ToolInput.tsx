import React, { InputHTMLAttributes } from "react";
import { useToolTheme } from "@/lib/useToolTheme";

export function ToolInput({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const { inputCls } = useToolTheme();
  return (
    <input
      {...props}
      className={`w-full p-3 rounded-xl border outline-none text-base sm:text-lg focus:ring-2 transition ${inputCls} ${className}`.trim()}
    />
  );
}

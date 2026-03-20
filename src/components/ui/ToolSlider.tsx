import React, { InputHTMLAttributes } from "react";
import { useToolTheme } from "@/lib/useToolTheme";

export function ToolSlider({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const { theme } = useToolTheme();
  const isClassic = theme === "classic";
  return (
    <input
      {...props}
      type="range"
      className={`${isClassic ? "h-2 accent-black" : "h-3"} w-full cursor-pointer ${className}`.trim()}
    />
  );
}

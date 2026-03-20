import React, { ButtonHTMLAttributes } from "react";
import { useToolTheme } from "@/lib/useToolTheme";

export type ToolButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function ToolButton({ variant = "primary", className = "", children, ...props }: ToolButtonProps) {
  const { primaryBtnCls, secondaryBtnCls } = useToolTheme();
  const btnCls = variant === "primary" ? primaryBtnCls : secondaryBtnCls;
  
  const baseCls = "rounded-xl font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  
  return (
    <button className={`${baseCls} ${btnCls} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

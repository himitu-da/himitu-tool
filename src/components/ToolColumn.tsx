import React from "react";

interface ToolColumnProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ツールパネルを縦に積んでいくためのカラムコンポーネント。
 */
export function ToolColumn({ children, className = "", style }: ToolColumnProps) {
  return (
    <div className={`flex flex-col gap-6 ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}

import React from "react";

interface ToolGridProps {
  children: React.ReactNode;
  /** デフォルトは2カラム（PC時）。1や3も指定可能 */
  cols?: 1 | 2 | 3;
  /** 追加のスタイリング（`xl:grid-cols-[...]` のようなカスタム指定もここに追加） */
  className?: string;
}

/**
 * ツール内でカラムを分けるためのグリッドコンポーネント。
 */
export function ToolGrid({ children, cols = 2, className = "" }: ToolGridProps) {
  const colCls = cols === 1 ? "grid-cols-1" : cols === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3";
  return (
    <div className={`grid gap-6 items-start ${colCls} ${className}`.trim()}>
      {children}
    </div>
  );
}

"use client";

import React from "react";

import { useToolTheme } from "@/lib/useToolTheme";

interface ToolPanelProps {
    children: React.ReactNode;
    /** 追加の Tailwind クラス（padding・grid など） */
    className?: string;
    /** インラインスタイル（動的な sticky top など） */
    style?: React.CSSProperties;
}

/**
 * 罫線なし・角丸のメインコンテンツパネル。
 * テーマに応じた背景色を自動適用する。
 *
 * @example
 * ```tsx
 * <ToolPanel>
 *   <p>コンテンツ</p>
 * </ToolPanel>
 * ```
 */
export function ToolPanel({ children, className = "", style }: ToolPanelProps) {
    const { panelCls } = useToolTheme();

    return (
        <section className={`rounded-2xl p-5 sm:p-7 shadow-sm ${panelCls} ${className}`.trim()} style={style}>
            {children}
        </section>
    );
}

"use client";

import React from "react";

import { ToolStickyHeader } from "@/components/ToolStickyHeader";
import { useToolTheme } from "@/lib/useToolTheme";

type MaxWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";

const maxWidthClass: Record<MaxWidth, string> = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
};

interface ToolPageLayoutProps {
    /** ToolStickyHeader に表示するツール名 */
    title: string;
    children: React.ReactNode;
    /** main コンテナの最大幅。デフォルト "2xl" */
    maxWidth?: MaxWidth;
    /** ToolStickyHeader の rightSlot */
    headerRightSlot?: React.ReactNode;
    /** ToolStickyHeader に追加する className */
    headerClassName?: string;
}

/**
 * ツールページの共通外枠。
 * ページ背景・ToolStickyHeader・main コンテナを内包する。
 *
 * @example
 * ```tsx
 * <ToolPageLayout title="電卓">
 *   <ToolPanel>...</ToolPanel>
 * </ToolPageLayout>
 * ```
 */
export function ToolPageLayout({
    title,
    children,
    maxWidth = "2xl",
    headerRightSlot,
    headerClassName = "",
}: ToolPageLayoutProps) {
    const { pageCls } = useToolTheme();

    return (
        <div className={`min-h-screen transition-colors duration-300 ${pageCls}`}>
            <ToolStickyHeader
                title={title}
                rightSlot={headerRightSlot}
                className={`bg-gray-800 text-white ${headerClassName}`.trim()}
            />
            <main
                className={`w-full ${maxWidthClass[maxWidth]} mx-auto px-4 pt-4 pb-10 text-base sm:text-lg`}
            >
                {children}
            </main>
        </div>
    );
}

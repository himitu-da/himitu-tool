"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";

import { ToolStickyHeader } from "@/components/ToolStickyHeader";
import { findToolByPathname } from "@/lib/tools";
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
    title: string;
    children: React.ReactNode;
    maxWidth?: MaxWidth;
    headerRightSlot?: React.ReactNode;
    headerClassName?: string;
}

export function ToolPageLayout({
    title,
    children,
    maxWidth = "2xl",
    headerRightSlot,
    headerClassName = "",
}: ToolPageLayoutProps) {
    const { pageCls } = useToolTheme();
    const pathname = usePathname();
    const toolContext = useMemo(() => findToolByPathname(pathname), [pathname]);

    return (
        <>
            {toolContext && (
                <div className="px-4 pt-4 pb-2">
                    <nav aria-label="パンくずリスト" className="flex flex-wrap items-center gap-2 text-sm opacity-70 sm:text-base">
                        <Link href="/" className="transition-opacity hover:opacity-100">
                            トップページ
                        </Link>
                        <span aria-hidden="true">＞</span>
                        <Link href={toolContext.category.path} className="transition-opacity hover:opacity-100">
                            {toolContext.category.category}
                        </Link>
                        <span aria-hidden="true">＞</span>
                        <span className="opacity-100">{toolContext.tool.title}</span>
                    </nav>
                </div>
            )}

            <div className={`min-h-screen transition-colors duration-300 ${pageCls}`}>
                <ToolStickyHeader
                    title={title}
                    rightSlot={headerRightSlot}
                    className={`bg-gray-800 text-white ${headerClassName}`.trim()}
                />
                <main className={`w-full ${maxWidthClass[maxWidth]} mx-auto px-4 pt-4 pb-10 text-base sm:text-lg`}>
                    {children}
                </main>
            </div>
        </>
    );
}

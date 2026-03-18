"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronRight, ChevronDown } from "lucide-react";
import { categorizedTools } from "../lib/tools";
import { useTheme } from "../app/ThemeProvider";

export function HamburgerMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [openCategory, setOpenCategory] = useState<string | null>(null);
    const [isToolsExpanded, setIsToolsExpanded] = useState(false);
    const { theme, mounted } = useTheme();

    // Prevent background scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Handle sidebar colors based on theme
    const getSidebarStyle = () => {
        switch (theme) {
            case "light":
                return "bg-white text-gray-900";
            case "dark":
                return "bg-gray-900 text-white";
            case "ocean":
                return "bg-cyan-900 text-white";
            default:
                return "bg-white text-gray-900";
        }
    };

    const getItemHoverStyle = () => {
        switch (theme) {
            case "light":
                return "hover:bg-black/5";
            case "dark":
                return "hover:bg-white/10";
            case "ocean":
                return "hover:bg-white/10";
            default:
                return "hover:bg-black/5";
        }
    };

    const getSubMenuBgStyle = () => {
        switch (theme) {
            case "light":
                return "bg-black/5";
            case "dark":
                return "bg-white/5";
            case "ocean":
                return "bg-black/10";
            default:
                return "bg-black/5";
        }
    };

    if (!mounted) {
        return (
            <button className="p-2 opacity-0 cursor-default" aria-hidden="true">
                <Menu size={24} />
            </button>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 hover:opacity-75 transition-opacity rounded-md"
                aria-label="メニューを開く"
            >
                <Menu size={24} />
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[60] bg-black/50 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-72 md:w-80 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${getSidebarStyle()} ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex items-center justify-between p-4 mb-2">
                    <h2 className="text-xl font-bold">メニュー</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className={`p-2 rounded-md transition-opacity ${getItemHoverStyle()}`}
                        aria-label="メニューを閉じる"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-4">
                    <Link
                        href="/"
                        onClick={() => setIsOpen(false)}
                        className={`block p-3 rounded-lg font-medium transition-colors ${getItemHoverStyle()}`}
                    >
                        トップページ
                    </Link>

                    <div>
                        <div className="flex items-center justify-between mb-2 px-1">
                            <p className="text-sm opacity-60 px-2 font-bold">ツール一覧</p>
                            <button
                                onClick={() => setIsToolsExpanded(!isToolsExpanded)}
                                className={`p-1 rounded-md transition-colors opacity-70 hover:opacity-100 ${getItemHoverStyle()}`}
                                aria-label={isToolsExpanded ? "ツール一覧を折りたたむ" : "ツール一覧を展開する"}
                            >
                                {isToolsExpanded ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <polyline points="9 21 3 21 3 15"></polyline>
                                        <line x1="21" y1="3" x2="14" y2="10"></line>
                                        <line x1="3" y1="21" x2="10" y2="14"></line>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="4 14 10 14 10 20"></polyline>
                                        <polyline points="20 10 14 14 14 4"></polyline>
                                        <line x1="14" y1="10" x2="21" y2="3"></line>
                                        <line x1="3" y1="21" x2="10" y2="14"></line>
                                    </svg>
                                )}
                            </button>
                        </div>

                        {isToolsExpanded ? (
                            <div className="space-y-2">
                                {categorizedTools.map((cat) => (
                                    <div key={cat.category} className="rounded-lg overflow-hidden">
                                        <button
                                            onClick={() =>
                                                setOpenCategory(openCategory === cat.category ? null : cat.category)
                                            }
                                            className={`w-full flex items-center justify-between p-3 transition-colors ${getItemHoverStyle()}`}
                                        >
                                            <span className="font-medium text-sm">{cat.category}</span>
                                            {openCategory === cat.category ? (
                                                <ChevronDown size={18} />
                                            ) : (
                                                <ChevronRight size={18} />
                                            )}
                                        </button>

                                        {openCategory === cat.category && (
                                            <div className={`p-2 space-y-1 ${getSubMenuBgStyle()}`}>
                                                {cat.tools.map((tool) => (
                                                    <Link
                                                        key={tool.path}
                                                        href={tool.path}
                                                        onClick={() => setIsOpen(false)}
                                                        className={`flex items-center gap-3 p-2 rounded-md text-sm transition-colors ${getItemHoverStyle()}`}
                                                    >
                                                        <span className="text-base">{tool.icon}</span>
                                                        <span>{tool.title}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6 mt-4">
                                {categorizedTools.map((cat) => (
                                    <div key={`min-${cat.category}`}>
                                        <h3 className="text-sm font-bold opacity-70 mb-3 px-2">{cat.category}</h3>
                                        <ul className="flex flex-wrap gap-1.5 px-2">
                                            {cat.tools.map((tool) => (
                                                <li key={`min-${tool.path}`}>
                                                    <Link
                                                        href={tool.path}
                                                        onClick={() => setIsOpen(false)}
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-opacity text-xs font-medium ${getSubMenuBgStyle()} hover:opacity-75`}
                                                    >
                                                        <span>{tool.icon}</span>
                                                        <span>{tool.title}</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

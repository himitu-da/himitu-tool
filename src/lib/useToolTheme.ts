"use client";

import { useTheme } from "@/app/ThemeProvider";
import type { Theme } from "@/app/ThemeProvider";

export interface ToolTheme {
    theme: Theme;
    /** ページ最外殻の背景・文字色 */
    pageCls: string;
    /** メインパネル（border なし角丸白）の背景色 */
    panelCls: string;
    /** パネル内設定ブロックの背景色 */
    blockCls: string;
    /** 補足テキストの文字色 */
    mutedTextCls: string;
    /** input / textarea / select の見た目 */
    inputCls: string;
    /** プライマリボタンの色 */
    primaryBtnCls: string;
    /** セカンダリボタンの色 */
    secondaryBtnCls: string;
    /** ラジオ/トグルラベルの色。active=true でハイライト */
    radioLabelCls: (active: boolean) => string;
}

export function useToolTheme(): ToolTheme {
    const { theme } = useTheme();

    const pageCls = (() => {
        switch (theme) {
            case "dark": return "bg-gray-900 text-gray-100";
            case "ocean": return "bg-cyan-950 text-cyan-50";
            default: return "bg-gray-50 text-gray-900";
        }
    })();

    const panelCls = (() => {
        switch (theme) {
            case "dark": return "bg-gray-800";
            case "ocean": return "bg-cyan-900/80";
            default: return "bg-white";
        }
    })();

    const blockCls = (() => {
        switch (theme) {
            case "dark": return "bg-gray-700/70";
            case "ocean": return "bg-cyan-800/70";
            default: return "bg-gray-100";
        }
    })();

    const mutedTextCls = (() => {
        switch (theme) {
            case "dark": return "text-gray-300";
            case "ocean": return "text-cyan-100/90";
            default: return "text-gray-600";
        }
    })();

    const inputCls = (() => {
        switch (theme) {
            case "dark":
                return "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:ring-blue-400";
            case "ocean":
                return "bg-cyan-800 border-cyan-700 text-cyan-50 placeholder:text-cyan-200/70 focus:ring-cyan-300";
            default:
                return "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-blue-500";
        }
    })();

    const primaryBtnCls = (() => {
        switch (theme) {
            case "dark": return "bg-blue-500 hover:bg-blue-400 text-white";
            case "ocean": return "bg-cyan-400 hover:bg-cyan-300 text-cyan-950";
            default: return "bg-blue-600 hover:bg-blue-700 text-white";
        }
    })();

    const secondaryBtnCls = (() => {
        switch (theme) {
            case "dark": return "bg-sky-600 hover:bg-sky-500 text-white";
            case "ocean": return "bg-teal-600 hover:bg-teal-500 text-white";
            default: return "bg-slate-700 hover:bg-slate-600 text-white";
        }
    })();

    const radioLabelCls = (active: boolean): string => {
        if (active) {
            switch (theme) {
                case "dark": return "bg-sky-600 text-white";
                case "ocean": return "bg-teal-600 text-white";
                default: return "bg-slate-700 text-white";
            }
        }
        switch (theme) {
            case "dark": return "bg-gray-800 text-gray-300";
            case "ocean": return "bg-cyan-900/60 text-cyan-100";
            default: return "bg-gray-50 text-gray-600";
        }
    };

    return {
        theme,
        pageCls,
        panelCls,
        blockCls,
        mutedTextCls,
        inputCls,
        primaryBtnCls,
        secondaryBtnCls,
        radioLabelCls,
    };
}

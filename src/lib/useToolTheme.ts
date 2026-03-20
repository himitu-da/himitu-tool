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
    /** ロード中の骨格エリア用（スケルトン） */
    skeletonCls: string;
    /** 何もないときのプレースホルダー表示用 */
    placeholderBoxCls: string;
    /** 装飾的な枠線（コンテナや画像の枠向け） */
    containerBorderCls: string;
}

export function useToolTheme(): ToolTheme {
    const { theme } = useTheme();

    const pageCls = (() => {
        switch (theme) {
            case "light": return "bg-gray-50 text-gray-900";
            case "dark": return "bg-gray-900 text-gray-100";
            case "ocean": return "bg-cyan-950 text-cyan-50";
            case "classic": return "bg-white text-black font-serif";
            default: return "bg-gray-50 text-gray-900";
        }
    })();

    const panelCls = (() => {
        switch (theme) {
            case "light": return "bg-white";
            case "dark": return "bg-gray-800";
            case "ocean": return "bg-cyan-900/80";
            case "classic": return "bg-white border-2 border-gray-400 !rounded-none !shadow-none";
            default: return "bg-white";
        }
    })();

    const blockCls = (() => {
        switch (theme) {
            case "light": return "bg-gray-100";
            case "dark": return "bg-gray-700/70";
            case "ocean": return "bg-cyan-800/70";
            case "classic": return "bg-gray-100 border border-gray-400 !rounded-none !shadow-none";
            default: return "bg-gray-100";
        }
    })();

    const mutedTextCls = (() => {
        switch (theme) {
            case "light": return "text-gray-600";
            case "dark": return "text-gray-300";
            case "ocean": return "text-cyan-100/90";
            case "classic": return "text-gray-700";
            default: return "text-gray-600";
        }
    })();

    const inputCls = (() => {
        switch (theme) {
            case "light":
                return "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-blue-500";
            case "dark":
                return "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:ring-blue-400";
            case "ocean":
                return "bg-cyan-800 border-cyan-700 text-cyan-50 placeholder:text-cyan-200/70 focus:ring-cyan-300";
            case "classic":
                return "bg-white border-2 border-gray-400 text-black !rounded-none focus:ring-0 focus:border-black shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3)]";
            default:
                return "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-blue-500";
        }
    })();

    const primaryBtnCls = (() => {
        switch (theme) {
            case "light": return "bg-blue-600 hover:bg-blue-700 text-white";
            case "dark": return "bg-blue-500 hover:bg-blue-400 text-white";
            case "ocean": return "bg-cyan-400 hover:bg-cyan-300 text-cyan-950";
            case "classic": return "bg-gray-200 border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 text-black !rounded-none active:border-t-gray-600 active:border-l-gray-600 active:border-b-white active:border-r-white hover:bg-gray-300";
            default: return "bg-blue-600 hover:bg-blue-700 text-white";
        }
    })();

    const secondaryBtnCls = (() => {
        switch (theme) {
            case "light": return "bg-slate-700 hover:bg-slate-600 text-white";
            case "dark": return "bg-sky-600 hover:bg-sky-500 text-white";
            case "ocean": return "bg-teal-600 hover:bg-teal-500 text-white";
            case "classic": return "bg-gray-200 border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 text-black !rounded-none active:border-t-gray-600 active:border-l-gray-600 active:border-b-white active:border-r-white hover:bg-gray-300";
            default: return "bg-slate-700 hover:bg-slate-600 text-white";
        }
    })();

    const radioLabelCls = (active: boolean): string => {
        if (active) {
            switch (theme) {
                case "light": return "bg-slate-700 text-white";
                case "dark": return "bg-sky-600 text-white";
                case "ocean": return "bg-teal-600 text-white";
                case "classic": return "bg-gray-300 border-2 border-gray-600 text-black !rounded-none font-bold";
                default: return "bg-slate-700 text-white";
            }
        }
        switch (theme) {
            case "light": return "bg-gray-50 text-gray-600";
            case "dark": return "bg-gray-800 text-gray-300";
            case "ocean": return "bg-cyan-900/60 text-cyan-100";
            case "classic": return "bg-gray-100 border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 text-black !rounded-none";
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
        skeletonCls: (() => {
            switch (theme) {
                case "light": return "bg-gray-200 animate-pulse";
                case "dark": return "bg-gray-700 animate-pulse";
                case "ocean": return "bg-cyan-800/60 animate-pulse";
                case "classic": return "bg-gray-200 border border-gray-400 !rounded-none animate-pulse";
                default: return "bg-gray-200 animate-pulse";
            }
        })(),
        placeholderBoxCls: (() => {
            switch (theme) {
                case "light": return "bg-gray-100 text-gray-500";
                case "dark": return "bg-gray-700/50 text-gray-400";
                case "ocean": return "bg-cyan-900/50 text-cyan-200";
                case "classic": return "bg-gray-100 text-gray-700 border border-gray-400 !rounded-none";
                default: return "bg-gray-100 text-gray-500";
            }
        })(),
        containerBorderCls: (() => {
            switch (theme) {
                case "classic": return "border border-gray-400 !rounded-none";
                default: return "";
            }
        })(),
    };
}

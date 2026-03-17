"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeProvider';
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";
import { dseg7ClassicBold, dseg14ClassicBold } from "@/lib/digitalFonts";

type FontStyle = 'default' | 'roman' | 'digital';
type GaugeShape = 'round' | 'square';

interface Settings {
    decimals: number;
    fontStyle: FontStyle;
    gaugeShape: GaugeShape;
}

export default function YearTimerPage() {
    const { theme, mounted: isClient } = useTheme();
    const { pageCls, panelCls, blockCls, mutedTextCls, inputCls, primaryBtnCls } = useToolTheme();

    // Settings
    const [settings, setSettings] = useState<Settings>({
        decimals: 5,
        fontStyle: 'default',
        gaugeShape: 'round',
    });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Stats
    const [timeState, setTimeState] = useState({
        percent: 0,
        elapsedMs: 0,
        totalMs: 1,
        currentYear: new Date().getFullYear(),
    });

    useEffect(() => {
        const savedDecimals = localStorage.getItem('yearTimerDecimals');
        const savedFontStyle = localStorage.getItem('yearTimerFontStyle');
        const savedGaugeShape = localStorage.getItem('yearTimerGaugeShape');

        setSettings((prev) => ({
            ...prev,
            decimals: savedDecimals ? parseInt(savedDecimals, 10) : prev.decimals,
            fontStyle: savedFontStyle === 'roman' || savedFontStyle === 'digital' || savedFontStyle === 'default'
                ? savedFontStyle
                : prev.fontStyle,
            gaugeShape: savedGaugeShape === 'square' || savedGaugeShape === 'round'
                ? savedGaugeShape
                : prev.gaugeShape,
        }));
    }, []);

    useEffect(() => {
        let animationFrameId: number;

        const tick = () => {
            const now = new Date();
            const currentYear = now.getFullYear();
            const startOfYear = new Date(currentYear, 0, 1).getTime();
            const endOfYear = new Date(currentYear + 1, 0, 1).getTime();

            const totalMs = endOfYear - startOfYear;
            const elapsedMs = now.getTime() - startOfYear;
            const percent = (elapsedMs / totalMs) * 100;

            setTimeState({
                percent,
                elapsedMs,
                totalMs,
                currentYear
            });

            animationFrameId = requestAnimationFrame(tick);
        };

        animationFrameId = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const updateSettings = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));

        if (key === 'decimals') {
            localStorage.setItem('yearTimerDecimals', String(value));
        }
        if (key === 'fontStyle') {
            localStorage.setItem('yearTimerFontStyle', String(value));
        }
        if (key === 'gaugeShape') {
            localStorage.setItem('yearTimerGaugeShape', String(value));
        }
    };

    if (!isClient) return <div className="min-h-screen bg-gray-50 text-gray-900" />;

    const formatPercent = (percent: number) => {
        return percent.toFixed(settings.decimals);
    };

    const remainingDays = Math.ceil((timeState.totalMs - timeState.elapsedMs) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.floor(timeState.elapsedMs / (1000 * 60 * 60 * 24));

    // Gauge colors based on theme
    const getGaugeBg = () => {
        switch (theme) {
            case 'dark': return 'bg-gray-700';
            case 'ocean': return 'bg-cyan-900';
            default: return 'bg-gray-200';
        }
    };

    const getGaugeFill = () => {
        switch (theme) {
            case 'dark': return 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]';
            case 'ocean': return 'bg-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.5)]';
            default: return 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]';
        }
    };

    const getPercentFontClass = () => {
        switch (settings.fontStyle) {
            case 'roman':
                return 'font-serif';
            case 'digital':
                return dseg7ClassicBold.className;
            default:
                return 'font-mono';
        }
    };

    const getPercentSymbolClass = () => {
        if (settings.fontStyle === 'digital') {
            return dseg14ClassicBold.className;
        }
        return '';
    };

    const gaugeShapeClass = settings.gaugeShape === 'square' ? 'rounded-md' : 'rounded-full';

    return (
        <ToolPageLayout
            title="1年タイマー"
            maxWidth="3xl"
            headerRightSlot={
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
                    title="設定"
                    aria-label="設定を開く"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </button>
            }
        >
            <ToolPanel className="flex flex-col items-center justify-center p-8 min-h-[50vh]">
                <div className="w-full text-center mb-8">
                    <h2 className={`text-2xl sm:text-3xl font-bold font-sans tracking-wider mb-2 ${theme === 'default' ? 'text-gray-800' : 'text-white'}`}>
                        {timeState.currentYear}年の経過
                    </h2>
                </div>

                {/* The main Percentage Text */}
                <div className="w-full flex justify-center mb-10 select-none">
                    <div className="text-center font-bold tracking-tight text-5xl sm:text-7xl lg:text-8xl" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        <span className={getPercentFontClass()}>{formatPercent(timeState.percent)}</span>
                        <span className={`text-3xl sm:text-5xl lg:text-6xl text-opacity-80 ml-2 ${getPercentSymbolClass()}`}>%</span>
                    </div>
                </div>

                {/* Progress Bar (Gauge) */}
                <div className={`w-full h-8 sm:h-12 overflow-hidden mb-8 relative ${gaugeShapeClass} ${getGaugeBg()}`}>
                    <div
                        className={`h-full transition-all duration-75 ease-out relative overflow-hidden ${gaugeShapeClass} ${getGaugeFill()}`}
                        style={{ width: `${timeState.percent}%` }}
                    >
                        {/* Glossy overlay effect to make it look premium */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
                    </div>
                </div>

                {/* Stats footer in a block container */}
                <div className={`w-full max-w-2xl mx-auto rounded-2xl p-6 flex flex-col sm:flex-row justify-around flex-wrap gap-4 ${blockCls}`}>
                    <div className="text-center">
                        <div className="text-sm opacity-80 mb-1">経過日数</div>
                        <div className="text-2xl font-bold">{elapsedDays}日</div>
                    </div>
                    <div className="hidden sm:block w-px bg-current opacity-20"></div>
                    <div className="text-center">
                        <div className="text-sm opacity-80 mb-1">残り日数</div>
                        <div className="text-2xl font-bold">{remainingDays}日</div>
                    </div>
                </div>
            </ToolPanel>

            {/* Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity" onClick={() => setIsSettingsOpen(false)}>
                    <div
                        className={`relative w-full max-w-sm p-6 rounded-3xl shadow-2xl transition-all ${panelCls}`}
                        onClick={e => e.stopPropagation()}
                    >
                        <button onClick={() => setIsSettingsOpen(false)} className={`absolute top-4 right-4 transition-colors ${theme === 'default' ? 'text-gray-500 hover:text-gray-800' : 'text-gray-400 hover:text-white'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                        <h2 className="text-2xl font-bold mb-6">設定</h2>

                        <div className="space-y-6">
                            <div className={`p-4 rounded-xl ${blockCls}`}>
                                <label className="block font-medium mb-3">小数点以下の表示桁数: <span className="font-bold">{settings.decimals}桁</span></label>
                                <input
                                    type="range"
                                    min="0"
                                    max="6"
                                    value={settings.decimals}
                                    onChange={(e) => updateSettings('decimals', parseInt(e.target.value, 10))}
                                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-500 bg-black/10 dark:bg-white/20"
                                />
                                <div className="flex justify-between text-xs mt-2 opacity-60">
                                    <span>0</span>
                                    <span>1</span>
                                    <span>2</span>
                                    <span>3</span>
                                    <span>4</span>
                                    <span>5</span>
                                    <span>6</span>
                                </div>
                            </div>

                            <div className={`p-4 rounded-xl ${blockCls}`}>
                                <label className="block font-medium mb-3">フォント</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => updateSettings('fontStyle', 'default')}
                                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${settings.fontStyle === 'default' ? primaryBtnCls : inputCls}`}
                                    >
                                        デフォルト
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updateSettings('fontStyle', 'roman')}
                                        className={`px-3 py-2 rounded-lg text-sm font-semibold font-serif transition-colors ${settings.fontStyle === 'roman' ? primaryBtnCls : inputCls}`}
                                    >
                                        ローマン
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updateSettings('fontStyle', 'digital')}
                                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${dseg7ClassicBold.className} ${settings.fontStyle === 'digital' ? primaryBtnCls : inputCls}`}
                                    >
                                        デジタル
                                    </button>
                                </div>
                            </div>

                            <div className={`p-4 rounded-xl ${blockCls}`}>
                                <label className="block font-medium mb-3">ゲージ形状</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => updateSettings('gaugeShape', 'round')}
                                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${settings.gaugeShape === 'round' ? primaryBtnCls : inputCls}`}
                                    >
                                        丸
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updateSettings('gaugeShape', 'square')}
                                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${settings.gaugeShape === 'square' ? primaryBtnCls : inputCls}`}
                                    >
                                        四角
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setIsSettingsOpen(false)}
                                className={`px-6 py-2 rounded-lg transition-colors shadow-md ${primaryBtnCls}`}
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )
            }
        </ToolPageLayout >
    );
}

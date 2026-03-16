"use client";

import React, { useState, useEffect, useRef } from "react";
import localFont from "next/font/local";
import { useTheme } from "../ThemeProvider";

const dseg7ClassicBold = localFont({
  src: "./DSEG7Classic-Bold.woff2",
  weight: "700",
  style: "normal",
  display: "swap",
});

const dseg14ClassicBold = localFont({
  src: "./DSEG14Classic-Bold.woff2",
  weight: "700",
  style: "normal",
  display: "swap",
});

type FrequencyPreset = "60fps" | "10fps" | "2fps" | "1fps" | "custom";
type DecimalPlaces = 0 | 1 | 2 | 3;
type FontKind = "default" | "roman" | "digital";

interface SalarySettings {
  updateFrequency: FrequencyPreset;
  customFrequencySec: number;
  decimalPlaces: DecimalPlaces;
  fontFamily: FontKind;
}

const YEN_SIGN = "\u00A5";

export default function SalaryTimerPage() {
  const { theme, mounted: isClient } = useTheme();

  const [hourlyWage, setHourlyWage] = useState<number>(1000);
  const [settings, setSettings] = useState<SalarySettings>({
    updateFrequency: "10fps",
    customFrequencySec: 5,
    decimalPlaces: 0,
    fontFamily: "default",
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const requestRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const frameAccumulatorRef = useRef<number>(0);
  const fixedElapsedRef = useRef<number>(0);
  const frequencyPresetRef = useRef<FrequencyPreset>("10fps");
  const customFrequencyRef = useRef<number>(5);

  const getFrequencyMs = (preset: FrequencyPreset, customSec: number) => {
    switch (preset) {
      case "60fps":
        return 1000 / 60;
      case "10fps":
        return 1000 / 10;
      case "2fps":
        return 1000 / 2;
      case "1fps":
        return 1000;
      case "custom":
        return Math.max(0.1, customSec) * 1000;
      default:
        return 100;
    }
  };

  const saveSetting = <K extends keyof SalarySettings>(key: K, value: SalarySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    localStorage.setItem(`salaryTimer.${key}`, String(value));
  };

  const saveHourlyWage = (value: number) => {
    setHourlyWage(value);
    localStorage.setItem("salaryTimer.hourlyWage", String(value));
  };

  useEffect(() => {
    const storedWage = localStorage.getItem("salaryTimer.hourlyWage");
    const storedFrequency = localStorage.getItem("salaryTimer.updateFrequency") as FrequencyPreset | null;
    const storedCustom = localStorage.getItem("salaryTimer.customFrequencySec");
    const storedDecimal = localStorage.getItem("salaryTimer.decimalPlaces");
    const storedFont = localStorage.getItem("salaryTimer.fontFamily") as FontKind | null;

    if (storedWage !== null) {
      const parsed = Number(storedWage);
      if (Number.isFinite(parsed) && parsed >= 0) {
        setHourlyWage(parsed);
      }
    }

    setSettings((prev) => ({
      ...prev,
      updateFrequency:
        storedFrequency === "60fps" ||
        storedFrequency === "10fps" ||
        storedFrequency === "2fps" ||
        storedFrequency === "1fps" ||
        storedFrequency === "custom"
          ? storedFrequency
          : prev.updateFrequency,
      customFrequencySec:
        storedCustom !== null && Number(storedCustom) > 0 ? Number(storedCustom) : prev.customFrequencySec,
      decimalPlaces:
        storedDecimal === "0" || storedDecimal === "1" || storedDecimal === "2" || storedDecimal === "3"
          ? (Number(storedDecimal) as DecimalPlaces)
          : prev.decimalPlaces,
      fontFamily:
        storedFont === "default" || storedFont === "roman" || storedFont === "digital"
          ? storedFont
          : prev.fontFamily,
    }));
  }, []);

  useEffect(() => {
    frequencyPresetRef.current = settings.updateFrequency;
    customFrequencyRef.current = settings.customFrequencySec;
    frameAccumulatorRef.current = 0;
  }, [settings.updateFrequency, settings.customFrequencySec]);

  useEffect(() => {
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const tick = (time: number): void => {
    if (lastFrameTimeRef.current === null) {
      lastFrameTimeRef.current = time;
    }

    const deltaMs = time - lastFrameTimeRef.current;
    lastFrameTimeRef.current = time;

    const intervalMs = getFrequencyMs(frequencyPresetRef.current, customFrequencyRef.current);
    frameAccumulatorRef.current += deltaMs;

    if (frameAccumulatorRef.current >= intervalMs) {
      const stepCount = Math.floor(frameAccumulatorRef.current / intervalMs);
      frameAccumulatorRef.current -= stepCount * intervalMs;
      fixedElapsedRef.current += stepCount * intervalMs;
      setElapsedMs(fixedElapsedRef.current);
    }

    requestRef.current = requestAnimationFrame(tick);
  };

  const handleStart = () => {
    if (isRunning) return;
    setIsRunning(true);
    lastFrameTimeRef.current = null;
    frameAccumulatorRef.current = 0;
    requestRef.current = requestAnimationFrame(tick);
  };

  const handleStop = () => {
    if (!isRunning) return;
    setIsRunning(false);
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
    }
    lastFrameTimeRef.current = null;
    frameAccumulatorRef.current = 0;
    requestRef.current = null;
  };

  const handleReset = () => {
    handleStop();
    fixedElapsedRef.current = 0;
    setElapsedMs(0);
  };

  const moneyEarned = (hourlyWage / 3600000) * elapsedMs;

  const getThemeClasses = () => {
    if (!isClient) return "bg-gray-50 text-gray-900";
    switch (theme) {
      case "dark":
        return "bg-gray-900 text-gray-100";
      case "ocean":
        return "bg-cyan-900 text-cyan-50";
      default:
        return "bg-gray-50 text-gray-900";
    }
  };

  const getHeaderClasses = () => {
    if (!isClient) return "bg-slate-800 text-white";
    switch (theme) {
      case "dark":
        return "bg-slate-900 text-white";
      case "ocean":
        return "bg-cyan-950 text-cyan-50";
      default:
        return "bg-slate-800 text-white";
    }
  };

  const getPanelClasses = () => {
    if (!isClient) return "bg-white";
    switch (theme) {
      case "dark":
        return "bg-gray-800";
      case "ocean":
        return "bg-cyan-800";
      default:
        return "bg-white";
    }
  };

  const getButtonClass = (variant: "primary" | "danger" | "secondary") => {
    const base =
      "flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
    if (!isClient) {
      if (variant === "primary") return `${base} bg-green-600 text-white`;
      if (variant === "danger") return `${base} bg-red-600 text-white`;
      return `${base} bg-gray-200 text-gray-800`;
    }

    switch (theme) {
      case "dark":
        if (variant === "primary") return `${base} bg-green-600 hover:bg-green-500 text-white`;
        if (variant === "danger") return `${base} bg-red-600 hover:bg-red-500 text-white`;
        return `${base} bg-gray-700 hover:bg-gray-600 text-gray-100`;
      case "ocean":
        if (variant === "primary") return `${base} bg-cyan-600 hover:bg-cyan-500 text-white`;
        if (variant === "danger") return `${base} bg-red-700 hover:bg-red-600 text-white`;
        return `${base} bg-cyan-700 hover:bg-cyan-600 text-cyan-50`;
      default:
        if (variant === "primary") return `${base} bg-green-600 hover:bg-green-700 text-white`;
        if (variant === "danger") return `${base} bg-red-600 hover:bg-red-700 text-white`;
        return `${base} bg-gray-200 hover:bg-gray-300 text-gray-800`;
    }
  };

  const getInputClass = () => {
    const base =
      "w-full p-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-60 transition-colors";
    if (!isClient) return `${base} border-gray-300 bg-white text-gray-900`;
    switch (theme) {
      case "dark":
        return `${base} bg-gray-700 border-gray-600 text-white focus:ring-blue-500`;
      case "ocean":
        return `${base} bg-cyan-700 border-cyan-500 text-cyan-50 focus:ring-cyan-200`;
      default:
        return `${base} bg-white border-gray-300 text-gray-900 focus:ring-blue-500`;
    }
  };

  const displayFontClassName =
    settings.fontFamily === "default"
      ? "font-sans"
      : settings.fontFamily === "roman"
      ? "font-serif"
      : `${dseg7ClassicBold.className} tracking-wider`;

  const yenFontClassName =
    settings.fontFamily === "digital"
      ? `${dseg14ClassicBold.className} tracking-wider`
      : settings.fontFamily === "roman"
      ? "font-serif"
      : "font-sans";

  const formatElapsed = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  if (!isClient) return <div className="min-h-screen bg-gray-50 text-gray-900" />;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${getThemeClasses()}`}>
      <header className={`sticky top-0 z-40 flex items-center justify-between p-4 shadow-md ${getHeaderClasses()}`}>
        <h2 className="text-xl font-bold">給料タイマー</h2>
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
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto flex flex-col items-center justify-center p-4">
        <div className={`w-full max-w-xl rounded-2xl p-6 sm:p-8 shadow-lg ${getPanelClasses()}`}>
          <div className="text-sm font-semibold opacity-80 text-center">発生金額</div>
          <div
            className={`text-center mt-3 text-5xl sm:text-7xl font-bold break-all ${displayFontClassName}`}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            <span className={yenFontClassName}>{YEN_SIGN}</span>
            <span>{moneyEarned.toFixed(settings.decimalPlaces)}</span>
          </div>
          <div className="text-center mt-4 text-xl opacity-75">{formatElapsed(elapsedMs)}</div>

          <div className="mt-8">
            <label className="block text-sm font-semibold mb-2 opacity-90">1時間あたりのお金 (時給)</label>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-lg ${yenFontClassName}`}>{YEN_SIGN}</span>
              <input
                type="number"
                min="0"
                value={hourlyWage}
                onChange={(e) => {
                  const next = Math.max(0, Number(e.target.value) || 0);
                  saveHourlyWage(next);
                }}
                className={`${getInputClass()} text-lg font-medium`}
              />
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={handleStart} disabled={isRunning} className={getButtonClass("primary")}>
              スタート
            </button>
            <button onClick={handleStop} disabled={!isRunning} className={getButtonClass("danger")}>
              ストップ
            </button>
            <button onClick={handleReset} className={getButtonClass("secondary")}>
              リセット
            </button>
          </div>
        </div>
      </main>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setIsSettingsOpen(false)}>
          <div
            className={`relative w-full max-w-xl p-6 rounded-2xl shadow-2xl ${getPanelClasses()}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              aria-label="設定を閉じる"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
            <h3 className="text-2xl font-bold mb-6">設定</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1 opacity-90">加算する頻度</label>
                <select
                  value={settings.updateFrequency}
                  onChange={(e) => saveSetting("updateFrequency", e.target.value as FrequencyPreset)}
                  className={getInputClass()}
                >
                <option value="60fps">1秒間に60回</option>
                <option value="10fps">1秒間に10回</option>
                <option value="2fps">1秒間に2回</option>
                <option value="1fps">1秒間に1回</option>
                <option value="custom">カスタム (〇秒に1回)</option>
              </select>
              </div>

              {settings.updateFrequency === "custom" && (
                <div>
                <label className="block text-sm font-semibold mb-1 opacity-90">更新間隔 (秒)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={settings.customFrequencySec}
                  onChange={(e) => saveSetting("customFrequencySec", Math.max(0.1, Number(e.target.value) || 0.1))}
                  className={getInputClass()}
                />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-1 opacity-90">表示する桁数</label>
                <select
                  value={settings.decimalPlaces}
                  onChange={(e) => saveSetting("decimalPlaces", Number(e.target.value) as DecimalPlaces)}
                  className={getInputClass()}
                >
                  <option value={0}>整数のみ</option>
                  <option value={1}>小数第1位</option>
                  <option value={2}>小数第2位</option>
                  <option value={3}>小数第3位</option>
                </select>
              </div>

              <div className={settings.updateFrequency !== "custom" ? "sm:col-span-2" : ""}>
                <label className="block text-sm font-semibold mb-1 opacity-90">フォント</label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => saveSetting("fontFamily", e.target.value as FontKind)}
                  className={getInputClass()}
                >
                  <option value="default">デフォルトフォント</option>
                  <option value="roman">ローマン体</option>
                  <option value="digital">デジタル数字フォント</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
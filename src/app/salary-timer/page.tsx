"use client";

import React, { useEffect, useRef, useState } from "react";

import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { dseg14ClassicBold, dseg7ClassicBold } from "@/lib/digitalFonts";
import { useToolTheme } from "@/lib/useToolTheme";

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
  const { theme, pageCls, blockCls, inputCls, primaryBtnCls, secondaryBtnCls } = useToolTheme();

  const [hourlyWage, setHourlyWage] = useState(1000);
  const [settings, setSettings] = useState<SalarySettings>({
    updateFrequency: "10fps",
    customFrequencySec: 5,
    decimalPlaces: 0,
    fontFamily: "default",
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const requestRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const frameAccumulatorRef = useRef(0);
  const fixedElapsedRef = useRef(0);
  const frequencyPresetRef = useRef<FrequencyPreset>("10fps");
  const customFrequencyRef = useRef(5);

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
  }, [settings.customFrequencySec, settings.updateFrequency]);

  useEffect(() => {
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const tick = (time: number) => {
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
    if (isRunning) {
      return;
    }

    setIsRunning(true);
    lastFrameTimeRef.current = null;
    frameAccumulatorRef.current = 0;
    requestRef.current = requestAnimationFrame(tick);
  };

  const handleStop = () => {
    if (!isRunning) {
      return;
    }

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

  const dangerBtnCls =
    theme === "ocean"
      ? "bg-red-700 hover:bg-red-600 text-white"
      : theme === "dark"
        ? "bg-red-600 hover:bg-red-500 text-white"
        : "bg-red-600 hover:bg-red-700 text-white";

  const controlBtnBase =
    "flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50";
  const fullScreenBtnBase =
    "flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50";
  const subtleIconBtnCls =
    theme === "ocean"
      ? "hover:bg-white/10"
      : theme === "dark"
        ? "hover:bg-white/10"
        : "hover:bg-black/10";

  const headerClassName =
    theme === "ocean"
      ? "bg-cyan-950 text-cyan-50"
      : theme === "dark"
        ? "bg-slate-900 text-white"
        : "bg-slate-800 text-white";

  return (
    <ToolPageLayout
      title="給料タイマー"
      maxWidth="2xl"
      headerClassName={headerClassName}
      headerRightSlot={
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="rounded-full p-2 transition-colors hover:bg-white/10 focus:outline-none"
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
      <ToolPanel className="relative mx-auto flex w-full max-w-xl flex-col justify-center p-6 sm:p-8">
        <button
          type="button"
          onClick={() => setIsFullScreen(true)}
          className={`absolute right-4 top-4 z-10 rounded-full p-2 transition-colors focus:outline-none ${subtleIconBtnCls}`}
          title="全画面表示"
          aria-label="全画面表示"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        </button>

        <div className={`rounded-2xl px-4 py-5 text-center ${blockCls}`}>
          <div className="text-sm font-semibold opacity-80">稼いだ金額</div>
          <div className={`mt-3 break-all text-6xl font-bold sm:text-8xl ${displayFontClassName}`} style={{ fontVariantNumeric: "tabular-nums" }}>
            <span className={yenFontClassName}>{YEN_SIGN}</span>
            <span>{moneyEarned.toFixed(settings.decimalPlaces)}</span>
          </div>
          <div className={`mt-4 text-2xl opacity-75 sm:text-3xl ${displayFontClassName}`} style={{ fontVariantNumeric: "tabular-nums" }}>
            {formatElapsed(elapsedMs)}
          </div>
        </div>

        <div className="mt-8">
          <label className="mb-2 block text-sm font-semibold opacity-90">1時間あたりの給与 (円)</label>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${yenFontClassName}`}>{YEN_SIGN}</span>
            <input
              type="number"
              min="0"
              value={hourlyWage}
              onChange={(event) => {
                const next = Math.max(0, Number(event.target.value) || 0);
                saveHourlyWage(next);
              }}
              className={`w-full rounded-md border p-2.5 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-opacity-60 ${inputCls}`}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={handleStart} disabled={isRunning} className={`${controlBtnBase} ${primaryBtnCls}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
            スタート
          </button>
          <button type="button" onClick={handleStop} disabled={!isRunning} className={`${controlBtnBase} ${dangerBtnCls}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" />
            </svg>
            ストップ
          </button>
          <button type="button" onClick={handleReset} className={`${controlBtnBase} ${secondaryBtnCls}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            リセット
          </button>
        </div>
      </ToolPanel>

      {isFullScreen && (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 transition-colors duration-300 ${pageCls}`}>
          <button
            type="button"
            onClick={() => setIsFullScreen(false)}
            className={`absolute right-6 top-6 rounded-full p-3 transition-colors focus:outline-none ${subtleIconBtnCls}`}
            title="全画面を閉じる"
            aria-label="全画面を閉じる"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
            </svg>
          </button>

          <div className="flex w-full max-w-4xl flex-col items-center px-4 text-center">
            <div className="text-base font-semibold opacity-75 sm:text-lg">稼いだ金額</div>
            <div className={`mt-4 break-all text-[13vw] font-bold leading-none sm:text-[15vh] ${displayFontClassName}`} style={{ fontVariantNumeric: "tabular-nums" }}>
              <span className={yenFontClassName}>{YEN_SIGN}</span>
              <span>{moneyEarned.toFixed(settings.decimalPlaces)}</span>
            </div>
            <div className={`mt-5 text-[8vw] opacity-80 sm:text-[9vh] ${displayFontClassName}`} style={{ fontVariantNumeric: "tabular-nums" }}>
              {formatElapsed(elapsedMs)}
            </div>

            <div className="mt-12 flex justify-center gap-8">
              <button type="button" onClick={handleStart} disabled={isRunning} className={`${fullScreenBtnBase} ${primaryBtnCls}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
              </button>
              <button type="button" onClick={handleStop} disabled={!isRunning} className={`${fullScreenBtnBase} ${dangerBtnCls}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                </svg>
              </button>
              <button type="button" onClick={handleReset} className={`${fullScreenBtnBase} ${secondaryBtnCls}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)}>
          <div className="w-full max-w-xl" onClick={(event) => event.stopPropagation()}>
            <ToolPanel className="relative p-6">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className={`absolute right-4 top-4 rounded-full p-1 transition-colors ${subtleIconBtnCls}`}
                aria-label="設定を閉じる"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <h3 className="mb-6 text-2xl font-bold">設定</h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold opacity-90">更新頻度</label>
                  <select
                    value={settings.updateFrequency}
                    onChange={(event) => saveSetting("updateFrequency", event.target.value as FrequencyPreset)}
                    className={`w-full rounded-md border p-2.5 focus:outline-none focus:ring-2 focus:ring-opacity-60 ${inputCls}`}
                  >
                    <option value="60fps">1秒間に60回</option>
                    <option value="10fps">1秒間に10回</option>
                    <option value="2fps">1秒間に2回</option>
                    <option value="1fps">1秒間に1回</option>
                    <option value="custom">カスタム (秒)</option>
                  </select>
                </div>

                {settings.updateFrequency === "custom" && (
                  <div>
                    <label className="mb-1 block text-sm font-semibold opacity-90">更新間隔 (秒)</label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={settings.customFrequencySec}
                      onChange={(event) =>
                        saveSetting("customFrequencySec", Math.max(0.1, Number(event.target.value) || 0.1))
                      }
                      className={`w-full rounded-md border p-2.5 focus:outline-none focus:ring-2 focus:ring-opacity-60 ${inputCls}`}
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-sm font-semibold opacity-90">小数点</label>
                  <select
                    value={settings.decimalPlaces}
                    onChange={(event) => saveSetting("decimalPlaces", Number(event.target.value) as DecimalPlaces)}
                    className={`w-full rounded-md border p-2.5 focus:outline-none focus:ring-2 focus:ring-opacity-60 ${inputCls}`}
                  >
                    <option value={0}>整数のみ</option>
                    <option value={1}>小数第1位</option>
                    <option value={2}>小数第2位</option>
                    <option value={3}>小数第3位</option>
                  </select>
                </div>

                <div className={settings.updateFrequency !== "custom" ? "sm:col-span-2" : ""}>
                  <label className="mb-1 block text-sm font-semibold opacity-90">フォント</label>
                  <select
                    value={settings.fontFamily}
                    onChange={(event) => saveSetting("fontFamily", event.target.value as FontKind)}
                    className={`w-full rounded-md border p-2.5 focus:outline-none focus:ring-2 focus:ring-opacity-60 ${inputCls}`}
                  >
                    <option value="default">デフォルト</option>
                    <option value="roman">ローマン</option>
                    <option value="digital">デジタル数字フォント</option>
                  </select>
                </div>
              </div>
            </ToolPanel>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}

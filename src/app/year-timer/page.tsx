"use client";

import React, { useEffect, useState } from "react";

import { useTheme } from "../ThemeProvider";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { dseg14ClassicBold, dseg7ClassicBold } from "@/lib/digitalFonts";
import { useToolTheme } from "@/lib/useToolTheme";

type FontStyle = "default" | "roman" | "digital";
type GaugeShape = "round" | "square";

interface Settings {
  decimals: number;
  fontStyle: FontStyle;
  gaugeShape: GaugeShape;
}

interface TimeState {
  percent: number;
  elapsedMs: number;
  totalMs: number;
  currentYear: number;
}

export default function YearTimerPage() {
  const { mounted: isClient } = useTheme();
  const { theme, pageCls, panelCls, blockCls, inputCls, primaryBtnCls } = useToolTheme();

  const [settings, setSettings] = useState<Settings>({
    decimals: 5,
    fontStyle: "default",
    gaugeShape: "round",
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [timeState, setTimeState] = useState<TimeState>({
    percent: 0,
    elapsedMs: 0,
    totalMs: 1,
    currentYear: new Date().getFullYear(),
  });

  useEffect(() => {
    const savedDecimals = localStorage.getItem("yearTimerDecimals");
    const savedFontStyle = localStorage.getItem("yearTimerFontStyle");
    const savedGaugeShape = localStorage.getItem("yearTimerGaugeShape");

    setSettings((prev) => ({
      ...prev,
      decimals: savedDecimals ? parseInt(savedDecimals, 10) : prev.decimals,
      fontStyle:
        savedFontStyle === "default" || savedFontStyle === "roman" || savedFontStyle === "digital"
          ? savedFontStyle
          : prev.fontStyle,
      gaugeShape: savedGaugeShape === "round" || savedGaugeShape === "square" ? savedGaugeShape : prev.gaugeShape,
    }));
  }, []);

  useEffect(() => {
    let animationFrameId = 0;

    const tick = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const startOfYear = new Date(currentYear, 0, 1).getTime();
      const endOfYear = new Date(currentYear + 1, 0, 1).getTime();
      const totalMs = endOfYear - startOfYear;
      const elapsedMs = now.getTime() - startOfYear;

      setTimeState({
        percent: (elapsedMs / totalMs) * 100,
        elapsedMs,
        totalMs,
        currentYear,
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    if (!isFullScreen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeFullScreen();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullScreen]);

  const updateSettings = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));

    if (key === "decimals") {
      localStorage.setItem("yearTimerDecimals", String(value));
    }
    if (key === "fontStyle") {
      localStorage.setItem("yearTimerFontStyle", String(value));
    }
    if (key === "gaugeShape") {
      localStorage.setItem("yearTimerGaugeShape", String(value));
    }
  };

  const openFullScreen = () => {
    setIsFullScreen(true);
  };

  const closeFullScreen = () => {
    setIsFullScreen(false);
  };

  if (!isClient) {
    return <div className="min-h-screen bg-gray-50 text-gray-900" />;
  }

  const formatPercent = (percent: number) => percent.toFixed(settings.decimals);
  const remainingMs = Math.max(timeState.totalMs - timeState.elapsedMs, 0);

  const getTimeParts = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    return { days, hours, minutes, seconds };
  };

  const elapsedParts = getTimeParts(timeState.elapsedMs);
  const remainingParts = getTimeParts(remainingMs);

  const gaugeBgClass =
    theme === "dark" ? "bg-gray-700" : theme === "ocean" ? "bg-cyan-900/80" : "bg-gray-200";
  const gaugeFillClass =
    theme === "dark"
      ? "bg-blue-500 shadow-[0_0_18px_rgba(59,130,246,0.55)]"
      : theme === "ocean"
        ? "bg-teal-400 shadow-[0_0_18px_rgba(45,212,191,0.55)]"
        : "bg-blue-500 shadow-[0_0_16px_rgba(59,130,246,0.35)]";
  const subtleIconBtnCls =
    theme === "light" ? "hover:bg-black/5" : "hover:bg-white/10";
  const gaugeShapeClass = settings.gaugeShape === "square" ? "rounded-md" : "rounded-full";

  const numberFontClass =
    settings.fontStyle === "digital"
      ? dseg7ClassicBold.className
      : settings.fontStyle === "roman"
        ? "font-serif"
        : "font-mono";
  const symbolFontClass =
    settings.fontStyle === "digital"
      ? `${dseg14ClassicBold.className} tracking-[0.08em]`
      : settings.fontStyle === "roman"
        ? "font-serif"
        : "font-mono";
  const labelFontClass =
    settings.fontStyle === "digital"
      ? `${dseg14ClassicBold.className} uppercase tracking-[0.18em]`
      : settings.fontStyle === "roman"
        ? "font-serif"
        : "font-sans";
  const unitFontClass =
    settings.fontStyle === "digital"
      ? `${dseg14ClassicBold.className} uppercase tracking-[0.12em]`
      : settings.fontStyle === "roman"
        ? "font-serif"
        : "font-sans";

  const isDigitalFont = settings.fontStyle === "digital";
  const elapsedLabel = isDigitalFont ? "ELAPSED DAYS" : "経過日数";
  const remainingLabel = isDigitalFont ? "DAYS LEFT" : "残り日数";

  const renderGauge = (heightClassName: string) => (
    <div className={`relative w-full overflow-hidden ${heightClassName} ${gaugeShapeClass} ${gaugeBgClass}`}>
      <div
        className={`h-full transition-all duration-75 ease-out ${gaugeShapeClass} ${gaugeFillClass}`}
        style={{ width: `${timeState.percent}%` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </div>
  );

  const renderTimeItem = (value: number, unit: string) => (
    <div className="rounded-xl bg-black/5 px-3 py-2 dark:bg-white/5">
      <div className="text-lg font-bold sm:text-xl" style={{ fontVariantNumeric: "tabular-nums" }}>
        <span className={numberFontClass}>{value}</span>
      </div>
      <div className={`mt-1 text-[10px] opacity-70 sm:text-xs ${unitFontClass}`}>{unit}</div>
    </div>
  );

  const renderStatCard = (
    label: string,
    parts: { days: number; hours: number; minutes: number; seconds: number },
  ) => (
    <div className="text-center">
      <div className={`text-xs sm:text-sm opacity-75 ${labelFontClass}`}>{label}</div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {renderTimeItem(parts.days, isDigitalFont ? "DAY" : "日")}
        {renderTimeItem(parts.hours, isDigitalFont ? "HOUR" : "時間")}
        {renderTimeItem(parts.minutes, isDigitalFont ? "MIN" : "分")}
        {renderTimeItem(parts.seconds, isDigitalFont ? "SEC" : "秒")}
      </div>
    </div>
  );

  return (
    <ToolPageLayout
      title="1年タイマー"
      maxWidth="3xl"
      headerRightSlot={
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="rounded-full p-2 transition-colors hover:bg-white/10 focus:outline-none"
          title="設定"
          aria-label="設定を開く"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      }
    >
      <ToolPanel className="relative flex min-h-[55vh] flex-col items-center justify-center p-6 sm:p-8">
        <button
          type="button"
          onClick={openFullScreen}
          className={`absolute right-4 top-4 rounded-full p-2 transition-colors focus:outline-none ${subtleIconBtnCls}`}
          title="全画面表示"
          aria-label="全画面表示"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        </button>

        <div className="mb-8 w-full text-center">
          <div className="mt-3 text-3xl font-bold sm:text-4xl">
            <span className={numberFontClass} style={{ fontVariantNumeric: "tabular-nums" }}>
              {timeState.currentYear}
            </span>
            {!isDigitalFont && <span className="ml-1">年</span>}
          </div>
        </div>

        <div className="mb-10 flex w-full justify-center select-none">
          <div
            className="inline-flex items-baseline justify-center gap-2 text-center font-bold tracking-tight"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            <span className={`text-5xl leading-none sm:text-7xl lg:text-8xl ${numberFontClass}`}>
              {formatPercent(timeState.percent)}
            </span>
            <span className={`text-3xl leading-none opacity-85 sm:text-5xl lg:text-6xl ${symbolFontClass}`}>
              %
            </span>
          </div>
        </div>

        <div className="mb-8 w-full">{renderGauge("h-8 sm:h-12")}</div>

        <div className={`flex w-full max-w-2xl flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:justify-around sm:p-6 ${blockCls}`}>
          {renderStatCard(elapsedLabel, elapsedParts)}
          {renderStatCard(remainingLabel, remainingParts)}
        </div>
      </ToolPanel>

      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div className={`relative w-full max-w-sm rounded-3xl p-6 shadow-2xl ${panelCls}`} onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className={`absolute right-4 top-4 rounded-full p-1 transition-colors ${subtleIconBtnCls}`}
              aria-label="設定を閉じる"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h2 className="mb-6 text-2xl font-bold">設定</h2>

            <div className="space-y-6">
              <div className={`rounded-xl p-4 ${blockCls}`}>
                <label className="mb-3 block font-medium">
                  小数点以下の表示桁数: <span className="font-bold">{settings.decimals}桁</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={settings.decimals}
                  onChange={(event) => updateSettings("decimals", parseInt(event.target.value, 10))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-black/10 accent-blue-500 dark:bg-white/20"
                />
                <div className="mt-2 flex justify-between text-xs opacity-60">
                  <span>0</span>
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                  <span>6</span>
                </div>
              </div>

              <div className={`rounded-xl p-4 ${blockCls}`}>
                <label className="mb-3 block font-medium">フォント</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => updateSettings("fontStyle", "default")}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${settings.fontStyle === "default" ? primaryBtnCls : inputCls}`}
                  >
                    デフォルト
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSettings("fontStyle", "roman")}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold font-serif transition-colors ${settings.fontStyle === "roman" ? primaryBtnCls : inputCls}`}
                  >
                    ローマン
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSettings("fontStyle", "digital")}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${dseg7ClassicBold.className} ${settings.fontStyle === "digital" ? primaryBtnCls : inputCls}`}
                  >
                    DIGITAL
                  </button>
                </div>
              </div>

              <div className={`rounded-xl p-4 ${blockCls}`}>
                <label className="mb-3 block font-medium">ゲージ形状</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateSettings("gaugeShape", "round")}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${settings.gaugeShape === "round" ? primaryBtnCls : inputCls}`}
                  >
                    丸型
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSettings("gaugeShape", "square")}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${settings.gaugeShape === "square" ? primaryBtnCls : inputCls}`}
                  >
                    角型
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className={`rounded-lg px-6 py-2 transition-colors shadow-md ${primaryBtnCls}`}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {isFullScreen && (
        <div className={`fixed inset-0 z-50 flex flex-col ${pageCls}`}>
          <button
            type="button"
            onClick={closeFullScreen}
            className={`absolute right-6 top-6 rounded-full p-3 transition-colors focus:outline-none ${subtleIconBtnCls}`}
            title="全画面を閉じる"
            aria-label="全画面を閉じる"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
            </svg>
          </button>

          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
            <div className={`text-[7vw] font-bold leading-none sm:text-[8vh] ${numberFontClass}`} style={{ fontVariantNumeric: "tabular-nums" }}>
              {timeState.currentYear}
            </div>

            <div
              className="mt-8 inline-flex items-baseline justify-center gap-3 font-bold leading-none"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              <span className={`text-[18vw] sm:text-[22vh] ${numberFontClass}`}>{formatPercent(timeState.percent)}</span>
              <span className={`text-[9vw] leading-none opacity-85 sm:text-[11vh] ${symbolFontClass}`}>%</span>
            </div>

            <div className="mt-10 w-full max-w-5xl">{renderGauge("h-10 sm:h-14")}</div>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}

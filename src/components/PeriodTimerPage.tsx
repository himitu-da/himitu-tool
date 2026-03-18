"use client";

import React, { useEffect, useState } from "react";

import { useTheme } from "@/app/ThemeProvider";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { dseg14ClassicBold, dseg7ClassicBold } from "@/lib/digitalFonts";
import { useToolTheme } from "@/lib/useToolTheme";

type FontStyle = "default" | "roman" | "digital";
type GaugeShape = "round" | "square";
type PeriodKind = "year" | "month" | "day";

interface Settings {
  decimals: number;
  fontStyle: FontStyle;
  gaugeShape: GaugeShape;
}

interface PeriodTimerPageProps {
  title: string;
  storageKey: string;
  period: PeriodKind;
}

interface TimeState {
  percent: number;
  elapsedMs: number;
  totalMs: number;
}

interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface DisplaySegment {
  text: string;
  kind: "number" | "separator" | "text";
}

function getPeriodFrame(period: PeriodKind, now: Date) {
  if (period === "year") {
    const currentYear = now.getFullYear();
    return {
      unitLabel: "年",
      year: currentYear,
      startMs: new Date(currentYear, 0, 1).getTime(),
      endMs: new Date(currentYear + 1, 0, 1).getTime(),
      showDays: true,
    };
  }

  if (period === "month") {
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    return {
      year: currentYear,
      month: currentMonth + 1,
      unitLabel: "月",
      startMs: new Date(currentYear, currentMonth, 1).getTime(),
      endMs: new Date(currentYear, currentMonth + 1, 1).getTime(),
      showDays: true,
    };
  }

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    unitLabel: "日",
    startMs: new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(),
    endMs: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime(),
    showDays: false,
  };
}

function getDisplaySegments(
  period: PeriodKind,
  frame: ReturnType<typeof getPeriodFrame>,
  compact: boolean,
): DisplaySegment[] {
  if (period === "year") {
    return compact
      ? [{ text: String(frame.year), kind: "number" }]
      : [
          { text: String(frame.year), kind: "number" },
          { text: "年", kind: "text" },
        ];
  }

  if (period === "month") {
    return compact
      ? [
          { text: String(frame.year), kind: "number" },
          { text: "/", kind: "separator" },
          { text: String(frame.month), kind: "number" },
        ]
      : [
          { text: String(frame.year), kind: "number" },
          { text: "年", kind: "text" },
          { text: String(frame.month), kind: "number" },
          { text: "月", kind: "text" },
        ];
  }

  return compact
    ? [
        { text: String(frame.year), kind: "number" },
        { text: "/", kind: "separator" },
        { text: String(frame.month), kind: "number" },
        { text: "/", kind: "separator" },
        { text: String(frame.day), kind: "number" },
      ]
    : [
        { text: String(frame.year), kind: "number" },
        { text: "年", kind: "text" },
        { text: String(frame.month), kind: "number" },
        { text: "月", kind: "text" },
        { text: String(frame.day), kind: "number" },
        { text: "日", kind: "text" },
      ];
}

function getTimeParts(milliseconds: number): TimeParts {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

export function PeriodTimerPage({ title, storageKey, period }: PeriodTimerPageProps) {
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
  });

  useEffect(() => {
    const savedDecimals = localStorage.getItem(`${storageKey}.decimals`);
    const savedFontStyle = localStorage.getItem(`${storageKey}.fontStyle`);
    const savedGaugeShape = localStorage.getItem(`${storageKey}.gaugeShape`);

    setSettings((prev) => ({
      ...prev,
      decimals: savedDecimals ? parseInt(savedDecimals, 10) : prev.decimals,
      fontStyle:
        savedFontStyle === "default" || savedFontStyle === "roman" || savedFontStyle === "digital"
          ? savedFontStyle
          : prev.fontStyle,
      gaugeShape: savedGaugeShape === "round" || savedGaugeShape === "square" ? savedGaugeShape : prev.gaugeShape,
    }));
  }, [storageKey]);

  useEffect(() => {
    let animationFrameId = 0;

    const tick = () => {
      const now = new Date();
      const frame = getPeriodFrame(period, now);
      const elapsedMs = now.getTime() - frame.startMs;
      const totalMs = frame.endMs - frame.startMs;

      setTimeState({
        percent: (elapsedMs / totalMs) * 100,
        elapsedMs,
        totalMs,
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrameId);
  }, [period]);

  useEffect(() => {
    if (!isFullScreen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullScreen(false);
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
    localStorage.setItem(`${storageKey}.${key}`, String(value));
  };

  if (!isClient) {
    return <div className="min-h-screen bg-gray-50 text-gray-900" />;
  }

  const frame = getPeriodFrame(period, new Date());
  const remainingMs = Math.max(timeState.totalMs - timeState.elapsedMs, 0);
  const elapsedParts = getTimeParts(timeState.elapsedMs);
  const remainingParts = getTimeParts(remainingMs);
  const formatPercent = (percent: number) => percent.toFixed(settings.decimals);

  const gaugeBgClass =
    theme === "dark" ? "bg-gray-700" : theme === "ocean" ? "bg-cyan-900/80" : "bg-gray-200";
  const gaugeFillClass =
    theme === "dark"
      ? "bg-blue-500 shadow-[0_0_18px_rgba(59,130,246,0.55)]"
      : theme === "ocean"
        ? "bg-teal-400 shadow-[0_0_18px_rgba(45,212,191,0.55)]"
        : "bg-blue-500 shadow-[0_0_16px_rgba(59,130,246,0.35)]";
  const subtleIconBtnCls = theme === "light" ? "hover:bg-black/5" : "hover:bg-white/10";
  const miniBlockCls =
    theme === "ocean" ? "bg-cyan-950/30" : theme === "dark" ? "bg-white/5" : "bg-black/5";
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
  const dateTextFontClass = settings.fontStyle === "roman" ? "font-serif" : "font-sans";
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
  const isCompactDateDisplay = isFullScreen || isDigitalFont;
  const displaySegments = getDisplaySegments(period, frame, isCompactDateDisplay);
  const elapsedLabel = isDigitalFont ? "ELAPSED" : "経過";
  const remainingLabel = isDigitalFont ? "LEFT" : "残り";
  const timeItemLabels = frame.showDays
    ? [
        { key: "days", defaultLabel: "日", digitalLabel: "DAY" },
        { key: "hours", defaultLabel: "時間", digitalLabel: "HOUR" },
        { key: "minutes", defaultLabel: "分", digitalLabel: "MIN" },
        { key: "seconds", defaultLabel: "秒", digitalLabel: "SEC" },
      ]
    : [
        { key: "hours", defaultLabel: "時間", digitalLabel: "HOUR" },
        { key: "minutes", defaultLabel: "分", digitalLabel: "MIN" },
        { key: "seconds", defaultLabel: "秒", digitalLabel: "SEC" },
      ];
  const statGridClass = frame.showDays ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3";

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
    <div className={`rounded-xl px-3 py-2 ${miniBlockCls}`}>
      <div className="text-lg font-bold sm:text-xl" style={{ fontVariantNumeric: "tabular-nums" }}>
        <span className={numberFontClass}>{value}</span>
      </div>
      <div className={`mt-1 text-[10px] opacity-70 sm:text-xs ${unitFontClass}`}>{unit}</div>
    </div>
  );

  const renderStatCard = (label: string, parts: TimeParts) => (
    <div className="text-center">
      <div className={`text-xs sm:text-sm opacity-75 ${labelFontClass}`}>{label}</div>
      <div className={`mt-3 grid gap-2 ${statGridClass}`}>
        {timeItemLabels.map((item) =>
          renderTimeItem(
            parts[item.key as keyof TimeParts],
            isDigitalFont ? item.digitalLabel : item.defaultLabel,
          ),
        )}
      </div>
    </div>
  );

  const renderDateDisplay = (className: string) => (
    <div
      className={`mt-3 inline-flex flex-wrap items-baseline justify-center font-bold leading-none ${className}`}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {displaySegments.map((segment, index) => (
        <span
          key={`${segment.kind}-${index}-${segment.text}`}
          className={
            segment.kind === "number"
              ? numberFontClass
              : segment.kind === "separator"
                ? symbolFontClass
                : dateTextFontClass
          }
        >
          {segment.text}
        </span>
      ))}
    </div>
  );

  return (
    <ToolPageLayout
      title={title}
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
          onClick={() => setIsFullScreen(true)}
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
          {renderDateDisplay("text-3xl sm:text-4xl")}
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

        <div className={`flex w-full max-w-3xl flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:justify-around sm:p-6 ${blockCls}`}>
          {renderStatCard(elapsedLabel, elapsedParts)}
          {renderStatCard(remainingLabel, remainingParts)}
        </div>
      </ToolPanel>

      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div
            className={`relative w-full max-w-sm rounded-3xl p-6 shadow-2xl ${panelCls}`}
            onClick={(event) => event.stopPropagation()}
          >
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
            onClick={() => setIsFullScreen(false)}
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
            {renderDateDisplay("text-[7vw] sm:text-[8vh]")}

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

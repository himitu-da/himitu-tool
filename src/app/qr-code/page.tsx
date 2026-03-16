"use client";

import QRCode from "qrcode";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ClipboardPaste, Copy } from "lucide-react";

import { useTheme } from "../ThemeProvider";
import { ToolStickyHeader } from "@/components/ToolStickyHeader";

type AdjustMode = "modules" | "percent" | "auto";
type PrefixMode = "free" | "https" | "http";

const MIN_QR_SIZE = 240;
const MAX_QR_SIZE = 720;
const QR_STEP = 40;

const pxToMm = (px: number, dpi = 300) => (px / dpi) * 25.4;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeHexColor = (value: string, fallback: string) => {
  const normalized = value.trim().toLowerCase();
  const shortMatch = normalized.match(/^#([0-9a-f]{3})$/i);
  if (shortMatch) {
    const [r, g, b] = shortMatch[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  if (/^#([0-9a-f]{6})$/i.test(normalized)) {
    return normalized;
  }
  return fallback;
};

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  if (safeRadius <= 0) {
    ctx.fillRect(x, y, width, height);
    return;
  }

  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.arcTo(x + width, y, x + width, y + safeRadius, safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.arcTo(x + width, y + height, x + width - safeRadius, y + height, safeRadius);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.arcTo(x, y + height, x, y + height - safeRadius, safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.arcTo(x, y, x + safeRadius, y, safeRadius);
  ctx.closePath();
  ctx.fill();
};

export default function QrCodePage() {
  const { theme } = useTheme();
  const [prefixMode, setPrefixMode] = useState<PrefixMode>("https");
  const [text, setText] = useState("example.com");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrSize, setQrSize] = useState(360);
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [marginMode, setMarginMode] = useState<AdjustMode>("modules");
  const [marginModules, setMarginModules] = useState(4);
  const [marginPercent, setMarginPercent] = useState(10);
  const [roundMode, setRoundMode] = useState<AdjustMode>("auto");
  const [roundModules, setRoundModules] = useState(0.22);
  const [roundPercent, setRoundPercent] = useState(22);
  const [dotColor, setDotColor] = useState("#000000");
  const [dotColorInput, setDotColorInput] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [backgroundColorInput, setBackgroundColorInput] = useState("#ffffff");
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  const generateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestTaskRef = useRef(0);

  const composedText = useMemo(() => {
    const value = text.trim();
    if (!value) {
      return "";
    }

    if (prefixMode === "free") {
      return value;
    }

    const stripped = value.replace(/^https?:\/\//i, "");
    return `${prefixMode}://${stripped}`;
  }, [prefixMode, text]);

  const getPaddingSize = useCallback(
    (moduleCount: number) => {
      if (marginMode === "modules") {
        const safeModules = clamp(marginModules, 0, 20);
        return (qrSize * safeModules) / (moduleCount + safeModules * 2);
      }
      if (marginMode === "percent") {
        const safePercent = clamp(marginPercent, 0, 30);
        return qrSize * (safePercent / 100);
      }
      return qrSize * 0.08;
    },
    [marginMode, marginModules, marginPercent, qrSize]
  );

  const getRoundRatio = useCallback(() => {
    if (roundMode === "modules") {
      return clamp(roundModules, 0, 1.5);
    }
    if (roundMode === "percent") {
      return clamp(roundPercent, 0, 95) / 100;
    }
    return 0.22;
  }, [roundMode, roundModules, roundPercent]);

  const generateQrCode = useCallback(async () => {
    const taskId = latestTaskRef.current + 1;
    latestTaskRef.current = taskId;
    setStatusMessage("");

    const value = composedText.trim();
    if (!value) {
      setQrDataUrl("");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 160));
      const qr = QRCode.create(value, { errorCorrectionLevel: "M" });
      const moduleCount = qr.modules.size;

      let padding = getPaddingSize(moduleCount);
      let innerSize = qrSize - padding * 2;
      let cellSize = innerSize / moduleCount;
      let cornerRadius = Math.min(cellSize * getRoundRatio(), cellSize * 0.95);

      // Keep enough quiet zone so rounded modules are not clipped at the edges.
      for (let i = 0; i < 3; i += 1) {
        if (innerSize <= 0) {
          throw new Error("QRサイズに対して余白が大きすぎます。");
        }
        const requiredPadding = cornerRadius + cellSize * 0.6;
        if (requiredPadding <= padding) {
          break;
        }
        padding = requiredPadding;
        innerSize = qrSize - padding * 2;
        cellSize = innerSize / moduleCount;
        cornerRadius = Math.min(cellSize * getRoundRatio(), cellSize * 0.95);
      }

      if (innerSize <= 0 || cellSize <= 0) {
        throw new Error("角丸設定が大きすぎるため、余白を確保できません。");
      }

      const canvas = document.createElement("canvas");
      canvas.width = qrSize;
      canvas.height = qrSize;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvasの初期化に失敗しました。");
      }

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, qrSize, qrSize);

      ctx.fillStyle = dotColor;

      for (let row = 0; row < moduleCount; row += 1) {
        for (let col = 0; col < moduleCount; col += 1) {
          if (!qr.modules.get(row, col)) {
            continue;
          }
          const x = padding + col * cellSize;
          const y = padding + row * cellSize;
          const nextX = padding + (col + 1) * cellSize;
          const nextY = padding + (row + 1) * cellSize;
          drawRoundedRect(ctx, x, y, nextX - x, nextY - y, cornerRadius);
        }
      }

      if (latestTaskRef.current !== taskId) {
        return;
      }

      setQrDataUrl(canvas.toDataURL("image/png"));
      setIsLoading(false);
    } catch (error) {
      if (latestTaskRef.current !== taskId) {
        return;
      }
      setQrDataUrl("");
      setIsLoading(false);
      setStatusMessage(error instanceof Error ? error.message : "QRコードの生成に失敗しました。");
    }
  }, [backgroundColor, composedText, dotColor, getPaddingSize, getRoundRatio, qrSize]);

  const scheduleAutoGenerate = useCallback(
    (delayMs: number) => {
      if (!autoGenerate) {
        return;
      }
      if (generateTimerRef.current) {
        clearTimeout(generateTimerRef.current);
      }
      setIsLoading(true);
      generateTimerRef.current = setTimeout(() => {
        void generateQrCode();
      }, delayMs);
    },
    [autoGenerate, generateQrCode]
  );

  useEffect(() => {
    scheduleAutoGenerate(500);
    return () => {
      if (generateTimerRef.current) {
        clearTimeout(generateTimerRef.current);
      }
    };
  }, [scheduleAutoGenerate]);

  const handlePaste = async () => {
    setStatusMessage("");
    try {
      const pastedText = (await navigator.clipboard.readText()).trim();
      if (/^https:\/\//i.test(pastedText)) {
        setPrefixMode("https");
        setText(pastedText.replace(/^https:\/\//i, ""));
      } else if (/^http:\/\//i.test(pastedText)) {
        setPrefixMode("http");
        setText(pastedText.replace(/^http:\/\//i, ""));
      } else {
        setPrefixMode("free");
        setText(pastedText);
      }
      scheduleAutoGenerate(500);
    } catch {
      setStatusMessage("クリップボードの読み取りに失敗しました。ブラウザの許可設定をご確認ください。");
    }
  };

  const handlePrefixModeChange = (nextMode: PrefixMode) => {
    if (nextMode === prefixMode) {
      return;
    }

    const currentValue = composedText;
    if (nextMode === "free") {
      setText(currentValue);
    } else {
      setText(currentValue.replace(/^https?:\/\//i, ""));
    }

    setPrefixMode(nextMode);
    scheduleAutoGenerate(500);
  };

  const handleCopyImage = async () => {
    setStatusMessage("");
    if (!qrDataUrl) {
      setStatusMessage("コピー対象のQRコードがまだありません。");
      return;
    }

    if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
      setStatusMessage("このブラウザは画像コピーに対応していません。");
      return;
    }

    try {
      const blob = await fetch(qrDataUrl).then((res) => res.blob());
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setStatusMessage("QRコード画像をクリップボードにコピーしました。");
    } catch {
      setStatusMessage("画像のコピーに失敗しました。ブラウザ権限をご確認ください。");
    }
  };

  const getPageClasses = () => {
    switch (theme) {
      case "dark":
        return "bg-gray-900 text-gray-100";
      case "ocean":
        return "bg-cyan-950 text-cyan-50";
      default:
        return "bg-gray-50 text-gray-900";
    }
  };

  const getPanelClasses = () => {
    switch (theme) {
      case "dark":
        return "bg-gray-800";
      case "ocean":
        return "bg-cyan-900/80";
      default:
        return "bg-white";
    }
  };

  const getMutedTextClasses = () => {
    switch (theme) {
      case "dark":
        return "text-gray-300";
      case "ocean":
        return "text-cyan-100/90";
      default:
        return "text-gray-600";
    }
  };

  const getInputClasses = () => {
    switch (theme) {
      case "dark":
        return "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:ring-blue-400";
      case "ocean":
        return "bg-cyan-800 border-cyan-700 text-cyan-50 placeholder:text-cyan-200/70 focus:ring-cyan-300";
      default:
        return "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-blue-500";
    }
  };

  const getPrimaryButtonClasses = () => {
    switch (theme) {
      case "dark":
        return "bg-blue-500 hover:bg-blue-400 text-white";
      case "ocean":
        return "bg-cyan-400 hover:bg-cyan-300 text-cyan-950";
      default:
        return "bg-blue-600 hover:bg-blue-700 text-white";
    }
  };

  const getSecondaryButtonClasses = () => {
    switch (theme) {
      case "dark":
        return "bg-gray-700 hover:bg-gray-600 text-gray-100";
      case "ocean":
        return "bg-cyan-800 hover:bg-cyan-700 text-cyan-50";
      default:
        return "bg-gray-100 hover:bg-gray-200 text-gray-900";
    }
  };

  const getCheckerboardStyle = (): React.CSSProperties => {
    if (theme === "dark") {
      return {
        backgroundColor: "#1a1a1a",
        backgroundImage:
          "linear-gradient(45deg, #242424 25%, transparent 25%), linear-gradient(-45deg, #242424 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #242424 75%), linear-gradient(-45deg, transparent 75%, #242424 75%)",
        backgroundSize: "24px 24px",
        backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0px",
      };
    }
    if (theme === "ocean") {
      return {
        backgroundColor: "#0c3f4c",
        backgroundImage:
          "linear-gradient(45deg, #115467 25%, transparent 25%), linear-gradient(-45deg, #115467 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #115467 75%), linear-gradient(-45deg, transparent 75%, #115467 75%)",
        backgroundSize: "24px 24px",
        backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0px",
      };
    }
    return {
      backgroundColor: "#f8f8f8",
      backgroundImage:
        "linear-gradient(45deg, #ececec 25%, transparent 25%), linear-gradient(-45deg, #ececec 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ececec 75%), linear-gradient(-45deg, transparent 75%, #ececec 75%)",
      backgroundSize: "24px 24px",
      backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0px",
    };
  };

  const getRadioLabelClasses = (active: boolean) => {
    if (active) {
      switch (theme) {
        case "dark":
          return "bg-gray-700 text-white";
        case "ocean":
          return "bg-cyan-800 text-cyan-50";
        default:
          return "bg-gray-100 text-gray-900";
      }
    }
    switch (theme) {
      case "dark":
        return "bg-gray-800 text-gray-300";
      case "ocean":
        return "bg-cyan-900/60 text-cyan-100";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  const printHint = useMemo(() => {
    const mm = pxToMm(qrSize);
    let useCase = "ポスターや掲示物";
    if (qrSize <= 320) {
      useCase = "名刺や小さめラベル";
    } else if (qrSize <= 440) {
      useCase = "チラシやA4印刷";
    } else if (qrSize <= 600) {
      useCase = "卓上POPやメニュー";
    }
    return `${qrSize}x${qrSize}（約${mm.toFixed(1)}mm角 / 300dpi目安）: ${useCase}`;
  }, [qrSize]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${getPageClasses()}`}>
      <ToolStickyHeader title="QRコード生成" className="bg-gray-800 text-white" />
      <main className="w-full max-w-6xl mx-auto px-4 pt-4 pb-10">
        <div className="grid gap-4 lg:grid-cols-2">
          <section className={`rounded-2xl p-5 sm:p-6 shadow-sm ${getPanelClasses()}`}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2">URLまたはテキスト</label>
                <div className="grid gap-2 sm:grid-cols-3 mb-2">
                  <label className={`rounded-xl px-3 py-2 text-sm cursor-pointer transition-colors ${getRadioLabelClasses(prefixMode === "free")}`}>
                    <input
                      type="radio"
                      name="prefix-mode"
                      checked={prefixMode === "free"}
                      onChange={() => handlePrefixModeChange("free")}
                      className="mr-2"
                    />
                    自由入力
                  </label>
                  <label className={`rounded-xl px-3 py-2 text-sm cursor-pointer transition-colors ${getRadioLabelClasses(prefixMode === "https")}`}>
                    <input
                      type="radio"
                      name="prefix-mode"
                      checked={prefixMode === "https"}
                      onChange={() => handlePrefixModeChange("https")}
                      className="mr-2"
                    />
                    https://
                  </label>
                  <label className={`rounded-xl px-3 py-2 text-sm cursor-pointer transition-colors ${getRadioLabelClasses(prefixMode === "http")}`}>
                    <input
                      type="radio"
                      name="prefix-mode"
                      checked={prefixMode === "http"}
                      onChange={() => handlePrefixModeChange("http")}
                      className="mr-2"
                    />
                    http://
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePaste}
                    className={`shrink-0 px-4 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors ${getSecondaryButtonClasses()}`}
                    aria-label="クリップボードからペースト"
                  >
                    <ClipboardPaste size={18} />
                    <span>ペースト</span>
                  </button>
                  {prefixMode !== "free" && (
                    <span className={`shrink-0 px-3 py-3 rounded-xl text-sm font-semibold ${getSecondaryButtonClasses()}`}>
                      {prefixMode}://
                    </span>
                  )}
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      scheduleAutoGenerate(1500);
                    }}
                    className={`w-full p-3 rounded-xl border outline-none focus:ring-2 transition ${getInputClasses()}`}
                    placeholder={prefixMode === "free" ? "https://example.com" : "example.com/path"}
                  />
                </div>
                <p className={`mt-2 text-sm ${getMutedTextClasses()}`}>
                  手入力時は1.5秒、ペーストや設定変更時は0.5秒待って自動生成します。
                </p>
                <p className={`mt-1 text-sm ${getMutedTextClasses()}`}>生成対象: {composedText || "(未入力)"}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">QRサイズ</label>
                <input
                  type="range"
                  min={MIN_QR_SIZE}
                  max={MAX_QR_SIZE}
                  step={QR_STEP}
                  value={qrSize}
                  onChange={(e) => {
                    setQrSize(Number(e.target.value));
                    scheduleAutoGenerate(500);
                  }}
                  className="w-full h-2 cursor-pointer"
                />
                <p className={`mt-2 text-sm ${getMutedTextClasses()}`}>{printHint}</p>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">外周余白</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <label className={`rounded-xl px-3 py-2 text-sm cursor-pointer transition-colors ${getRadioLabelClasses(marginMode === "modules")}`}>
                    <input
                      type="radio"
                      name="margin-mode"
                      checked={marginMode === "modules"}
                      onChange={() => {
                        setMarginMode("modules");
                        scheduleAutoGenerate(500);
                      }}
                      className="mr-2"
                    />
                    ドット数指定
                  </label>
                  <label className={`rounded-xl px-3 py-2 text-sm cursor-pointer transition-colors ${getRadioLabelClasses(marginMode === "percent")}`}>
                    <input
                      type="radio"
                      name="margin-mode"
                      checked={marginMode === "percent"}
                      onChange={() => {
                        setMarginMode("percent");
                        scheduleAutoGenerate(500);
                      }}
                      className="mr-2"
                    />
                    パーセント指定
                  </label>
                  <label className={`rounded-xl px-3 py-2 text-sm cursor-pointer transition-colors ${getRadioLabelClasses(marginMode === "auto")}`}>
                    <input
                      type="radio"
                      name="margin-mode"
                      checked={marginMode === "auto"}
                      onChange={() => {
                        setMarginMode("auto");
                        scheduleAutoGenerate(500);
                      }}
                      className="mr-2"
                    />
                    自動（推奨）
                  </label>
                </div>

                {marginMode === "modules" && (
                  <div className="mt-3">
                    <label className="block text-sm font-semibold mb-1">余白（ドット数: 0〜20）</label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={0.1}
                      value={marginModules}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setMarginModules(Number.isNaN(next) ? 0 : next);
                        scheduleAutoGenerate(500);
                      }}
                      className={`w-full p-3 rounded-xl border outline-none focus:ring-2 transition ${getInputClasses()}`}
                    />
                    <p className={`mt-2 text-sm ${getMutedTextClasses()}`}>QRの1セル単位で周囲余白を広げます。</p>
                  </div>
                )}

                {marginMode === "percent" && (
                  <div className="mt-3">
                    <label className="block text-sm font-semibold mb-1">余白率（0〜30%）</label>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      step={0.1}
                      value={marginPercent}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setMarginPercent(Number.isNaN(next) ? 0 : next);
                        scheduleAutoGenerate(500);
                      }}
                      className={`w-full p-3 rounded-xl border outline-none focus:ring-2 transition ${getInputClasses()}`}
                    />
                    <p className={`mt-2 text-sm ${getMutedTextClasses()}`}>上下左右に同率の余白を確保します。</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">角丸設定</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <label className={`rounded-xl px-3 py-2 text-sm cursor-pointer transition-colors ${getRadioLabelClasses(roundMode === "modules")}`}>
                    <input
                      type="radio"
                      name="round-mode"
                      checked={roundMode === "modules"}
                      onChange={() => {
                        setRoundMode("modules");
                        scheduleAutoGenerate(500);
                      }}
                      className="mr-2"
                    />
                    ドット指定
                  </label>
                  <label className={`rounded-xl px-3 py-2 text-sm cursor-pointer transition-colors ${getRadioLabelClasses(roundMode === "percent")}`}>
                    <input
                      type="radio"
                      name="round-mode"
                      checked={roundMode === "percent"}
                      onChange={() => {
                        setRoundMode("percent");
                        scheduleAutoGenerate(500);
                      }}
                      className="mr-2"
                    />
                    パーセント指定
                  </label>
                  <label className={`rounded-xl px-3 py-2 text-sm cursor-pointer transition-colors ${getRadioLabelClasses(roundMode === "auto")}`}>
                    <input
                      type="radio"
                      name="round-mode"
                      checked={roundMode === "auto"}
                      onChange={() => {
                        setRoundMode("auto");
                        scheduleAutoGenerate(500);
                      }}
                      className="mr-2"
                    />
                    自動（推奨）
                  </label>
                </div>

                {roundMode === "modules" && (
                  <div className="mt-3">
                    <label className="block text-sm font-semibold mb-1">角丸量（ドット数: 0〜1.5）</label>
                    <input
                      type="number"
                      min={0}
                      max={1.5}
                      step={0.05}
                      value={roundModules}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setRoundModules(Number.isNaN(next) ? 0 : next);
                        scheduleAutoGenerate(500);
                      }}
                      className={`w-full p-3 rounded-xl border outline-none focus:ring-2 transition ${getInputClasses()}`}
                    />
                  </div>
                )}

                {roundMode === "percent" && (
                  <div className="mt-3">
                    <label className="block text-sm font-semibold mb-1">角丸率（0〜95%）</label>
                    <input
                      type="number"
                      min={0}
                      max={95}
                      step={1}
                      value={roundPercent}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setRoundPercent(Number.isNaN(next) ? 0 : next);
                        scheduleAutoGenerate(500);
                      }}
                      className={`w-full p-3 rounded-xl border outline-none focus:ring-2 transition ${getInputClasses()}`}
                    />
                  </div>
                )}

                <p className={`mt-2 text-sm ${getMutedTextClasses()}`}>
                  余白不足時は角丸を優先し、必要な余白を自動で拡張します。
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">カラー設定</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold mb-1">背景色</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => {
                          const next = normalizeHexColor(e.target.value, backgroundColor);
                          setBackgroundColor(next);
                          setBackgroundColorInput(next);
                          scheduleAutoGenerate(500);
                        }}
                        className="h-11 w-14 rounded-xl cursor-pointer"
                        aria-label="背景色"
                      />
                      <input
                        type="text"
                        value={backgroundColorInput}
                        onChange={(e) => setBackgroundColorInput(e.target.value)}
                        onBlur={() => {
                          const next = normalizeHexColor(backgroundColorInput, backgroundColor);
                          setBackgroundColor(next);
                          setBackgroundColorInput(next);
                          scheduleAutoGenerate(500);
                        }}
                        className={`w-full p-3 rounded-xl border outline-none focus:ring-2 transition ${getInputClasses()}`}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">ドット色</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={dotColor}
                        onChange={(e) => {
                          const next = normalizeHexColor(e.target.value, dotColor);
                          setDotColor(next);
                          setDotColorInput(next);
                          scheduleAutoGenerate(500);
                        }}
                        className="h-11 w-14 rounded-xl cursor-pointer"
                        aria-label="ドット色"
                      />
                      <input
                        type="text"
                        value={dotColorInput}
                        onChange={(e) => setDotColorInput(e.target.value)}
                        onBlur={() => {
                          const next = normalizeHexColor(dotColorInput, dotColor);
                          setDotColor(next);
                          setDotColorInput(next);
                          scheduleAutoGenerate(500);
                        }}
                        className={`w-full p-3 rounded-xl border outline-none focus:ring-2 transition ${getInputClasses()}`}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (generateTimerRef.current) {
                    clearTimeout(generateTimerRef.current);
                  }
                  void generateQrCode();
                }}
                className={`w-full py-3 rounded-xl font-bold transition-colors ${getPrimaryButtonClasses()}`}
              >
                生成する
              </button>
            </div>
          </section>

          <section className={`rounded-2xl p-5 sm:p-6 shadow-sm ${getPanelClasses()}`}>
            <div className="space-y-4">
              <label className="inline-flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={autoGenerate}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setAutoGenerate(checked);
                    if (checked) {
                      scheduleAutoGenerate(500);
                    } else if (generateTimerRef.current) {
                      clearTimeout(generateTimerRef.current);
                      setIsLoading(false);
                    }
                  }}
                />
                自動生成を有効にする
              </label>

              <div className="rounded-2xl p-4 sm:p-5 bg-white/90">
                <div className="flex justify-center items-center min-h-[320px] rounded-xl p-4" style={getCheckerboardStyle()}>
                  {isLoading ? (
                    <div className="w-full max-w-[320px] aspect-square rounded-xl bg-gray-200 animate-pulse" />
                  ) : qrDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrDataUrl} alt="生成されたQRコード" width={qrSize} height={qrSize} className="w-full h-auto max-w-[420px]" />
                  ) : (
                    <div className="w-full max-w-[320px] aspect-square rounded-xl bg-gray-100 flex items-center justify-center text-sm text-gray-500 text-center px-4">
                      URLまたはテキストを入力するとここにQRコードが表示されます。
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href={qrDataUrl || "#"}
                  download="qrcode.png"
                  onClick={(e) => {
                    if (!qrDataUrl) {
                      e.preventDefault();
                    }
                  }}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-colors ${getSecondaryButtonClasses()}`}
                >
                  画像を保存
                </a>
                <button
                  onClick={handleCopyImage}
                  className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${getSecondaryButtonClasses()}`}
                >
                  <Copy size={16} />
                  画像をコピー
                </button>
              </div>

              {statusMessage && <p className={`text-sm ${getMutedTextClasses()}`}>{statusMessage}</p>}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
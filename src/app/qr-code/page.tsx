"use client";

import QRCode from "qrcode";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ClipboardPaste, Copy } from "lucide-react";

import { useTheme } from "../ThemeProvider";
import { ToolStickyHeader } from "@/components/ToolStickyHeader";

type AdjustMode = "none" | "auto" | "modules" | "percent";
type PrefixMode = "free" | "https" | "http";
type CenterOverlayMode = "none" | "char" | "image";

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

const addRoundedRectPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  if (safeRadius <= 0) {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.closePath();
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
};

export default function QrCodePage() {
  const { theme } = useTheme();
  const [rightStickyTop, setRightStickyTop] = useState(140);
  const [prefixMode, setPrefixMode] = useState<PrefixMode>("https");
  const [text, setText] = useState("example.com");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrSize, setQrSize] = useState(360);
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [marginMode, setMarginMode] = useState<AdjustMode>("auto");
  const [marginModules, setMarginModules] = useState(4);
  const [marginPercent, setMarginPercent] = useState(10);
  const [roundMode, setRoundMode] = useState<AdjustMode>("none");
  const [roundModules, setRoundModules] = useState(2.5);
  const [roundPercent, setRoundPercent] = useState(22);
  const [dotColor, setDotColor] = useState("#000000");
  const [dotColorInput, setDotColorInput] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [backgroundColorInput, setBackgroundColorInput] = useState("#ffffff");
  const [centerOverlayMode, setCenterOverlayMode] = useState<CenterOverlayMode>("none");
  const [centerOverlayText, setCenterOverlayText] = useState("");
  const [centerOverlayImageDataUrl, setCenterOverlayImageDataUrl] = useState("");
  const [centerOverlayCharWithBadge, setCenterOverlayCharWithBadge] = useState(true);
  const [centerOverlayTextColor, setCenterOverlayTextColor] = useState("#000000");
  const [centerOverlayTextColorInput, setCenterOverlayTextColorInput] = useState("#000000");
  const [centerOverlayBadgeSizePercent, setCenterOverlayBadgeSizePercent] = useState(8);
  const [centerOverlayTextSizePercent, setCenterOverlayTextSizePercent] = useState(7);
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
      if (marginMode === "none") {
        return 0;
      }
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

  const getCornerRadiusPx = useCallback(
    (cellSize: number) => {
      if (roundMode === "none") {
        return 0;
      }
      if (roundMode === "modules") {
        return cellSize * clamp(roundModules, 0, 20);
      }
      if (roundMode === "percent") {
        return qrSize * (clamp(roundPercent, 0, 45) / 100);
      }
      return qrSize * 0.08;
    },
    [qrSize, roundMode, roundModules, roundPercent]
  );

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
      let cornerRadius = Math.min(getCornerRadiusPx(cellSize), qrSize / 2);

      // Corner radius has priority. Expand quiet zone if needed to keep modules readable.
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
        cornerRadius = Math.min(getCornerRadiusPx(cellSize), qrSize / 2);
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

      const moduleCanvas = document.createElement("canvas");
      moduleCanvas.width = moduleCount;
      moduleCanvas.height = moduleCount;
      const moduleCtx = moduleCanvas.getContext("2d");
      if (!moduleCtx) {
        throw new Error("QRデータの描画に失敗しました。");
      }

      moduleCtx.clearRect(0, 0, moduleCount, moduleCount);
      moduleCtx.fillStyle = dotColor;
      for (let row = 0; row < moduleCount; row += 1) {
        for (let col = 0; col < moduleCount; col += 1) {
          if (qr.modules.get(row, col)) {
            moduleCtx.fillRect(col, row, 1, 1);
          }
        }
      }

      addRoundedRectPath(ctx, 0, 0, qrSize, qrSize, cornerRadius);
      ctx.save();
      ctx.clip();
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, qrSize, qrSize);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(moduleCanvas, padding, padding, innerSize, innerSize);

      const overlayChar = Array.from(centerOverlayText.trim()).slice(0, 1).join("");
      const hasImageOverlay = centerOverlayMode === "image" && !!centerOverlayImageDataUrl;
      const hasCharOverlay = centerOverlayMode === "char" && (centerOverlayCharWithBadge || !!overlayChar);

      if (hasImageOverlay || hasCharOverlay) {
        const badgeSize = Math.round(qrSize * (clamp(centerOverlayBadgeSizePercent, 5, 30) / 100));
        const cx = qrSize / 2;
        const cy = qrSize / 2;
        const badgeRadius = badgeSize / 2;

        if (hasImageOverlay) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, badgeRadius, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(cx - badgeRadius, cy - badgeRadius, badgeSize, badgeSize);

          const overlayImage = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error("中央画像の読み込みに失敗しました。"));
            img.src = centerOverlayImageDataUrl;
          });
          ctx.imageSmoothingEnabled = true;
          ctx.drawImage(overlayImage, cx - badgeRadius, cy - badgeRadius, badgeSize, badgeSize);
          ctx.restore();
        } else {
          if (centerOverlayCharWithBadge) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, badgeRadius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(cx - badgeRadius, cy - badgeRadius, badgeSize, badgeSize);
            ctx.restore();
          }

          const fontSize = Math.round(qrSize * (clamp(centerOverlayTextSizePercent, 3, 30) / 100));
          ctx.fillStyle = centerOverlayTextColor;
          ctx.textAlign = "center";
          ctx.font = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
          const metrics = ctx.measureText(overlayChar);
          const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.8;
          const descent = metrics.actualBoundingBoxDescent || fontSize * 0.2;
          const baselineY = cy + (ascent - descent) / 2;
          ctx.textBaseline = "alphabetic";
          ctx.fillText(overlayChar, cx, baselineY);
        }
      }

      ctx.restore();

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
  }, [
    backgroundColor,
    centerOverlayCharWithBadge,
    centerOverlayImageDataUrl,
    centerOverlayMode,
    centerOverlayBadgeSizePercent,
    centerOverlayTextSizePercent,
    centerOverlayText,
    centerOverlayTextColor,
    composedText,
    dotColor,
    getCornerRadiusPx,
    getPaddingSize,
    qrSize,
  ]);

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

  useEffect(() => {
    const globalHeader = document.getElementById("global-site-header");
    const toolHeader = document.querySelector(".qr-tool-sticky-header");

    const updateStickyTop = () => {
      const globalHeight = globalHeader?.getBoundingClientRect().height ?? 0;
      const toolHeight = toolHeader?.getBoundingClientRect().height ?? 0;
      setRightStickyTop(Math.ceil(globalHeight + toolHeight + 16));
    };

    updateStickyTop();

    const resizeObserver = new ResizeObserver(() => {
      updateStickyTop();
    });

    if (globalHeader) {
      resizeObserver.observe(globalHeader);
    }
    if (toolHeader instanceof Element) {
      resizeObserver.observe(toolHeader);
    }

    window.addEventListener("resize", updateStickyTop);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateStickyTop);
    };
  }, []);

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

  const getDownloadFileName = useCallback(() => {
    const raw = composedText.trim();
    const base = raw
      .replace(/^https?:\/\//i, "")
      .replace(/[\\/:*?"<>|]/g, "_")
      .replace(/\s+/g, "_")
      .slice(0, 80);
    return `qr_${base || "qrcode"}.png`;
  }, [composedText]);

  const triggerDownload = useCallback(
    (fileName: string) => {
      if (!qrDataUrl) {
        setStatusMessage("保存対象のQRコードがまだありません。");
        return;
      }

      const anchor = document.createElement("a");
      anchor.href = qrDataUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    },
    [qrDataUrl]
  );

  const handleSaveImage = () => {
    setStatusMessage("");
    triggerDownload(getDownloadFileName());
  };

  const handleSaveImageAs = async () => {
    setStatusMessage("");
    if (!qrDataUrl) {
      setStatusMessage("保存対象のQRコードがまだありません。");
      return;
    }

    const suggestedName = getDownloadFileName();
    const windowWithPicker = window as Window & {
      showSaveFilePicker?: (options?: {
        suggestedName?: string;
        types?: Array<{ description: string; accept: Record<string, string[]> }>;
      }) => Promise<{
        createWritable: () => Promise<{ write: (data: Blob) => Promise<void>; close: () => Promise<void> }>;
      }>;
    };

    if (!windowWithPicker.showSaveFilePicker) {
      triggerDownload(suggestedName);
      setStatusMessage("このブラウザでは保存先指定に未対応のため、通常ダウンロードを実行しました。");
      return;
    }

    try {
      const handle = await windowWithPicker.showSaveFilePicker({
        suggestedName,
        types: [{ description: "PNG画像", accept: { "image/png": [".png"] } }],
      });
      const blob = await fetch(qrDataUrl).then((res) => res.blob());
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch {
      setStatusMessage("保存先指定をキャンセル、または保存に失敗しました。");
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

  const getSettingBlockClasses = () => {
    switch (theme) {
      case "dark":
        return "bg-gray-700/70";
      case "ocean":
        return "bg-cyan-800/70";
      default:
        return "bg-gray-100";
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
        return "bg-sky-600 hover:bg-sky-500 text-white";
      case "ocean":
        return "bg-teal-600 hover:bg-teal-500 text-white";
      default:
        return "bg-slate-700 hover:bg-slate-600 text-white";
    }
  };

  const getCheckerboardStyle = (): React.CSSProperties => {
    if (theme === "dark") {
      return {
        backgroundColor: "#111111",
        backgroundImage:
          "linear-gradient(45deg, #2f2f2f 25%, transparent 25%), linear-gradient(-45deg, #2f2f2f 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2f2f2f 75%), linear-gradient(-45deg, transparent 75%, #2f2f2f 75%)",
        backgroundSize: "28px 28px",
        backgroundPosition: "0 0, 0 14px, 14px -14px, -14px 0px",
      };
    }
    if (theme === "ocean") {
      return {
        backgroundColor: "#093640",
        backgroundImage:
          "linear-gradient(45deg, #15718a 25%, transparent 25%), linear-gradient(-45deg, #15718a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #15718a 75%), linear-gradient(-45deg, transparent 75%, #15718a 75%)",
        backgroundSize: "28px 28px",
        backgroundPosition: "0 0, 0 14px, 14px -14px, -14px 0px",
      };
    }
    return {
      backgroundColor: "#f6f6f6",
      backgroundImage:
        "linear-gradient(45deg, #d6d6d6 25%, transparent 25%), linear-gradient(-45deg, #d6d6d6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d6d6d6 75%), linear-gradient(-45deg, transparent 75%, #d6d6d6 75%)",
      backgroundSize: "28px 28px",
      backgroundPosition: "0 0, 0 14px, 14px -14px, -14px 0px",
    };
  };

  const getRadioLabelClasses = (active: boolean) => {
    if (active) {
      switch (theme) {
        case "dark":
          return "bg-sky-600 text-white";
        case "ocean":
          return "bg-teal-600 text-white";
        default:
          return "bg-slate-700 text-white";
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
      <ToolStickyHeader title="QRコード生成" className="qr-tool-sticky-header bg-gray-800 text-white" />
      <main className="w-full max-w-6xl mx-auto px-4 pt-4 pb-10 text-base sm:text-lg">
        <div className="grid gap-4 lg:grid-cols-2">
          <section className={`rounded-2xl p-5 sm:p-7 shadow-sm ${getPanelClasses()}`}>
            <div className="space-y-6">
              <div className={`rounded-2xl px-4 py-5 sm:px-5 sm:py-6 space-y-4 text-center ${getSettingBlockClasses()}`}>
                <label className="block text-lg font-bold">URLまたはテキスト</label>
                <div className="grid gap-2 sm:grid-cols-3 mb-2 max-w-2xl mx-auto">
                  <label className={`rounded-xl px-3 py-3 text-base cursor-pointer transition-colors ${getRadioLabelClasses(prefixMode === "https")}`}>
                    <input
                      type="radio"
                      name="prefix-mode"
                      checked={prefixMode === "https"}
                      onChange={() => handlePrefixModeChange("https")}
                      className="mr-2"
                    />
                    https://
                  </label>
                  <label className={`rounded-xl px-3 py-3 text-base cursor-pointer transition-colors ${getRadioLabelClasses(prefixMode === "http")}`}>
                    <input
                      type="radio"
                      name="prefix-mode"
                      checked={prefixMode === "http"}
                      onChange={() => handlePrefixModeChange("http")}
                      className="mr-2"
                    />
                    http://
                  </label>
                  <label className={`rounded-xl px-3 py-3 text-base cursor-pointer transition-colors ${getRadioLabelClasses(prefixMode === "free")}`}>
                    <input
                      type="radio"
                      name="prefix-mode"
                      checked={prefixMode === "free"}
                      onChange={() => handlePrefixModeChange("free")}
                      className="mr-2"
                    />
                    自由入力
                  </label>
                </div>
                <div className="flex items-center gap-2 max-w-2xl mx-auto">
                  <button
                    onClick={handlePaste}
                    className={`shrink-0 px-4 py-3 rounded-xl font-semibold text-base flex items-center gap-2 transition-colors ${getSecondaryButtonClasses()}`}
                    aria-label="クリップボードからペースト"
                  >
                    <ClipboardPaste size={18} />
                    <span>ペースト</span>
                  </button>
                  {prefixMode !== "free" && (
                    <span className={`shrink-0 px-3 py-3 rounded-xl text-base font-semibold ${getSecondaryButtonClasses()}`}>
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
                    className={`w-full p-3 rounded-xl border outline-none text-base sm:text-lg focus:ring-2 transition ${getInputClasses()}`}
                    placeholder={prefixMode === "free" ? "https://example.com" : "example.com/path"}
                  />
                </div>
                <p className={`mt-2 text-base ${getMutedTextClasses()}`}>
                  手入力時は1.5秒、ペーストや設定変更時は0.5秒待って自動生成します。
                </p>
              </div>

              <div className={`rounded-2xl px-4 py-5 sm:px-5 sm:py-6 space-y-3 text-center ${getSettingBlockClasses()}`}>
                <label className="block text-lg font-bold">QRサイズ</label>
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
                  className="w-full h-3 cursor-pointer max-w-2xl mx-auto"
                />
                <p className={`mt-2 text-base ${getMutedTextClasses()}`}>{printHint}</p>
              </div>

              <div className={`rounded-2xl px-4 py-5 sm:px-5 sm:py-6 space-y-3 text-center ${getSettingBlockClasses()}`}>
                <p className="text-lg font-bold">外周余白</p>
                <div className="grid grid-cols-2 gap-2 max-w-2xl mx-auto">
                  <label className={`rounded-xl px-3 py-3 text-base cursor-pointer transition-colors ${getRadioLabelClasses(marginMode === "none")}`}>
                    <input
                      type="radio"
                      name="margin-mode"
                      checked={marginMode === "none"}
                      onChange={() => {
                        setMarginMode("none");
                        scheduleAutoGenerate(500);
                      }}
                      className="mr-2"
                    />
                    最小
                  </label>
                  <label className={`rounded-xl px-3 py-3 text-base cursor-pointer transition-colors ${getRadioLabelClasses(marginMode === "auto")}`}>
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
                    自動
                  </label>
                  <label className={`rounded-xl px-3 py-3 text-base cursor-pointer transition-colors ${getRadioLabelClasses(marginMode === "modules")}`}>
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
                  <label className={`rounded-xl px-3 py-3 text-base cursor-pointer transition-colors ${getRadioLabelClasses(marginMode === "percent")}`}>
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
                </div>

                {marginMode === "modules" && (
                  <div className="mt-3 max-w-xl mx-auto text-center">
                    <label className="block text-base font-semibold mb-1">余白（ドット数: 0〜20）</label>
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
                      className={`w-full p-3 rounded-xl border outline-none text-base sm:text-lg focus:ring-2 transition ${getInputClasses()}`}
                    />
                    <p className={`mt-2 text-base ${getMutedTextClasses()}`}>QRの1セル単位で周囲余白を広げます。</p>
                  </div>
                )}

                {marginMode === "percent" && (
                  <div className="mt-3 max-w-xl mx-auto text-center">
                    <label className="block text-base font-semibold mb-1">余白率（0〜30%）</label>
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
                      className={`w-full p-3 rounded-xl border outline-none text-base sm:text-lg focus:ring-2 transition ${getInputClasses()}`}
                    />
                    <p className={`mt-2 text-base ${getMutedTextClasses()}`}>上下左右に同率の余白を確保します。</p>
                  </div>
                )}
              </div>

              <div className={`rounded-2xl px-4 py-5 sm:px-5 sm:py-6 space-y-3 text-center ${getSettingBlockClasses()}`}>
                <p className="text-lg font-bold">角丸設定</p>
                <div className="grid grid-cols-2 gap-2 max-w-2xl mx-auto">
                  <label className={`rounded-xl px-3 py-3 text-base cursor-pointer transition-colors ${getRadioLabelClasses(roundMode === "none")}`}>
                    <input
                      type="radio"
                      name="round-mode"
                      checked={roundMode === "none"}
                      onChange={() => {
                        setRoundMode("none");
                        scheduleAutoGenerate(500);
                      }}
                      className="mr-2"
                    />
                    なし
                  </label>
                  <label className={`rounded-xl px-3 py-3 text-base cursor-pointer transition-colors ${getRadioLabelClasses(roundMode === "auto")}`}>
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
                    自動
                  </label>
                  <label className={`rounded-xl px-3 py-3 text-base cursor-pointer transition-colors ${getRadioLabelClasses(roundMode === "modules")}`}>
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
                  <label className={`rounded-xl px-3 py-3 text-base cursor-pointer transition-colors ${getRadioLabelClasses(roundMode === "percent")}`}>
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
                </div>

                {roundMode === "modules" && (
                  <div className="mt-3 max-w-xl mx-auto text-center">
                    <label className="block text-base font-semibold mb-1">角丸量（ドット数: 0〜20）</label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={0.1}
                      value={roundModules}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setRoundModules(Number.isNaN(next) ? 0 : next);
                        scheduleAutoGenerate(500);
                      }}
                      className={`w-full p-3 rounded-xl border outline-none text-base sm:text-lg focus:ring-2 transition ${getInputClasses()}`}
                    />
                  </div>
                )}

                {roundMode === "percent" && (
                  <div className="mt-3 max-w-xl mx-auto text-center">
                    <label className="block text-base font-semibold mb-1">角丸率（0〜45%）</label>
                    <input
                      type="number"
                      min={0}
                      max={45}
                      step={1}
                      value={roundPercent}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setRoundPercent(Number.isNaN(next) ? 0 : next);
                        scheduleAutoGenerate(500);
                      }}
                      className={`w-full p-3 rounded-xl border outline-none text-base sm:text-lg focus:ring-2 transition ${getInputClasses()}`}
                    />
                  </div>
                )}

                <p className={`mt-2 text-base ${getMutedTextClasses()}`}>
                  画像全体に角丸を適用します。余白不足時は角丸を優先し、必要な余白を自動で拡張します。
                </p>
              </div>

              <div className={`rounded-2xl px-4 py-5 sm:px-5 sm:py-6 space-y-4 text-center ${getSettingBlockClasses()}`}>
                <p className="text-lg font-bold">カラー設定</p>
                <div className="grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto">
                  <div>
                    <label className="block text-base font-semibold mb-1">背景色</label>
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
                        className="h-12 w-16 rounded-xl cursor-pointer"
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
                        className={`w-full p-3 rounded-xl border outline-none text-base sm:text-lg focus:ring-2 transition ${getInputClasses()}`}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-base font-semibold mb-1">ドット色</label>
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
                        className="h-12 w-16 rounded-xl cursor-pointer"
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
                        className={`w-full p-3 rounded-xl border outline-none text-base sm:text-lg focus:ring-2 transition ${getInputClasses()}`}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl px-4 py-5 sm:px-5 sm:py-6 space-y-4 text-center ${getSettingBlockClasses()}`}>
                <p className="text-lg font-bold">中央アイコン・絵文字・画像</p>
                <div className="max-w-3xl mx-auto space-y-3">
                  <div className="grid grid-cols-3 gap-2 max-w-2xl mx-auto">
                    <label className={`rounded-xl px-3 py-3 text-base cursor-pointer transition-colors ${getRadioLabelClasses(centerOverlayMode === "none")}`}>
                      <input
                        type="radio"
                        name="center-overlay-mode"
                        checked={centerOverlayMode === "none"}
                        onChange={() => {
                          setCenterOverlayMode("none");
                          scheduleAutoGenerate(500);
                        }}
                        className="mr-2"
                      />
                      なし
                    </label>
                    <label className={`rounded-xl px-3 py-3 text-base cursor-pointer transition-colors ${getRadioLabelClasses(centerOverlayMode === "char")}`}>
                      <input
                        type="radio"
                        name="center-overlay-mode"
                        checked={centerOverlayMode === "char"}
                        onChange={() => {
                          setCenterOverlayMode("char");
                          scheduleAutoGenerate(500);
                        }}
                        className="mr-2"
                      />
                      1文字
                    </label>
                    <label className={`rounded-xl px-3 py-3 text-base cursor-pointer transition-colors ${getRadioLabelClasses(centerOverlayMode === "image")}`}>
                      <input
                        type="radio"
                        name="center-overlay-mode"
                        checked={centerOverlayMode === "image"}
                        onChange={() => {
                          setCenterOverlayMode("image");
                          scheduleAutoGenerate(500);
                        }}
                        className="mr-2"
                      />
                      画像
                    </label>
                  </div>

                  <div className="max-w-xl mx-auto text-center">
                    {centerOverlayMode === "none" ? (
                      <></>
                    ) : centerOverlayMode === "char" ? (
                      <>
                        <label className="block text-base font-semibold mb-1">表示する文字（1文字）</label>
                        <input
                          type="text"
                          value={centerOverlayText}
                          onChange={(e) => {
                            setCenterOverlayText(e.target.value);
                            scheduleAutoGenerate(500);
                          }}
                          onBlur={() => {
                            const nextChar = Array.from(centerOverlayText.trim()).slice(0, 1).join("");
                            setCenterOverlayText(nextChar);
                            scheduleAutoGenerate(500);
                          }}
                          className={`w-full p-3 rounded-xl border outline-none text-base sm:text-lg focus:ring-2 transition ${getInputClasses()}`}
                          placeholder="例: ★"
                        />

                        <div className="mt-3">
                          <label className="block text-base font-semibold mb-1">文字色</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={centerOverlayTextColor}
                              onChange={(e) => {
                                const next = normalizeHexColor(e.target.value, centerOverlayTextColor);
                                setCenterOverlayTextColor(next);
                                setCenterOverlayTextColorInput(next);
                                scheduleAutoGenerate(500);
                              }}
                              className="h-12 w-16 rounded-xl cursor-pointer"
                              aria-label="中央文字色"
                            />
                            <input
                              type="text"
                              value={centerOverlayTextColorInput}
                              onChange={(e) => setCenterOverlayTextColorInput(e.target.value)}
                              onBlur={() => {
                                const next = normalizeHexColor(centerOverlayTextColorInput, centerOverlayTextColor);
                                setCenterOverlayTextColor(next);
                                setCenterOverlayTextColorInput(next);
                                scheduleAutoGenerate(500);
                              }}
                              className={`w-full p-3 rounded-xl border outline-none text-base sm:text-lg focus:ring-2 transition ${getInputClasses()}`}
                              placeholder="#000000"
                            />
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="block text-base font-semibold mb-1">文字サイズ（3〜25%）</label>
                          <input
                            type="range"
                            min={3}
                            max={25}
                            step={1}
                            value={centerOverlayTextSizePercent}
                            onChange={(e) => {
                              setCenterOverlayTextSizePercent(Number(e.target.value));
                              scheduleAutoGenerate(500);
                            }}
                            className="w-full h-3 cursor-pointer"
                          />
                          <p className={`mt-2 text-base ${getMutedTextClasses()}`}>{centerOverlayTextSizePercent}%</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <label className={`rounded-xl px-3 py-3 text-base cursor-pointer transition-colors ${getRadioLabelClasses(centerOverlayCharWithBadge)}`}>
                            <input
                              type="radio"
                              name="center-char-badge"
                              checked={centerOverlayCharWithBadge}
                              onChange={() => {
                                setCenterOverlayCharWithBadge(true);
                                scheduleAutoGenerate(500);
                              }}
                              className="mr-2"
                            />
                            バッジあり
                          </label>
                          <label className={`rounded-xl px-3 py-3 text-base cursor-pointer transition-colors ${getRadioLabelClasses(!centerOverlayCharWithBadge)}`}>
                            <input
                              type="radio"
                              name="center-char-badge"
                              checked={!centerOverlayCharWithBadge}
                              onChange={() => {
                                setCenterOverlayCharWithBadge(false);
                                scheduleAutoGenerate(500);
                              }}
                              className="mr-2"
                            />
                            バッジなし
                          </label>
                        </div>

                        {centerOverlayCharWithBadge && (
                          <div className="mt-3">
                            <label className="block text-base font-semibold mb-1">バッジサイズ（5〜30%）</label>
                            <input
                              type="range"
                              min={5}
                              max={30}
                              step={1}
                              value={centerOverlayBadgeSizePercent}
                              onChange={(e) => {
                                setCenterOverlayBadgeSizePercent(Number(e.target.value));
                                scheduleAutoGenerate(500);
                              }}
                              className="w-full h-3 cursor-pointer"
                            />
                            <p className={`mt-2 text-base ${getMutedTextClasses()}`}>{centerOverlayBadgeSizePercent}%</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <label className="block text-base font-semibold mb-1">中央に表示する画像</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) {
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => {
                              const result = typeof reader.result === "string" ? reader.result : "";
                              setCenterOverlayImageDataUrl(result);
                              scheduleAutoGenerate(500);
                            };
                            reader.readAsDataURL(file);
                          }}
                          className={`w-full p-3 rounded-xl border outline-none text-base sm:text-lg focus:ring-2 transition ${getInputClasses()}`}
                        />
                        {centerOverlayImageDataUrl && (
                          <div className="mt-3 flex items-center justify-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={centerOverlayImageDataUrl} alt="中央画像プレビュー" className="w-12 h-12 rounded-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                setCenterOverlayImageDataUrl("");
                                scheduleAutoGenerate(500);
                              }}
                              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${getSecondaryButtonClasses()}`}
                            >
                              画像をクリア
                            </button>
                          </div>
                        )}

                        <div className="mt-3">
                          <label className="block text-base font-semibold mb-1">表示サイズ（5〜25%）</label>
                          <input
                            type="range"
                            min={5}
                            max={25}
                            step={1}
                            value={centerOverlayBadgeSizePercent}
                            onChange={(e) => {
                              setCenterOverlayBadgeSizePercent(Number(e.target.value));
                              scheduleAutoGenerate(500);
                            }}
                            className="w-full h-3 cursor-pointer"
                          />
                          <p className={`mt-2 text-base ${getMutedTextClasses()}`}>{centerOverlayBadgeSizePercent}%</p>
                        </div>
                      </>
                    )}
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
                className={`w-full py-4 rounded-xl text-lg font-bold transition-colors ${getPrimaryButtonClasses()}`}
              >
                生成する
              </button>
            </div>
          </section>

          <section
            className={`rounded-2xl p-5 sm:p-7 shadow-sm lg:sticky lg:self-start ${getPanelClasses()}`}
            style={{ top: `${rightStickyTop}px` }}
          >
            <div className="space-y-5">
              <label className="inline-flex items-center gap-2 text-base sm:text-lg font-semibold">
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

              <div className="flex justify-center items-center min-h-[360px] rounded-2xl p-5" style={getCheckerboardStyle()}>
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

              <div className="flex w-full flex-wrap gap-2 items-stretch">
                <button
                  onClick={handleCopyImage}
                  className={`basis-full w-full px-4 py-3 rounded-xl text-base font-bold whitespace-nowrap flex items-center justify-center gap-2 text-center transition-colors ${getSecondaryButtonClasses()}`}
                >
                  <Copy size={16} />
                  画像をコピー
                </button>
                <button
                  onClick={handleSaveImage}
                  className={`flex-1 min-w-[11rem] px-4 py-3 rounded-xl text-base font-bold whitespace-nowrap flex items-center justify-center gap-2 text-center transition-colors ${getSecondaryButtonClasses()}`}
                >
                  画像を保存
                </button>
                <button
                  onClick={() => {
                    void handleSaveImageAs();
                  }}
                  className={`flex-1 min-w-[12.5rem] px-4 py-3 rounded-xl text-base font-bold whitespace-nowrap flex items-center justify-center gap-2 text-center transition-colors ${getSecondaryButtonClasses()}`}
                >
                  場所を指定して保存
                </button>
              </div>

              {statusMessage && <p className={`text-base ${getMutedTextClasses()}`}>{statusMessage}</p>}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
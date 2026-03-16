"use client";

import QRCode from "qrcode";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ClipboardPaste, Copy } from "lucide-react";

import { useTheme } from "../ThemeProvider";
import { ToolStickyHeader } from "@/components/ToolStickyHeader";

type MarginMode = "modules" | "percent" | "auto";

const MIN_QR_SIZE = 240;
const MAX_QR_SIZE = 720;
const QR_STEP = 40;

const pxToMm = (px: number, dpi = 300) => (px / dpi) * 25.4;

export default function QrCodePage() {
  const { theme } = useTheme();
  const [text, setText] = useState("https://example.com");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrSize, setQrSize] = useState(360);
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [marginMode, setMarginMode] = useState<MarginMode>("modules");
  const [marginModules, setMarginModules] = useState(4);
  const [marginPercent, setMarginPercent] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  const generateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestTaskRef = useRef(0);

  const getPaddingSize = useCallback(
    (moduleCount: number) => {
      if (marginMode === "modules") {
        const safeModules = Math.min(20, Math.max(0, marginModules));
        return (qrSize * safeModules) / (moduleCount + safeModules * 2);
      }
      if (marginMode === "percent") {
        const safePercent = Math.min(30, Math.max(0, marginPercent));
        return qrSize * (safePercent / 100);
      }
      return qrSize * 0.08;
    },
    [marginMode, marginModules, marginPercent, qrSize]
  );

  const generateQrCode = useCallback(async () => {
    const taskId = latestTaskRef.current + 1;
    latestTaskRef.current = taskId;
    setStatusMessage("");

    const value = text.trim();
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
      const padding = getPaddingSize(moduleCount);
      const innerSize = qrSize - padding * 2;

      if (innerSize <= 0) {
        throw new Error("QRサイズに対して余白が大きすぎます。");
      }

      const canvas = document.createElement("canvas");
      canvas.width = qrSize;
      canvas.height = qrSize;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvasの初期化に失敗しました。");
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, qrSize, qrSize);

      const cellSize = innerSize / moduleCount;
      ctx.fillStyle = "#000000";

      for (let row = 0; row < moduleCount; row += 1) {
        for (let col = 0; col < moduleCount; col += 1) {
          if (!qr.modules.get(row, col)) {
            continue;
          }
          const x = padding + col * cellSize;
          const y = padding + row * cellSize;
          const nextX = padding + (col + 1) * cellSize;
          const nextY = padding + (row + 1) * cellSize;
          ctx.fillRect(x, y, nextX - x, nextY - y);
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
  }, [getPaddingSize, qrSize, text]);

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
      const pastedText = await navigator.clipboard.readText();
      setText(pastedText);
      scheduleAutoGenerate(500);
    } catch {
      setStatusMessage("クリップボードの読み取りに失敗しました。ブラウザの許可設定をご確認ください。");
    }
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePaste}
                    className={`shrink-0 px-4 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors ${getSecondaryButtonClasses()}`}
                    aria-label="クリップボードからペースト"
                  >
                    <ClipboardPaste size={18} />
                    <span>ペースト</span>
                  </button>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      scheduleAutoGenerate(1500);
                    }}
                    className={`w-full p-3 rounded-xl border outline-none focus:ring-2 transition ${getInputClasses()}`}
                    placeholder="https://example.com"
                  />
                </div>
                <p className={`mt-2 text-sm ${getMutedTextClasses()}`}>
                  手入力時は1.5秒、ペーストや設定変更時は0.5秒待って自動生成します。
                </p>
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
                <div className="flex justify-center items-center min-h-[320px]">
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
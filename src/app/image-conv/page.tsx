"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ToolStickyHeader } from "@/components/ToolStickyHeader";

type OutputFormat = "image/png" | "image/jpeg" | "image/webp" | "image/avif";

const OUTPUT_OPTIONS: Array<{ mime: OutputFormat; label: string; ext: string; lossy: boolean }> = [
  { mime: "image/png", label: "PNG", ext: "png", lossy: false },
  { mime: "image/jpeg", label: "JPEG", ext: "jpg", lossy: true },
  { mime: "image/webp", label: "WebP", ext: "webp", lossy: true },
  { mime: "image/avif", label: "AVIF", ext: "avif", lossy: true },
];

const ACCEPT_EXTENSIONS = ".png,.jpg,.jpeg,.webp,.avif,.gif,.bmp,.tif,.tiff,.ico,.heic,.heif";

function fileExtension(name: string) {
  const dot = name.lastIndexOf(".");
  if (dot < 0) {
    return "";
  }
  return name.slice(dot + 1).toLowerCase();
}

function blobToObjectUrl(blob: Blob) {
  return URL.createObjectURL(blob);
}

function revokeObjectUrl(url: string | null) {
  if (!url) return;
  URL.revokeObjectURL(url);
}

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
    img.src = url;
  });
}

async function imageLikeToCanvas(blob: Blob): Promise<HTMLCanvasElement> {
  try {
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      throw new Error("Canvasコンテキストを初期化できませんでした");
    }
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    return canvas;
  } catch {
    const url = blobToObjectUrl(blob);
    try {
      const img = await loadImageElement(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvasコンテキストを初期化できませんでした");
      }
      ctx.drawImage(img, 0, 0);
      return canvas;
    } finally {
      revokeObjectUrl(url);
    }
  }
}

async function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
        return;
      }
      reject(new Error("ファイルを読み込めませんでした"));
    };
    reader.onerror = () => reject(new Error("ファイル読み込み時にエラーが発生しました"));
    reader.readAsArrayBuffer(file);
  });
}

async function decodeHeic(file: File): Promise<HTMLCanvasElement> {
  const mod = await import("heic2any");
  const converted = await mod.default({ blob: file, toType: "image/png", quality: 0.95 });
  const normalized = Array.isArray(converted) ? converted[0] : converted;
  return imageLikeToCanvas(normalized);
}

async function decodeTiff(file: File): Promise<HTMLCanvasElement> {
  const UTIF = await import("utif");
  const buffer = await readAsArrayBuffer(file);
  const ifds = UTIF.decode(buffer);
  if (!ifds.length) {
    throw new Error("TIFFデータを解析できませんでした");
  }
  UTIF.decodeImages(buffer, ifds);
  const first = ifds[0] as { width: number; height: number };
  const rgba = UTIF.toRGBA8(first);

  const canvas = document.createElement("canvas");
  canvas.width = first.width;
  canvas.height = first.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvasコンテキストを初期化できませんでした");
  }

  const data = new ImageData(new Uint8ClampedArray(rgba), first.width, first.height);
  ctx.putImageData(data, 0, 0);
  return canvas;
}

async function decodeIco(file: File): Promise<HTMLCanvasElement> {
  const { parseICO } = await import("icojs/browser");
  const buffer = await readAsArrayBuffer(file);
  const images = await parseICO(buffer, "image/png");
  if (!images.length) {
    throw new Error("ICOデータを解析できませんでした");
  }

  const best = images.reduce((acc, current) => {
    const areaAcc = acc.width * acc.height;
    const areaCur = current.width * current.height;
    return areaCur > areaAcc ? current : acc;
  });

  const pixels = new Uint8ClampedArray(best.buffer);
  const imageData = new ImageData(pixels, best.width, best.height);

  const canvas = document.createElement("canvas");
  canvas.width = best.width;
  canvas.height = best.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvasコンテキストを初期化できませんでした");
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: OutputFormat, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const qualityValue = mime === "image/png" ? undefined : quality;
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("この形式は現在のブラウザで出力できませんでした"));
          return;
        }
        resolve(blob);
      },
      mime,
      qualityValue,
    );
  });
}

export default function ImageConvPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState("converted-image");
  const [outputMime, setOutputMime] = useState<OutputFormat>("image/png");
  const [quality, setQuality] = useState(0.9);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const selectedOutput = useMemo(() => {
    return OUTPUT_OPTIONS.find((item) => item.mime === outputMime) ?? OUTPUT_OPTIONS[0];
  }, [outputMime]);

  useEffect(() => {
    return () => {
      revokeObjectUrl(sourceUrl);
      revokeObjectUrl(resultUrl);
    };
  }, [sourceUrl, resultUrl]);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setError("");
    setNote("");
    revokeObjectUrl(resultUrl);
    setResultUrl(null);
    setResultBlob(null);

    if (!file) {
      revokeObjectUrl(sourceUrl);
      setSourceUrl(null);
      setSourceFile(null);
      return;
    }

    revokeObjectUrl(sourceUrl);
    setSourceUrl(blobToObjectUrl(file));
    setSourceFile(file);

    const ext = fileExtension(file.name);
    if (ext === "gif") {
      setNote("GIFは先頭フレームを静止画として変換します。");
    }
  };

  const convert = async () => {
    if (!sourceFile) {
      setError("先に画像ファイルを選択してください。");
      return;
    }

    setLoading(true);
    setError("");

    revokeObjectUrl(resultUrl);
    setResultUrl(null);
    setResultBlob(null);

    try {
      const ext = fileExtension(sourceFile.name);
      const mime = sourceFile.type.toLowerCase();

      let canvas: HTMLCanvasElement;
      if (ext === "heic" || ext === "heif" || mime === "image/heic" || mime === "image/heif") {
        canvas = await decodeHeic(sourceFile);
      } else if (ext === "tif" || ext === "tiff" || mime === "image/tiff") {
        canvas = await decodeTiff(sourceFile);
      } else if (ext === "ico" || mime === "image/x-icon" || mime === "image/vnd.microsoft.icon") {
        canvas = await decodeIco(sourceFile);
      } else {
        canvas = await imageLikeToCanvas(sourceFile);
      }

      const blob = await canvasToBlob(canvas, outputMime, quality);
      const url = blobToObjectUrl(blob);

      setResultBlob(blob);
      setResultUrl(url);
      setResultName(sourceFile.name.replace(/\.[^.]+$/, "") || "converted-image");

      if (outputMime === "image/jpeg") {
        setNote("JPEGは透過情報を保持できません。背景は黒または白に見える場合があります。");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "変換中に予期しないエラーが発生しました";
      if (message.includes("heic") || message.includes("HEIC")) {
        setError("HEICの解析に失敗しました。端末のメモリ状態やファイル破損をご確認ください。");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!resultBlob || !resultUrl) {
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = resultUrl;
    anchor.download = `${resultName}.${selectedOutput.ext}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <>
      <ToolStickyHeader title="画像変換" className="bg-gray-800 text-white" />
      <div className="max-w-4xl mx-auto mt-4 px-4 pb-8">
        <div className="rounded-2xl p-5 sm:p-6 bg-black/10 dark:bg-white/10 backdrop-blur-sm">
          <p className="text-sm opacity-85 leading-relaxed">
            ブラウザだけで画像形式を変換します。HEIC / TIFF / ICO も入力できます。
            出力は PNG / JPEG / WebP / AVIF に対応しています。
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold opacity-90">入力画像</span>
              <input
                type="file"
                accept={ACCEPT_EXTENSIONS}
                onChange={onFileChange}
                className="w-full p-2.5 rounded-lg bg-black/10 dark:bg-white/10 border border-current/30"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold opacity-90">出力形式</span>
              <select
                value={outputMime}
                onChange={(e) => setOutputMime(e.target.value as OutputFormat)}
                className="w-full p-2.5 rounded-lg bg-black/10 dark:bg-white/10 border border-current/30"
              >
                {OUTPUT_OPTIONS.map((option) => (
                  <option key={option.mime} value={option.mime}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedOutput.lossy && (
            <div className="mt-4 p-4 rounded-xl bg-black/5 dark:bg-white/5">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold opacity-90">画質: {Math.round(quality * 100)}%</span>
                <input
                  type="range"
                  min={0.4}
                  max={1}
                  step={0.05}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="accent-blue-500"
                />
              </label>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={convert}
              disabled={!sourceFile || loading}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "変換中..." : "変換する"}
            </button>
            <button
              onClick={download}
              disabled={!resultBlob}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ダウンロード
            </button>
          </div>

          {note && (
            <p className="mt-4 text-sm rounded-lg p-3 bg-amber-500/15 text-amber-900 dark:text-amber-200">
              {note}
            </p>
          )}

          {error && (
            <p className="mt-4 text-sm rounded-lg p-3 bg-red-500/15 text-red-900 dark:text-red-200">
              {error}
            </p>
          )}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl p-4 bg-black/5 dark:bg-white/5">
            <h3 className="font-semibold opacity-90 mb-3">入力プレビュー</h3>
            {sourceUrl ? (
              <img src={sourceUrl} alt="入力画像プレビュー" className="w-full h-auto rounded-lg object-contain max-h-[360px] bg-black/10 dark:bg-white/10" />
            ) : (
              <p className="text-sm opacity-70">画像を選択するとプレビューが表示されます。</p>
            )}
          </section>

          <section className="rounded-2xl p-4 bg-black/5 dark:bg-white/5">
            <h3 className="font-semibold opacity-90 mb-3">変換後プレビュー</h3>
            {resultUrl ? (
              <img src={resultUrl} alt="変換後画像プレビュー" className="w-full h-auto rounded-lg object-contain max-h-[360px] bg-black/10 dark:bg-white/10" />
            ) : (
              <p className="text-sm opacity-70">変換後の画像はここに表示されます。</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

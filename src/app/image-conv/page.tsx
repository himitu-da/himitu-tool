"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

type OutputFormat = "image/png" | "image/jpeg" | "image/webp" | "image/avif";

type SelectedImage = {
  id: string;
  file: File;
  previewUrl: string;
  note: string;
};

type ConvertedImage = {
  id: string;
  name: string;
  downloadName: string;
  formatLabel: string;
  previewUrl: string;
  blob: Blob;
  width: number;
  height: number;
  sizeLabel: string;
};

type PreviewImage = {
  src: string;
  alt: string;
};

const OUTPUT_OPTIONS: Array<{ mime: OutputFormat; label: string; ext: string; lossy: boolean }> = [
  { mime: "image/png", label: "PNG", ext: "png", lossy: false },
  { mime: "image/jpeg", label: "JPEG", ext: "jpg", lossy: true },
  { mime: "image/webp", label: "WebP", ext: "webp", lossy: true },
  { mime: "image/avif", label: "AVIF", ext: "avif", lossy: true },
];

const ACCEPT_EXTENSIONS = ".png,.jpg,.jpeg,.webp,.avif,.gif,.bmp,.tif,.tiff,.ico,.heic,.heif";

function fileExtension(name: string) {
  const dot = name.lastIndexOf(".");
  return dot < 0 ? "" : name.slice(dot + 1).toLowerCase();
}

function blobToObjectUrl(blob: Blob) {
  return URL.createObjectURL(blob);
}

function revokeObjectUrl(url: string | null) {
  if (url) {
    URL.revokeObjectURL(url);
  }
}

function revokeUrls(items: Array<{ previewUrl: string }>) {
  items.forEach((item) => revokeObjectUrl(item.previewUrl));
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function buildFileNote(file: File) {
  return fileExtension(file.name) === "gif" ? "GIFは先頭フレームを静止画として変換します。" : "";
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
      throw new Error("Canvasコンテキストを取得できませんでした");
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
        throw new Error("Canvasコンテキストを取得できませんでした");
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
      reject(new Error("ファイルの読み込みに失敗しました"));
    };
    reader.onerror = () => reject(new Error("ファイル読み込み中にエラーが発生しました"));
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
    throw new Error("TIFFファイルを解析できませんでした");
  }
  UTIF.decodeImages(buffer, ifds);
  const first = ifds[0] as { width: number; height: number };
  const rgba = UTIF.toRGBA8(first);

  const canvas = document.createElement("canvas");
  canvas.width = first.width;
  canvas.height = first.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvasコンテキストを取得できませんでした");
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
    throw new Error("ICOファイルを解析できませんでした");
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
    throw new Error("Canvasコンテキストを取得できませんでした");
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
          reject(new Error("画像の書き出しに失敗しました"));
          return;
        }
        resolve(blob);
      },
      mime,
      qualityValue,
    );
  });
}

async function fileToCanvas(file: File) {
  const ext = fileExtension(file.name);
  const mime = file.type.toLowerCase();

  if (ext === "heic" || ext === "heif" || mime === "image/heic" || mime === "image/heif") {
    return decodeHeic(file);
  }
  if (ext === "tif" || ext === "tiff" || mime === "image/tiff") {
    return decodeTiff(file);
  }
  if (ext === "ico" || mime === "image/x-icon" || mime === "image/vnd.microsoft.icon") {
    return decodeIco(file);
  }
  return imageLikeToCanvas(file);
}

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export default function ImageConvPage() {
  const [selectedFiles, setSelectedFiles] = useState<SelectedImage[]>([]);
  const [results, setResults] = useState<ConvertedImage[]>([]);
  const [outputMime, setOutputMime] = useState<OutputFormat>("image/png");
  const [quality, setQuality] = useState(0.9);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conversionNotes, setConversionNotes] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { primaryBtnCls, secondaryBtnCls, blockCls, mutedTextCls, radioLabelCls, theme } = useToolTheme();

  const selectedOutput = useMemo(() => {
    return OUTPUT_OPTIONS.find((item) => item.mime === outputMime) ?? OUTPUT_OPTIONS[0];
  }, [outputMime]);

  useEffect(() => {
    return () => {
      revokeUrls(selectedFiles);
      revokeUrls(results);
    };
  }, [selectedFiles, results]);

  const addFiles = (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    if (!incoming.length) {
      return;
    }

    setError("");
    setConversionNotes([]);
    setResults((current) => {
      revokeUrls(current);
      return [];
    });

    setSelectedFiles((current) => {
      const seen = new Set(current.map((item) => fileKey(item.file)));
      const next = [...current];

      incoming.forEach((file) => {
        const key = fileKey(file);
        if (seen.has(key)) {
          return;
        }

        seen.add(key);
        next.push({
          id: key,
          file,
          previewUrl: blobToObjectUrl(file),
          note: buildFileNote(file),
        });
      });

      return next;
    });
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(event.target.files ?? []);
    event.target.value = "";
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    addFiles(event.dataTransfer.files);
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!dragActive) {
      setDragActive(true);
    }
  };

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }
    setDragActive(false);
  };

  const clearSelectedFiles = () => {
    setSelectedFiles((current) => {
      revokeUrls(current);
      return [];
    });
    setResults((current) => {
      revokeUrls(current);
      return [];
    });
    setError("");
    setConversionNotes([]);
  };

  const removeSelectedFile = (id: string) => {
    setSelectedFiles((current) => {
      const target = current.find((item) => item.id === id);
      if (target) {
        revokeObjectUrl(target.previewUrl);
      }
      return current.filter((item) => item.id !== id);
    });
    setResults((current) => {
      revokeUrls(current);
      return [];
    });
    setError("");
    setConversionNotes([]);
  };

  const convert = async () => {
    if (!selectedFiles.length) {
      setError("先に画像を選択してください。");
      return;
    }

    setLoading(true);
    setError("");
    setConversionNotes([]);
    setResults((current) => {
      revokeUrls(current);
      return [];
    });

    const startedAt = Date.now();

    try {
      const nextResults = await Promise.all(
        selectedFiles.map(async ({ file, id }) => {
          const canvas = await fileToCanvas(file);
          const blob = await canvasToBlob(canvas, outputMime, quality);
          const downloadName = `${file.name.replace(/\.[^.]+$/, "") || "converted-image"}.${selectedOutput.ext}`;
          return {
            id,
            name: file.name,
            downloadName,
            formatLabel: selectedOutput.label,
            previewUrl: blobToObjectUrl(blob),
            blob,
            width: canvas.width,
            height: canvas.height,
            sizeLabel: formatBytes(blob.size),
          } satisfies ConvertedImage;
        }),
      );

      const remaining = 1000 - (Date.now() - startedAt);
      if (remaining > 0) {
        await wait(remaining);
      }

      setResults(nextResults);

      const notes = Array.from(
        new Set(
          selectedFiles
            .map((item) => item.note)
            .filter(Boolean)
            .concat(outputMime === "image/jpeg" ? ["JPEGは透過情報を保持できません。"] : []),
        ),
      );
      setConversionNotes(notes);
    } catch (e) {
      const message = e instanceof Error ? e.message : "変換中にエラーが発生しました";
      if (message.includes("heic") || message.includes("HEIC")) {
        setError("HEICの変換に失敗しました。端末やブラウザの対応状況をご確認ください。");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadOne = (item: ConvertedImage) => {
    const anchor = document.createElement("a");
    anchor.href = item.previewUrl;
    anchor.download = item.downloadName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const downloadAll = async () => {
    for (const item of results) {
      downloadOne(item);
      await wait(120);
    }
  };

  const dropZoneCls = (() => {
    const base = "rounded-3xl border-2 border-dashed p-6 sm:p-8 transition-colors";
    if (dragActive) {
      switch (theme) {
        case "dark":
          return `${base} border-blue-400 bg-blue-500/10`;
        case "ocean":
          return `${base} border-cyan-300 bg-cyan-300/10`;
        default:
          return `${base} border-blue-500 bg-blue-50`;
      }
    }

    switch (theme) {
      case "dark":
        return `${base} border-gray-500 bg-gray-700/20`;
      case "ocean":
        return `${base} border-cyan-200/40 bg-cyan-800/30`;
      default:
        return `${base} border-slate-300 bg-slate-50`;
    }
  })();

  const cardSurfaceCls = theme === "default" ? "bg-white" : "bg-black/10";

  return (
    <ToolPageLayout title="画像拡張子変換ツール" maxWidth="5xl">
      <ToolPanel className="space-y-5">
        <div className={`rounded-3xl p-5 sm:p-6 ${blockCls}`}>
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={dropZoneCls}
          >
            <div className="space-y-2 text-center">
              <p className="text-lg font-semibold">画像をドロップ</p>
              <p className={`text-sm ${mutedTextCls}`}>
                このエリアに画像をドラッグしてください。複数ファイルもまとめて追加できます。
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-xl px-5 py-3 font-semibold transition-colors ${secondaryBtnCls}`}
            >
              ファイルを選択
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_EXTENSIONS}
              multiple
              onChange={onFileChange}
              className="hidden"
            />
          </div>
        </div>

        <div className={`rounded-3xl p-5 sm:p-6 ${blockCls}`}>
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold opacity-90">変換後の拡張子</h2>
              <div className="flex flex-wrap gap-2">
                {OUTPUT_OPTIONS.map((option) => {
                  const active = outputMime === option.mime;
                  return (
                    <button
                      key={option.mime}
                      type="button"
                      onClick={() => setOutputMime(option.mime)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${radioLabelCls(active)}`}
                      aria-pressed={active}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedOutput.lossy ? (
              <label className="flex max-w-xl flex-col gap-2">
                <span className="text-sm font-semibold opacity-90">画質 {Math.round(quality * 100)}%</span>
                <div className={`rounded-xl px-4 py-4 ${cardSurfaceCls}`}>
                  <input
                    type="range"
                    min={0.4}
                    max={1}
                    step={0.05}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
              </label>
            ) : (
              <div className={`max-w-xl rounded-xl p-4 text-sm ${cardSurfaceCls} ${mutedTextCls}`}>
                PNGは劣化なしで出力します。
              </div>
            )}
          </div>
        </div>

        <div className={`rounded-3xl p-5 sm:p-6 ${blockCls}`}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold opacity-90">選択した画像</h2>
            {!!selectedFiles.length && (
              <button
                type="button"
                onClick={clearSelectedFiles}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${secondaryBtnCls}`}
              >
                すべてクリア
              </button>
            )}
          </div>

          {selectedFiles.length ? (
            <ul className="grid gap-2.5">
              {selectedFiles.map((item) => (
                <li key={item.id} className={`rounded-2xl p-3 ${cardSurfaceCls}`}>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPreviewImage({ src: item.previewUrl, alt: item.file.name })}
                      className="shrink-0"
                      aria-label={`${item.file.name} を拡大表示`}
                    >
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{item.file.name}</p>
                      <p className={`text-xs ${mutedTextCls}`}>
                        {fileExtension(item.file.name).toUpperCase() || "FILE"} / {formatBytes(item.file.size)}
                      </p>
                      {item.note && <p className={`mt-1 text-xs ${mutedTextCls}`}>{item.note}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(item.id)}
                      className={`shrink-0 rounded-full px-2.5 py-1.5 text-sm leading-none transition-colors ${secondaryBtnCls}`}
                      aria-label={`${item.file.name} を削除`}
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={`rounded-2xl p-4 text-sm ${cardSurfaceCls} ${mutedTextCls}`}>
              まだ画像は選択されていません。
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={convert}
          disabled={!selectedFiles.length || loading}
          className={`min-h-14 w-full rounded-2xl px-6 py-4 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${primaryBtnCls}`}
        >
          {loading ? "変換中..." : "変換する"}
        </button>

        {loading && (
          <div className={`rounded-2xl p-4 text-sm ${blockCls} ${mutedTextCls}`}>
            画像を順番に処理しています。完了まで少しだけお待ちください。
          </div>
        )}

        {error && (
          <div className={`rounded-2xl p-4 text-sm ${blockCls}`}>
            {error}
          </div>
        )}

        <div className={`rounded-3xl p-5 sm:p-6 ${blockCls}`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">変換後の画像</h2>
              <p className={`text-sm ${mutedTextCls}`}>
                {results.length ? `${results.length}件の画像を出力しました。` : "変換後の画像はここに表示されます。"}
              </p>
            </div>
            {results.length > 1 && (
              <button
                type="button"
                onClick={downloadAll}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${secondaryBtnCls}`}
              >
                一括ダウンロード
              </button>
            )}
          </div>

          {results.length ? (
            <div className="grid gap-2.5">
              {results.map((item) => (
                <article key={item.id} className={`rounded-2xl p-3 ${cardSurfaceCls}`}>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPreviewImage({ src: item.previewUrl, alt: item.downloadName })}
                      className="shrink-0"
                      aria-label={`${item.downloadName} を拡大表示`}
                    >
                      <img
                        src={item.previewUrl}
                        alt={item.downloadName}
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{item.downloadName}</p>
                      <p className={`text-xs ${mutedTextCls}`}>
                        {item.formatLabel} / {item.width} x {item.height} / {item.sizeLabel}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadOne(item)}
                      className={`shrink-0 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${primaryBtnCls}`}
                    >
                      ダウンロード
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={`rounded-2xl p-4 text-sm ${cardSurfaceCls} ${mutedTextCls}`}>
              ファイルを選択して変換すると、ここに変換後の画像リストが並びます。
            </div>
          )}
        </div>

        <div className={`rounded-3xl p-5 sm:p-6 ${blockCls}`}>
          <h2 className="text-lg font-semibold">使い方と補足</h2>
          <div className={`mt-3 space-y-2 text-sm leading-relaxed ${mutedTextCls}`}>
            <p>PNG / JPEG / WebP / AVIF へ変換できます。HEIC / HEIF / TIFF / ICO なども読み込みに対応しています。</p>
            <p>複数画像をまとめて選択し、そのまま同じ拡張子へ一括変換できます。</p>
            {conversionNotes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </div>
      </ToolPanel>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-h-full max-w-5xl">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-2 text-sm font-semibold text-white"
              aria-label="プレビューを閉じる"
            >
              ×
            </button>
            <img
              src={previewImage.src}
              alt={previewImage.alt}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain"
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}

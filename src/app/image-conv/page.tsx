"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { ToolGrid } from "@/components/ToolGrid";
import { ToolColumn } from "@/components/ToolColumn";
import { useToolTheme } from "@/lib/useToolTheme";
import { ToolButton } from "@/components/ui/ToolButton";
import { ToolRadio } from "@/components/ui/ToolRadio";
import { ToolSlider } from "@/components/ui/ToolSlider";

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
  const { mutedTextCls, theme } = useToolTheme();

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

  return (
    <ToolPageLayout title="画像拡張子変換ツール" maxWidth="6xl">
      <ToolGrid>
        <ToolColumn>
          {/* 画像ドロップエリア */}
          <ToolPanel title="画像を選択">
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={dropZoneCls}
            >
              <div className="space-y-2 text-center">
                <p className="text-lg font-semibold">画像をドロップ</p>
                <p className={`text-sm ${mutedTextCls}`}>
                  このエリアに画像をドラッグしてください。<br />複数ファイルもまとめて追加できます。
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <ToolButton
                variant="secondary"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3"
              >
                ファイルを選択して追加
              </ToolButton>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_EXTENSIONS}
                multiple
                onChange={onFileChange}
                className="hidden"
              />
            </div>
          </ToolPanel>

          {/* 変換後の拡張子 */}
          <ToolPanel title="変換設定">
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-bold opacity-80">変換後の拡張子</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {OUTPUT_OPTIONS.map((option) => (
                    <ToolRadio
                      key={option.mime}
                      variant="card"
                      name="output-format"
                      checked={outputMime === option.mime}
                      onChange={() => setOutputMime(option.mime)}
                      label={option.label}
                    />
                  ))}
                </div>
              </div>

              {selectedOutput.lossy ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold opacity-80">画質</h3>
                    <span className="text-sm font-bold">{Math.round(quality * 100)}%</span>
                  </div>
                  <ToolSlider
                    min={0.4}
                    max={1}
                    step={0.05}
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                  />
                </div>
              ) : (
                <div className={`rounded-xl p-4 text-sm bg-black/5 dark:bg-white/5 ${mutedTextCls}`}>
                  PNGは劣化なし（ロスレス）で出力します。
                </div>
              )}
            </div>
          </ToolPanel>
        </ToolColumn>

        <ToolColumn>
          {/* 選択した画像と変換ボタンを1つのパネルに集約 */}
          <ToolPanel title="選択した画像">
            {selectedFiles.length ? (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <ToolButton variant="secondary" onClick={clearSelectedFiles} className="px-3 py-1.5 text-xs">
                    すべてクリア
                  </ToolButton>
                </div>
                <ul className="grid gap-3 overflow-hidden">
                  {selectedFiles.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 overflow-hidden rounded-2xl p-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                      <button
                        type="button"
                        onClick={() => setPreviewImage({ src: item.previewUrl, alt: item.file.name })}
                        className="shrink-0 transition-transform hover:scale-105"
                        aria-label={`${item.file.name} を拡大表示`}
                      >
                        <img
                          src={item.previewUrl}
                          alt={item.file.name}
                          className="h-14 w-14 rounded-xl object-cover shadow-sm"
                        />
                      </button>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="truncate text-sm font-bold">{item.file.name}</p>
                        <p className={`text-xs truncate ${mutedTextCls}`}>
                          {fileExtension(item.file.name).toUpperCase() || "FILE"} / {formatBytes(item.file.size)}
                        </p>
                        {item.note && <p className={`mt-1 text-xs truncate text-amber-500 font-medium`}>{item.note}</p>}
                      </div>
                      <ToolButton
                        variant="secondary"
                        onClick={() => removeSelectedFile(item.id)}
                        className="shrink-0 w-8 h-8 !p-0 rounded-full"
                        aria-label={`${item.file.name} を削除`}
                      >
                        ×
                      </ToolButton>
                    </li>
                  ))}
                </ul>

                <div className="pt-6 border-t border-black/5 dark:border-white/5">
                  <ToolButton
                    variant="primary"
                    type="button"
                    onClick={convert}
                    disabled={!selectedFiles.length || loading}
                    className="w-full py-4 text-lg font-bold"
                  >
                    {loading ? "変換中..." : "画像を一括変換する"}
                  </ToolButton>

                  {loading && (
                    <p className={`mt-4 text-center text-sm ${mutedTextCls}`}>
                      画像を処理しています。完了までしばらくお待ちください...
                    </p>
                  )}

                  {error && (
                    <div className="mt-4 rounded-xl p-4 bg-rose-500/10 text-rose-500 text-sm font-medium border border-rose-500/20">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={`p-8 text-center rounded-2xl text-sm bg-black/5 dark:bg-white/5 ${mutedTextCls}`}>
                画像を選択してください。
              </div>
            )}
          </ToolPanel>

          {/* 変換後の画像 */}
          <ToolPanel title="変換後の画像">
            {results.length ? (
              <div className="space-y-6">
                {results.length > 1 && (
                  <div className="flex justify-end">
                    <ToolButton variant="secondary" onClick={downloadAll} className="px-3 py-1.5 text-xs">
                      一括保存
                    </ToolButton>
                  </div>
                )}
                <div className="grid gap-3">
                  {results.map((item) => (
                    <article key={item.id} className="flex items-center gap-3 overflow-hidden rounded-2xl p-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                      <button
                        type="button"
                        onClick={() => setPreviewImage({ src: item.previewUrl, alt: item.downloadName })}
                        className="shrink-0 transition-transform hover:scale-105"
                        aria-label={`${item.downloadName} を拡大表示`}
                      >
                        <img
                          src={item.previewUrl}
                          alt={item.downloadName}
                          className="h-14 w-14 rounded-xl object-cover shadow-sm"
                        />
                      </button>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="truncate text-sm font-bold">{item.downloadName}</p>
                        <p className={`text-xs truncate ${mutedTextCls}`}>
                          {item.formatLabel} / {item.width} x {item.height} / {item.sizeLabel}
                        </p>
                      </div>
                      <ToolButton
                        variant="primary"
                        onClick={() => downloadOne(item)}
                        className="px-4 py-2 text-sm shrink-0"
                      >
                        保存
                      </ToolButton>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`p-12 text-center rounded-2xl text-sm bg-black/5 dark:bg-white/5 ${mutedTextCls}`}>
                変換後の画像がここに表示されます。
              </div>
            )}
          </ToolPanel>

          {/* 使い方と補足 */}
          <ToolPanel title="使い方と補足">
            <div className={`space-y-3 text-sm leading-relaxed ${mutedTextCls}`}>
              <p>1. 変換したい画像をドロップまたは選択ボタンから追加します。</p>
              <p>2. 出力したい形式（PNG/JPEG/WebP/AVIF）と画質を設定します。</p>
              <p>3. 「画像を一括変換する」ボタンを押すと、ブラウザ内で変換処理が行われます。</p>
              <p>4. 変換完了後、個別に保存するか一括保存ボタンでダウンロードしてください。</p>
              <div className="pt-2 border-t border-black/5 dark:border-white/5">
                <p>※ HEIC / HEIF / TIFF / ICO などの読み込みにも対応しています。</p>
                {conversionNotes.map((note) => (
                  <p key={note} className="text-amber-500 font-medium">※ {note}</p>
                ))}
              </div>
            </div>
          </ToolPanel>
        </ToolColumn>
      </ToolGrid>

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

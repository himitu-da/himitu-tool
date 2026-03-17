"use client";

import React, { useEffect, useMemo, useState } from "react";

import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

type ShapeType = "rect" | "circle";
type LayoutMode = "overlay" | "horizontal" | "vertical";

interface CompareItem {
  id: string;
  label: string;
  category: string;
  widthMm: number;
  heightMm: number;
  shape: ShapeType;
}

interface SelectedEntry {
  uid: number;
  itemId: string;
  rotation: 0 | 90 | 180 | 270;
}

interface AnchorPoint {
  id: string;
  glyph: string;
  label: string;
  ax: number;
  ay: number;
}

const compareItems: CompareItem[] = [
  { id: "a0", label: "A0", category: "A版", widthMm: 841, heightMm: 1189, shape: "rect" },
  { id: "a1", label: "A1", category: "A版", widthMm: 594, heightMm: 841, shape: "rect" },
  { id: "a2", label: "A2", category: "A版", widthMm: 420, heightMm: 594, shape: "rect" },
  { id: "a3", label: "A3", category: "A版", widthMm: 297, heightMm: 420, shape: "rect" },
  { id: "a4", label: "A4", category: "A版", widthMm: 210, heightMm: 297, shape: "rect" },
  { id: "a5", label: "A5", category: "A版", widthMm: 148, heightMm: 210, shape: "rect" },
  { id: "a6", label: "A6", category: "A版", widthMm: 105, heightMm: 148, shape: "rect" },
  { id: "a7", label: "A7", category: "A版", widthMm: 74, heightMm: 105, shape: "rect" },
  { id: "a8", label: "A8", category: "A版", widthMm: 52, heightMm: 74, shape: "rect" },
  { id: "a9", label: "A9", category: "A版", widthMm: 37, heightMm: 52, shape: "rect" },
  { id: "a10", label: "A10", category: "A版", widthMm: 26, heightMm: 37, shape: "rect" },

  { id: "b0", label: "B0", category: "B版", widthMm: 1030, heightMm: 1456, shape: "rect" },
  { id: "b1", label: "B1", category: "B版", widthMm: 728, heightMm: 1030, shape: "rect" },
  { id: "b2", label: "B2", category: "B版", widthMm: 515, heightMm: 728, shape: "rect" },
  { id: "b3", label: "B3", category: "B版", widthMm: 364, heightMm: 515, shape: "rect" },
  { id: "b4", label: "B4", category: "B版", widthMm: 257, heightMm: 364, shape: "rect" },
  { id: "b5", label: "B5", category: "B版", widthMm: 182, heightMm: 257, shape: "rect" },
  { id: "b6", label: "B6", category: "B版", widthMm: 128, heightMm: 182, shape: "rect" },
  { id: "b7", label: "B7", category: "B版", widthMm: 91, heightMm: 128, shape: "rect" },
  { id: "b8", label: "B8", category: "B版", widthMm: 64, heightMm: 91, shape: "rect" },
  { id: "b9", label: "B9", category: "B版", widthMm: 45, heightMm: 64, shape: "rect" },
  { id: "b10", label: "B10", category: "B版", widthMm: 32, heightMm: 45, shape: "rect" },

  { id: "shiroku", label: "四六判", category: "書籍・出版物", widthMm: 127, heightMm: 188, shape: "rect" },
  { id: "kiku", label: "菊判", category: "書籍・出版物", widthMm: 150, heightMm: 220, shape: "rect" },
  { id: "shinsho", label: "新書判", category: "書籍・出版物", widthMm: 103, heightMm: 182, shape: "rect" },
  { id: "bunko", label: "文庫判", category: "書籍・出版物", widthMm: 105, heightMm: 148, shape: "rect" },

  { id: "naga3", label: "長形3号封筒", category: "封筒", widthMm: 120, heightMm: 235, shape: "rect" },
  { id: "kaku2", label: "角形2号封筒", category: "封筒", widthMm: 240, heightMm: 332, shape: "rect" },

  { id: "iphone16", label: "スマホ (iPhone 16)", category: "身近なモノ", widthMm: 71.6, heightMm: 147.6, shape: "rect" },
  { id: "pixel9", label: "スマホ (Pixel 9)", category: "身近なモノ", widthMm: 72, heightMm: 152.8, shape: "rect" },
  { id: "banknote10000", label: "一万円札", category: "お金", widthMm: 160, heightMm: 76, shape: "rect" },
  { id: "banknote1000", label: "千円札", category: "お金", widthMm: 150, heightMm: 76, shape: "rect" },
  { id: "coin500", label: "500円玉", category: "お金", widthMm: 26.5, heightMm: 26.5, shape: "circle" },
  { id: "business-card", label: "名刺", category: "その他", widthMm: 91, heightMm: 55, shape: "rect" },
  { id: "postcard", label: "ハガキ", category: "その他", widthMm: 148, heightMm: 100, shape: "rect" },
  { id: "tennis-ball", label: "テニスボール", category: "その他", widthMm: 67, heightMm: 67, shape: "circle" },
];

const anchorPoints: AnchorPoint[] = [
  { id: "tl", glyph: "\u250c", label: "左上", ax: 0, ay: 0 },
  { id: "tc", glyph: "\u252c", label: "上中央", ax: 0.5, ay: 0 },
  { id: "tr", glyph: "\u2510", label: "右上", ax: 1, ay: 0 },
  { id: "ml", glyph: "\u251c", label: "左中央", ax: 0, ay: 0.5 },
  { id: "mc", glyph: "\u253c", label: "中央", ax: 0.5, ay: 0.5 },
  { id: "mr", glyph: "\u2524", label: "右中央", ax: 1, ay: 0.5 },
  { id: "bl", glyph: "\u2514", label: "左下", ax: 0, ay: 1 },
  { id: "bc", glyph: "\u2534", label: "下中央", ax: 0.5, ay: 1 },
  { id: "br", glyph: "\u2518", label: "右下", ax: 1, ay: 1 },
];

const colorStyles = [
  { fill: "#4ea8de", label: "#0369a1" },
  { fill: "#facc15", label: "#854d0e" },
  { fill: "#fb7185", label: "#9f1239" },
  { fill: "#86efac", label: "#166534" },
  { fill: "#c4b5fd", label: "#5b21b6" },
];

const shapeOpacity = 0.44;
const svgWidth = 920;
const svgHeight = 620;
const svgPadding = 40;
const minItems = 1;
const maxItems = 5;

function clampRotation(value: number): 0 | 90 | 180 | 270 {
  const normalized = ((value % 360) + 360) % 360;
  if (normalized === 90 || normalized === 180 || normalized === 270) {
    return normalized;
  }
  return 0;
}

function formatItemSize(widthMm: number, heightMm: number, shape: ShapeType): string {
  if (shape === "circle") {
    return `直径 ${widthMm.toLocaleString("ja-JP", { maximumFractionDigits: 1 })} mm`;
  }
  return `${widthMm.toLocaleString("ja-JP", { maximumFractionDigits: 1 })} mm \u00d7 ${heightMm.toLocaleString("ja-JP", { maximumFractionDigits: 1 })} mm`;
}

function lightenColor(hex: string, ratio: number): string {
  const raw = hex.replace("#", "");
  if (raw.length !== 6) {
    return hex;
  }
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  const blend = (channel: number) => Math.round(channel + (255 - channel) * ratio);
  return `rgb(${blend(r)}, ${blend(g)}, ${blend(b)})`;
}

export default function PaperSizeComparePage() {
  const { blockCls, mutedTextCls, radioLabelCls } = useToolTheme();

  const [rightStickyTop, setRightStickyTop] = useState(140);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("overlay");
  const [anchorId, setAnchorId] = useState<string>("mc");
  const [isAddPickerOpen, setIsAddPickerOpen] = useState(false);
  const [editingUid, setEditingUid] = useState<number | null>(null);
  const [selectedEntries, setSelectedEntries] = useState<SelectedEntry[]>([
    { uid: 1, itemId: "a4", rotation: 0 },
    { uid: 2, itemId: "b5", rotation: 0 },
    { uid: 3, itemId: "iphone16", rotation: 0 },
  ]);
  const [nextUid, setNextUid] = useState<number>(4);

  useEffect(() => {
    const globalHeader = document.getElementById("global-site-header");
    const toolHeader = document.querySelector(".paper-size-compare-sticky-header");

    const updateStickyTop = () => {
      const globalHeight = globalHeader?.getBoundingClientRect().height ?? 0;
      const toolHeight = toolHeader instanceof Element ? toolHeader.getBoundingClientRect().height : 0;
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

  const idToItem = useMemo(() => new Map(compareItems.map((item) => [item.id, item])), []);

  const optionsByCategory = useMemo(() => {
    const sorted = [...compareItems].sort(
      (a, b) =>
        a.category.localeCompare(b.category, "ja") ||
        a.label.localeCompare(b.label, "ja", { numeric: true })
    );
    const grouped = new Map<string, CompareItem[]>();
    sorted.forEach((item) => {
      const list = grouped.get(item.category) ?? [];
      list.push(item);
      grouped.set(item.category, list);
    });
    return Array.from(grouped.entries());
  }, []);

  const anchorPoint = useMemo(
    () => anchorPoints.find((point) => point.id === anchorId) ?? anchorPoints[4],
    [anchorId]
  );

  const selectedItems = useMemo(() => {
    return selectedEntries
      .map((entry) => {
        const item = idToItem.get(entry.itemId);
        if (!item) {
          return null;
        }
        const rotated = item.shape === "rect" && entry.rotation % 180 !== 0;
        const widthMm = rotated ? item.heightMm : item.widthMm;
        const heightMm = rotated ? item.widthMm : item.heightMm;
        return {
          uid: entry.uid,
          item,
          widthMm,
          heightMm,
          areaMm: widthMm * heightMm,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  }, [idToItem, selectedEntries]);

  const selectedByUid = useMemo(() => new Map(selectedItems.map((entry) => [entry.uid, entry])), [selectedItems]);
  const selectedIds = useMemo(() => new Set(selectedEntries.map((entry) => entry.itemId)), [selectedEntries]);

  const colorByUid = useMemo(() => {
    const map = new Map<number, { fill: string; label: string }>();
    selectedEntries.forEach((entry, index) => {
      map.set(entry.uid, colorStyles[index % colorStyles.length]);
    });
    return map;
  }, [selectedEntries]);

  const layoutMetrics = useMemo(() => {
    if (selectedItems.length === 0) {
      return {
        widthMm: 1,
        heightMm: 1,
        placements: [] as Array<{ uid: number; xMm: number; yMm: number; widthMm: number; heightMm: number }>,
        extents: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5 },
      };
    }

    const placements: Array<{ uid: number; xMm: number; yMm: number; widthMm: number; heightMm: number }> = [];
    let widthMm = 0;
    let heightMm = 0;

    if (layoutMode === "overlay") {
      widthMm = Math.max(...selectedItems.map((entry) => entry.widthMm));
      heightMm = Math.max(...selectedItems.map((entry) => entry.heightMm));
      selectedItems.forEach((entry) => {
        placements.push({
          uid: entry.uid,
          xMm: anchorPoint.ax * (widthMm - entry.widthMm),
          yMm: anchorPoint.ay * (heightMm - entry.heightMm),
          widthMm: entry.widthMm,
          heightMm: entry.heightMm,
        });
      });
    } else if (layoutMode === "horizontal") {
      widthMm = selectedItems.reduce((sum, entry) => sum + entry.widthMm, 0);
      heightMm = Math.max(...selectedItems.map((entry) => entry.heightMm));
      let currentX = 0;
      selectedItems.forEach((entry) => {
        placements.push({
          uid: entry.uid,
          xMm: currentX,
          yMm: anchorPoint.ay * (heightMm - entry.heightMm),
          widthMm: entry.widthMm,
          heightMm: entry.heightMm,
        });
        currentX += entry.widthMm;
      });
    } else {
      widthMm = Math.max(...selectedItems.map((entry) => entry.widthMm));
      heightMm = selectedItems.reduce((sum, entry) => sum + entry.heightMm, 0);
      let currentY = 0;
      selectedItems.forEach((entry) => {
        placements.push({
          uid: entry.uid,
          xMm: anchorPoint.ax * (widthMm - entry.widthMm),
          yMm: currentY,
          widthMm: entry.widthMm,
          heightMm: entry.heightMm,
        });
        currentY += entry.heightMm;
      });
    }

    return {
      widthMm,
      heightMm,
      placements,
      extents: {
        left: widthMm * anchorPoint.ax,
        right: widthMm * (1 - anchorPoint.ax),
        top: heightMm * anchorPoint.ay,
        bottom: heightMm * (1 - anchorPoint.ay),
      },
    };
  }, [anchorPoint.ax, anchorPoint.ay, layoutMode, selectedItems]);

  const scale = useMemo(() => {
    const drawableWidth = svgWidth - svgPadding * 2;
    const drawableHeight = svgHeight - svgPadding * 2;
    return Math.min(drawableWidth / layoutMetrics.widthMm, drawableHeight / layoutMetrics.heightMm);
  }, [layoutMetrics.heightMm, layoutMetrics.widthMm]);

  const drawingOffset = useMemo(() => {
    const drawableWidth = svgWidth - svgPadding * 2;
    const drawableHeight = svgHeight - svgPadding * 2;
    const plotWidth = layoutMetrics.widthMm * scale;
    const plotHeight = layoutMetrics.heightMm * scale;
    return {
      x: svgPadding + (drawableWidth - plotWidth) / 2,
      y: svgPadding + (drawableHeight - plotHeight) / 2,
      width: plotWidth,
      height: plotHeight,
    };
  }, [layoutMetrics.heightMm, layoutMetrics.widthMm, scale]);

  const axisX = useMemo(
    () => drawingOffset.x + drawingOffset.width * anchorPoint.ax,
    [anchorPoint.ax, drawingOffset.width, drawingOffset.x]
  );

  const axisY = useMemo(
    () => drawingOffset.y + drawingOffset.height * anchorPoint.ay,
    [anchorPoint.ay, drawingOffset.height, drawingOffset.y]
  );

  const gridStepPx = useMemo(() => 100 * scale, [scale]);

  const gridXs = useMemo(() => {
    const positions: number[] = [];
    if (gridStepPx <= 0) {
      return positions;
    }
    const maxLines = 1200;

    for (let x = axisX; x >= 0 && positions.length < maxLines; x -= gridStepPx) {
      positions.push(x);
    }
    for (let x = axisX + gridStepPx; x <= svgWidth && positions.length < maxLines; x += gridStepPx) {
      positions.push(x);
    }

    return positions.sort((a, b) => a - b);
  }, [axisX, gridStepPx]);

  const gridYs = useMemo(() => {
    const positions: number[] = [];
    if (gridStepPx <= 0) {
      return positions;
    }
    const maxLines = 1200;

    for (let y = axisY; y >= 0 && positions.length < maxLines; y -= gridStepPx) {
      positions.push(y);
    }
    for (let y = axisY + gridStepPx; y <= svgHeight && positions.length < maxLines; y += gridStepPx) {
      positions.push(y);
    }

    return positions.sort((a, b) => a - b);
  }, [axisY, gridStepPx]);

  const drawableShapes = useMemo(() => {
    return layoutMetrics.placements
      .map((placement) => {
        const entry = selectedByUid.get(placement.uid);
        if (!entry) {
          return null;
        }
        return {
          uid: placement.uid,
          item: entry.item,
          areaMm: entry.areaMm,
          x: drawingOffset.x + placement.xMm * scale,
          y: drawingOffset.y + placement.yMm * scale,
          width: placement.widthMm * scale,
          height: placement.heightMm * scale,
        };
      })
      .filter((shape): shape is NonNullable<typeof shape> => Boolean(shape))
      .sort((a, b) => b.areaMm - a.areaMm);
  }, [drawingOffset.x, drawingOffset.y, layoutMetrics.placements, scale, selectedByUid]);

  const onAddItem = (itemId: string) => {
    if (!itemId || selectedEntries.length >= maxItems || selectedIds.has(itemId)) {
      return;
    }
    setSelectedEntries((prev) => [...prev, { uid: nextUid, itemId, rotation: 0 }]);
    setNextUid((prev) => prev + 1);
    setIsAddPickerOpen(false);
  };

  const onChangeItem = (uid: number, itemId: string) => {
    if (!itemId) {
      return;
    }
    const duplicate = selectedEntries.some((entry) => entry.itemId === itemId && entry.uid !== uid);
    if (duplicate) {
      return;
    }
    setSelectedEntries((prev) => prev.map((entry) => (entry.uid === uid ? { ...entry, itemId } : entry)));
    setEditingUid(null);
  };

  const onRemoveItem = (uid: number) => {
    if (selectedEntries.length <= minItems) {
      return;
    }
    setSelectedEntries((prev) => prev.filter((entry) => entry.uid !== uid));
    setEditingUid((prev) => (prev === uid ? null : prev));
  };

  const onRotate = (uid: number, delta: number) => {
    setSelectedEntries((prev) =>
      prev.map((entry) => {
        if (entry.uid !== uid) {
          return entry;
        }
        return { ...entry, rotation: clampRotation(entry.rotation + delta) };
      })
    );
  };

  return (
    <ToolPageLayout title="紙の大きさ比較" maxWidth="6xl" headerClassName="paper-size-compare-sticky-header">
      <div className="grid grid-cols-1 xl:grid-cols-[1.02fr_1.35fr] gap-6">
        <ToolPanel className="space-y-4 h-fit">
          <div>
            <button
              type="button"
              onClick={() => setIsAddPickerOpen((prev) => !prev)}
              disabled={selectedEntries.length >= maxItems}
              className="w-full h-14 rounded-xl text-3xl font-bold transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-35"
              title="項目を追加"
            >
              +
            </button>
          </div>

          {isAddPickerOpen && (
            <div className={`rounded-xl p-3 space-y-2 ${blockCls}`}>
              {optionsByCategory.map(([category, items]) => (
                <details key={category} className="rounded-lg">
                  <summary className="cursor-pointer text-sm sm:text-base font-semibold">{category}</summary>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onAddItem(item.id)}
                        disabled={selectedIds.has(item.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${radioLabelCls(false)} disabled:opacity-35`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {selectedEntries.map((entry, index) => {
              const item = idToItem.get(entry.itemId);
              const computed = selectedByUid.get(entry.uid);
              if (!item || !computed) {
                return null;
              }
              const color = colorByUid.get(entry.uid) ?? colorStyles[index % colorStyles.length];
              const rotatable = item.shape === "rect" && item.widthMm !== item.heightMm;

              return (
                <div key={entry.uid} className={`rounded-xl p-3 space-y-2 ${blockCls}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-base sm:text-lg">
                      {item.label}
                      <span className={`ml-2 text-xs sm:text-sm ${mutedTextCls}`}>{item.category}</span>
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingUid((prev) => (prev === entry.uid ? null : entry.uid))}
                        className={`px-2 py-1 rounded-lg transition-colors ${radioLabelCls(false)}`}
                        title="項目を変更"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M4 20h4l10-10-4-4L4 16v4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                          <path d="M13 7l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(entry.uid)}
                        disabled={selectedEntries.length <= minItems}
                        className="text-red-500 font-bold text-lg leading-none disabled:opacity-35"
                        title="削除"
                      >
                        {"\u2715"}
                      </button>
                    </div>
                  </div>

                  {editingUid === entry.uid && (
                    <div className={`rounded-lg p-2 space-y-2 ${blockCls}`}>
                      {optionsByCategory.map(([category, items]) => (
                        <details key={`${entry.uid}-${category}`} className="rounded-lg">
                          <summary className="cursor-pointer text-sm font-semibold">{category}</summary>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {items.map((option) => {
                              const duplicated = selectedEntries.some((row) => row.itemId === option.id && row.uid !== entry.uid);
                              return (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() => onChangeItem(entry.uid, option.id)}
                                  disabled={duplicated}
                                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${radioLabelCls(option.id === entry.itemId)} disabled:opacity-35`}
                                >
                                  {option.label}
                                </button>
                              );
                            })}
                          </div>
                        </details>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onRotate(entry.uid, -90)}
                      disabled={!rotatable}
                      className={`px-2.5 py-1.5 rounded-lg transition-colors ${radioLabelCls(false)} disabled:opacity-35`}
                      title="左回転"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M8 7H4V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 7A9 9 0 1 0 7 3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRotate(entry.uid, 90)}
                      disabled={!rotatable}
                      className={`px-2.5 py-1.5 rounded-lg transition-colors ${radioLabelCls(false)} disabled:opacity-35`}
                      title="右回転"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M16 7H20V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M20 7A9 9 0 1 1 17 3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                    <p className="text-sm font-semibold" style={{ color: color.label }}>
                      {formatItemSize(computed.widthMm, computed.heightMm, item.shape)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={`rounded-xl p-4 space-y-3 ${blockCls}`}>
            <p className={`text-sm sm:text-base font-semibold ${mutedTextCls}`}>中心位置</p>
            <div className="grid grid-cols-3 gap-2 max-w-[220px]">
              {anchorPoints.map((point) => (
                <button
                  key={point.id}
                  type="button"
                  onClick={() => setAnchorId(point.id)}
                  className={`h-12 rounded-lg text-xl font-bold transition-colors ${radioLabelCls(anchorId === point.id)}`}
                  title={point.label}
                >
                  {point.glyph}
                </button>
              ))}
            </div>
          </div>

          <div className={`rounded-xl p-4 space-y-3 ${blockCls}`}>
            <p className={`text-sm sm:text-base font-semibold ${mutedTextCls}`}>並べ方</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setLayoutMode("overlay")}
                className={`px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-colors ${radioLabelCls(layoutMode === "overlay")}`}
              >
                重ねる
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode("horizontal")}
                className={`px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-colors ${radioLabelCls(layoutMode === "horizontal")}`}
              >
                横に並べる
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode("vertical")}
                className={`px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-colors ${radioLabelCls(layoutMode === "vertical")}`}
              >
                縦に並べる
              </button>
            </div>
          </div>
        </ToolPanel>

        <div className="lg:sticky lg:self-start" style={{ top: `${rightStickyTop}px` }}>
          <ToolPanel className="space-y-4 min-h-[620px]">
            <div className={`rounded-2xl p-3 sm:p-4 relative ${blockCls}`}>
              <div className="absolute top-5 right-5 flex flex-col gap-2 z-10">
                {selectedEntries.map((entry, index) => {
                  const selected = selectedByUid.get(entry.uid);
                  if (!selected) {
                    return null;
                  }
                  const color = colorByUid.get(entry.uid) ?? colorStyles[index % colorStyles.length];
                  return (
                    <div
                      key={entry.uid}
                      className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold"
                      style={{ backgroundColor: color.fill, color: color.label }}
                    >
                      {selected.item.label}
                    </div>
                  );
                })}
              </div>

              <div className="w-full overflow-x-auto">
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} role="img" aria-label="紙サイズ比較プレビュー" className="w-full min-w-[320px] h-auto">
                  <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="transparent" />

                  {drawableShapes.map((shape) => {
                    const color = colorByUid.get(shape.uid) ?? colorStyles[0];
                    const strokeColor = lightenColor(color.fill, 0.35);
                    const strokeWidth = 6;

                    if (shape.item.shape === "circle") {
                      const radius = Math.min(shape.width, shape.height) / 2;
                      return (
                        <g key={shape.uid}>
                          <circle cx={shape.x + radius} cy={shape.y + radius} r={radius} fill={color.fill} opacity={shapeOpacity} />
                          <circle
                            cx={shape.x + radius}
                            cy={shape.y + radius}
                            r={Math.max(0, radius - strokeWidth / 2)}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                          />
                        </g>
                      );
                    }

                    return (
                      <g key={shape.uid}>
                        <rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} fill={color.fill} opacity={shapeOpacity} />
                        <rect
                          x={shape.x + strokeWidth / 2}
                          y={shape.y + strokeWidth / 2}
                          width={Math.max(0, shape.width - strokeWidth)}
                          height={Math.max(0, shape.height - strokeWidth)}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                        />
                      </g>
                    );
                  })}

                  <rect
                    x={drawingOffset.x}
                    y={drawingOffset.y}
                    width={drawingOffset.width}
                    height={drawingOffset.height}
                    fill="transparent"
                    stroke="currentColor"
                    strokeOpacity="0.42"
                    strokeWidth="2"
                  />

                  {gridXs.map((x, index) => (
                    <line
                      key={`grid-v-${index}`}
                      x1={x}
                      y1={0}
                      x2={x}
                      y2={svgHeight}
                      stroke="currentColor"
                      strokeOpacity="0.36"
                      strokeWidth="1.8"
                    />
                  ))}

                  {gridYs.map((y, index) => (
                    <line
                      key={`grid-h-${index}`}
                      x1={0}
                      y1={y}
                      x2={svgWidth}
                      y2={y}
                      stroke="currentColor"
                      strokeOpacity="0.36"
                      strokeWidth="1.8"
                    />
                  ))}

                  <line
                    x1={axisX}
                    y1={0}
                    x2={axisX}
                    y2={svgHeight}
                    stroke="currentColor"
                    strokeOpacity="0.78"
                    strokeWidth="3.2"
                  />
                  <line
                    x1={0}
                    y1={axisY}
                    x2={svgWidth}
                    y2={axisY}
                    stroke="currentColor"
                    strokeOpacity="0.78"
                    strokeWidth="3.2"
                  />

                  <text x={drawingOffset.x} y={drawingOffset.y - 10} fontSize="14" fill="currentColor" opacity="0.9">
                    幅 {layoutMetrics.widthMm.toLocaleString("ja-JP", { maximumFractionDigits: 1 })} mm / 高さ {layoutMetrics.heightMm.toLocaleString("ja-JP", { maximumFractionDigits: 1 })} mm
                  </text>
                </svg>
              </div>
            </div>

            <div className={`rounded-xl p-4 space-y-1 ${blockCls}`}>
              <p className={`text-sm ${mutedTextCls}`}>最外周の基準値</p>
              <p className="text-sm sm:text-base font-semibold">
                左 {layoutMetrics.extents.left.toLocaleString("ja-JP", { maximumFractionDigits: 1 })} mm / 右 {layoutMetrics.extents.right.toLocaleString("ja-JP", { maximumFractionDigits: 1 })} mm / 上 {layoutMetrics.extents.top.toLocaleString("ja-JP", { maximumFractionDigits: 1 })} mm / 下 {layoutMetrics.extents.bottom.toLocaleString("ja-JP", { maximumFractionDigits: 1 })} mm
              </p>
              <p className={`text-xs sm:text-sm ${mutedTextCls}`}>方眼は10cm (100mm) 単位です。</p>
            </div>
          </ToolPanel>
        </div>
      </div>
    </ToolPageLayout>
  );
}

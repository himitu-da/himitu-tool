"use client";

import React, { useMemo, useState } from "react";

import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

type MenuGroup = "paper" | "familiar";
type ShapeType = "rect" | "circle";
type AlignType = "bottom-left" | "center";

interface CompareItem {
    id: string;
    label: string;
    category: string;
    menuGroup: MenuGroup;
    widthMm: number;
    heightMm: number;
    shape: ShapeType;
}

const compareItems: CompareItem[] = [
    { id: "a0", label: "A0", category: "A版", menuGroup: "paper", widthMm: 841, heightMm: 1189, shape: "rect" },
    { id: "a1", label: "A1", category: "A版", menuGroup: "paper", widthMm: 594, heightMm: 841, shape: "rect" },
    { id: "a2", label: "A2", category: "A版", menuGroup: "paper", widthMm: 420, heightMm: 594, shape: "rect" },
    { id: "a3", label: "A3", category: "A版", menuGroup: "paper", widthMm: 297, heightMm: 420, shape: "rect" },
    { id: "a4", label: "A4", category: "A版", menuGroup: "paper", widthMm: 210, heightMm: 297, shape: "rect" },
    { id: "a5", label: "A5", category: "A版", menuGroup: "paper", widthMm: 148, heightMm: 210, shape: "rect" },
    { id: "a6", label: "A6", category: "A版", menuGroup: "paper", widthMm: 105, heightMm: 148, shape: "rect" },
    { id: "a7", label: "A7", category: "A版", menuGroup: "paper", widthMm: 74, heightMm: 105, shape: "rect" },
    { id: "a8", label: "A8", category: "A版", menuGroup: "paper", widthMm: 52, heightMm: 74, shape: "rect" },
    { id: "a9", label: "A9", category: "A版", menuGroup: "paper", widthMm: 37, heightMm: 52, shape: "rect" },
    { id: "a10", label: "A10", category: "A版", menuGroup: "paper", widthMm: 26, heightMm: 37, shape: "rect" },

    { id: "b0", label: "B0", category: "B版", menuGroup: "paper", widthMm: 1030, heightMm: 1456, shape: "rect" },
    { id: "b1", label: "B1", category: "B版", menuGroup: "paper", widthMm: 728, heightMm: 1030, shape: "rect" },
    { id: "b2", label: "B2", category: "B版", menuGroup: "paper", widthMm: 515, heightMm: 728, shape: "rect" },
    { id: "b3", label: "B3", category: "B版", menuGroup: "paper", widthMm: 364, heightMm: 515, shape: "rect" },
    { id: "b4", label: "B4", category: "B版", menuGroup: "paper", widthMm: 257, heightMm: 364, shape: "rect" },
    { id: "b5", label: "B5", category: "B版", menuGroup: "paper", widthMm: 182, heightMm: 257, shape: "rect" },
    { id: "b6", label: "B6", category: "B版", menuGroup: "paper", widthMm: 128, heightMm: 182, shape: "rect" },
    { id: "b7", label: "B7", category: "B版", menuGroup: "paper", widthMm: 91, heightMm: 128, shape: "rect" },
    { id: "b8", label: "B8", category: "B版", menuGroup: "paper", widthMm: 64, heightMm: 91, shape: "rect" },
    { id: "b9", label: "B9", category: "B版", menuGroup: "paper", widthMm: 45, heightMm: 64, shape: "rect" },
    { id: "b10", label: "B10", category: "B版", menuGroup: "paper", widthMm: 32, heightMm: 45, shape: "rect" },

    { id: "shiroku", label: "四六判", category: "書籍・出版物", menuGroup: "paper", widthMm: 127, heightMm: 188, shape: "rect" },
    { id: "kiku", label: "菊判", category: "書籍・出版物", menuGroup: "paper", widthMm: 150, heightMm: 220, shape: "rect" },
    { id: "shinsho", label: "新書判", category: "書籍・出版物", menuGroup: "paper", widthMm: 103, heightMm: 182, shape: "rect" },
    { id: "bunko", label: "文庫判", category: "書籍・出版物", menuGroup: "paper", widthMm: 105, heightMm: 148, shape: "rect" },

    { id: "naga3", label: "長形3号封筒", category: "封筒", menuGroup: "paper", widthMm: 120, heightMm: 235, shape: "rect" },
    { id: "kaku2", label: "角形2号封筒", category: "封筒", menuGroup: "paper", widthMm: 240, heightMm: 332, shape: "rect" },

    { id: "iphone16", label: "スマホ (iPhone 16)", category: "身近なモノ", menuGroup: "familiar", widthMm: 71.6, heightMm: 147.6, shape: "rect" },
    { id: "pixel9", label: "スマホ (Pixel 9)", category: "身近なモノ", menuGroup: "familiar", widthMm: 72, heightMm: 152.8, shape: "rect" },
    { id: "banknote10000", label: "一万円札", category: "お金", menuGroup: "familiar", widthMm: 160, heightMm: 76, shape: "rect" },
    { id: "banknote1000", label: "千円札", category: "お金", menuGroup: "familiar", widthMm: 150, heightMm: 76, shape: "rect" },
    { id: "coin500", label: "500円玉", category: "お金", menuGroup: "familiar", widthMm: 26.5, heightMm: 26.5, shape: "circle" },
    { id: "business-card", label: "名刺", category: "その他", menuGroup: "familiar", widthMm: 91, heightMm: 55, shape: "rect" },
    { id: "postcard", label: "ハガキ", category: "その他", menuGroup: "familiar", widthMm: 148, heightMm: 100, shape: "rect" },
    { id: "tennis-ball", label: "テニスボール", category: "その他", menuGroup: "familiar", widthMm: 67, heightMm: 67, shape: "circle" },
];

const colorStyles = [
    { fill: "#4ea8de", label: "#0369a1" },
    { fill: "#facc15", label: "#854d0e" },
    { fill: "#fb7185", label: "#9f1239" },
];

const shapeOpacity = 0.44;
const svgWidth = 920;
const svgHeight = 560;
const svgPadding = 40;

function formatItemSize(item: CompareItem): string {
    if (item.shape === "circle") {
        return `直径 ${item.widthMm.toLocaleString("ja-JP", { maximumFractionDigits: 1 })} mm`;
    }
    return `${item.widthMm.toLocaleString("ja-JP", { maximumFractionDigits: 1 })} mm × ${item.heightMm.toLocaleString("ja-JP", { maximumFractionDigits: 1 })} mm`;
}

export default function PaperSizeComparePage() {
    const { blockCls, inputCls, mutedTextCls, radioLabelCls } = useToolTheme();

    const [menuGroup, setMenuGroup] = useState<MenuGroup>("paper");
    const [align, setAlign] = useState<AlignType>("bottom-left");
    const [targetOne, setTargetOne] = useState<string>("a4");
    const [targetTwo, setTargetTwo] = useState<string>("b5");
    const [targetThree, setTargetThree] = useState<string>("iphone16");

    const idToItem = useMemo(() => {
        return new Map(compareItems.map((item) => [item.id, item]));
    }, []);

    const selectedItems = useMemo(() => {
        const ids = [targetOne, targetTwo, targetThree].filter((id) => id !== "");
        const uniqueIds = Array.from(new Set(ids));
        return uniqueIds
            .map((id) => idToItem.get(id))
            .filter((item): item is CompareItem => Boolean(item));
    }, [idToItem, targetOne, targetTwo, targetThree]);

    const filteredOptions = useMemo(() => {
        return compareItems
            .filter((item) => item.menuGroup === menuGroup)
            .sort((a, b) => a.category.localeCompare(b.category, "ja") || a.label.localeCompare(b.label, "ja"));
    }, [menuGroup]);

    const buildOptions = (currentValue: string): CompareItem[] => {
        const currentItem = idToItem.get(currentValue);
        if (!currentItem) {
            return filteredOptions;
        }
        const exists = filteredOptions.some((item) => item.id === currentItem.id);
        if (exists) {
            return filteredOptions;
        }
        return [currentItem, ...filteredOptions];
    };

    const maxWidthMm = useMemo(() => {
        if (selectedItems.length === 0) {
            return 1;
        }
        return Math.max(...selectedItems.map((item) => item.widthMm));
    }, [selectedItems]);

    const maxHeightMm = useMemo(() => {
        if (selectedItems.length === 0) {
            return 1;
        }
        return Math.max(...selectedItems.map((item) => item.heightMm));
    }, [selectedItems]);

    const scale = useMemo(() => {
        const drawableWidth = svgWidth - svgPadding * 2;
        const drawableHeight = svgHeight - svgPadding * 2;
        const scaleX = drawableWidth / maxWidthMm;
        const scaleY = drawableHeight / maxHeightMm;
        return Math.min(scaleX, scaleY);
    }, [maxHeightMm, maxWidthMm]);

    const selectedSet = useMemo(() => {
        return new Set([targetOne, targetTwo, targetThree].filter((id) => id !== ""));
    }, [targetOne, targetTwo, targetThree]);

    return (
        <ToolPageLayout title="紙の大きさ比較" maxWidth="6xl">
            <div className="space-y-6">
                <ToolPanel className="space-y-5">
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setMenuGroup("paper")}
                            className={`px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-colors ${radioLabelCls(menuGroup === "paper")}`}
                        >
                            紙のサイズから選ぶ
                        </button>
                        <button
                            type="button"
                            onClick={() => setMenuGroup("familiar")}
                            className={`px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-colors ${radioLabelCls(menuGroup === "familiar")}`}
                        >
                            身近なモノから選ぶ
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`rounded-xl p-4 space-y-2 ${blockCls}`}>
                            <p className={`text-sm sm:text-base font-semibold ${mutedTextCls}`}>比較するもの1</p>
                            <select
                                value={targetOne}
                                onChange={(e) => setTargetOne(e.target.value)}
                                className={`w-full p-3 rounded-lg border focus:ring-2 outline-none cursor-pointer ${inputCls}`}
                            >
                                {buildOptions(targetOne).map((item) => {
                                    const isTaken = selectedSet.has(item.id) && item.id !== targetOne;
                                    return (
                                        <option key={item.id} value={item.id} disabled={isTaken}>
                                            {item.category} / {item.label}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className={`rounded-xl p-4 space-y-2 ${blockCls}`}>
                            <p className={`text-sm sm:text-base font-semibold ${mutedTextCls}`}>比較するもの2</p>
                            <select
                                value={targetTwo}
                                onChange={(e) => setTargetTwo(e.target.value)}
                                className={`w-full p-3 rounded-lg border focus:ring-2 outline-none cursor-pointer ${inputCls}`}
                            >
                                {buildOptions(targetTwo).map((item) => {
                                    const isTaken = selectedSet.has(item.id) && item.id !== targetTwo;
                                    return (
                                        <option key={item.id} value={item.id} disabled={isTaken}>
                                            {item.category} / {item.label}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className={`rounded-xl p-4 space-y-2 ${blockCls}`}>
                            <p className={`text-sm sm:text-base font-semibold ${mutedTextCls}`}>比較するもの3 (任意)</p>
                            <select
                                value={targetThree}
                                onChange={(e) => setTargetThree(e.target.value)}
                                className={`w-full p-3 rounded-lg border focus:ring-2 outline-none cursor-pointer ${inputCls}`}
                            >
                                <option value="">なし</option>
                                {buildOptions(targetThree).map((item) => {
                                    const isTaken = selectedSet.has(item.id) && item.id !== targetThree;
                                    return (
                                        <option key={item.id} value={item.id} disabled={isTaken}>
                                            {item.category} / {item.label}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setAlign("bottom-left")}
                            className={`px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-colors ${radioLabelCls(align === "bottom-left")}`}
                        >
                            左下で重ねる
                        </button>
                        <button
                            type="button"
                            onClick={() => setAlign("center")}
                            className={`px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-colors ${radioLabelCls(align === "center")}`}
                        >
                            中央で重ねる
                        </button>
                    </div>
                </ToolPanel>

                <ToolPanel className="space-y-4">
                    <div className={`rounded-2xl p-3 sm:p-4 ${blockCls}`}>
                        <div className="w-full overflow-x-auto">
                            <svg
                                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                                role="img"
                                aria-label="紙サイズ比較プレビュー"
                                className="w-full min-w-[320px] h-auto"
                            >
                                <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="transparent" />
                                {selectedItems.map((item, index) => {
                                    const drawWidth = item.widthMm * scale;
                                    const drawHeight = item.heightMm * scale;
                                    const x = align === "center" ? (svgWidth - drawWidth) / 2 : svgPadding;
                                    const y = align === "center" ? (svgHeight - drawHeight) / 2 : svgHeight - svgPadding - drawHeight;
                                    const color = colorStyles[index % colorStyles.length];

                                    if (item.shape === "circle") {
                                        const radius = (item.widthMm * scale) / 2;
                                        const cx = x + radius;
                                        const cy = y + radius;
                                        return (
                                            <circle
                                                key={item.id}
                                                cx={cx}
                                                cy={cy}
                                                r={radius}
                                                fill={color.fill}
                                                opacity={shapeOpacity}
                                            />
                                        );
                                    }

                                    return (
                                        <rect
                                            key={item.id}
                                            x={x}
                                            y={y}
                                            width={drawWidth}
                                            height={drawHeight}
                                            fill={color.fill}
                                            opacity={shapeOpacity}
                                        />
                                    );
                                })}
                            </svg>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {selectedItems.map((item, index) => {
                            const color = colorStyles[index % colorStyles.length];
                            return (
                                <div key={item.id} className={`rounded-xl p-4 space-y-1 ${blockCls}`}>
                                    <p className="font-bold flex items-center gap-2 text-base sm:text-lg">
                                        <span
                                            className="inline-block w-3 h-3 rounded-full"
                                            style={{ backgroundColor: color.fill }}
                                            aria-hidden="true"
                                        />
                                        {item.label}
                                    </p>
                                    <p className={`text-sm sm:text-base ${mutedTextCls}`}>{item.category}</p>
                                    <p className="text-sm sm:text-base font-semibold" style={{ color: color.label }}>{formatItemSize(item)}</p>
                                </div>
                            );
                        })}
                    </div>

                    {selectedItems.length < 2 && (
                        <p className={`text-sm sm:text-base ${mutedTextCls}`}>
                            比較には2つ以上の対象を選択してください。
                        </p>
                    )}
                </ToolPanel>
            </div>
        </ToolPageLayout>
    );
}
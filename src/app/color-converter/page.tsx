"use client";

import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function ColorConverterPage() {
  const [hex, setHex] = useState("#3B82F6");
  const [rgb, setRgb] = useState("rgb(59, 130, 246)");
  const { inputCls, blockCls } = useToolTheme();

  const hexToRgb = (hexColor: string) => {
    let c = hexColor.replace("#", "");
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    if (c.length !== 6) return null;

    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return `rgb(${r}, ${g}, ${b})`;
  };

  const rgbToHex = (rgbColor: string) => {
    const match = rgbColor.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if (!match) return null;

    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);

    if (r > 255 || g > 255 || b > 255) return null;

    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHex(val);
    const newRgb = hexToRgb(val);
    if (newRgb) setRgb(newRgb);
  };

  const handleRgbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRgb(val);
    const newHex = rgbToHex(val);
    if (newHex) setHex(newHex);
  };

  return (
    <ToolPageLayout title="カラーコード変換" maxWidth="md">
      <ToolPanel className="max-w-md mx-auto">
        <div
          className="w-full h-32 rounded-lg mb-8 shadow-inner border border-white/20 transition-colors"
          style={{ backgroundColor: hexToRgb(hex) ? hex : "transparent" }}
        />

        <div className="flex flex-col gap-6">
          <div className={`p-4 rounded-lg transition-colors ${blockCls}`}>
            <label className="block text-sm font-semibold mb-2 opacity-80">HEX コード</label>
            <input
              type="text"
              value={hex}
              onChange={handleHexChange}
              className={`w-full p-3 rounded-lg focus:ring-2 font-mono outline-none transition-colors ${inputCls}`}
              placeholder="#FFFFFF"
            />
          </div>

          <div className={`p-4 rounded-lg transition-colors ${blockCls}`}>
            <label className="block text-sm font-semibold mb-2 opacity-80">RGB コード</label>
            <input
              type="text"
              value={rgb}
              onChange={handleRgbChange}
              className={`w-full p-3 rounded-lg focus:ring-2 font-mono outline-none transition-colors ${inputCls}`}
              placeholder="rgb(255, 255, 255)"
            />
          </div>
        </div>
      </ToolPanel>
    </ToolPageLayout>
  );
}
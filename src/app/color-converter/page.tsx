"use client";

import React, { useState, useEffect } from "react";

import { ToolStickyHeader } from "@/components/ToolStickyHeader";
export default function ColorConverterPage() {
  const [hex, setHex] = useState("#3B82F6");
  const [rgb, setRgb] = useState("rgb(59, 130, 246)");

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
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
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
    <>
      <ToolStickyHeader title="カラーコード変換" className="bg-gray-800 text-white" />
      <div className="max-w-md mx-auto p-6 rounded-xl shadow-lg border border-opacity-20 border-current bg-white/10 backdrop-blur-sm mt-4">

      <div 
        className="w-full h-32 rounded-lg mb-8 shadow-inner border border-white/20"
        style={{ backgroundColor: hexToRgb(hex) ? hex : "transparent" }}
      />

      <div className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-semibold mb-2 opacity-80">HEX コード</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={hex}
              onChange={handleHexChange}
              className="flex-1 p-3 rounded-lg bg-black/10 border-none focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder="#FFFFFF"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 opacity-80">RGB コード</label>
          <input
            type="text"
            value={rgb}
            onChange={handleRgbChange}
            className="w-full p-3 rounded-lg bg-black/10 border-none focus:ring-2 focus:ring-blue-500 font-mono"
            placeholder="rgb(255, 255, 255)"
          />
        </div>
      </div>
    </div>
  </>
);
}
"use client";

import React, { useState, useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";
const conversionRates: Record<string, number> = {
  mg: 0.001,
  g: 1,
  kg: 1000,
  t: 1000000,
  oz: 28.349523125,
  lb: 453.59237,
};

const unitLabels: Record<string, string> = {
  mg: "ミリグラム (mg)",
  g: "グラム (g)",
  kg: "キログラム (kg)",
  t: "トン (t)",
  oz: "オンス (oz)",
  lb: "ポンド (lb)",
};

export default function WeightConverterPage() {
  const [inputValue, setInputValue] = useState<string>("1");
  const [fromUnit, setFromUnit] = useState<string>("kg");
  const [toUnit, setToUnit] = useState<string>("lb");
  const [result, setResult] = useState<string>("");
  const { inputCls, blockCls, mutedTextCls } = useToolTheme();

  useEffect(() => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      setResult("");
      return;
    }

    const valueInGrams = value * conversionRates[fromUnit];
    const finalValue = valueInGrams / conversionRates[toUnit];
    
    setResult(finalValue.toLocaleString('ja-JP', { maximumFractionDigits: 6 }));
  }, [inputValue, fromUnit, toUnit]);

  return (
    <ToolPageLayout title="重さの変換" maxWidth="xl">
      <ToolPanel className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`rounded-xl p-4 space-y-2 ${blockCls}`}>
            <label className={`text-sm font-semibold ${mutedTextCls}`}>変換元</label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={`w-full p-3 rounded-lg border focus:ring-2 outline-none ${inputCls}`}
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className={`w-full p-3 rounded-lg border focus:ring-2 outline-none cursor-pointer ${inputCls}`}
            >
              {Object.entries(unitLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className={`rounded-xl p-4 space-y-2 ${blockCls}`}>
            <label className={`text-sm font-semibold ${mutedTextCls}`}>変換先</label>
            <div className={`w-full p-3 min-h-[52px] rounded-lg border font-bold text-xl flex items-center overflow-x-auto ${inputCls}`}>
              {result}
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className={`w-full p-3 rounded-lg border focus:ring-2 outline-none cursor-pointer ${inputCls}`}
            >
              {Object.entries(unitLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </ToolPanel>
    </ToolPageLayout>
  );
}
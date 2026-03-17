"use client";

import React, { useState, useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";
const conversionRates: Record<string, number> = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};

const unitLabels: Record<string, string> = {
  mm: "ミリメートル (mm)",
  cm: "センチメートル (cm)",
  m: "メートル (m)",
  km: "キロメートル (km)",
  in: "インチ (in)",
  ft: "フィート (ft)",
  yd: "ヤード (yd)",
  mi: "マイル (mi)",
};

export default function LengthConverterPage() {
  const [inputValue, setInputValue] = useState<string>("1");
  const [fromUnit, setFromUnit] = useState<string>("m");
  const [toUnit, setToUnit] = useState<string>("cm");
  const [result, setResult] = useState<string>("");
  const { inputCls, blockCls, mutedTextCls } = useToolTheme();

  useEffect(() => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      setResult("");
      return;
    }

    // Convert from current unit to meters, then to target unit
    const valueInMeters = value * conversionRates[fromUnit];
    const finalValue = valueInMeters / conversionRates[toUnit];
    
    // Format to avoid extremely long decimals
    setResult(finalValue.toLocaleString('ja-JP', { maximumFractionDigits: 6 }));
  }, [inputValue, fromUnit, toUnit]);

  return (
    <ToolPageLayout title="長さの変換" maxWidth="xl">
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

        <div className={`text-center text-sm p-4 rounded-xl ${blockCls} ${mutedTextCls}`}>
          {inputValue || "0"} {unitLabels[fromUnit]} = <span className="font-bold text-base">{result || "0"}</span> {unitLabels[toUnit]}
        </div>
      </ToolPanel>
    </ToolPageLayout>
  );
}
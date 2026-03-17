"use client";

import React, { useState, useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

const conversionRates: Record<string, number> = {
  m2: 1,
  a: 100,
  ha: 10000,
  km2: 1000000,
  tsubo: 3.305785,
  jo: 1.6562, // 中京間で計算(目安)
};

const unitLabels: Record<string, string> = {
  m2: "平方メートル (m²)",
  a: "アール (a)",
  ha: "ヘクタール (ha)",
  km2: "平方キロメートル (km²)",
  tsubo: "坪 (つぼ)",
  jo: "畳 (じょう - 中京間)",
};

export default function AreaConverterPage() {
  const [inputValue, setInputValue] = useState<string>("1");
  const [fromUnit, setFromUnit] = useState<string>("m2");
  const [toUnit, setToUnit] = useState<string>("tsubo");
  const [result, setResult] = useState<string>("");
  const { inputCls, blockCls } = useToolTheme();

  useEffect(() => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      setResult("");
      return;
    }

    const valueInMeters = value * conversionRates[fromUnit];
    const finalValue = valueInMeters / conversionRates[toUnit];

    setResult(finalValue.toLocaleString('ja-JP', { maximumFractionDigits: 6 }));
  }, [inputValue, fromUnit, toUnit]);

  return (
    <ToolPageLayout title="面積の変換" maxWidth="xl">
      <ToolPanel className="max-w-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold opacity-80">変換元</label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={`w-full p-3 rounded-lg focus:ring-2 outline-none transition-colors ${inputCls}`}
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className={`w-full p-3 rounded-lg focus:ring-2 cursor-pointer outline-none transition-colors ${inputCls}`}
            >
              {Object.entries(unitLabels).map(([key, label]) => (
                <option key={key} value={key} className="text-black dark:text-white bg-white dark:bg-gray-800">{label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold opacity-80">変換先</label>
            <div className={`w-full p-3 h-[52px] rounded-lg font-bold text-xl flex items-center overflow-x-auto transition-colors ${blockCls}`}>
              {result}
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className={`w-full p-3 rounded-lg focus:ring-2 cursor-pointer outline-none transition-colors ${inputCls}`}
            >
              {Object.entries(unitLabels).map(([key, label]) => (
                <option key={key} value={key} className="text-black dark:text-white bg-white dark:bg-gray-800">{label}</option>
              ))}
            </select>
          </div>
        </div>
      </ToolPanel>
    </ToolPageLayout>
  );
}
"use client";

import React, { useState, useEffect } from "react";

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
    <div className="max-w-xl mx-auto p-6 rounded-xl shadow-lg border border-opacity-20 border-current bg-white/10 backdrop-blur-sm">
      <h1 className="text-2xl font-bold mb-6 text-center">重さの変換</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold opacity-80">変換元</label>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-3 rounded-lg bg-black/10 border-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full p-3 rounded-lg bg-black/10 border-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {Object.entries(unitLabels).map(([key, label]) => (
              <option key={key} value={key} className="text-black">{label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold opacity-80">変換先</label>
          <div className="w-full p-3 h-[52px] rounded-lg bg-black/10 font-bold text-xl flex items-center overflow-x-auto">
            {result}
          </div>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full p-3 rounded-lg bg-black/10 border-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {Object.entries(unitLabels).map(([key, label]) => (
              <option key={key} value={key} className="text-black">{label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

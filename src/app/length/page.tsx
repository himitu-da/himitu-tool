"use client";

import React, { useState, useEffect } from "react";

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
    <div className="max-w-xl mx-auto p-6 rounded-xl shadow-lg border border-opacity-20 border-current bg-white/10 backdrop-blur-sm">
      <h1 className="text-2xl font-bold mb-6 text-center">長さの変換</h1>

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
      
      <div className="mt-8 text-center text-sm opacity-60 bg-black/5 p-4 rounded-lg">
        {inputValue} {unitLabels[fromUnit]} = <span className="font-bold text-lg text-blue-400">{result}</span> {unitLabels[toUnit]}
      </div>
    </div>
  );
}

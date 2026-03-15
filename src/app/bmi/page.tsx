"use client";

import React, { useState } from "react";

export default function BMIPage() {
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [bmi, setBmi] = useState<number | null>(null);

  const calculateBMI = () => {
    const h = parseFloat(height) / 100; // cm to m
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      setBmi(w / (h * h));
    }
  };

  const getStatus = (bmiValue: number) => {
    if (bmiValue < 18.5) return "低体重 (痩せ型)";
    if (bmiValue < 25) return "普通体重";
    if (bmiValue < 30) return "肥満 (1度)";
    if (bmiValue < 35) return "肥満 (2度)";
    if (bmiValue < 40) return "肥満 (3度)";
    return "肥満 (4度)";
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-xl shadow-lg border border-opacity-20 border-current bg-white/10 backdrop-blur-sm">
      <h1 className="text-2xl font-bold mb-6 text-center">BMI計算</h1>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1 opacity-80">身長 (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full p-3 rounded-lg bg-black/10 border-none focus:ring-2 focus:ring-blue-500"
            placeholder="170"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-1 opacity-80">体重 (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full p-3 rounded-lg bg-black/10 border-none focus:ring-2 focus:ring-blue-500"
            placeholder="60"
          />
        </div>

        <button
          onClick={calculateBMI}
          className="w-full py-3 rounded-lg bg-blue-500/80 hover:bg-blue-600/80 text-white font-bold transition-colors mt-2"
        >
          計算する
        </button>

        {bmi !== null && (
          <div className="mt-6 p-4 rounded-lg bg-black/20 text-center">
            <div className="text-sm opacity-80 mb-1">あなたのBMI</div>
            <div className="text-4xl font-bold text-blue-400 mb-2">{bmi.toFixed(2)}</div>
            <div className="text-lg font-semibold">{getStatus(bmi)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

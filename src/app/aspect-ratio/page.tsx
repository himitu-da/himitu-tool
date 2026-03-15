"use client";
import React, { useState } from "react";
import { useTheme } from "../ThemeProvider";

export default function Ratio() {
  const [w, set_w] = useState("");
  const [h, set_h] = useState("");
  const [out, setOut] = useState("");
  const { theme } = useTheme();

  const getContainerClassName = () => {
    switch (theme) {
      case "dark":
        return "max-w-md mx-auto p-6 rounded-xl shadow-lg border border-gray-700 bg-gray-800 text-gray-100";
      case "ocean":
        return "max-w-md mx-auto p-6 rounded-xl shadow-lg border border-cyan-700 bg-cyan-800 text-cyan-50";
      default:
        return "max-w-md mx-auto p-6 rounded-xl shadow-lg border border-gray-300 bg-white text-gray-900";
    }
  };

  const getInputClassName = () => {
    switch (theme) {
      case "dark":
        return "p-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500";
      case "ocean":
        return "p-3 bg-cyan-900 border border-cyan-700 rounded-lg text-cyan-50 focus:outline-none focus:border-blue-400";
      default:
        return "p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500";
    }
  };

  const getButtonClassName = () => {
    switch (theme) {
      case "dark":
        return "py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors";
      case "ocean":
        return "py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold transition-colors";
      default:
        return "py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-colors";
    }
  };

  const getOutputClassName = () => {
    switch (theme) {
      case "dark":
        return "p-4 bg-gray-900 border border-gray-700 rounded-lg text-center text-xl font-bold break-all";
      case "ocean":
        return "p-4 bg-cyan-900 border border-cyan-700 rounded-lg text-center text-xl font-bold break-all text-cyan-50";
      default:
        return "p-4 bg-gray-100 border border-gray-300 rounded-lg text-center text-xl font-bold break-all text-gray-900";
    }
  };

  const run = () => {
    try {
      const parsedW = parseInt(w);
      const parsedH = parseInt(h);
      if (isNaN(parsedW) || isNaN(parsedH) || parsedW <= 0 || parsedH <= 0) {
        setOut("正の整数を入力してください");
        return;
      }
      const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
      const g = gcd(parsedW, parsedH);
      setOut((parsedW / g) + ":" + (parsedH / g));
    } catch(e) {
      setOut("エラー");
    }
  };

  return (
    <div className={getContainerClassName()}>
      <h1 className="text-2xl font-bold mb-6 text-center">アスペクト比</h1>
      <div className="flex flex-col gap-4">
        <input 
          type="number" 
          value={w} 
          onChange={e => set_w(e.target.value)} 
          placeholder="幅 (w)" 
          className={getInputClassName()}
        />
        <input 
          type="number" 
          value={h} 
          onChange={e => set_h(e.target.value)} 
          placeholder="高さ (h)" 
          className={getInputClassName()}
        />
        <button onClick={run} className={getButtonClassName()}>計算</button>
        {out && <div className={getOutputClassName()}>{out}</div>}
      </div>
    </div>
  );
}
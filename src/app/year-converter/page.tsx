"use client";

import React, { useState } from "react";

export default function YearConverterPage() {
  const [year, setYear] = useState<string>("2024");
  const [result, setResult] = useState<string>("");

  const convertYear = () => {
    const y = parseInt(year);
    if (isNaN(y) || y < 1) {
      setResult("正しい西暦を入力してください");
      return;
    }

    let era = "";
    if (y >= 2019) {
      const ey = y - 2018;
      era = `令和${ey === 1 ? '元' : ey}年`;
    } else if (y >= 1989) {
      const ey = y - 1988;
      era = `平成${ey === 1 ? '元' : ey}年`;
    } else if (y >= 1926) {
      const ey = y - 1925;
      era = `昭和${ey === 1 ? '元' : ey}年`;
    } else if (y >= 1912) {
      const ey = y - 1911;
      era = `大正${ey === 1 ? '元' : ey}年`;
    } else if (y >= 1868) {
      const ey = y - 1867;
      era = `明治${ey === 1 ? '元' : ey}年`;
    } else {
      era = "明治より前は非対応です";
    }

    setResult(era);
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-xl shadow-lg border border-opacity-20 border-current bg-white/10 backdrop-blur-sm">
      <h1 className="text-2xl font-bold mb-6 text-center">西暦 / 元号変換</h1>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2 opacity-80">西暦 (年)</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full p-3 rounded-lg bg-black/10 border-none focus:ring-2 focus:ring-blue-500"
            placeholder="例: 2024"
          />
        </div>

        <button
          onClick={convertYear}
          className="w-full py-3 rounded-lg bg-blue-500/80 hover:bg-blue-600/80 text-white font-bold transition-colors"
        >
          変換
        </button>

        <div className="mt-6 p-6 rounded-lg bg-black/20 text-center min-h-[100px] flex items-center justify-center">
          <div className="text-2xl font-bold text-blue-400">
            {result || <span className="opacity-50 text-current text-base">ボタンを押して変換</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

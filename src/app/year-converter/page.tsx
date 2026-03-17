"use client";

import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function YearConverterPage() {
  const [year, setYear] = useState<string>("2024");
  const [result, setResult] = useState<string>("");
  const { inputCls, primaryBtnCls, blockCls, mutedTextCls } = useToolTheme();

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
    <ToolPageLayout title="西暦 / 元号変換" maxWidth="md">
      <ToolPanel className="space-y-4">
        <div>
          <label className={`block text-sm font-semibold mb-2 ${mutedTextCls}`}>西暦 (年)</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={`w-full p-3 rounded-lg border focus:ring-2 outline-none ${inputCls}`}
            placeholder="例: 2024"
          />
        </div>

        <button onClick={convertYear} className={`w-full py-3 rounded-lg font-bold transition-colors ${primaryBtnCls}`}>
          変換
        </button>

        <div className={`mt-2 p-6 rounded-lg text-center min-h-[100px] flex items-center justify-center ${blockCls}`}>
          <div className="text-2xl font-bold">
            {result || <span className={`text-base ${mutedTextCls}`}>ボタンを押して変換</span>}
          </div>
        </div>
      </ToolPanel>
    </ToolPageLayout>
  );
}
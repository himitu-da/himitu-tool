"use client";

import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function Prof() {
  const [cost, set_cost] = useState("");
  const [sales, set_sales] = useState("");
  const [out, setOut] = useState("");
  const { inputCls, primaryBtnCls, blockCls, mutedTextCls } = useToolTheme();

  const run = () => {
    const c = Number(cost);
    const s = Number(sales);
    if (!Number.isFinite(c) || !Number.isFinite(s) || s === 0) {
      setOut("エラー: 売上は0以外の数値を入力してください");
      return;
    }
    setOut(`${(((s - c) / s) * 100).toFixed(2)}%`);
  };

  return (
    <ToolPageLayout title="利益率計算" maxWidth="md">
      <ToolPanel className="space-y-4">
        <input
          type="number"
          value={cost}
          onChange={(e) => set_cost(e.target.value)}
          placeholder="原価"
          className={`w-full p-3 rounded-lg border focus:ring-2 outline-none ${inputCls}`}
        />
        <input
          type="number"
          value={sales}
          onChange={(e) => set_sales(e.target.value)}
          placeholder="売上"
          className={`w-full p-3 rounded-lg border focus:ring-2 outline-none ${inputCls}`}
        />
        <button
          onClick={run}
          className={`w-full py-3 rounded-lg font-bold transition-colors ${primaryBtnCls}`}
        >
          計算
        </button>
        {out && <div className={`p-4 rounded-lg text-center text-xl font-bold break-all ${blockCls}`}>{out}</div>}
        <p className={`text-sm ${mutedTextCls}`}>計算式: (売上 - 原価) / 売上 × 100</p>
      </ToolPanel>
    </ToolPageLayout>
  );
}
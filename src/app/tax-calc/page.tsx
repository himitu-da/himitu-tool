"use client";

import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function Tax() {
  const [price, set_price] = useState("");
  const [out, setOut] = useState("");
  const { inputCls, primaryBtnCls, blockCls } = useToolTheme();

  const run = () => {
    const base = Number(price);
    if (!Number.isFinite(base)) {
      setOut("エラー: 数値を入力してください");
      return;
    }
    setOut(`税込: ${Math.floor(base * 1.1)}円`);
  };

  return (
    <ToolPageLayout title="消費税(10%)計算" maxWidth="md">
      <ToolPanel className="space-y-4">
        <input
          type="number"
          value={price}
          onChange={(e) => set_price(e.target.value)}
          placeholder="税抜価格"
          className={`w-full p-3 rounded-lg border focus:ring-2 outline-none ${inputCls}`}
        />
        <button onClick={run} className={`w-full py-3 rounded-lg font-bold transition-colors ${primaryBtnCls}`}>
          計算
        </button>
        {out && <div className={`p-4 rounded-lg text-center text-xl font-bold ${blockCls}`}>{out}</div>}
      </ToolPanel>
    </ToolPageLayout>
  );
}
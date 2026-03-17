"use client";

import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function Temp() {
  const [c, set_c] = useState("");
  const [out, setOut] = useState("");
  const { inputCls, primaryBtnCls, blockCls, mutedTextCls } = useToolTheme();

  const run = () => {
    const value = Number(c);
    if (!Number.isFinite(value)) {
      setOut("エラー: 数値を入力してください");
      return;
    }
    setOut(`${((value * 9) / 5 + 32).toFixed(2)}°F`);
  };

  return (
    <ToolPageLayout title="温度変換(摂氏・華氏)" maxWidth="md">
      <ToolPanel className="space-y-4">
        <input
          type="number"
          value={c}
          onChange={(e) => set_c(e.target.value)}
          placeholder="摂氏 (°C)"
          className={`w-full p-3 rounded-lg border focus:ring-2 outline-none ${inputCls}`}
        />
        <button onClick={run} className={`w-full py-3 rounded-lg font-bold transition-colors ${primaryBtnCls}`}>
          変換
        </button>
        {out && <div className={`p-4 rounded-lg text-center text-xl font-bold ${blockCls}`}>{out}</div>}
        <p className={`text-sm ${mutedTextCls}`}>摂氏から華氏への変換式: (°C × 9/5) + 32</p>
      </ToolPanel>
    </ToolPageLayout>
  );
}
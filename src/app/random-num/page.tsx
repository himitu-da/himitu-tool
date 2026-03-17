"use client";

import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function Rand() {
  const [min, set_min] = useState("");
  const [max, set_max] = useState("");
  const [out, setOut] = useState("");
  const { inputCls, primaryBtnCls, blockCls, mutedTextCls } = useToolTheme();

  const run = () => {
    const minNum = Number(min);
    const maxNum = Number(max);
    if (!Number.isFinite(minNum) || !Number.isFinite(maxNum) || minNum > maxNum) {
      setOut("エラー: 最小値と最大値を正しく入力してください");
      return;
    }
    setOut((Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum).toString());
  };

  return (
    <ToolPageLayout title="乱数生成" maxWidth="md">
      <ToolPanel className="space-y-4">
        <input
          type="number"
          value={min}
          onChange={(e) => set_min(e.target.value)}
          placeholder="最小値"
          className={`w-full p-3 rounded-lg border focus:ring-2 outline-none ${inputCls}`}
        />
        <input
          type="number"
          value={max}
          onChange={(e) => set_max(e.target.value)}
          placeholder="最大値"
          className={`w-full p-3 rounded-lg border focus:ring-2 outline-none ${inputCls}`}
        />
        <button onClick={run} className={`w-full py-3 rounded-lg font-bold transition-colors ${primaryBtnCls}`}>
          生成
        </button>
        {out && <div className={`p-4 rounded-lg text-center text-2xl font-bold ${blockCls}`}>{out}</div>}
        <p className={`text-sm ${mutedTextCls}`}>指定範囲内の整数を1つランダムに生成します。</p>
      </ToolPanel>
    </ToolPageLayout>
  );
}
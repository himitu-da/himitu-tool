"use client";

import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function Perc() {
  const [A, set_A] = useState("");
  const [B, set_B] = useState("");
  const [out, setOut] = useState("");
  const { inputCls, primaryBtnCls, blockCls, mutedTextCls } = useToolTheme();

  const run = () => {
    const a = Number(A);
    const b = Number(B);
    if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) {
      setOut("エラー: 0以外の数値を入力してください");
      return;
    }
    setOut(`${((a / b) * 100).toFixed(2)}%`);
  };

  return (
    <ToolPageLayout title="割合計算" maxWidth="md">
      <ToolPanel className="space-y-4">
        <input
          type="number"
          value={A}
          onChange={(e) => set_A(e.target.value)}
          placeholder="A"
          className={`w-full p-3 rounded-lg border focus:ring-2 outline-none ${inputCls}`}
        />
        <input
          type="number"
          value={B}
          onChange={(e) => set_B(e.target.value)}
          placeholder="B"
          className={`w-full p-3 rounded-lg border focus:ring-2 outline-none ${inputCls}`}
        />
        <button
          onClick={run}
          className={`w-full py-3 rounded-lg font-bold transition-colors ${primaryBtnCls}`}
        >
          計算
        </button>
        {out && (
          <div className={`p-4 rounded-lg text-center text-xl font-bold break-all ${blockCls}`}>
            {out}
          </div>
        )}
        <p className={`text-sm ${mutedTextCls}`}>A が B の何パーセントかを計算します。</p>
      </ToolPanel>
    </ToolPageLayout>
  );
}
"use client";

import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function Speed() {
  const [kmh, set_kmh] = useState("");
  const [out, setOut] = useState("");
  const { inputCls, primaryBtnCls, blockCls, mutedTextCls } = useToolTheme();

  const run = () => {
    const speed = Number(kmh);
    if (!Number.isFinite(speed)) {
      setOut("エラー: 数値を入力してください");
      return;
    }
    setOut(`${((speed * 1000) / 3600).toFixed(2)} m/s`);
  };

  return (
    <ToolPageLayout title="速度変換" maxWidth="md">
      <ToolPanel className="space-y-4">
        <input
          type="number"
          value={kmh}
          onChange={(e) => set_kmh(e.target.value)}
          placeholder="km/h"
          className={`w-full p-3 rounded-lg border focus:ring-2 outline-none ${inputCls}`}
        />
        <button onClick={run} className={`w-full py-3 rounded-lg font-bold transition-colors ${primaryBtnCls}`}>
          変換
        </button>
        {out && <div className={`p-4 rounded-lg text-center text-xl font-bold ${blockCls}`}>{out}</div>}
        <p className={`text-sm ${mutedTextCls}`}>1 km/h = 0.27778 m/s</p>
      </ToolPanel>
    </ToolPageLayout>
  );
}
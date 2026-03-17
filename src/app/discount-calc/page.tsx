"use client";
import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function Disc() {
  const [price, set_price] = useState("");
  const [percent, set_percent] = useState("");
  const [out, setOut] = useState("");
  const { inputCls, primaryBtnCls, blockCls } = useToolTheme();

  const run = () => {
    try {
      setOut(Math.floor(Number(price) * (1 - Number(percent) / 100)) + "円")
    } catch (e) {
      setOut("エラー");
    }
  };

  return (
    <ToolPageLayout title="割引計算" maxWidth="md">
      <ToolPanel className="max-w-md mx-auto">
        <div className="flex flex-col gap-4">
          <input
            type="number"
            value={price}
            onChange={e => set_price(e.target.value)}
            placeholder="元の金額 (円)"
            className={`p-3 rounded-lg focus:ring-2 outline-none transition-colors ${inputCls}`}
          />
          <input
            type="number"
            value={percent}
            onChange={e => set_percent(e.target.value)}
            placeholder="割引率 (%)"
            className={`p-3 rounded-lg focus:ring-2 outline-none transition-colors ${inputCls}`}
          />
          <button
            onClick={run}
            className={`py-3 rounded-lg font-bold transition-colors ${primaryBtnCls}`}
          >
            計算
          </button>
          {out && (
            <div className={`p-4 rounded-lg text-center text-xl font-bold break-all transition-colors ${blockCls}`}>
              {out}
            </div>
          )}
        </div>
      </ToolPanel>
    </ToolPageLayout>
  );
}
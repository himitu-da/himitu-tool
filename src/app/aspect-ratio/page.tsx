"use client";
import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function Ratio() {
  const [w, set_w] = useState("");
  const [h, set_h] = useState("");
  const [out, setOut] = useState("");
  const { inputCls, primaryBtnCls, blockCls } = useToolTheme();

  const run = () => {
    try {
      const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
      const g = gcd(Number(w), Number(h));
      setOut((Number(w) / g) + ":" + (Number(h) / g))
    } catch (e) {
      setOut("エラー");
    }
  };

  return (
    <ToolPageLayout title="アスペクト比" maxWidth="md">
      <ToolPanel className="max-w-md mx-auto">
        <div className="flex flex-col gap-4">
          <input
            type="number"
            value={w}
            onChange={e => set_w(e.target.value)}
            placeholder="幅 (w)"
            className={`p-3 rounded-lg focus:ring-2 outline-none transition-colors ${inputCls}`}
          />
          <input
            type="number"
            value={h}
            onChange={e => set_h(e.target.value)}
            placeholder="高さ (h)"
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
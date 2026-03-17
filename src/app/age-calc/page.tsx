"use client";
import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function Age() {
  const [year, set_year] = useState("");
  const [out, setOut] = useState("");
  const { inputCls, primaryBtnCls, blockCls } = useToolTheme();

  const run = () => {
    try {
      setOut((new Date().getFullYear() - Number(year)) + "歳")
    } catch (e) {
      setOut("エラー");
    }
  };

  return (
    <ToolPageLayout title="年齢計算" maxWidth="md">
      <ToolPanel className="max-w-md mx-auto">
        <div className="flex flex-col gap-4">
          <input
            type="number"
            value={year}
            onChange={e => set_year(e.target.value)}
            placeholder="生まれた年 (西暦)"
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
"use client";
import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function Keb() {
  const [inp, setInp] = useState("");
  const [out, setOut] = useState("");
  const { inputCls, primaryBtnCls, blockCls } = useToolTheme();

  const run = () => {
    try {
      setOut(inp.trim().replace(/\s+/g, "-").toLowerCase())
    } catch (e) {
      setOut("エラー");
    }
  };

  return (
    <ToolPageLayout title="ケバブケース変換" maxWidth="2xl">
      <ToolPanel className="max-w-2xl mx-auto">
        <div className="flex flex-col gap-4">
          <textarea
            value={inp}
            onChange={e => setInp(e.target.value)}
            className={`w-full h-32 p-3 rounded-lg focus:ring-2 resize-y outline-none transition-colors ${inputCls}`}
            placeholder="入力..."
          />
          <button
            onClick={run}
            className={`py-3 rounded-lg font-bold transition-colors ${primaryBtnCls}`}
          >
            変換
          </button>
          <textarea
            value={out}
            readOnly
            className={`w-full h-32 p-3 rounded-lg opacity-90 resize-none transition-colors ${blockCls}`}
            placeholder="結果..."
          />
        </div>
      </ToolPanel>
    </ToolPageLayout>
  );
}
"use client";

import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function Shuf() {
  const [inp, setInp] = useState("");
  const [out, setOut] = useState("");
  const { inputCls, primaryBtnCls } = useToolTheme();

  const run = () => {
    setOut(inp.split("\n").sort(() => Math.random() - 0.5).join("\n"));
  };

  return (
    <ToolPageLayout title="行をシャッフル" maxWidth="2xl">
      <ToolPanel className="space-y-4">
        <textarea
          value={inp}
          onChange={(e) => setInp(e.target.value)}
          className={`w-full h-40 p-3 rounded-lg border focus:ring-2 outline-none ${inputCls}`}
          placeholder="1行ずつ入力"
        />
        <button onClick={run} className={`w-full py-3 rounded-lg font-bold transition-colors ${primaryBtnCls}`}>
          実行
        </button>
        <textarea
          value={out}
          readOnly
          className={`w-full h-40 p-3 rounded-lg border opacity-90 ${inputCls}`}
          placeholder="結果"
        />
      </ToolPanel>
    </ToolPageLayout>
  );
}
"use client";

import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function SortL() {
  const [inp, setInp] = useState("");
  const [out, setOut] = useState("");
  const { inputCls, primaryBtnCls } = useToolTheme();

  const run = () => {
    setOut(inp.split("\n").sort().join("\n"));
  };

  return (
    <ToolPageLayout title="行のソート" maxWidth="2xl">
      <ToolPanel className="space-y-4">
        <textarea
          value={inp}
          onChange={(e) => setInp(e.target.value)}
          className={`w-full h-40 p-3 rounded-lg border focus:ring-2 outline-none ${inputCls}`}
          placeholder="1行ずつ入力"
        />
        <button onClick={run} className={`w-full py-3 rounded-lg font-bold transition-colors ${primaryBtnCls}`}>
          ソート
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
"use client";

import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function JsonF() {
  const [inp, setInp] = useState("");
  const [out, setOut] = useState("");
  const { inputCls, primaryBtnCls, blockCls, mutedTextCls } = useToolTheme();

  const run = () => {
    try {
      setOut(JSON.stringify(JSON.parse(inp), null, 2));
    } catch {
      setOut("エラー: JSON形式が不正です");
    }
  };

  return (
    <ToolPageLayout title="JSONフォーマッタ" maxWidth="2xl">
      <ToolPanel className="space-y-4">
        <textarea
          value={inp}
          onChange={(e) => setInp(e.target.value)}
          className={`w-full h-40 p-3 rounded-lg border focus:ring-2 outline-none ${inputCls}`}
          placeholder="整形したいJSONを入力"
        />
        <button
          onClick={run}
          className={`w-full py-3 rounded-lg font-bold transition-colors ${primaryBtnCls}`}
        >
          整形
        </button>
        <textarea
          value={out}
          readOnly
          className={`w-full h-40 p-3 rounded-lg border opacity-90 ${inputCls}`}
          placeholder="結果"
        />
        <div className={`p-3 rounded-lg text-sm ${blockCls} ${mutedTextCls}`}>
          入力されたJSONを読みやすい形に整形します。
        </div>
      </ToolPanel>
    </ToolPageLayout>
  );
}
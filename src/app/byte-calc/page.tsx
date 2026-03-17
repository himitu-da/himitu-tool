"use client";
import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function Byte() {
  const [bytes, set_bytes] = useState("");
  const [out, setOut] = useState("");
  const { inputCls, primaryBtnCls, blockCls } = useToolTheme();

  const run = () => {
    try {
      const b = Number(bytes);
      setOut("MB: " + (b / 1024 ** 2).toFixed(2))
    } catch (e) {
      setOut("エラー");
    }
  };

  return (
    <ToolPageLayout title="バイト単位変換" maxWidth="md">
      <ToolPanel className="max-w-md mx-auto">
        <div className="flex flex-col gap-4">
          <input
            type="number"
            value={bytes}
            onChange={e => set_bytes(e.target.value)}
            placeholder="バイト数"
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
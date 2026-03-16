"use client";
import React, { useState } from "react";
import { ToolStickyHeader } from "@/components/ToolStickyHeader";
export default function Temp() {
  const [c, set_c] = useState("");
  const [out, setOut] = useState("");
  const run = () => { try { setOut((Number(c)*9/5+32).toFixed(2)+"°F") } catch(e) { setOut("エラー"); } };
  return (
    <>
      <ToolStickyHeader title="温度変換(摂氏・華氏)" className="bg-gray-800 text-white" />
      <div className="max-w-md mx-auto p-6 rounded-xl shadow-lg border border-opacity-20 border-current bg-white/10 backdrop-blur-sm mt-4">
      <div className="flex flex-col gap-4">
        <input type="number" value={c} onChange={e=>set_c(e.target.value)} placeholder="c" className="p-3 bg-black/10 rounded-lg text-current border-current" />
        <button onClick={run} className="py-3 bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-lg font-bold transition-colors">計算</button>
        {out && <div className="p-4 bg-black/20 rounded-lg text-center text-xl font-bold break-all">{out}</div>}
      </div>
    </div>
  </>
);
}
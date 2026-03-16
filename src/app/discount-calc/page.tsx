"use client";
import React, { useState } from "react";
import { ToolStickyHeader } from "@/components/ToolStickyHeader";
export default function Disc() {
  const [price, set_price] = useState("");
  const [percent, set_percent] = useState("");
  const [out, setOut] = useState("");
  const run = () => { try { setOut(Math.floor(Number(price)*(1-Number(percent)/100))+"円") } catch(e) { setOut("エラー"); } };
  return (
    <>
      <ToolStickyHeader title="割引計算" className="bg-gray-800 text-white" />
      <div className="max-w-md mx-auto p-6 rounded-xl shadow-lg border border-opacity-20 border-current bg-white/10 backdrop-blur-sm mt-4">
      <div className="flex flex-col gap-4">
        <input type="number" value={price} onChange={e=>set_price(e.target.value)} placeholder="price" className="p-3 bg-black/10 rounded-lg text-current border-current" />
        <input type="number" value={percent} onChange={e=>set_percent(e.target.value)} placeholder="percent" className="p-3 bg-black/10 rounded-lg text-current border-current" />
        <button onClick={run} className="py-3 bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-lg font-bold transition-colors">計算</button>
        {out && <div className="p-4 bg-black/20 rounded-lg text-center text-xl font-bold break-all">{out}</div>}
      </div>
    </div>
  </>
);
}
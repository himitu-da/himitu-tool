"use client";
import React, { useState } from "react";
import { ToolStickyHeader } from "@/components/ToolStickyHeader";
export default function Split() {
  const [amount, set_amount] = useState("");
  const [people, set_people] = useState("");
  const [out, setOut] = useState("");
  const run = () => { try { setOut("1人: "+Math.ceil(Number(amount)/Number(people))+"円") } catch(e) { setOut("エラー"); } };
  return (
    <>
      <ToolStickyHeader title="割り勘計算" className="bg-gray-800 text-white" />
      <div className="max-w-md mx-auto p-6 rounded-xl shadow-lg border border-opacity-20 border-current bg-white/10 backdrop-blur-sm mt-4">
      <div className="flex flex-col gap-4">
        <input type="number" value={amount} onChange={e=>set_amount(e.target.value)} placeholder="amount" className="p-3 bg-black/10 rounded-lg text-current border-current" />
        <input type="number" value={people} onChange={e=>set_people(e.target.value)} placeholder="people" className="p-3 bg-black/10 rounded-lg text-current border-current" />
        <button onClick={run} className="py-3 bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-lg font-bold transition-colors">計算</button>
        {out && <div className="p-4 bg-black/20 rounded-lg text-center text-xl font-bold break-all">{out}</div>}
      </div>
    </div>
  </>
);
}
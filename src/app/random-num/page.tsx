"use client";
import React, { useState } from "react";
export default function Rand() {
  const [min, set_min] = useState("");
  const [max, set_max] = useState("");
  const [out, setOut] = useState("");
  const run = () => { try { setOut((Math.floor(Math.random()*(Number(max)-Number(min)+1))+Number(min)).toString()) } catch(e) { setOut("エラー"); } };
  return (
    <div className="max-w-md mx-auto p-6 rounded-xl shadow-lg border border-opacity-20 border-current bg-white/10 backdrop-blur-sm">
      <h1 className="text-2xl font-bold mb-6 text-center">乱数生成</h1>
      <div className="flex flex-col gap-4">
        <input type="number" value={min} onChange={e=>set_min(e.target.value)} placeholder="min" className="p-3 bg-black/10 rounded-lg text-current border-current" />
        <input type="number" value={max} onChange={e=>set_max(e.target.value)} placeholder="max" className="p-3 bg-black/10 rounded-lg text-current border-current" />
        <button onClick={run} className="py-3 bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-lg font-bold transition-colors">計算</button>
        {out && <div className="p-4 bg-black/20 rounded-lg text-center text-xl font-bold break-all">{out}</div>}
      </div>
    </div>
  );
}
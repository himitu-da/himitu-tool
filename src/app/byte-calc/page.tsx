"use client";
import React, { useState } from "react";
export default function Byte() {
  const [bytes, set_bytes] = useState("");
  const [out, setOut] = useState("");
  const run = () => { try { const b=Number(bytes); setOut("MB: "+(b/1024**2).toFixed(2)) } catch(e) { setOut("エラー"); } };
  return (
    <div className="max-w-md mx-auto p-6 rounded-xl shadow-lg border border-opacity-20 border-current bg-white/10 backdrop-blur-sm">
      <h1 className="text-2xl font-bold mb-6 text-center">バイト単位変換</h1>
      <div className="flex flex-col gap-4">
        <input type="number" value={bytes} onChange={e=>set_bytes(e.target.value)} placeholder="bytes" className="p-3 bg-black/10 rounded-lg text-current border-current" />
        <button onClick={run} className="py-3 bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-lg font-bold transition-colors">計算</button>
        {out && <div className="p-4 bg-black/20 rounded-lg text-center text-xl font-bold break-all">{out}</div>}
      </div>
    </div>
  );
}
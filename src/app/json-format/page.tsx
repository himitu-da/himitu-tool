"use client";
import React, { useState } from "react";
import { ToolStickyHeader } from "@/components/ToolStickyHeader";
export default function JsonF() {
  const [inp, setInp] = useState("");
  const [out, setOut] = useState("");
  const run = () => { try { setOut(JSON.stringify(JSON.parse(inp),null,2)) } catch(e) { setOut("エラー"); } };
  return (
    <>
      <ToolStickyHeader title="JSONフォーマッタ" className="bg-gray-800 text-white" />
      <div className="max-w-2xl mx-auto p-6 rounded-xl shadow-lg border border-opacity-20 border-current bg-white/10 backdrop-blur-sm mt-4">
        <div className="flex flex-col gap-4">
          <textarea value={inp} onChange={e=>setInp(e.target.value)} className="w-full h-32 p-3 bg-black/10 rounded-lg border-current focus:ring-2" placeholder="入力..."></textarea>
          <button onClick={run} className="py-3 bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-lg font-bold transition-colors">整形</button>
          <textarea value={out} readOnly className="w-full h-32 p-3 bg-black/20 rounded-lg opacity-80" placeholder="結果..."></textarea>
        </div>
      </div>
    </>
  );
}
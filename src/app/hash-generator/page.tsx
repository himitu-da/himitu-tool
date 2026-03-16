"use client";

import React, { useState } from "react";

import { ToolStickyHeader } from "@/components/ToolStickyHeader";
export default function HashGeneratorPage() {
  const [text, setText] = useState("");
  const [hash, setHash] = useState("");

  const generateHash = async () => {
    if (!text) {
      setHash("");
      return;
    }
    
    // Web Crypto API を使用して SHA-256 ハッシュを生成
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    
    setHash(hashHex);
  };

  return (
    <>
      <ToolStickyHeader title="ハッシュ生成 (SHA-256)" className="bg-gray-800 text-white" />
      <div className="max-w-2xl mx-auto p-6 rounded-xl shadow-lg border border-opacity-20 border-current bg-white/10 backdrop-blur-sm mt-4">

      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2 opacity-80">入力テキスト</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-32 p-4 rounded-lg bg-black/10 border-none focus:ring-2 focus:ring-blue-500 resize-y"
          placeholder="ハッシュ化したいテキストを入力してください"
        />
        <button
          onClick={generateHash}
          className="mt-4 px-6 py-2 rounded-lg bg-blue-500/80 hover:bg-blue-600/80 text-white font-bold transition-colors"
        >
          ハッシュを生成
        </button>
      </div>

      <div className="mt-8">
        <label className="block text-sm font-semibold mb-2 opacity-80">SHA-256 ハッシュ</label>
        <div className="w-full p-4 rounded-lg bg-black/20 font-mono break-all min-h-[60px] flex items-center">
          {hash || <span className="opacity-50">結果がここに表示されます</span>}
        </div>
      </div>
    </div>
  </>
);
}
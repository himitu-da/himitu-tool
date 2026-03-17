"use client";

import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function HashGeneratorPage() {
  const [text, setText] = useState("");
  const [hash, setHash] = useState("");
  const { inputCls, primaryBtnCls, blockCls } = useToolTheme();

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
    <ToolPageLayout title="ハッシュ生成 (SHA-256)">
      <ToolPanel className="max-w-2xl mx-auto">
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 opacity-80">入力テキスト</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={`w-full h-32 p-4 rounded-lg focus:ring-2 resize-y transition-colors outline-none ${inputCls}`}
            placeholder="ハッシュ化したいテキストを入力してください"
          />
          <button
            onClick={generateHash}
            className={`mt-4 px-6 py-2 rounded-lg font-bold transition-colors ${primaryBtnCls}`}
          >
            ハッシュを生成
          </button>
        </div>

        <div className="mt-8">
          <label className="block text-sm font-semibold mb-2 opacity-80">SHA-256 ハッシュ</label>
          <div className={`w-full p-4 rounded-lg font-mono break-all min-h-[60px] flex items-center transition-colors ${blockCls}`}>
            {hash || <span className="opacity-50">結果がここに表示されます</span>}
          </div>
        </div>
      </ToolPanel>
    </ToolPageLayout>
  );
}
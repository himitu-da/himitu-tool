"use client";

import React, { useState } from "react";

export default function CharCounterPage() {
  const [text, setText] = useState("");

  const charCount = text.length;
  // 日本語の空白を含めずにカウントする
  const charCountNoSpaces = text.replace(/[\s\u3000]/g, "").length;
  // 単語数 (簡易的な英語単語カウント)
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  // 行数
  const lineCount = text === "" ? 0 : text.split("\n").length;

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-xl shadow-lg border border-opacity-20 border-current bg-white/10 backdrop-blur-sm">
      <h1 className="text-2xl font-bold mb-6 text-center">文字数・単語数カウント</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-black/20 text-center">
          <div className="text-sm opacity-80 mb-1">文字数</div>
          <div className="text-2xl font-bold text-blue-400">{charCount}</div>
        </div>
        <div className="p-4 rounded-lg bg-black/20 text-center">
          <div className="text-sm opacity-80 mb-1">空白なし</div>
          <div className="text-2xl font-bold text-blue-400">{charCountNoSpaces}</div>
        </div>
        <div className="p-4 rounded-lg bg-black/20 text-center">
          <div className="text-sm opacity-80 mb-1">単語数</div>
          <div className="text-2xl font-bold text-blue-400">{wordCount}</div>
        </div>
        <div className="p-4 rounded-lg bg-black/20 text-center">
          <div className="text-sm opacity-80 mb-1">行数</div>
          <div className="text-2xl font-bold text-blue-400">{lineCount}</div>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-64 p-4 rounded-lg bg-black/10 border-none focus:ring-2 focus:ring-blue-500 resize-y"
        placeholder="ここにテキストを入力またはペーストしてください..."
      />
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setText("")}
          className="px-6 py-2 rounded-lg bg-red-500/80 hover:bg-red-600/80 text-white font-bold transition-colors"
        >
          クリア
        </button>
      </div>
    </div>
  );
}

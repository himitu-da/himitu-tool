"use client";

import React, { useState } from "react";

import { ToolStickyHeader } from "@/components/ToolStickyHeader";
export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState("");

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyz";
    const uppercaseCharset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numberCharset = "0123456789";
    const symbolCharset = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    let availableCharset = charset;
    if (includeUppercase) availableCharset += uppercaseCharset;
    if (includeNumbers) availableCharset += numberCharset;
    if (includeSymbols) availableCharset += symbolCharset;

    let generated = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * availableCharset.length);
      generated += availableCharset[randomIndex];
    }
    setPassword(generated);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
  };

  return (
    <>
      <ToolStickyHeader title="パスワード生成" className="bg-gray-800 text-white" />
      <div className="max-w-md mx-auto p-6 rounded-xl shadow-lg border border-opacity-20 border-current bg-white/10 backdrop-blur-sm mt-4">

      <div className="mb-6 p-4 rounded-lg bg-black/20 flex items-center justify-between">
        <div className="font-mono text-xl overflow-x-auto whitespace-nowrap mr-4">
          {password || "クリックして生成"}
        </div>
        {password && (
          <button 
            onClick={copyToClipboard}
            className="p-2 rounded bg-blue-500/50 hover:bg-blue-600/50"
            title="コピー"
          >
            📋
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-2 opacity-80">
            長さ: {length}
          </label>
          <input
            type="range"
            min="4"
            max="64"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeUppercase}
            onChange={(e) => setIncludeUppercase(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="opacity-90">大文字を含める (A-Z)</span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeNumbers}
            onChange={(e) => setIncludeNumbers(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="opacity-90">数字を含める (0-9)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeSymbols}
            onChange={(e) => setIncludeSymbols(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="opacity-90">記号を含める (!@#$)</span>
        </label>
      </div>

      <button
        onClick={generatePassword}
        className="w-full py-3 rounded-lg bg-blue-500/80 hover:bg-blue-600/80 text-white font-bold transition-colors"
      >
        生成する
      </button>
    </div>
  </>
);
}
"use client";

import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function PasswordGeneratorPage() {
  const { blockCls, primaryBtnCls } = useToolTheme();

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
    <ToolPageLayout title="パスワード生成">
      <ToolPanel className="max-w-md mx-auto">

        <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${blockCls}`}>
          <div className="font-mono text-xl overflow-x-auto whitespace-nowrap mr-4">
            {password || "クリックして生成"}
          </div>
          {password && (
            <button
              onClick={copyToClipboard}
              className="p-2 rounded bg-blue-500/50 hover:bg-blue-600/50 transition-colors"
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
              className="w-full accent-blue-500 hover:accent-blue-400 cursor-pointer"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeUppercase}
              onChange={(e) => setIncludeUppercase(e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
            <span className="opacity-90">大文字を含める (A-Z)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
            <span className="opacity-90">数字を含める (0-9)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
            <span className="opacity-90">記号を含める (!@#$)</span>
          </label>
        </div>

        <button
          onClick={generatePassword}
          className={`w-full py-3 rounded-lg font-bold transition-colors ${primaryBtnCls}`}
        >
          生成する
        </button>
      </ToolPanel>
    </ToolPageLayout>
  );
}
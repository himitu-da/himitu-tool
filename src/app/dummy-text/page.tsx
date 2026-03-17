"use client";

import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function DummyTextPage() {
  const [length, setLength] = useState(100);
  const [text, setText] = useState("");
  const { primaryBtnCls, blockCls } = useToolTheme();

  const generateText = () => {
    // 青空文庫によくあるようなダミーテキスト用サンプル
    const sampleText = "吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。吾輩はここで始めて人間というものを見た。しかもあとで聞くとそれは書生という人間中で一番獰悪な種族であったそうだ。この書生というのは時々我々を捕えて煮て食うという話である。しかしその当時は何という考もなかったから別段恐しいとも思わなかった。ただ彼の掌に載せられてスーと持ち上げられた時何だかフワフワした感じがあったばかりである。掌の上で少し落ちついて書生の顔を見たのがいわゆる人間というものの見始であろう。";

    let result = "";
    while (result.length < length) {
      result += sampleText;
    }
    setText(result.substring(0, length));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <ToolPageLayout title="ダミーテキスト生成" maxWidth="2xl">
      <ToolPanel className="max-w-2xl mx-auto">
        <div className="mb-6 flex flex-col gap-4">
          <div className={`p-5 rounded-lg transition-colors ${blockCls}`}>
            <label className="block text-sm font-semibold mb-4 opacity-80">文字数制限: {length}文字</label>
            <input
              type="range"
              min="10"
              max="2000"
              step="10"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full cursor-pointer accent-blue-500"
            />
          </div>

          <button
            onClick={generateText}
            className={`w-full py-3 rounded-lg font-bold transition-colors ${primaryBtnCls}`}
          >
            生成する
          </button>
        </div>

        {text && (
          <div className="mt-8 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 p-2 rounded bg-white/20 hover:bg-white/30 transition-colors text-sm dark:text-white"
              title="コピー"
            >
              📋 コピー
            </button>
            <div className={`w-full p-6 pt-12 rounded-lg text-justify leading-relaxed whitespace-pre-wrap min-h-[200px] border border-opacity-20 border-current transition-colors ${blockCls}`}>
              {text}
            </div>
          </div>
        )}
      </ToolPanel>
    </ToolPageLayout>
  );
}
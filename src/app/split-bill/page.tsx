"use client";

import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function Split() {
  const [amount, set_amount] = useState("");
  const [people, set_people] = useState("");
  const [out, setOut] = useState("");
  const { inputCls, primaryBtnCls, blockCls, mutedTextCls } = useToolTheme();

  const run = () => {
    const total = Number(amount);
    const count = Number(people);
    if (!Number.isFinite(total) || !Number.isFinite(count) || count <= 0) {
      setOut("エラー: 人数は1以上で入力してください");
      return;
    }
    setOut(`1人: ${Math.ceil(total / count)}円`);
  };

  return (
    <ToolPageLayout title="割り勘計算" maxWidth="md">
      <ToolPanel className="space-y-4">
        <input
          type="number"
          value={amount}
          onChange={(e) => set_amount(e.target.value)}
          placeholder="合計金額"
          className={`w-full p-3 rounded-lg border focus:ring-2 outline-none ${inputCls}`}
        />
        <input
          type="number"
          value={people}
          onChange={(e) => set_people(e.target.value)}
          placeholder="人数"
          className={`w-full p-3 rounded-lg border focus:ring-2 outline-none ${inputCls}`}
        />
        <button onClick={run} className={`w-full py-3 rounded-lg font-bold transition-colors ${primaryBtnCls}`}>
          計算
        </button>
        {out && <div className={`p-4 rounded-lg text-center text-xl font-bold ${blockCls}`}>{out}</div>}
        <p className={`text-sm ${mutedTextCls}`}>端数は切り上げて1人あたり金額を表示します。</p>
      </ToolPanel>
    </ToolPageLayout>
  );
}
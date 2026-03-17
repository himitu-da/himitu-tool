"use client";
import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function DaysDiff() {
    const [d1, s1] = useState("");
    const [d2, s2] = useState("");
    const [o, so] = useState("");
    const { inputCls, primaryBtnCls, blockCls } = useToolTheme();

    const run = () => {
        if (!d1 || !d2) return;
        so(Math.abs((new Date(d1).getTime() - new Date(d2).getTime()) / (1000 * 60 * 60 * 24)) + "日");
    };

    return (
        <ToolPageLayout title="日付の差分" maxWidth="md">
            <ToolPanel className="max-w-md mx-auto flex flex-col gap-4 text-center">
                <input
                    type="date"
                    value={d1}
                    onChange={e => s1(e.target.value)}
                    className={`p-3 rounded-lg focus:ring-2 outline-none transition-colors ${inputCls}`}
                />
                <input
                    type="date"
                    value={d2}
                    onChange={e => s2(e.target.value)}
                    className={`p-3 rounded-lg focus:ring-2 outline-none transition-colors ${inputCls}`}
                />
                <button
                    onClick={run}
                    className={`py-3 rounded-lg font-bold transition-colors ${primaryBtnCls}`}
                >
                    計算
                </button>
                {o && (
                    <div className={`p-4 rounded-lg text-center text-xl font-bold break-all transition-colors ${blockCls}`}>
                        {o}
                    </div>
                )}
            </ToolPanel>
        </ToolPageLayout>
    );
}
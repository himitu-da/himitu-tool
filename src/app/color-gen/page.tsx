"use client";
import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function ColorGen() {
    const [c, s] = useState("#3b82f6");
    const { primaryBtnCls } = useToolTheme();

    return (
        <ToolPageLayout title="ランダムカラー" maxWidth="md">
            <ToolPanel className="max-w-md mx-auto text-center">
                <div
                    className="w-full h-32 rounded-lg mb-4 shadow-inner border border-white/20 transition-colors"
                    style={{ backgroundColor: c }}
                />
                <div className="text-2xl font-mono mb-4">{c}</div>
                <button
                    onClick={() => s("#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"))}
                    className={`px-8 py-3 rounded-lg font-bold transition-colors ${primaryBtnCls}`}
                >
                    生成
                </button>
            </ToolPanel>
        </ToolPageLayout>
    );
}
"use client";
import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function Dice() {
    const [v, s] = useState(1);
    const { primaryBtnCls } = useToolTheme();

    return (
        <ToolPageLayout title="サイコロ" maxWidth="md">
            <ToolPanel className="max-w-md mx-auto text-center">
                <div className="text-9xl mb-6">
                    {["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][v - 1]}
                </div>
                <button
                    onClick={() => s(Math.floor(Math.random() * 6) + 1)}
                    className={`px-8 py-3 rounded-lg font-bold transition-colors ${primaryBtnCls}`}
                >
                    振る
                </button>
            </ToolPanel>
        </ToolPageLayout>
    );
}
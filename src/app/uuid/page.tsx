"use client";

import React, { useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function UuidGeneratorPage() {
    const [uuid, setUuid] = useState("");
    const { primaryBtnCls, blockCls } = useToolTheme();

    return (
        <ToolPageLayout title="UUID生成" maxWidth="2xl">
            <ToolPanel className="max-w-md mx-auto text-center">
                <button
                    onClick={() => setUuid(crypto.randomUUID())}
                    className={`w-full py-3 rounded-lg font-bold mb-6 transition-colors ${primaryBtnCls}`}
                >
                    生成する
                </button>
                <div className={`p-4 rounded-lg break-all font-mono min-h-[60px] flex items-center justify-center transition-colors ${blockCls}`}>
                    {uuid || <span className="opacity-50">---</span>}
                </div>
            </ToolPanel>
        </ToolPageLayout>
    );
}
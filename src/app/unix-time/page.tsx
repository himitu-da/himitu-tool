"use client";

import React, { useEffect, useState } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function U() {
	const [t, s] = useState(Math.floor(Date.now() / 1000));
	const { blockCls, mutedTextCls } = useToolTheme();

	useEffect(() => {
		const i = setInterval(() => s(Math.floor(Date.now() / 1000)), 1000);
		return () => clearInterval(i);
	}, []);

	return (
		<ToolPageLayout title="UNIXタイム" maxWidth="md">
			<ToolPanel className="text-center space-y-4">
				<div className={`rounded-xl p-6 ${blockCls}`}>
					<div className={`text-sm mb-2 ${mutedTextCls}`}>現在のUNIXタイム</div>
					<div className="text-4xl md:text-5xl font-mono font-bold break-all">{t}</div>
				</div>
			</ToolPanel>
		</ToolPageLayout>
	);
}
"use client";

import React, { useState, useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function WorldClockPage() {
  const [time, setTime] = useState(new Date());
  const { blockCls, mutedTextCls } = useToolTheme();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cities = [
    { name: "東京", tz: "Asia/Tokyo" },
    { name: "ニューヨーク", tz: "America/New_York" },
    { name: "ロンドン", tz: "Europe/London" },
    { name: "パリ", tz: "Europe/Paris" },
    { name: "シドニー", tz: "Australia/Sydney" },
    { name: "ドバイ", tz: "Australia/Sydney" }, // Fixed timezone later
  ];

  cities[5].tz = "Asia/Dubai";

  return (
    <ToolPageLayout title="世界時計" maxWidth="4xl">
      <ToolPanel>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cities.map((city) => {
            const formatter = new Intl.DateTimeFormat("ja-JP", {
              timeZone: city.tz,
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });
            const parts = formatter.formatToParts(time);
            const dateStr = `${parts.find((p) => p.type === "year")?.value}/${parts.find((p) => p.type === "month")?.value}/${parts.find((p) => p.type === "day")?.value}`;
            const timeStr = `${parts.find((p) => p.type === "hour")?.value}:${parts.find((p) => p.type === "minute")?.value}:${parts.find((p) => p.type === "second")?.value}`;

            return (
              <div key={city.name} className={`p-5 rounded-xl text-center ${blockCls}`}>
                <h2 className="text-xl font-bold mb-2">{city.name}</h2>
                <div className={`text-sm mb-1 ${mutedTextCls}`}>{dateStr}</div>
                <div className="text-3xl font-mono font-bold text-blue-500">{timeStr}</div>
              </div>
            );
          })}
        </div>
      </ToolPanel>
    </ToolPageLayout>
  );
}
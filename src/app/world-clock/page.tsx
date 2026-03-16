"use client";

import React, { useState, useEffect } from "react";

import { ToolStickyHeader } from "@/components/ToolStickyHeader";
export default function WorldClockPage() {
  const [time, setTime] = useState(new Date());

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
    <>
      <ToolStickyHeader title="世界時計" className="bg-gray-800 text-white" />
      <div className="max-w-4xl mx-auto p-6 rounded-xl shadow-lg border border-opacity-20 border-current bg-white/10 backdrop-blur-sm mt-4">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map(city => {
          const formatter = new Intl.DateTimeFormat('ja-JP', {
            timeZone: city.tz,
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
          });
          const parts = formatter.formatToParts(time);
          const dateStr = `${parts.find(p=>p.type==='year')?.value}/${parts.find(p=>p.type==='month')?.value}/${parts.find(p=>p.type==='day')?.value}`;
          const timeStr = `${parts.find(p=>p.type==='hour')?.value}:${parts.find(p=>p.type==='minute')?.value}:${parts.find(p=>p.type==='second')?.value}`;

          return (
            <div key={city.name} className="p-6 rounded-xl bg-black/20 text-center">
              <h2 className="text-xl font-bold mb-2 opacity-90">{city.name}</h2>
              <div className="text-sm opacity-70 mb-1">{dateStr}</div>
              <div className="text-3xl font-mono font-bold text-blue-400">{timeStr}</div>
            </div>
          )
        })}
      </div>
    </div>
  </>
);
}
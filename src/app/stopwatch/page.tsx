"use client";

import React, { useState, useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function StopwatchPage() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const { primaryBtnCls, secondaryBtnCls, blockCls, mutedTextCls } = useToolTheme();

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isRunning) {
      intervalId = setInterval(() => setTime((time) => time + 10), 10);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, time]);

  const hours = Math.floor(time / 3600000);
  const minutes = Math.floor((time % 3600000) / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  const milliseconds = Math.floor((time % 1000) / 10);

  const startAndStop = () => {
    setIsRunning(!isRunning);
  };

  const reset = () => {
    setTime(0);
    setLaps([]);
  };

  const lap = () => {
    setLaps([...laps, time]);
  };

  return (
    <ToolPageLayout title="ストップウォッチ" maxWidth="md">
      <ToolPanel className="space-y-6">
        <div className="text-center">
          <div className="text-5xl font-mono font-bold tracking-wider">
            {hours > 0 && `${hours.toString().padStart(2, "0")}:`}
            {minutes.toString().padStart(2, "0")}:
            {seconds.toString().padStart(2, "0")}.
            <span className="text-3xl text-blue-500">{milliseconds.toString().padStart(2, "0")}</span>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <button onClick={startAndStop} className={`px-8 py-3 rounded-lg font-bold transition-colors ${primaryBtnCls}`}>
            {isRunning ? "停止" : "開始"}
          </button>
          <button onClick={isRunning ? lap : reset} className={`px-8 py-3 rounded-lg font-bold transition-colors ${secondaryBtnCls}`}>
            {isRunning ? "ラップ" : "リセット"}
          </button>
        </div>

        {laps.length > 0 && (
          <div className={`rounded-xl p-4 max-h-[300px] overflow-y-auto ${blockCls}`}>
            <h2 className="text-lg font-semibold mb-3">ラップタイム</h2>
            <div className="flex flex-col gap-2">
              {laps.map((lapTime, index) => {
                const l_min = Math.floor((lapTime % 3600000) / 60000);
                const l_sec = Math.floor((lapTime % 60000) / 1000);
                const l_ms = Math.floor((lapTime % 1000) / 10);
                return (
                  <div key={index} className={`flex justify-between p-3 rounded-lg font-mono ${blockCls}`}>
                    <span className={mutedTextCls}>ラップ {laps.length - index}</span>
                    <span>
                      {l_min.toString().padStart(2, "0")}:
                      {l_sec.toString().padStart(2, "0")}.
                      {l_ms.toString().padStart(2, "0")}
                    </span>
                  </div>
                );
              }).reverse()}
            </div>
          </div>
        )}
      </ToolPanel>
    </ToolPageLayout>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function PomodoroPage() {
  const [time, setTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const { primaryBtnCls, secondaryBtnCls, blockCls, mutedTextCls } = useToolTheme();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else if (time === 0) {
      // 終わった時
      setIsRunning(false);
      if (!isBreak) {
        setTime(5 * 60); // 休憩5分
        setIsBreak(true);
      } else {
        setTime(25 * 60); // 作業25分
        setIsBreak(false);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, time, isBreak]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTime(25 * 60);
  };

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <ToolPageLayout title="ポモドーロタイマー" maxWidth="md">
      <ToolPanel className="space-y-6 text-center">
        <div className={`rounded-xl p-4 ${blockCls}`}>
          <h2 className={`text-xl font-bold ${isBreak ? "text-green-500" : "text-red-500"}`}>
            {isBreak ? "休憩時間 (Break)" : "作業時間 (Work)"}
          </h2>
          <p className={`text-sm mt-1 ${mutedTextCls}`}>25分作業 + 5分休憩を自動切替します。</p>
        </div>

        <div className="text-7xl font-mono font-bold tracking-wider">
          {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={toggleTimer}
            className={`px-8 py-3 rounded-lg font-bold transition-colors ${primaryBtnCls}`}
          >
            {isRunning ? "一時停止" : "開始"}
          </button>
          <button
            onClick={resetTimer}
            className={`px-8 py-3 rounded-lg font-bold transition-colors ${secondaryBtnCls}`}
          >
            リセット
          </button>
        </div>
      </ToolPanel>
    </ToolPageLayout>
  );
}
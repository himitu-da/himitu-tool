"use client";

import React, { useState, useEffect } from "react";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function RepeatTimerPage() {
  const [timeSetting, setTimeSetting] = useState(10);
  const [time, setTime] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [repeatCount, setRepeatCount] = useState(0);
  const { primaryBtnCls, secondaryBtnCls, blockCls, mutedTextCls } = useToolTheme();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else if (time === 0 && isRunning) {
      setRepeatCount(c => c + 1);
      setTime(timeSetting); // Auto repeat
    }
    return () => clearInterval(interval);
  }, [isRunning, time, timeSetting]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTime(timeSetting);
    setRepeatCount(0);
  };

  const applySetting = (val: number) => {
    setTimeSetting(val);
    setTime(val);
    setIsRunning(false);
    setRepeatCount(0);
  };

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <ToolPageLayout title="リピートタイマー" maxWidth="md">
      <ToolPanel className="space-y-6 text-center">
        <div className="flex justify-center flex-wrap gap-2">
          {[10, 30, 60, 300].map((sec) => (
            <button
              key={sec}
              onClick={() => applySetting(sec)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${secondaryBtnCls}`}
            >
              {sec >= 60 ? `${sec / 60}分` : `${sec}秒`}
            </button>
          ))}
        </div>

        <div className={`rounded-xl p-4 ${blockCls}`}>
          <span className={`text-sm ${mutedTextCls}`}>リピート回数</span>
          <div className="text-3xl font-bold">{repeatCount}</div>
        </div>

        <div className="text-7xl font-mono font-bold tracking-wider">
          {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
        </div>

        <div className="flex justify-center gap-3">
          <button onClick={toggleTimer} className={`px-8 py-3 rounded-lg font-bold transition-colors ${primaryBtnCls}`}>
            {isRunning ? "一時停止" : "開始"}
          </button>
          <button onClick={resetTimer} className={`px-8 py-3 rounded-lg font-bold transition-colors ${secondaryBtnCls}`}>
            リセット
          </button>
        </div>
      </ToolPanel>
    </ToolPageLayout>
  );
}
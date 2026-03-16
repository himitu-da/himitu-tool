"use client";

import React, { useState, useEffect } from "react";

import { ToolStickyHeader } from "@/components/ToolStickyHeader";
export default function PomodoroPage() {
  const [time, setTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

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
    <>
      <ToolStickyHeader title="ポモドーロタイマー" className="bg-gray-800 text-white" />
      <div className="max-w-md mx-auto p-6 rounded-xl shadow-lg border border-opacity-20 border-current bg-white/10 backdrop-blur-sm mt-4">
      
      <div className="text-center mb-6">
        <h2 className={`text-xl font-bold ${isBreak ? 'text-green-400' : 'text-red-400'}`}>
          {isBreak ? '休憩時間 (Break)' : '作業時間 (Work)'}
        </h2>
      </div>

      <div className="text-center mb-8">
        <div className="text-7xl font-mono font-bold tracking-wider">
          {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={toggleTimer}
          className={`px-8 py-3 rounded-full font-bold text-white transition-colors ${
            isRunning ? "bg-orange-500/80 hover:bg-orange-600/80" : "bg-blue-500/80 hover:bg-blue-600/80"
          }`}
        >
          {isRunning ? "一時停止" : "開始"}
        </button>
        <button
          onClick={resetTimer}
          className="px-8 py-3 rounded-full font-bold bg-gray-500/50 hover:bg-gray-600/50 transition-colors"
        >
          リセット
        </button>
      </div>
    </div>
  </>
);
}
"use client";

import React, { useState, useEffect } from "react";

export default function RepeatTimerPage() {
  const [timeSetting, setTimeSetting] = useState(10);
  const [time, setTime] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [repeatCount, setRepeatCount] = useState(0);

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
    <div className="max-w-md mx-auto p-6 rounded-xl shadow-lg border border-opacity-20 border-current bg-white/10 backdrop-blur-sm">
      <h1 className="text-2xl font-bold mb-6 text-center">リピートタイマー</h1>
      
      <div className="flex justify-center gap-2 mb-6">
        {[10, 30, 60, 300].map(sec => (
          <button
            key={sec}
            onClick={() => applySetting(sec)}
            className="px-4 py-2 rounded bg-black/20 hover:bg-black/30 transition-colors text-sm"
          >
            {sec >= 60 ? `${sec/60}分` : `${sec}秒`}
          </button>
        ))}
      </div>

      <div className="text-center mb-4">
        <span className="text-lg opacity-80">リピート回数: </span>
        <span className="text-2xl font-bold text-blue-400">{repeatCount}</span>
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
  );
}

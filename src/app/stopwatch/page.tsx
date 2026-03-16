"use client";

import React, { useState, useEffect } from "react";

import { ToolStickyHeader } from "@/components/ToolStickyHeader";
export default function StopwatchPage() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

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
    <>
      <ToolStickyHeader title="ストップウォッチ" className="bg-gray-800 text-white" />
      <div className="max-w-md mx-auto p-6 rounded-xl shadow-lg border border-opacity-20 border-current bg-white/10 backdrop-blur-sm mt-4">

      <div className="text-center mb-8">
        <div className="text-5xl font-mono font-bold tracking-wider">
          {hours > 0 && `${hours.toString().padStart(2, "0")}:`}
          {minutes.toString().padStart(2, "0")}:
          {seconds.toString().padStart(2, "0")}.
          <span className="text-3xl text-blue-400">{milliseconds.toString().padStart(2, "0")}</span>
        </div>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={startAndStop}
          className={`px-8 py-3 rounded-full font-bold text-white transition-colors ${
            isRunning ? "bg-red-500/80 hover:bg-red-600/80" : "bg-green-500/80 hover:bg-green-600/80"
          }`}
        >
          {isRunning ? "停止" : "開始"}
        </button>
        <button
          onClick={isRunning ? lap : reset}
          className="px-8 py-3 rounded-full font-bold bg-gray-500/50 hover:bg-gray-600/50 transition-colors"
        >
          {isRunning ? "ラップ" : "リセット"}
        </button>
      </div>

      {laps.length > 0 && (
        <div className="mt-8 border-t border-opacity-20 border-current pt-4 max-h-[300px] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">ラップタイム</h2>
          <div className="flex flex-col gap-2">
            {laps.map((lapTime, index) => {
              const l_min = Math.floor((lapTime % 3600000) / 60000);
              const l_sec = Math.floor((lapTime % 60000) / 1000);
              const l_ms = Math.floor((lapTime % 1000) / 10);
              return (
                <div key={index} className="flex justify-between p-3 rounded-lg bg-black/10 font-mono">
                  <span>ラップ {laps.length - index}</span>
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
    </div>
  </>
);
}
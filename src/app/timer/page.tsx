"use client";

import React, { useState, useEffect, useRef } from 'react';

import { useTheme } from '../ThemeProvider';
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";
import { dseg7ClassicBold } from "@/lib/digitalFonts";

type FontKind = 'default' | 'roman' | 'digital';

interface Settings {
  defaultMinutes: number;
  defaultSeconds: number;
  alarmSound: string;
  volume: number;
  enableMilliseconds: boolean;
  muted: boolean;
  fontFamily: FontKind;
}

export default function TimerPage() {
  const { theme, mounted: isClient } = useTheme();
  const { pageCls, panelCls, blockCls } = useToolTheme();

  // Timer States
  const [isRunning, setIsRunning] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(5);
  const [inputSeconds, setInputSeconds] = useState(0);
  const [initialMinutes, setInitialMinutes] = useState(5);
  const [initialSeconds, setInitialSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300000); // in milliseconds

  // Settings & UI States
  const [settings, setSettings] = useState<Settings>({
    defaultMinutes: 5,
    defaultSeconds: 0,
    alarmSound: '/alarm.mp3',
    volume: 1,
    enableMilliseconds: false,
    muted: false,
    fontFamily: 'digital'
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // 1. Load Settings on Mount (Client-side only)
  useEffect(() => {
    const savedMins = localStorage.getItem('timerDefaultMinutes');
    const savedSecs = localStorage.getItem('timerDefaultSeconds');
    const savedAlarm = localStorage.getItem('timerAlarmSound') || '/alarm.mp3';
    const savedVolume = localStorage.getItem('timerVolume') || '1';
    const savedEnableMs = localStorage.getItem('timerEnableMilliseconds') === 'true';
    const savedMuted = localStorage.getItem('timerMuted') === 'true';
    const savedFont = localStorage.getItem('timerFontFamily') as FontKind | null;

    const defaultMins = savedMins !== null ? parseInt(savedMins, 10) : 5;
    const defaultSecs = savedSecs !== null ? parseInt(savedSecs, 10) : 0;

    setSettings({
      defaultMinutes: defaultMins,
      defaultSeconds: defaultSecs,
      alarmSound: savedAlarm,
      volume: parseFloat(savedVolume),
      enableMilliseconds: savedEnableMs,
      muted: savedMuted,
      fontFamily:
        savedFont === 'default' || savedFont === 'roman' || savedFont === 'digital'
          ? savedFont
          : 'digital'
    });

    setInputMinutes(defaultMins);
    setInputSeconds(defaultSecs);
    setInitialMinutes(defaultMins);
    setInitialSeconds(defaultSecs);
    setTimeLeft((defaultMins * 60 + defaultSecs) * 1000);
  }, []);

  // 2. Audio Effects
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = settings.volume;
      audioRef.current.muted = settings.muted;
      audioRef.current.src = settings.alarmSound;
    }
  }, [settings.volume, settings.muted, settings.alarmSound]);

  // 3. Timer Interval Logic
  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      if (!isRunning || !endTimeRef.current) return;
      const now = Date.now();
      const remain = endTimeRef.current - now;

      if (remain <= 0) {
        setTimeLeft(0);
        setIsRunning(false);
        if (audioRef.current && !settings.muted) {
          audioRef.current.play().catch(e => console.error("Alarm error:", e));
        }
        return;
      }

      setTimeLeft(remain);
      animationFrameId = requestAnimationFrame(tick);
    };

    if (isRunning) {
      animationFrameId = requestAnimationFrame(tick);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning, settings.muted]);

  // --- Handlers ---
  const handleStart = () => {
    if (isRunning) return;

    let currentLeftMs = timeLeft;
    // If timer is at 0, reset to input values
    if (currentLeftMs <= 0) {
      currentLeftMs = (inputMinutes * 60 + inputSeconds) * 1000;
      setInitialMinutes(inputMinutes);
      setInitialSeconds(inputSeconds);
    }

    if (currentLeftMs <= 0) return; // Still 0 after check? Do nothing.

    endTimeRef.current = Date.now() + currentLeftMs;
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    // timeLeft is already up-to-date due to tick updates
  };

  const handleReset = () => {
    setIsRunning(false);
    const totalMs = (inputMinutes * 60 + inputSeconds) * 1000;
    setTimeLeft(totalMs);
    setInitialMinutes(inputMinutes);
    setInitialSeconds(inputSeconds);
  };

  const handleAdjustTime = (amount: number) => {
    if (isRunning) return;
    let newSecs = inputMinutes * 60 + inputSeconds + amount;
    if (newSecs < 0) newSecs = 0;
    if (newSecs > 5999) newSecs = 5999;
    const m = Math.floor(newSecs / 60);
    const s = newSecs % 60;
    setInputMinutes(m);
    setInputSeconds(s);
    setTimeLeft(newSecs * 1000);
    setInitialMinutes(m);
    setInitialSeconds(s);
  };

  const updateSettingStore = (key: keyof Settings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    const mapping: Record<string, string> = {
      defaultMinutes: 'timerDefaultMinutes',
      defaultSeconds: 'timerDefaultSeconds',
      alarmSound: 'timerAlarmSound',
      volume: 'timerVolume',
      enableMilliseconds: 'timerEnableMilliseconds',
      muted: 'timerMuted',
      fontFamily: 'timerFontFamily'
    };
    if (mapping[key as string]) localStorage.setItem(mapping[key as string], String(value));
  };

  const timerFontClassName =
    settings.fontFamily === 'digital'
      ? dseg7ClassicBold.className
      : settings.fontFamily === 'roman'
      ? 'font-serif'
      : 'font-sans';

  // --- Theme Style Helpers ---
  const getButtonHoverClasses = () => {
    switch (theme) {
      case 'dark': return 'hover:bg-white/10';
      case 'ocean': return 'hover:bg-white/10';
      default: return 'hover:bg-black/5';
    }
  };

  const getNumberInputClasses = () => {
    switch (theme) {
      case 'dark': return 'bg-gray-700 border-gray-600 focus:ring-blue-500 text-white';
      case 'ocean': return 'bg-cyan-700 border-cyan-600 focus:ring-cyan-300 text-cyan-50';
      default: return 'bg-white border text-gray-900 border-gray-300 focus:ring-blue-500 shadow-sm';
    }
  };

  const getRangeSliderClasses = () => {
    switch (theme) {
      case 'dark': return 'bg-gray-700 accent-blue-500';
      case 'ocean': return 'bg-cyan-700 accent-cyan-400';
      default: return 'bg-blue-100 accent-blue-500';
    }
  };

  const getSettingItemClasses = () => {
    switch (theme) {
      case 'dark': return 'bg-gray-800 border-gray-700 text-white';
      case 'ocean': return 'bg-cyan-800 border-cyan-700 text-cyan-50';
      default: return 'bg-white border-gray-200 shadow-sm text-gray-900';
    }
  };

  // --- Display Calculations ---
  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    const milli = Math.floor(ms % 1000);
    const formatted = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    if (settings.enableMilliseconds) {
      return `${formatted}.${String(milli).padStart(3, '0')}`;
    }
    return formatted;
  };

  const currentTotalTime = isRunning ? (initialMinutes * 60 + initialSeconds) * 1000 : (inputMinutes * 60 + inputSeconds) * 1000;
  const progress = currentTotalTime > 0 ? (timeLeft / currentTotalTime) : 0;
  const isSettingsDisabled = isRunning || (!isRunning && timeLeft > 0 && timeLeft < (initialMinutes * 60 + initialSeconds) * 1000);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  let strokeColor = '#28a745';
  if (progress * 100 < 20) strokeColor = '#dc3545';
  else if (progress * 100 < 50) strokeColor = '#ffc107';

  // Return Loading state to avoid Hydration issues
  if (!isClient) return <div className="min-h-screen bg-gray-50 text-gray-900" />;

  return (
    <ToolPageLayout
      title="タイマーツール"
      maxWidth="2xl"
      headerRightSlot={
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
          title="設定"
          aria-label="設定を開く"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      }
    >
      <ToolPanel className="flex flex-col items-center justify-center w-full min-h-[60vh] max-w-xl mx-auto my-4 sm:my-8 relative overflow-hidden">

        {/* Timer UI (Ring & Display) */}
        <div
          className="relative w-80 h-80 mx-auto my-6 flex justify-center items-center select-none"
          onContextMenu={(e) => {
            e.preventDefault();
            setIsQuickSettingsOpen(true);
          }}
          onDoubleClick={() => isRunning ? handleStop() : handleStart()}
          onTouchStart={(e) => touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }}
          onTouchEnd={(e) => {
            if (!touchStartRef.current) return;
            const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
            const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
            if (Math.abs(dx) > 50) {
              if (!isSettingsDisabled) handleAdjustTime(dx > 0 ? 10 : -10); // L/R Swipe
            }
            else if (Math.abs(dy) > 50) setIsSettingsOpen(dy < 0); // U/D Swipe
            touchStartRef.current = null;
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFullScreen(true);
            }}
            className="absolute top-0 right-0 z-20 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none"
            title="全画面表示"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
          </button>
          <svg width="100%" height="100%" viewBox="0 0 120 120" className="absolute top-0 left-0 -rotate-90">
            <circle
              cx="60" cy="60" r={radius} fill="transparent"
              stroke={theme === 'dark' ? '#333' : '#e0e0e0'} strokeWidth="8"
            />
            <circle
              cx="60" cy="60" r={radius} fill="transparent"
              stroke={strokeColor} strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className={`z-10 ${settings.enableMilliseconds ? 'text-3xl sm:text-4xl' : 'text-5xl sm:text-6xl'} font-bold tracking-widest transition-transform duration-300 ${timerFontClassName} ${isRunning ? 'scale-105 opacity-90' : 'scale-100 opacity-100'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Time Inputs & Sliders */}
        <div className={`w-full max-w-sm mx-auto p-5 rounded-2xl mb-8 ${blockCls} ${isSettingsDisabled ? 'opacity-50 pointer-events-none transition-opacity duration-300' : ''}`}>
          {/* Minutes */}
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold opacity-80">分:</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isSettingsDisabled) return;
                  const val = Math.max(0, inputMinutes - 1);
                  setInputMinutes(val);
                  setTimeLeft((val * 60 + inputSeconds) * 1000);
                  setInitialMinutes(val);
                  setInitialSeconds(inputSeconds);
                }}
                disabled={isSettingsDisabled}
                className={`w-8 h-8 flex items-center justify-center rounded-full disabled:opacity-50 transition active:scale-95 ${getButtonHoverClasses()}`}
              >

                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></button>
              <input
                type="number" min="0" max="99"
                value={inputMinutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  const newMin = Math.min(99, val);
                  setInputMinutes(newMin);
                  if (!isSettingsDisabled) {
                    setTimeLeft((newMin * 60 + inputSeconds) * 1000);
                    setInitialMinutes(newMin);
                    setInitialSeconds(inputSeconds);
                  }
                }}
                disabled={isSettingsDisabled}
                className={`w-16 p-1 text-center font-bold text-lg rounded-lg outline-none focus:ring-2 relative z-10 transition [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${getNumberInputClasses()}`}
              />
              <button
                onClick={() => {
                  if (isSettingsDisabled) return;
                  const val = Math.min(99, inputMinutes + 1);
                  setInputMinutes(val);
                  setTimeLeft((val * 60 + inputSeconds) * 1000);
                  setInitialMinutes(val);
                  setInitialSeconds(inputSeconds);
                }}
                disabled={isSettingsDisabled}
                className={`w-8 h-8 flex items-center justify-center rounded-full disabled:opacity-50 transition active:scale-95 ${getButtonHoverClasses()}`}
              >

                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg></button>
            </div>
          </div>
          <input
            type="range" min="0" max="99"
            value={inputMinutes}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              setInputMinutes(val);
              if (!isSettingsDisabled) {
                setTimeLeft((val * 60 + inputSeconds) * 1000);
                setInitialMinutes(val);
                setInitialSeconds(inputSeconds);
              }
            }}
            disabled={isSettingsDisabled}
            className={`w-full h-2 mb-6 rounded-lg appearance-none cursor-pointer ${getRangeSliderClasses()}`}
          />

          {/* Seconds */}
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold opacity-80">秒:</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isSettingsDisabled) return;
                  const val = Math.max(0, inputSeconds - 1);
                  setInputSeconds(val);
                  setTimeLeft((inputMinutes * 60 + val) * 1000);
                  setInitialMinutes(inputMinutes);
                  setInitialSeconds(val);
                }}
                disabled={isSettingsDisabled}
                className={`w-8 h-8 flex items-center justify-center rounded-full disabled:opacity-50 transition active:scale-95 ${getButtonHoverClasses()}`}
              >

                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg></button>
              <input
                type="number" min="0" max="59"
                value={inputSeconds}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  const newSec = Math.min(59, val);
                  setInputSeconds(newSec);
                  if (!isSettingsDisabled) {
                    setTimeLeft((inputMinutes * 60 + newSec) * 1000);
                    setInitialMinutes(inputMinutes);
                    setInitialSeconds(newSec);
                  }
                }}
                disabled={isSettingsDisabled}
                className={`w-16 p-1 text-center font-bold text-lg rounded-lg outline-none focus:ring-2 relative z-10 transition [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${getNumberInputClasses()}`}
              />
              <button
                onClick={() => {
                  if (isSettingsDisabled) return;
                  const val = Math.min(59, inputSeconds + 1);
                  setInputSeconds(val);
                  setTimeLeft((inputMinutes * 60 + val) * 1000);
                  setInitialMinutes(inputMinutes);
                  setInitialSeconds(val);
                }}
                disabled={isSettingsDisabled}
                className={`w-8 h-8 flex items-center justify-center rounded-full disabled:opacity-50 transition active:scale-95 ${getButtonHoverClasses()}`}
              >

                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg></button>
            </div>
          </div>
          <input
            type="range" min="0" max="59"
            value={inputSeconds}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              setInputSeconds(val);
              if (!isSettingsDisabled) {
                setTimeLeft((inputMinutes * 60 + val) * 1000);
                setInitialMinutes(inputMinutes);
                setInitialSeconds(val);
              }
            }}
            disabled={isSettingsDisabled}
            className={`w-full h-2 mb-2 rounded-lg appearance-none cursor-pointer ${getRangeSliderClasses()}`}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4 mb-4">
          <button onClick={handleStart} disabled={isRunning} className="flex items-center gap-2 px-6 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 20 12 6 21 6 3" /></svg>
            スタート
          </button>
          <button onClick={handleStop} disabled={!isRunning} className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /></svg>
            ストップ
          </button>
          <button onClick={handleReset} className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all transform active:scale-95 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
            リセット
          </button>
        </div>
      </ToolPanel>

      <audio ref={audioRef} preload="auto" />

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity" onClick={() => setIsSettingsOpen(false)}>
          <div
            className={`relative w-full max-w-lg p-6 rounded-3xl shadow-2xl transition-all ${panelCls}`}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setIsSettingsOpen(false)} className={`absolute top-4 right-4 transition-colors ${theme === 'light' ? 'text-gray-500 hover:text-gray-800' : 'text-gray-400 hover:text-white'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
            <h2 className="text-2xl font-bold mb-6">設定</h2>

            <div className={`flex border-b mb-6 overflow-x-auto select-none ${theme === 'light' ? 'border-gray-300' : 'border-gray-600'}`}>
              {['basic', 'sound', 'advanced'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium border-b-2 whitespace-nowrap outline-none transition-colors ${activeTab === tab ? 'border-blue-500 text-blue-500' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  {tab === 'basic' && '基本設定'}
                  {tab === 'sound' && '音声'}
                  {tab === 'advanced' && '詳細'}
                </button>
              ))}
            </div>

            <div className="py-2 h-64 overflow-y-auto pr-2">
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <h3 className={`font-semibold text-lg border-b border-opacity-20 pb-2 ${theme === 'light' ? 'border-gray-300' : 'border-gray-600'}`}>基本設定</h3>
                  <div className={`flex justify-between items-center p-3 rounded-lg border ${getSettingItemClasses()}`}>
                    <label>デフォルト時間（分）:</label>
                    <input type="number" min="0" max="99" value={settings.defaultMinutes} onChange={e => {
                      const val = parseInt(e.target.value) || 0;
                      const validMin = Math.min(99, val);
                      updateSettingStore('defaultMinutes', validMin);
                      if (!isRunning) {
                        setInputMinutes(validMin);
                        setTimeLeft((validMin * 60 + inputSeconds) * 1000);
                        setInitialMinutes(validMin);
                      }
                    }} className={`w-20 p-2 text-center rounded-md ${getNumberInputClasses()}`} />
                  </div>
                  <div className={`flex justify-between items-center p-3 rounded-lg border ${getSettingItemClasses()}`}>
                    <label>デフォルト時間（秒）:</label>
                    <input type="number" min="0" max="59" value={settings.defaultSeconds} onChange={e => {
                      const val = parseInt(e.target.value) || 0;
                      const validSec = Math.min(59, val);
                      updateSettingStore('defaultSeconds', validSec);
                      if (!isRunning) {
                        setInputSeconds(validSec);
                        setTimeLeft((inputMinutes * 60 + validSec) * 1000);
                        setInitialSeconds(validSec);
                      }
                    }} className={`w-20 p-2 text-center rounded-md ${getNumberInputClasses()}`} />
                  </div>
                  <div className={`flex justify-between items-center p-3 rounded-lg border ${getSettingItemClasses()}`}>
                    <label>表示フォント:</label>
                    <select
                      value={settings.fontFamily}
                      onChange={(e) => updateSettingStore('fontFamily', e.target.value as FontKind)}
                      className={`w-40 p-2 rounded-md focus:outline-none ${getNumberInputClasses()}`}
                    >
                      <option value="digital">デジタル数字</option>
                      <option value="roman">ローマン体</option>
                      <option value="default">デフォルト</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'sound' && (
                <div className="space-y-6">
                  <h3 className={`font-semibold text-lg border-b border-opacity-20 pb-2 ${theme === 'light' ? 'border-gray-300' : 'border-gray-600'}`}>音声設定</h3>
                  <div className={`flex justify-between items-center p-3 rounded-lg border ${getSettingItemClasses()}`}>
                    <label>アラーム音:</label>
                    <select
                      value={settings.alarmSound}
                      onChange={(e) => updateSettingStore('alarmSound', e.target.value)}
                      className={`p-2 rounded-md focus:outline-none ${getNumberInputClasses()}`}
                    >
                      <option value="/alarm.mp3">デフォルト</option>
                      <option value="/alarm2.mp3">サウンド2</option>
                      <option value="/alarm3.mp3">サウンド3</option>
                    </select>
                  </div>
                  <div className={`p-4 rounded-lg border space-y-3 ${getSettingItemClasses()}`}>
                    <div className="flex justify-between items-center">
                      <label>音量:</label>
                      <span className="font-bold">{Math.round(settings.volume * 100)}%</span>
                    </div>
                    <input
                      type="range" min="0" max="1" step="0.1"
                      value={settings.volume}
                      onChange={e => updateSettingStore('volume', parseFloat(e.target.value))}
                      className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${getRangeSliderClasses()}`}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <h3 className={`font-semibold text-lg border-b border-opacity-20 pb-2 ${theme === 'light' ? 'border-gray-300' : 'border-gray-600'}`}>詳細設定</h3>
                  <div className={`flex items-center justify-between p-4 rounded-lg border ${getSettingItemClasses()}`}>
                    <label>ミリ秒表示を有効にする:</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enableMilliseconds}
                        onChange={e => updateSettingStore('enableMilliseconds', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className={`w-14 h-7 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-500 ${theme === 'light' ? 'bg-gray-300' : 'bg-gray-600'}`}></div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Settings Context Menu */}
      {isQuickSettingsOpen && (
        <div className="fixed inset-0 z-40 transition-opacity" onClick={() => setIsQuickSettingsOpen(false)} onContextMenu={(e) => e.preventDefault()}>
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden ${panelCls}`}
            onClick={e => e.stopPropagation()}
          >
            <button className={`w-full text-left px-5 py-3 transition-colors font-semibold ${getButtonHoverClasses()}`} onClick={() => {
              if (!isRunning) { setInputMinutes(5); setInputSeconds(0); setTimeLeft(300000); setInitialMinutes(5); setInitialSeconds(0); }
              setIsQuickSettingsOpen(false);
            }}>5分セット</button>

            <button className={`w-full text-left px-5 py-3 transition-colors font-semibold ${getButtonHoverClasses()}`} onClick={() => {
              if (!isRunning) { setInputMinutes(10); setInputSeconds(0); setTimeLeft(600000); setInitialMinutes(10); setInitialSeconds(0); }
              setIsQuickSettingsOpen(false);
            }}>10分セット</button>

            <div className={`h-px w-full my-1 ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'}`} />


            <button className={`w-full text-left px-5 py-3 transition-colors flex items-center justify-between ${getButtonHoverClasses()}`} onClick={() => {
              updateSettingStore('muted', !settings.muted);
              setIsQuickSettingsOpen(false);
            }}>
              サウンド
              <span className={`text-sm font-bold px-2 py-1 rounded ${settings.muted ? (theme === 'light' ? 'bg-red-100 text-red-600' : 'bg-red-900/30 text-red-600') : (theme === 'light' ? 'bg-green-100 text-green-600' : 'bg-green-900/30 text-green-600')}`}>
                {settings.muted ? 'OFF' : 'ON'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Full Screen Mode */}
      {isFullScreen && (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 transition-colors duration-300 ${pageCls}`}>
          {/* Close Full Screen Button */}
          <button
            onClick={() => setIsFullScreen(false)}
            className="absolute top-6 right-6 p-3 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none z-50"
            title="元に戻す"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
            </svg>
          </button>

          {/* Large Timer Display */}
          <div
            className="relative w-full max-w-[80vh] aspect-square flex justify-center items-center select-none"
            onDoubleClick={() => isRunning ? handleStop() : handleStart()}
          >
            <svg width="100%" height="100%" viewBox="0 0 120 120" className="absolute top-0 left-0 -rotate-90">
              <circle
                cx="60" cy="60" r={radius} fill="transparent"
                stroke={theme === 'dark' ? '#333' : '#e0e0e0'} strokeWidth="4"
              />
              <circle
                cx="60" cy="60" r={radius} fill="transparent"
                stroke={strokeColor} strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className={`z-10 ${settings.enableMilliseconds ? 'text-[8vw] sm:text-[10vh]' : 'text-[12vw] sm:text-[15vh]'} font-bold tracking-widest transition-transform duration-300 ${timerFontClassName} ${isRunning ? 'scale-105 opacity-90' : 'scale-100 opacity-100'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Icon Only Buttons */}
          <div className="flex justify-center gap-8 mt-12 z-10">
            <button onClick={handleStart} disabled={isRunning} className="flex items-center justify-center w-20 h-20 rounded-full bg-green-600 hover:bg-green-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 shadow-lg" title="スタート">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 20 12 6 21 6 3" /></svg>
            </button>
            <button onClick={handleStop} disabled={!isRunning} className="flex items-center justify-center w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 shadow-lg" title="ストップ">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /></svg>
            </button>
            <button onClick={handleReset} className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all transform active:scale-95 shadow-lg" title="リセット">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
            </button>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}







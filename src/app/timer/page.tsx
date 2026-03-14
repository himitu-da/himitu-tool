"use client";

import React, { useState, useEffect, useRef } from 'react';

type Theme = 'default' | 'dark' | 'ocean';

interface Settings {
  defaultMinutes: number;
  defaultSeconds: number;
  theme: Theme;
  alarmSound: string;
  volume: number;
  enableMilliseconds: boolean;
  muted: boolean;
}

export default function TimerPage() {
  const [isClient, setIsClient] = useState(false);
  
  // Timer States
  const [isRunning, setIsRunning] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(5);
  const [inputSeconds, setInputSeconds] = useState(0);
  const [initialMinutes, setInitialMinutes] = useState(5);
  const [initialSeconds, setInitialSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);

  // Settings & UI States
  const [settings, setSettings] = useState<Settings>({
    defaultMinutes: 5,
    defaultSeconds: 0,
    theme: 'default',
    alarmSound: '/alarm.mp3',
    volume: 1,
    enableMilliseconds: false,
    muted: false
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // 1. Load Settings on Mount (Client-side only)
  useEffect(() => {
    setIsClient(true);
    const savedMins = localStorage.getItem('timerDefaultMinutes');
    const savedSecs = localStorage.getItem('timerDefaultSeconds');
    const savedTheme = localStorage.getItem('timerTheme') as Theme || 'default';
    const savedAlarm = localStorage.getItem('timerAlarmSound') || '/alarm.mp3';
    const savedVolume = localStorage.getItem('timerVolume') || '1';
    const savedEnableMs = localStorage.getItem('timerEnableMilliseconds') === 'true';
    const savedMuted = localStorage.getItem('timerMuted') === 'true';

    const defaultMins = savedMins !== null ? parseInt(savedMins, 10) : 5;
    const defaultSecs = savedSecs !== null ? parseInt(savedSecs, 10) : 0;

    setSettings({
      defaultMinutes: defaultMins,
      defaultSeconds: defaultSecs,
      theme: savedTheme,
      alarmSound: savedAlarm,
      volume: parseFloat(savedVolume),
      enableMilliseconds: savedEnableMs,
      muted: savedMuted
    });
    
    setInputMinutes(defaultMins);
    setInputSeconds(defaultSecs);
    setInitialMinutes(defaultMins);
    setInitialSeconds(defaultSecs);
    setTimeLeft(defaultMins * 60 + defaultSecs);
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
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            if (audioRef.current && !settings.muted) {
              audioRef.current.play().catch(e => console.error("Alarm error:", e));
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, settings.muted]);

  // --- Handlers ---
  const handleStart = () => {
    if (isRunning) return;
    const total = inputMinutes * 60 + inputSeconds;
    if (total <= 0) return;
    
    setInitialMinutes(inputMinutes);
    setInitialSeconds(inputSeconds);
    if (timeLeft === 0 || timeLeft !== total) setTimeLeft(total);
    setIsRunning(true);
  };

  const handleStop = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    const total = inputMinutes * 60 + inputSeconds;
    setTimeLeft(total);
    setInitialMinutes(inputMinutes);
    setInitialSeconds(inputSeconds);
  };

  const handleAdjustTime = (amount: number) => {
    if (isRunning) return;
    let newSecs = inputMinutes * 60 + inputSeconds + amount;
    if (newSecs < 0) newSecs = 0;
    const m = Math.floor(newSecs / 60);
    const s = newSecs % 60;
    setInputMinutes(m);
    setInputSeconds(s);
    setTimeLeft(newSecs);
    setInitialMinutes(m);
    setInitialSeconds(s);
  };

  const updateSettingStore = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    const mapping: Record<string, string> = {
      defaultMinutes: 'timerDefaultMinutes',
      defaultSeconds: 'timerDefaultSeconds',
      theme: 'timerTheme',
      alarmSound: 'timerAlarmSound',
      volume: 'timerVolume',
      enableMilliseconds: 'timerEnableMilliseconds',
      muted: 'timerMuted'
    };
    if (mapping[key as string]) localStorage.setItem(mapping[key as string], String(value));
  };

  // --- Theme Style Helpers ---
  const getThemeClasses = () => {
    switch (settings.theme) {
      case 'dark': return 'bg-gray-900 text-gray-100';
      case 'ocean': return 'bg-cyan-900 text-cyan-50';
      default: return 'bg-gray-50 text-gray-900';
    }
  };

  const getPanelClasses = () => {
    switch (settings.theme) {
      case 'dark': return 'bg-gray-800 shadow-black/40 border border-gray-700';
      case 'ocean': return 'bg-cyan-800 shadow-black/20 border border-cyan-700';
      default: return 'bg-white shadow-gray-200 border border-gray-100';
    }
  };

  // --- Display Calculations ---
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const totalTime = initialMinutes * 60 + initialSeconds;
  const progress = totalTime > 0 ? (timeLeft / totalTime) : 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;
  
  let strokeColor = '#28a745';
  if (progress * 100 < 20) strokeColor = '#dc3545';
  else if (progress * 100 < 50) strokeColor = '#ffc107';

  // Return Loading state to avoid Hydration issues
  if (!isClient) return <div className="min-h-screen bg-gray-50 text-gray-900" />;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${getThemeClasses()}`}>
      
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-gray-800 text-white shadow-md">
        <div>
          <h1 className="text-sm font-light opacity-80 hover:opacity-100 transition-opacity">
            <a href="/">ひみっちゃんのKAMIツール</a>
          </h1>
          <h2 className="text-xl font-bold mt-1">タイマーツール</h2>
        </div>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
          title="設定"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto flex flex-col items-center justify-center p-4">
        
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
            if (Math.abs(dx) > 50) handleAdjustTime(dx > 0 ? 10 : -10); // L/R Swipe
            else if (Math.abs(dy) > 50) setIsSettingsOpen(dy < 0); // U/D Swipe
            touchStartRef.current = null;
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 120 120" className="absolute top-0 left-0 -rotate-90">
            <circle 
              cx="60" cy="60" r={radius} fill="transparent" 
              stroke={settings.theme === 'dark' ? '#333' : '#e0e0e0'} strokeWidth="8"
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
          <div className={`z-10 text-6xl font-bold tracking-widest transition-transform duration-300 ${isRunning ? 'scale-105 opacity-90' : 'scale-100 opacity-100'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Time Inputs & Sliders */}
        <div className={`w-full max-w-sm mx-auto p-5 rounded-2xl shadow-lg mb-8 transition-colors duration-300 ${getPanelClasses()}`}>
          {/* Minutes */}
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold opacity-80">分:</label>
            <input 
              type="number" min="0" max="60" 
              value={inputMinutes}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setInputMinutes(val);
                if (!isRunning) setTimeLeft(val * 60 + inputSeconds);
              }}
              disabled={isRunning}
              className="w-16 p-1 text-center font-bold text-lg rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-black/5 dark:bg-black/20 text-inherit border border-transparent dark:border-gray-600 transition"
            />
          </div>
          <input 
            type="range" min="0" max="60"
            value={inputMinutes}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              setInputMinutes(val);
              if (!isRunning) setTimeLeft(val * 60 + inputSeconds);
            }}
            disabled={isRunning}
            className="w-full h-2 mb-6 rounded-lg appearance-none cursor-pointer accent-blue-500 bg-gray-200 dark:bg-gray-600"
          />

          {/* Seconds */}
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold opacity-80">秒:</label>
            <input 
              type="number" min="0" max="59" 
              value={inputSeconds}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setInputSeconds(val);
                if (!isRunning) setTimeLeft(inputMinutes * 60 + val);
              }}
              disabled={isRunning}
              className="w-16 p-1 text-center font-bold text-lg rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-black/5 dark:bg-black/20 text-inherit border border-transparent dark:border-gray-600 transition"
            />
          </div>
          <input 
            type="range" min="0" max="59"
            value={inputSeconds}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              setInputSeconds(val);
              if (!isRunning) setTimeLeft(inputMinutes * 60 + val);
            }}
            disabled={isRunning}
            className="w-full h-2 mb-2 rounded-lg appearance-none cursor-pointer accent-blue-500 bg-gray-200 dark:bg-gray-600"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4 mb-4">
          <button onClick={handleStart} disabled={isRunning} className="flex items-center gap-2 px-6 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>
            スタート
          </button>
          <button onClick={handleStop} disabled={!isRunning} className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
            ストップ
          </button>
          <button onClick={handleReset} className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all transform active:scale-95 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            リセット
          </button>
        </div>
      </main>

      <footer className="text-center p-6 text-sm opacity-70">
        <a href="https://hmts.jp" className="hover:underline text-blue-500 hover:text-blue-600">ひみっちゃんのKAMIサイト</a>
        <p className="mt-2">&copy; 2025 ひみっちゃん</p>
      </footer>

      <audio ref={audioRef} preload="auto" />

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity" onClick={() => setIsSettingsOpen(false)}>
          <div 
            className={`relative w-full max-w-lg p-6 rounded-2xl shadow-2xl transition-all ${settings.theme === 'dark' ? 'bg-gray-800 text-white' : settings.theme === 'ocean' ? 'bg-cyan-900 text-cyan-50' : 'bg-white text-gray-900'}`} 
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setIsSettingsOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <h2 className="text-2xl font-bold mb-6">設定</h2>
            
            <div className="flex border-b border-gray-300 dark:border-gray-700 mb-6 overflow-x-auto select-none">
              {['basic', 'theme', 'sound', 'advanced'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium border-b-2 whitespace-nowrap outline-none transition-colors ${activeTab === tab ? 'border-blue-500 text-blue-500' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  {tab === 'basic' && '基本設定'}
                  {tab === 'theme' && 'テーマ'}
                  {tab === 'sound' && '音声'}
                  {tab === 'advanced' && '詳細'}
                </button>
              ))}
            </div>

            <div className="py-2 h-64 overflow-y-auto pr-2">
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg border-b border-opacity-20 pb-2">基本設定</h3>
                  <div className="flex justify-between items-center bg-black/5 dark:bg-black/20 p-3 rounded-lg">
                    <label>デフォルト時間（分）:</label>
                    <input type="number" min="0" value={settings.defaultMinutes} onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        updateSettingStore('defaultMinutes', val);
                        if (!isRunning) {
                            setInputMinutes(val);
                            setTimeLeft(val * 60 + inputSeconds);
                            setInitialMinutes(val);
                        }
                    }} className="w-20 p-2 text-center border rounded-md bg-white dark:bg-gray-700 text-inherit" />
                  </div>
                  <div className="flex justify-between items-center bg-black/5 dark:bg-black/20 p-3 rounded-lg">
                    <label>デフォルト時間（秒）:</label>
                    <input type="number" min="0" max="59" value={settings.defaultSeconds} onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        updateSettingStore('defaultSeconds', val);
                        if (!isRunning) {
                            setInputSeconds(val);
                            setTimeLeft(inputMinutes * 60 + val);
                            setInitialSeconds(val);
                        }
                    }} className="w-20 p-2 text-center border rounded-md bg-white dark:bg-gray-700 text-inherit" />
                  </div>
                </div>
              )}

              {activeTab === 'theme' && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg border-b border-opacity-20 pb-2">テーマ設定</h3>
                  <div className="flex flex-col gap-4">
                    {['default', 'dark', 'ocean'].map(t => (
                      <label key={t} className="flex items-center gap-3 cursor-pointer bg-black/5 dark:bg-black/20 p-3 rounded-lg hover:bg-black/10 transition-colors">
                        <input 
                          type="radio" name="theme" value={t} 
                          checked={settings.theme === t}
                          onChange={(e) => updateSettingStore('theme', e.target.value)}
                          className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-lg">{t === 'default' ? 'デフォルト' : t === 'dark' ? 'ダーク' : 'オーシャン'}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'sound' && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg border-b border-opacity-20 pb-2">音声設定</h3>
                  <div className="flex justify-between items-center bg-black/5 dark:bg-black/20 p-3 rounded-lg">
                    <label>アラーム音:</label>
                    <select 
                      value={settings.alarmSound}
                      onChange={(e) => updateSettingStore('alarmSound', e.target.value)}
                      className="p-2 border rounded-md bg-white dark:bg-gray-700 text-inherit focus:outline-none"
                    >
                      <option value="/alarm.mp3">デフォルト</option>
                      <option value="/alarm2.mp3">サウンド2</option>
                      <option value="/alarm3.mp3">サウンド3</option>
                    </select>
                  </div>
                  <div className="bg-black/5 dark:bg-black/20 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <label>音量:</label>
                      <span className="font-bold">{Math.round(settings.volume * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.1" 
                      value={settings.volume}
                      onChange={e => updateSettingStore('volume', parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-500 bg-gray-300 dark:bg-gray-600"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg border-b border-opacity-20 pb-2">詳細設定</h3>
                  <div className="flex items-center justify-between bg-black/5 dark:bg-black/20 p-4 rounded-lg">
                    <label>ミリ秒表示を有効にする:</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.enableMilliseconds} 
                        onChange={e => updateSettingStore('enableMilliseconds', e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-500"></div>
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
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 rounded-xl shadow-2xl py-2 z-50 overflow-hidden ${settings.theme === 'dark' ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-gray-900 border border-gray-200'}`}
            onClick={e => e.stopPropagation()}
          >
            <button className="w-full text-left px-5 py-3 hover:bg-black/10 dark:hover:bg-white/10 transition-colors font-semibold" onClick={() => {
              if(!isRunning) { setInputMinutes(5); setInputSeconds(0); setTimeLeft(300); setInitialMinutes(5); setInitialSeconds(0); }
              setIsQuickSettingsOpen(false);
            }}>5分セット</button>
            
            <button className="w-full text-left px-5 py-3 hover:bg-black/10 dark:hover:bg-white/10 transition-colors font-semibold" onClick={() => {
              if(!isRunning) { setInputMinutes(10); setInputSeconds(0); setTimeLeft(600); setInitialMinutes(10); setInitialSeconds(0); }
              setIsQuickSettingsOpen(false);
            }}>10分セット</button>

            <div className="h-px w-full bg-gray-200 dark:bg-gray-700 my-1" />
            
            <button className="w-full text-left px-5 py-3 hover:bg-black/10 dark:hover:bg-white/10 transition-colors" onClick={() => {
              const themes: Theme[] = ['default', 'dark', 'ocean'];
              const nextIdx = (themes.indexOf(settings.theme) + 1) % themes.length;
              updateSettingStore('theme', themes[nextIdx]);
              setIsQuickSettingsOpen(false);
            }}>テーマ切替</button>
            
            <button className="w-full text-left px-5 py-3 hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center justify-between" onClick={() => {
              updateSettingStore('muted', !settings.muted);
              setIsQuickSettingsOpen(false);
            }}>
              サウンド
              <span className={`text-sm font-bold px-2 py-1 rounded ${settings.muted ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-green-100 text-green-600 dark:bg-green-900/30'}`}>
                {settings.muted ? 'OFF' : 'ON'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
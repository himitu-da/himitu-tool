"use client";

import React, { useEffect, useState } from "react";
import { Copy, ShieldCheck } from "lucide-react";

import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{}:;,.?/|~";
const AMBIGUOUS = "O0oIl1|`'\"";

const LENGTH_OPTIONS = [4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 48, 64, 128];
const COUNT_OPTIONS = [1, 5, 10, 20, 50, 100];

type SettingMode = "simple" | "detailed";
type SimplePatternId = "numbers" | "alphanumeric" | "symbols";
type StrengthLevel = "weak" | "fair" | "strong" | "excellent";

type GeneratorSettings = {
  length: number;
  count: number;
  includeLowercase: boolean;
  includeUppercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
  ensureEverySet: boolean;
  charset: string;
  isCharsetEdited: boolean;
};

type SimpleSettings = {
  pattern: SimplePatternId;
  lengthType: 6 | 8 | 12;
  excludeAmbiguous: boolean;
};

type GeneratedItem = {
  id: string;
  value: string;
  entropy: number;
  strength: StrengthLevel;
  detail: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function uniqueChars(value: string) {
  return Array.from(new Set(value.split(""))).join("");
}

function randomInt(maxExclusive: number) {
  if (maxExclusive <= 0) {
    throw new Error("maxExclusive must be positive");
  }

  const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
  const buffer = new Uint32Array(1);

  while (true) {
    if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.getRandomValues) {
      globalThis.crypto.getRandomValues(buffer);
    } else {
      buffer[0] = Math.floor(Math.random() * 0x100000000);
    }
    const value = buffer[0] ?? 0;
    if (value < limit) {
      return value % maxExclusive;
    }
  }
}

function pickRandomChar(source: string) {
  return source[randomInt(source.length)] ?? "";
}

function calculateEntropy(charsetLength: number, passwordLength: number) {
  if (charsetLength === 0 || passwordLength === 0) return 0;
  return Math.log2(charsetLength) * passwordLength;
}

function strengthFromEntropy(entropy: number): StrengthLevel {
  if (entropy < 40) return "weak";
  if (entropy < 60) return "fair";
  if (entropy < 90) return "strong";
  return "excellent";
}

function strengthLabel(level: StrengthLevel) {
  switch (level) {
    case "weak":
      return "弱い";
    case "fair":
      return "普通";
    case "strong":
      return "強い";
    case "excellent":
      return "非常に強い";
    default:
      return "普通";
  }
}

function strengthBadge(level: StrengthLevel, theme: ReturnType<typeof useToolTheme>["theme"]) {
  switch (level) {
    case "weak":
      return theme === "dark"
        ? "bg-rose-500/20 text-rose-200"
        : theme === "ocean"
          ? "bg-rose-400/20 text-rose-100"
          : "bg-rose-100 text-rose-700";
    case "fair":
      return theme === "dark"
        ? "bg-amber-500/20 text-amber-100"
        : theme === "ocean"
          ? "bg-amber-300/20 text-amber-50"
          : "bg-amber-100 text-amber-700";
    case "strong":
      return theme === "dark"
        ? "bg-emerald-500/20 text-emerald-100"
        : theme === "ocean"
          ? "bg-emerald-300/20 text-emerald-50"
          : "bg-emerald-100 text-emerald-700";
    case "excellent":
      return theme === "dark"
        ? "bg-sky-500/20 text-sky-100"
        : theme === "ocean"
          ? "bg-cyan-200/25 text-cyan-50"
          : "bg-sky-100 text-sky-700";
    default:
      return "";
  }
}

function createId() {
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
}

const DEFAULT_SETTINGS: GeneratorSettings = {
  length: 16,
  count: 5,
  includeLowercase: true,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: false,
  excludeAmbiguous: true,
  ensureEverySet: true,
  charset: "",
  isCharsetEdited: false,
};

function generateRandomBatch(settings: GeneratorSettings) {
  const chars = uniqueChars(settings.charset);
  if (chars.length === 0) {
    throw new Error("使用する文字が入力されていません。");
  }
  if (settings.length < 4) {
    throw new Error("パスワードの長さは4文字以上で設定してください。");
  }

  const results: GeneratedItem[] = [];
  const entropy = calculateEntropy(chars.length, settings.length);
  const strength = strengthFromEntropy(entropy);
  
  const seen = new Set<string>();
  let attempts = 0;
  const limit = Math.max(1000, settings.count * 100);
  
  while (results.length < settings.count && attempts < limit) {
    attempts++;
    let pwd = "";
    for (let i = 0; i < settings.length; i++) {
        pwd += pickRandomChar(chars);
    }
    
    if (!settings.isCharsetEdited && settings.ensureEverySet) {
       let valid = true;
       if (settings.includeLowercase && !pwd.split('').some(c => LOWERCASE.includes(c))) valid = false;
       if (settings.includeUppercase && !pwd.split('').some(c => UPPERCASE.includes(c))) valid = false;
       if (settings.includeNumbers && !pwd.split('').some(c => NUMBERS.includes(c))) valid = false;
       if (settings.includeSymbols && !pwd.split('').some(c => SYMBOLS.includes(c))) valid = false;
       if (!valid) continue;
    }

    if (!seen.has(pwd)) {
      seen.add(pwd);
      results.push({
        id: createId(),
        value: pwd,
        entropy,
        strength,
        detail: `${chars.length} 種類の文字から構成`,
      });
    }
  }

  if (results.length < settings.count) {
    throw new Error("条件が厳しすぎるか、十分な数の一意な結果を生成できませんでした。");
  }
  return results;
}

export default function PasswordGeneratorPage() {
  const { blockCls, inputCls, mutedTextCls, primaryBtnCls, secondaryBtnCls, theme } = useToolTheme();

  const [settingMode, setSettingMode] = useState<SettingMode>("simple");

  const [simpleSettings, setSimpleSettings] = useState<SimpleSettings>({
    pattern: "alphanumeric",
    lengthType: 8,
    excludeAmbiguous: true,
  });

  const [settings, setSettings] = useState<GeneratorSettings>(() => {
    let pool = LOWERCASE + UPPERCASE + NUMBERS;
    pool = pool.split('').filter(c => !AMBIGUOUS.includes(c)).join('');
    return { ...DEFAULT_SETTINGS, charset: uniqueChars(pool) };
  });

  const [results, setResults] = useState<GeneratedItem[]>([]);
  const [error, setError] = useState("");
  const [copiedMessage, setCopiedMessage] = useState("");

  const accentCls = theme === "ocean" ? "accent-cyan-300" : "accent-blue-500";
  const messageCls = error
    ? theme === "light"
      ? "bg-rose-100 text-rose-700"
      : theme === "dark"
        ? "bg-rose-500/20 text-rose-100"
        : "bg-rose-400/20 text-rose-50"
    : `${blockCls} ${mutedTextCls}`;

  const updateSetting = <K extends keyof GeneratorSettings>(key: K, value: GeneratorSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'charset') {
        next.isCharsetEdited = true;
      } else if (
        key === 'includeLowercase' || 
        key === 'includeUppercase' || 
        key === 'includeNumbers' || 
        key === 'includeSymbols' || 
        key === 'excludeAmbiguous'
      ) {
        next.isCharsetEdited = false;
        let pool = "";
        if (next.includeLowercase) pool += LOWERCASE;
        if (next.includeUppercase) pool += UPPERCASE;
        if (next.includeNumbers) pool += NUMBERS;
        if (next.includeSymbols) pool += SYMBOLS;
        
        if (next.excludeAmbiguous) {
           pool = pool.split('').filter(c => !AMBIGUOUS.includes(c)).join('');
        }
        next.charset = uniqueChars(pool);
      }
      return next;
    });
  };

  const updateSimple = <K extends keyof SimpleSettings>(key: K, value: SimpleSettings[K]) => {
    setSimpleSettings((prev) => {
      const next = { ...prev, [key]: value };
      setTimeout(() => generate("simple", next), 0);
      return next;
    });
  };

  const generate = (mode: SettingMode = settingMode, currentSimple = simpleSettings, currentDetailed = settings) => {
    try {
      let runSettings: GeneratorSettings;
      
      if (mode === "simple") {
        const next: GeneratorSettings = {
          ...DEFAULT_SETTINGS,
          length: currentSimple.lengthType,
          count: 5,
          excludeAmbiguous: currentSimple.excludeAmbiguous,
          ensureEverySet: true,
          isCharsetEdited: false,
        };

        if (currentSimple.pattern === 'numbers') {
          next.includeLowercase = false;
          next.includeUppercase = false;
          next.includeNumbers = true;
          next.includeSymbols = false;
        } else if (currentSimple.pattern === 'alphanumeric') {
          next.includeLowercase = true;
          next.includeUppercase = true;
          next.includeNumbers = true;
          next.includeSymbols = false;
        } else if (currentSimple.pattern === 'symbols') {
          next.includeLowercase = true;
          next.includeUppercase = true;
          next.includeNumbers = true;
          next.includeSymbols = true;
        }
        
        let pool = "";
        if (next.includeLowercase) pool += LOWERCASE;
        if (next.includeUppercase) pool += UPPERCASE;
        if (next.includeNumbers) pool += NUMBERS;
        if (next.includeSymbols) pool += SYMBOLS;
        if (next.excludeAmbiguous) {
           pool = pool.split('').filter(c => !AMBIGUOUS.includes(c)).join('');
        }
        next.charset = uniqueChars(pool);
        
        runSettings = next;
      } else {
        runSettings = currentDetailed;
      }

      const nextResults = generateRandomBatch(runSettings);
      setResults(nextResults);
      setError("");
      setCopiedMessage("");
    } catch (generationError) {
      setResults([]);
      setError(generationError instanceof Error ? generationError.message : "生成に失敗しました。");
      setCopiedMessage("");
    }
  };

  useEffect(() => {
    generate(settingMode, simpleSettings, settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyText = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setError("");
      setCopiedMessage("パスワードをコピーしました。");
      setTimeout(() => setCopiedMessage(""), 3000);
    } catch {
      setError("クリップボードへのコピーに失敗しました。ブラウザの権限を確認してください。");
    }
  };

  const copyAll = () => {
    if (results.length > 0) {
      copyText(results.map((item) => item.value).join("\n"));
    }
  };

  return (
    <ToolPageLayout title="パスワード生成" maxWidth="6xl">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.9fr)] items-start">
        {/* 左カラム設定 */}
        <div className="space-y-6">
          
          {/* タブ切り替え */}
          <div className={`p-1 flex items-center gap-1 rounded-2xl ${blockCls}`}>
            <button
              type="button"
              onClick={() => {
                 setSettingMode("simple");
                 generate("simple", simpleSettings, settings);
              }}
              className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${settingMode === "simple" ? 'bg-white dark:bg-zinc-800 shadow shadow-black/5 dark:shadow-black/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              簡易設定
            </button>
            <button
              type="button"
              onClick={() => {
                 setSettingMode("detailed");
                 generate("detailed", simpleSettings, settings);
              }}
              className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-all ${settingMode === "detailed" ? 'bg-white dark:bg-zinc-800 shadow shadow-black/5 dark:shadow-black/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              詳細設定
            </button>
          </div>

          {settingMode === "simple" ? (
            <ToolPanel className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">文字種の選択</h2>
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    { id: "numbers", label: "数字のみ" },
                    { id: "alphanumeric", label: "英数字のみ" },
                    { id: "symbols", label: "英数字記号" },
                  ].map((pattern) => (
                    <button
                      key={pattern.id}
                      type="button"
                      onClick={() => updateSimple('pattern', pattern.id as SimplePatternId)}
                      className={`rounded-2xl p-4 text-center transition-colors border ${simpleSettings.pattern === pattern.id ? 'border-blue-500 bg-blue-500/10' : `border-transparent bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10`}`}
                    >
                      <div className="font-semibold">{pattern.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-black/5 dark:border-white/5" />

              <div className="space-y-3">
                <h2 className="text-lg font-semibold">文字数の選択</h2>
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    { id: 6, label: "短め", sub: "6文字" },
                    { id: 8, label: "普通", sub: "8文字" },
                    { id: 12, label: "長め", sub: "12文字" },
                  ].map((len) => (
                    <button
                      key={len.id}
                      type="button"
                      onClick={() => updateSimple('lengthType', len.id as 6|8|12)}
                      className={`rounded-2xl p-4 text-center transition-colors border ${simpleSettings.lengthType === len.id ? 'border-blue-500 bg-blue-500/10' : `border-transparent bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10`}`}
                    >
                      <div className="font-semibold">{len.label}</div>
                      <div className="text-xs mt-1 opacity-75">{len.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-black/5 dark:border-white/5" />

              <div className="space-y-3">
                <h2 className="text-lg font-semibold">その他</h2>
                <label className={`flex items-center gap-3 rounded-xl p-4 cursor-pointer transition-colors border ${simpleSettings.excludeAmbiguous ? 'border-blue-500 bg-blue-500/10' : `border-transparent bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10`}`}>
                  <input type="checkbox" checked={simpleSettings.excludeAmbiguous} onChange={(event) => updateSimple("excludeAmbiguous", event.target.checked)} className={`h-5 w-5 ${accentCls}`} />
                  <div>
                    <span className="block font-medium">紛らわしい文字を除外する</span>
                    <span className="block text-xs mt-0.5 opacity-70">(I, l, 1, O, 0 など)</span>
                  </div>
                </label>
              </div>
              
              <button
                type="button"
                onClick={() => generate("simple", simpleSettings, settings)}
                className={`w-full mt-4 py-4 text-center rounded-2xl font-bold text-lg transition-transform active:scale-[0.98] ${primaryBtnCls}`}
              >
                パスワードを生成する
              </button>
            </ToolPanel>
          ) : (
            <ToolPanel className="space-y-8">
              
              {/* 1. 使用する文字 */}
              <div className="space-y-4">
                 <div>
                    <h2 className="text-lg font-semibold">1. 使用する文字</h2>
                    <p className={`text-sm mt-1 mb-3 ${mutedTextCls}`}>チェックボックスでオンオフを切り替えるか、テキストフィールドから直接編集できます。</p>
                 </div>
                 
                 <div className="grid gap-3 sm:grid-cols-2">
                   <label className={`flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-colors border ${settings.includeLowercase ? 'border-blue-500 bg-blue-500/10' : 'border-transparent bg-black/5 dark:bg-white/5'}`}>
                     <input type="checkbox" checked={settings.includeLowercase} onChange={(event) => updateSetting("includeLowercase", event.target.checked)} className={`h-4 w-4 ${accentCls}`} />
                     <span className="font-medium text-sm">英小文字 (a-z)</span>
                   </label>
                   <label className={`flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-colors border ${settings.includeUppercase ? 'border-blue-500 bg-blue-500/10' : 'border-transparent bg-black/5 dark:bg-white/5'}`}>
                     <input type="checkbox" checked={settings.includeUppercase} onChange={(event) => updateSetting("includeUppercase", event.target.checked)} className={`h-4 w-4 ${accentCls}`} />
                     <span className="font-medium text-sm">英大文字 (A-Z)</span>
                   </label>
                   <label className={`flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-colors border ${settings.includeNumbers ? 'border-blue-500 bg-blue-500/10' : 'border-transparent bg-black/5 dark:bg-white/5'}`}>
                     <input type="checkbox" checked={settings.includeNumbers} onChange={(event) => updateSetting("includeNumbers", event.target.checked)} className={`h-4 w-4 ${accentCls}`} />
                     <span className="font-medium text-sm">数字 (0-9)</span>
                   </label>
                   <label className={`flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-colors border ${settings.includeSymbols ? 'border-blue-500 bg-blue-500/10' : 'border-transparent bg-black/5 dark:bg-white/5'}`}>
                     <input type="checkbox" checked={settings.includeSymbols} onChange={(event) => updateSetting("includeSymbols", event.target.checked)} className={`h-4 w-4 ${accentCls}`} />
                     <span className="font-medium text-sm">記号</span>
                   </label>
                 </div>

                 <div className="pt-2 space-y-3">
                   <label className={`flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-colors border ${settings.excludeAmbiguous ? 'border-blue-500 bg-blue-500/10' : 'border-transparent bg-black/5 dark:bg-white/5'}`}>
                     <input type="checkbox" checked={settings.excludeAmbiguous} onChange={(event) => updateSetting("excludeAmbiguous", event.target.checked)} className={`h-4 w-4 ${accentCls}`} />
                     <span className="font-medium text-sm">紛らわしい文字を除外 (I, l, 1, O, 0 など)</span>
                   </label>
                   <label className={`flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-colors border ${settings.ensureEverySet ? 'border-blue-500 bg-blue-500/10' : 'border-transparent bg-black/5 dark:bg-white/5'}`}>
                     <input type="checkbox" checked={settings.ensureEverySet} onChange={(event) => updateSetting("ensureEverySet", event.target.checked)} className={`h-4 w-4 ${accentCls}`} />
                     <span className="font-medium text-sm">有効な文字種を少なくとも1文字ずつ含める</span>
                   </label>
                 </div>

                 <div className="space-y-2 mt-4 pt-4">
                   <div className="flex justify-between items-end">
                     <label className="text-sm font-semibold">生成に使われる文字一覧</label>
                     {settings.isCharsetEdited && (
                       <span className="text-xs text-amber-500 font-bold px-2 py-0.5 rounded bg-amber-500/20">カスタム編集中</span>
                     )}
                   </div>
                   <textarea
                     value={settings.charset}
                     onChange={(event) => updateSetting("charset", event.target.value)}
                     className={`w-full p-3 rounded-xl border text-sm sm:text-base break-all resize-y min-h-[80px] outline-none font-mono focus:ring-2 ${inputCls}`}
                   />
                 </div>
              </div>

              <hr className="border-black/5 dark:border-white/5" />

              {/* 2. パスワードの長さ */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <label className="font-semibold text-lg">2. パスワードの長さ</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="4"
                      max="128"
                      value={settings.length}
                      onChange={(event) => updateSetting("length", clamp(Number(event.target.value) || 4, 4, 128))}
                      className={`w-24 rounded-xl border px-3 py-2 outline-none focus:ring-2 ${inputCls}`}
                    />
                    <span className={`text-sm ${mutedTextCls}`}>文字</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="4"
                  max="128"
                  value={settings.length}
                  onChange={(event) => updateSetting("length", clamp(Number(event.target.value) || 4, 4, 128))}
                  className={`mt-4 w-full cursor-pointer ${accentCls}`}
                />
                <div className="flex flex-wrap gap-2 mt-4">
                  {LENGTH_OPTIONS.map(len => (
                    <button
                      key={len}
                      onClick={() => updateSetting('length', len)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                        settings.length === len 
                        ? 'border-blue-500 bg-blue-500 text-white' 
                        : `border-transparent bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10`
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-black/5 dark:border-white/5" />

              {/* 3. 生成する個数 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <label className="font-semibold text-lg">3. 生成する個数</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={settings.count}
                      onChange={(event) => updateSetting("count", clamp(Number(event.target.value) || 1, 1, 100))}
                      className={`w-24 rounded-xl border px-3 py-2 outline-none focus:ring-2 ${inputCls}`}
                    />
                    <span className={`text-sm ${mutedTextCls}`}>個</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={settings.count}
                  onChange={(event) => updateSetting("count", clamp(Number(event.target.value) || 1, 1, 100))}
                  className={`mt-4 w-full cursor-pointer ${accentCls}`}
                />
                <div className="flex flex-wrap gap-2 mt-4">
                  {COUNT_OPTIONS.map(cnt => (
                    <button
                      key={cnt}
                      onClick={() => updateSetting('count', cnt)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                        settings.count === cnt 
                        ? 'border-blue-500 bg-blue-500 text-white' 
                        : `border-transparent bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10`
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. 生成ボタン */}
              <button
                type="button"
                onClick={() => generate("detailed", simpleSettings, settings)}
                className={`w-full py-4 text-center rounded-2xl font-bold text-lg transition-transform active:scale-[0.98] ${primaryBtnCls}`}
              >
                パスワードを生成する
              </button>
            </ToolPanel>
          )}

        </div>

        {/* 右カラム：出力結果 */}
        <div className="sticky top-20 space-y-6">
          <ToolPanel className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">パスワード</h2>
                {results.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${strengthBadge(results[0].strength, theme)}`}>
                      強度: {strengthLabel(results[0].strength)}
                    </span>
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400">
                      {Math.round(results[0].entropy)} bits
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyAll}
                  disabled={results.length === 0}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${secondaryBtnCls}`}
                >
                  <Copy size={16} />
                  一括コピー
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {results.length > 0 ? results.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-3 px-5 py-3 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors hover:border-blue-500/50 cursor-pointer"
                  onClick={() => copyText(item.value)}
                >
                  <div className="font-mono text-lg">{item.value}</div>
                  <button 
                    type="button" 
                    className="p-1 rounded-full text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    aria-label="コピー"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              )) : (
                <div className={`p-8 w-full rounded-2xl text-center ${mutedTextCls} bg-black/5 dark:bg-white/5`}>
                  パラメータを設定して生成ボタンをクリックしてください。
                </div>
              )}
            </div>
            
            {(error || copiedMessage) && <div className={`rounded-2xl p-4 mt-2 ${error ? messageCls : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100'}`}>{error || copiedMessage}</div>}

          </ToolPanel>

          <ToolPanel className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="text-lg font-semibold">現在の使用状況</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
               <div className={`rounded-2xl p-4 text-sm bg-black/5 dark:bg-white/5`}>
                  <div className={`text-xs mb-1 ${mutedTextCls}`}>プールされている文字数</div>
                  <div className="font-bold text-lg">{uniqueChars(settingMode === "simple" ? (
                    (simpleSettings.pattern === "numbers" ? NUMBERS : LOWERCASE + UPPERCASE + NUMBERS + (simpleSettings.pattern === "symbols" ? SYMBOLS : ""))
                    .split('').filter(c => !simpleSettings.excludeAmbiguous || !AMBIGUOUS.includes(c)).join('')
                  ) : settings.charset).length} 文字</div>
               </div>
               <div className={`rounded-2xl p-4 text-sm bg-black/5 dark:bg-white/5`}>
                  <div className={`text-xs mb-1 ${mutedTextCls}`}>セキュリティ強度目安</div>
                  <div className="font-bold text-lg">{strengthLabel(results[0]?.strength || "fair")}</div>
               </div>
            </div>
            {(settingMode === "simple" ? simpleSettings.lengthType : settings.length) < 12 && (
              <div className={`rounded-2xl p-4 text-sm bg-black/5 dark:bg-white/5`}>短いパスワードは入力しやすいですが、重要なアカウントには弱くなります。</div>
            )}
            {!(settingMode === "simple" ? simpleSettings.pattern === "symbols" : settings.includeSymbols) && (
              <div className={`rounded-2xl p-4 text-sm bg-black/5 dark:bg-white/5`}>記号を含めないと入力は簡単ですが、総当たりに弱くなります。</div>
            )}
          </ToolPanel>
        </div>
      </div>
    </ToolPageLayout>
  );
}

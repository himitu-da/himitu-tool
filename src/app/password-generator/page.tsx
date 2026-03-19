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

type PatternId = "numbers" | "alphanumeric" | "symbols" | "custom";
type StrengthLevel = "weak" | "fair" | "strong" | "excellent";

type GeneratorSettings = {
  length: number;
  count: number;
  includeLowercase: boolean;
  includeUppercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
  charset: string;
  isCharsetEdited: boolean;
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
    globalThis.crypto.getRandomValues(buffer);
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
  return globalThis.crypto.randomUUID();
}

const DEFAULT_SETTINGS: GeneratorSettings = {
  length: 16,
  count: 6,
  includeLowercase: true,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: false,
  excludeAmbiguous: true,
  charset: "",
  isCharsetEdited: false,
};

function generateRandomBatch(settings: GeneratorSettings) {
  const chars = uniqueChars(settings.charset);
  if (chars.length === 0) {
    throw new Error("使用する文字が入力されていません。");
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
    
    if (!settings.isCharsetEdited) {
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
  const { blockCls, inputCls, mutedTextCls, primaryBtnCls, secondaryBtnCls, radioLabelCls, theme } = useToolTheme();

  const [activePattern, setActivePattern] = useState<PatternId>("alphanumeric");
  const [settings, setSettings] = useState<GeneratorSettings>(() => {
    let pool = LOWERCASE + UPPERCASE + NUMBERS;
    pool = pool.split('').filter(c => !AMBIGUOUS.includes(c)).join('');
    return { ...DEFAULT_SETTINGS, charset: uniqueChars(pool) };
  });

  const [results, setResults] = useState<GeneratedItem[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const accentCls = theme === "ocean" ? "accent-cyan-300" : "accent-blue-500";
  const messageCls = error
    ? theme === "light"
      ? "bg-rose-100 text-rose-700"
      : theme === "dark"
        ? "bg-rose-500/20 text-rose-100"
        : "bg-rose-400/20 text-rose-50"
    : `${blockCls} ${mutedTextCls}`;

  const updateSetting = <K extends keyof GeneratorSettings>(key: K, value: GeneratorSettings[K]) => {
    setActivePattern("custom");
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

  const generate = (currentConfig = settings) => {
    try {
      const nextResults = generateRandomBatch(currentConfig);
      setResults(nextResults);
      setError("");
      setStatus(`${nextResults.length} 件の結果を生成しました。`);
    } catch (generationError) {
      setResults([]);
      setError(generationError instanceof Error ? generationError.message : "生成に失敗しました。");
    }
  };

  useEffect(() => {
    generate(settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyPattern = (pattern: PatternId) => {
    setActivePattern(pattern);
    setSettings(prev => {
      let next = { ...prev };
      next.isCharsetEdited = false;
      next.excludeAmbiguous = false;
      
      if (pattern === 'numbers') {
        next.includeLowercase = false;
        next.includeUppercase = false;
        next.includeNumbers = true;
        next.includeSymbols = false;
        next.length = 12;
      } else if (pattern === 'alphanumeric') {
        next.includeLowercase = true;
        next.includeUppercase = true;
        next.includeNumbers = true;
        next.includeSymbols = false;
        next.excludeAmbiguous = true;
        next.length = 16;
      } else if (pattern === 'symbols') {
        next.includeLowercase = true;
        next.includeUppercase = true;
        next.includeNumbers = true;
        next.includeSymbols = true;
        next.excludeAmbiguous = true;
        next.length = 16;
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
      
      // Auto-generate on preset selection
      setTimeout(() => generate(next), 0);
      
      return next;
    });
  };

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setError("");
      setStatus(`${label} をコピーしました。`);
    } catch {
      setError("クリップボードへのコピーに失敗しました。ブラウザの権限を確認してください。");
    }
  };

  const copyAll = () => {
    if (results.length > 0) {
      copyText(results.map((item) => item.value).join("\n"), "すべての結果");
    }
  };

  return (
    <ToolPageLayout title="パスワード生成" maxWidth="6xl">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.9fr)] items-start">
        {/* 左カラム設定 */}
        <div className="space-y-6">
          <ToolPanel className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">パターン</h2>
              <p className={`text-sm ${mutedTextCls}`}>パスワードの方向性を選択します。</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { id: "numbers", label: "数字のみ" },
                { id: "alphanumeric", label: "英数字のみ" },
                { id: "symbols", label: "英数字記号" },
              ].map((pattern) => (
                <button
                  key={pattern.id}
                  type="button"
                  onClick={() => applyPattern(pattern.id as PatternId)}
                  className={`rounded-2xl p-4 text-center transition-colors border ${activePattern === pattern.id ? 'border-blue-500 bg-blue-500/10' : `border-transparent ${blockCls}`}`}
                >
                  <div className="font-semibold">{pattern.label}</div>
                </button>
              ))}
            </div>
          </ToolPanel>

          <ToolPanel className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold">詳細設定</h2>
              <p className={`text-sm ${mutedTextCls}`}>長さや生成数、使用する文字の細やかなカスタマイズが可能です。</p>
            </div>

            {/* パスワードの長さ */}
            <div className={`rounded-2xl p-4 sm:p-5 ${blockCls}`}>
              <div className="flex items-center justify-between gap-3">
                <label className="font-medium text-lg">パスワードの長さ</label>
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

            {/* 生成する個数 */}
            <div className={`rounded-2xl p-4 sm:p-5 ${blockCls}`}>
              <div className="flex items-center justify-between gap-3">
                <label className="font-medium text-lg">生成する個数</label>
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
            </div>

            {/* 使用する文字 */}
            <div className={`rounded-2xl p-4 sm:p-5 space-y-4 ${blockCls}`}>
               <div>
                  <label className="font-medium text-lg">使用する文字</label>
                  <p className={`text-sm mt-1 mb-3 ${mutedTextCls}`}>チェックボックスでオンオフを切り替えるか、以下のテキストフィールドから直接編集できます。</p>
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

               <div className="pt-2">
                 <label className={`flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-colors border ${settings.excludeAmbiguous ? 'border-blue-500 bg-blue-500/10' : 'border-transparent bg-black/5 dark:bg-white/5'}`}>
                   <input type="checkbox" checked={settings.excludeAmbiguous} onChange={(event) => updateSetting("excludeAmbiguous", event.target.checked)} className={`h-4 w-4 ${accentCls}`} />
                   <span className="font-medium text-sm">紛らわしい文字を除外 (I, l, 1, O, 0 など)</span>
                 </label>
               </div>

               <div className="space-y-2 mt-4 pt-4 border-t border-black/5 dark:border-white/5">
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
                 <p className={`text-xs ${mutedTextCls}`}>一覧を手動編集すると、「カスタム編集中」モードになりチェックボックスによる除外ルールの影響を受けなくなります。（各ボックスを再びクリックするとリセットされます）</p>
               </div>
            </div>
          </ToolPanel>

          <button
            type="button"
            onClick={() => generate()}
            className={`w-full py-4 text-center rounded-2xl font-bold text-lg transition-transform active:scale-[0.98] ${primaryBtnCls}`}
          >
            パスワードを生成する
          </button>
        </div>

        {/* 右カラム：出力結果 */}
        <div className="sticky top-20 space-y-6">
          <ToolPanel className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">生成結果 ({results.length})</h2>
                <p className={`text-sm ${mutedTextCls}`}>タップしてコピーできます。</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyAll}
                  disabled={results.length === 0}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${secondaryBtnCls}`}
                >
                  <Copy size={16} />
                  すべてコピー
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {results.length > 0 ? results.map((item, index) => (
                <div key={item.id} className={`rounded-2xl p-4 ${blockCls} space-y-3`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${mutedTextCls}`}>結果 #{index + 1}</span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`rounded-full px-2 py-1 font-medium ${strengthBadge(item.strength, theme)}`}>{strengthLabel(item.strength)}</span>
                      <span className="rounded-full px-2 py-1 font-medium bg-black/5 dark:bg-white/5">{`${Math.round(item.entropy)} bits`}</span>
                    </div>
                  </div>
                  <div 
                    onClick={() => copyText(item.value, `結果 #${index + 1}`)}
                    className={`flex items-center gap-3 w-full p-4 rounded-xl border border-transparent hover:border-blue-500/50 cursor-pointer transition-colors ${inputCls}`}
                  >
                    <div className="flex-1 font-mono text-xl sm:text-2xl break-all select-all">{item.value}</div>
                    <button 
                      type="button" 
                      className={`p-3 rounded-xl shrink-0 ${secondaryBtnCls}`}
                      aria-label="コピー"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className={`p-8 rounded-2xl text-center ${mutedTextCls} ${blockCls}`}>
                  「パスワードを生成する」ボタンをクリックしてください。
                </div>
              )}
            </div>
            
            {(status || error) && <div className={`rounded-2xl p-4 mt-2 ${messageCls}`}>{error || status}</div>}

          </ToolPanel>

          <ToolPanel className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="text-lg font-semibold">現在の使用状況</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
               <div className={`rounded-2xl p-4 text-sm ${blockCls}`}>
                  <div className={`text-xs mb-1 ${mutedTextCls}`}>プールされている文字数</div>
                  <div className="font-bold text-lg">{uniqueChars(settings.charset).length} 文字</div>
               </div>
               <div className={`rounded-2xl p-4 text-sm ${blockCls}`}>
                  <div className={`text-xs mb-1 ${mutedTextCls}`}>セキュリティ強度目安</div>
                  <div className="font-bold text-lg">{strengthLabel(results[0]?.strength || "fair")}</div>
               </div>
            </div>
            {settings.length < 12 && (
              <div className={`rounded-2xl p-4 text-sm ${blockCls}`}>短いパスワードは入力しやすいですが、重要なアカウントには弱くなります。</div>
            )}
            {!settings.includeSymbols && (
              <div className={`rounded-2xl p-4 text-sm ${blockCls}`}>記号を含めないと入力は簡単ですが、総当たりに弱くなります。</div>
            )}
          </ToolPanel>
        </div>
      </div>
    </ToolPageLayout>
  );
}

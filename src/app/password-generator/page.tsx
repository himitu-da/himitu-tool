"use client";

import React, { useEffect, useState } from "react";
import { Copy, ShieldCheck } from "lucide-react";

import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { ToolGrid } from "@/components/ToolGrid";
import { ToolColumn } from "@/components/ToolColumn";
import { useToolTheme } from "@/lib/useToolTheme";
import { ToolButton } from "@/components/ui/ToolButton";
import { ToolInput } from "@/components/ui/ToolInput";
import { ToolSlider } from "@/components/ui/ToolSlider";
import { ToolCheckbox } from "@/components/ui/ToolCheckbox";
import { ToolSelectCard } from "@/components/ui/ToolSelectCard";
import { ToolTabs } from "@/components/ui/ToolTabs";

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{}:;,.?/|~";
const AMBIGUOUS = "O0oIl1|`'\"";

const LENGTH_OPTIONS = [4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 48, 64, 128];
const COUNT_OPTIONS = [1, 5, 10, 20, 50, 100];

const SIMPLE_LENGTH_OPTIONS = [
  { id: 4, label: "非常に短い", sub: "4文字" },
  { id: 8, label: "短い", sub: "8文字" },
  { id: 12, label: "普通", sub: "12文字" },
  { id: 16, label: "やや長い", sub: "16文字" },
  { id: 20, label: "長い", sub: "20文字" },
];

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
  distribution: "proportional" | "equal";
  charset: string;
  isCharsetEdited: boolean;
};

type SimpleSettings = {
  pattern: SimplePatternId;
  selectedLengths: number[];
  excludeAmbiguous: boolean;
  distribution: "proportional" | "equal";
};

type GeneratedItem = {
  id: string;
  value: string;
  length: number;
  entropy: number;
  strength: StrengthLevel;
  detail: string;
  label?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function uniqueChars(value: string) {
  return Array.from(new Set(value.split(""))).join("");
}

function randomInt(maxExclusive: number) {
  if (maxExclusive <= 0) throw new Error("maxExclusive must be positive");
  const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
  const buffer = new Uint32Array(1);
  while (true) {
    if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.getRandomValues) {
      globalThis.crypto.getRandomValues(buffer);
    } else {
      buffer[0] = Math.floor(Math.random() * 0x100000000);
    }
    const value = buffer[0] ?? 0;
    if (value < limit) return value % maxExclusive;
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
    case "weak": return "弱い";
    case "fair": return "普通";
    case "strong": return "強い";
    case "excellent": return "非常に強い";
    default: return "普通";
  }
}

function strengthBadge(level: StrengthLevel, theme: ReturnType<typeof useToolTheme>["theme"]) {
  switch (level) {
    case "weak":
      return theme === "dark" ? "bg-rose-500/20 text-rose-200" : theme === "ocean" ? "bg-rose-400/20 text-rose-100" : "bg-rose-100 text-rose-700";
    case "fair":
      return theme === "dark" ? "bg-amber-500/20 text-amber-100" : theme === "ocean" ? "bg-amber-300/20 text-amber-50" : "bg-amber-100 text-amber-700";
    case "strong":
      return theme === "dark" ? "bg-emerald-500/20 text-emerald-100" : theme === "ocean" ? "bg-emerald-300/20 text-emerald-50" : "bg-emerald-100 text-emerald-700";
    case "excellent":
      return theme === "dark" ? "bg-sky-500/20 text-sky-100" : theme === "ocean" ? "bg-cyan-200/25 text-cyan-50" : "bg-sky-100 text-sky-700";
    default: return "";
  }
}

function createId() {
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID();
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
  distribution: "proportional",
  charset: "",
  isCharsetEdited: false,
};

function generateRandomBatch(settings: GeneratorSettings) {
  const chars = uniqueChars(settings.charset);
  if (chars.length === 0) throw new Error("使用する文字が入力されていません。");
  if (settings.length < 4) throw new Error("パスワードの長さは4文字以上で設定してください。");

  const results: GeneratedItem[] = [];
  const entropy = calculateEntropy(chars.length, settings.length);
  const strength = strengthFromEntropy(entropy);

  const seen = new Set<string>();
  let attempts = 0;
  const limit = Math.max(1000, settings.count * 100);

  let buckets: string[] = [];
  if (settings.distribution === "equal") {
    const b1 = chars.split('').filter(c => LOWERCASE.includes(c)).join('');
    const b2 = chars.split('').filter(c => UPPERCASE.includes(c)).join('');
    const b3 = chars.split('').filter(c => NUMBERS.includes(c)).join('');
    const b4 = chars.split('').filter(c => SYMBOLS.includes(c)).join('');
    const b5 = chars.split('').filter(c => !LOWERCASE.includes(c) && !UPPERCASE.includes(c) && !NUMBERS.includes(c) && !SYMBOLS.includes(c)).join('');
    buckets = [b1, b2, b3, b4, b5].filter(b => b.length > 0);
  }

  while (results.length < settings.count && attempts < limit) {
    attempts++;
    let pwd = "";
    for (let i = 0; i < settings.length; i++) {
      if (settings.distribution === "equal" && buckets.length > 0) {
        const bucket = buckets[randomInt(buckets.length)];
        pwd += pickRandomChar(bucket!);
      } else {
        pwd += pickRandomChar(chars);
      }
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
      results.push({ id: createId(), value: pwd, length: settings.length, entropy, strength, detail: `${chars.length} 種類の文字から構成` });
    }
  }

  if (results.length < settings.count) {
    throw new Error(`【長さ: ${settings.length}文字】条件が厳しすぎるか、十分な数の一意な結果を生成できませんでした。パスワード長を増やすなどしてください。`);
  }
  return results;
}

export default function PasswordGeneratorPage() {
  const { blockCls, mutedTextCls, theme } = useToolTheme();

  const [settingMode, setSettingMode] = useState<SettingMode>("simple");

  const [simpleSettings, setSimpleSettings] = useState<SimpleSettings>({
    pattern: "alphanumeric",
    selectedLengths: [12, 16, 20],
    excludeAmbiguous: true,
    distribution: "equal",
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
    ? theme === "light" ? "bg-rose-100 text-rose-700" : theme === "dark" ? "bg-rose-500/20 text-rose-100" : "bg-rose-400/20 text-rose-50"
    : `${blockCls} ${mutedTextCls}`;

  const updateSetting = <K extends keyof GeneratorSettings>(key: K, value: GeneratorSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'charset') {
        next.isCharsetEdited = true;
      } else if (['includeLowercase', 'includeUppercase', 'includeNumbers', 'includeSymbols', 'excludeAmbiguous'].includes(key)) {
        next.isCharsetEdited = false;
        let pool = "";
        if (next.includeLowercase) pool += LOWERCASE;
        if (next.includeUppercase) pool += UPPERCASE;
        if (next.includeNumbers) pool += NUMBERS;
        if (next.includeSymbols) pool += SYMBOLS;
        if (next.excludeAmbiguous) pool = pool.split('').filter(c => !AMBIGUOUS.includes(c)).join('');
        next.charset = uniqueChars(pool);
      }
      return next;
    });
  };

  const toggleChar = (c: string) => {
    setSettings((prev) => {
      let newCharset = prev.charset;
      if (newCharset.includes(c)) {
        newCharset = newCharset.replace(c, '');
      } else {
        newCharset += c;
      }
      return { ...prev, charset: newCharset, isCharsetEdited: true };
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
      if (mode === "simple") {
        if (currentSimple.selectedLengths.length === 0) { setResults([]); setError(""); return; }
        let allResults: GeneratedItem[] = [];
        for (const lenId of currentSimple.selectedLengths) {
          const next: GeneratorSettings = { ...DEFAULT_SETTINGS, length: lenId, count: 5, excludeAmbiguous: currentSimple.excludeAmbiguous, ensureEverySet: true, distribution: currentSimple.distribution, isCharsetEdited: false };
          if (currentSimple.pattern === 'numbers') { next.includeLowercase = false; next.includeUppercase = false; next.includeNumbers = true; next.includeSymbols = false; }
          else if (currentSimple.pattern === 'alphanumeric') { next.includeLowercase = true; next.includeUppercase = true; next.includeNumbers = true; next.includeSymbols = false; }
          else if (currentSimple.pattern === 'symbols') { next.includeLowercase = true; next.includeUppercase = true; next.includeNumbers = true; next.includeSymbols = true; }
          let pool = "";
          if (next.includeLowercase) pool += LOWERCASE;
          if (next.includeUppercase) pool += UPPERCASE;
          if (next.includeNumbers) pool += NUMBERS;
          if (next.includeSymbols) pool += SYMBOLS;
          if (next.excludeAmbiguous) pool = pool.split('').filter(c => !AMBIGUOUS.includes(c)).join('');
          next.charset = uniqueChars(pool);
          const batchLabel = SIMPLE_LENGTH_OPTIONS.find(o => o.id === lenId)?.label || "";
          const batchResults = generateRandomBatch(next);
          batchResults.forEach(item => { item.label = `${lenId}文字 (${batchLabel})`; });
          allResults = allResults.concat(batchResults);
        }
        setResults(allResults); setError(""); setCopiedMessage("");
      } else {
        const nextResults = generateRandomBatch(currentDetailed);
        nextResults.forEach(item => { item.label = `${currentDetailed.length}文字`; });
        setResults(nextResults); setError(""); setCopiedMessage("");
      }
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
      setError(""); setCopiedMessage("パスワードをコピーしました。");
      setTimeout(() => setCopiedMessage(""), 3000);
    } catch {
      setError("クリップボードへのコピーに失敗しました。ブラウザの権限を確認してください。");
    }
  };

  const copyAll = () => {
    if (results.length > 0) { copyText(results.map((item) => item.value).join("\n")); }
  };

  const isClassic = theme === "classic";

  const CharsetButtons = ({ source, label }: { source: string; label: string }) => (
    <div className="mt-3 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
      <div className={`text-xs font-semibold mb-2 ${mutedTextCls}`}>{label}のカスタマイズ</div>
      <div className="flex flex-wrap gap-1.5">
        {source.split('').map(c => {
          const isActive = settings.charset.includes(c);
          return (
            <button
              key={c}
              type="button"
              onClick={() => toggleChar(c)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg font-mono text-sm sm:text-base outline-none transition-all ${
                isActive ? 'bg-blue-500 text-white shadow-sm font-bold' : 'bg-transparent text-gray-500 hover:bg-black/10 dark:hover:bg-white/10 scale-[0.98]'
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>
    </div>
  );

  const groupedResults = results.reduce((acc, item) => {
    const key = item.label || `${item.length}文字`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, GeneratedItem[]>);

  return (
    <ToolPageLayout title="パスワード生成" maxWidth="6xl">
      <ToolGrid>
        {/* 左カラム：設定 */}
        <ToolColumn>
          {/* タブ切り替え */}
          <ToolTabs
            tabs={[
              { id: "simple", label: "簡易生成" },
              { id: "detailed", label: "詳細生成" },
            ]}
            activeTab={settingMode}
            onChange={(id) => {
              setSettingMode(id);
              generate(id, simpleSettings, settings);
            }}
          />

          {settingMode === "simple" ? (
            <>
              <ToolPanel title="文字種の選択">
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    { id: "numbers", label: "数字のみ" },
                    { id: "alphanumeric", label: "英数字のみ" },
                    { id: "symbols", label: "英数字記号" },
                  ].map((pattern) => (
                    <ToolSelectCard
                      key={pattern.id}
                      active={simpleSettings.pattern === pattern.id}
                      onClick={() => updateSimple('pattern', pattern.id as SimplePatternId)}
                      label={pattern.label}
                    />
                  ))}
                </div>
              </ToolPanel>

              <ToolPanel title="文字数の選択">
                <div className={`text-xs mb-3 ${mutedTextCls}`}>複数選択可能</div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {SIMPLE_LENGTH_OPTIONS.map((len) => (
                    <ToolSelectCard
                      key={len.id}
                      active={simpleSettings.selectedLengths.includes(len.id)}
                      onClick={() => {
                        const current = simpleSettings.selectedLengths;
                        let nextLengths;
                        if (current.includes(len.id)) {
                          nextLengths = current.filter(id => id !== len.id);
                          if (nextLengths.length === 0) nextLengths = [len.id];
                        } else {
                          nextLengths = [...current, len.id].sort((a, b) => a - b);
                        }
                        updateSimple('selectedLengths', nextLengths);
                      }}
                      label={len.label}
                      sub={len.sub}
                    />
                  ))}
                </div>
              </ToolPanel>

              <ToolPanel title="その他">
                <ToolCheckbox
                  variant="card"
                  checked={simpleSettings.excludeAmbiguous}
                  onChange={(v) => updateSimple("excludeAmbiguous", v)}
                  label="紛らわしい文字を除外する"
                  description="(I, l, 1, O, 0 など)"
                />
              </ToolPanel>

              <ToolButton
                variant="primary"
                type="button"
                onClick={() => generate("simple", simpleSettings, settings)}
                className="w-full py-4 text-lg"
              >
                パスワードを生成する
              </ToolButton>
            </>
          ) : (
            <>
              {/* 1. 使用する文字 */}
              <ToolPanel title="1. 使用する文字">
                <p className={`text-sm mb-4 ${mutedTextCls}`}>下のボタンをタップして特定の文字だけを除外・追加したり、テキストフィールドから直接編集できます。</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <ToolCheckbox variant="card" checked={settings.includeLowercase} onChange={(v) => updateSetting("includeLowercase", v)} label="英小文字 (a-z)" />
                  <ToolCheckbox variant="card" checked={settings.includeUppercase} onChange={(v) => updateSetting("includeUppercase", v)} label="英大文字 (A-Z)" />
                  <ToolCheckbox variant="card" checked={settings.includeNumbers} onChange={(v) => updateSetting("includeNumbers", v)} label="数字 (0-9)" />
                  <ToolCheckbox variant="card" checked={settings.includeSymbols} onChange={(v) => updateSetting("includeSymbols", v)} label="記号" />
                </div>

                <div className="pt-2">
                  {settings.includeLowercase && <CharsetButtons source={LOWERCASE} label="英小文字" />}
                  {settings.includeUppercase && <CharsetButtons source={UPPERCASE} label="英大文字" />}
                  {settings.includeNumbers && <CharsetButtons source={NUMBERS} label="数字" />}
                  {settings.includeSymbols && <CharsetButtons source={SYMBOLS} label="記号" />}
                </div>

                <div className="pt-4 mt-2 space-y-2 border-t border-black/5 dark:border-white/5">
                  <ToolCheckbox variant="card" checked={settings.excludeAmbiguous} onChange={(v) => updateSetting("excludeAmbiguous", v)} label="紛らわしい文字を除外" description="(I, l, 1, O, 0 など)" />
                  <ToolCheckbox variant="card" checked={settings.ensureEverySet} onChange={(v) => updateSetting("ensureEverySet", v)} label="有効な文字種を少なくとも1文字ずつ含める" />
                  <ToolCheckbox variant="card" checked={settings.distribution === 'equal'} onChange={(v) => updateSetting("distribution", v ? "equal" : "proportional")} label="文字種が均等な割合で出現するようにする" />
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-end mb-1">
                    <label className="text-sm font-semibold">生成に使われる文字コード全体</label>
                    {settings.isCharsetEdited && <span className="text-xs text-amber-500 font-bold px-2 py-0.5 rounded bg-amber-500/20">カスタム編集中</span>}
                  </div>
                  <textarea
                    value={settings.charset}
                    onChange={(event) => updateSetting("charset", event.target.value)}
                    className={`w-full p-3 rounded-xl border text-sm sm:text-base break-all resize-y min-h-[80px] outline-none font-mono ${isClassic ? "border-2 border-gray-400 !rounded-none focus:ring-0 focus:border-black bg-white text-black" : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"}`}
                  />
                </div>
              </ToolPanel>

              {/* 2. パスワードの長さ */}
              <ToolPanel title="2. パスワードの長さ">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <ToolInput
                      type="number" min={4} max={128} value={settings.length}
                      onChange={(e) => updateSetting("length", clamp(Number(e.target.value) || 4, 4, 128))}
                      className="w-24"
                    />
                    <span className={`text-sm ${mutedTextCls}`}>文字</span>
                  </div>
                  <ToolSlider
                    min={4} max={128} value={settings.length}
                    onChange={(e) => updateSetting("length", clamp(Number(e.target.value) || 4, 4, 128))}
                  />
                  <div className="flex flex-wrap gap-2">
                    {LENGTH_OPTIONS.map(len => (
                      <ToolSelectCard
                        key={len}
                        active={settings.length === len}
                        onClick={() => updateSetting('length', len)}
                        label={len}
                        className={`px-3 py-1.5 text-sm !p-0 py-1.5 px-3 !rounded-lg`}
                      />
                    ))}
                  </div>
                </div>
              </ToolPanel>

              {/* 3. 生成する個数 */}
              <ToolPanel title="3. 生成する個数">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ToolInput
                      type="number" min={1} max={100} value={settings.count}
                      onChange={(e) => updateSetting("count", clamp(Number(e.target.value) || 1, 1, 100))}
                      className="w-24"
                    />
                    <span className={`text-sm ${mutedTextCls}`}>個</span>
                  </div>
                  <ToolSlider
                    min={1} max={100} value={settings.count}
                    onChange={(e) => updateSetting("count", clamp(Number(e.target.value) || 1, 1, 100))}
                  />
                  <div className="flex flex-wrap gap-2">
                    {COUNT_OPTIONS.map(cnt => (
                      <ToolSelectCard
                        key={cnt}
                        active={settings.count === cnt}
                        onClick={() => updateSetting('count', cnt)}
                        label={cnt}
                        className="px-3 py-1.5 text-sm !p-0 py-1.5 px-3 !rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              </ToolPanel>

              <ToolButton
                variant="primary"
                type="button"
                onClick={() => generate("detailed", simpleSettings, settings)}
                className="w-full py-4 text-lg"
              >
                パスワードを生成する
              </ToolButton>
            </>
          )}
        </ToolColumn>

        {/* 右カラム：結果 */}
        <ToolColumn className="sticky top-20">
          <ToolPanel>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">パスワード</h2>
                  {results.length > 0 && settingMode === "detailed" && (
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
                <ToolButton
                  variant="secondary"
                  type="button"
                  onClick={copyAll}
                  disabled={results.length === 0}
                  className="px-4 py-2 text-sm"
                >
                  <Copy size={16} />
                  一括コピー
                </ToolButton>
              </div>

              <div className="space-y-6">
                {Object.keys(groupedResults).length > 0 ? Object.entries(groupedResults).map(([groupLabel, items]) => (
                  <div key={groupLabel} className="space-y-3">
                    <div className="flex items-center gap-3 border-b border-black/10 dark:border-white/10 pb-2 mb-3">
                      <h3 className="text-sm font-bold opacity-80">{groupLabel}</h3>
                      {settingMode === "simple" && items[0] && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`px-1.5 py-0.5 rounded ${strengthBadge(items[0].strength, theme)}`}>{strengthLabel(items[0].strength)}</span>
                          <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 opacity-70">{Math.round(items[0].entropy)} bits</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 px-5 py-3 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors hover:border-blue-500/50 cursor-pointer"
                          onClick={() => copyText(item.value)}
                        >
                          <div className="font-mono text-lg">{item.value}</div>
                          <button type="button" className="p-1 rounded-full text-gray-400 hover:text-black dark:hover:text-white transition-colors" aria-label="コピー">
                            <Copy size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )) : (
                  <div className={`p-8 w-full rounded-2xl text-center ${mutedTextCls} bg-black/5 dark:bg-white/5`}>
                    パラメータを設定して生成ボタンをクリックしてください。
                  </div>
                )}
              </div>

              {(error || copiedMessage) && (
                <div className={`rounded-2xl p-4 mt-2 ${error ? messageCls : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100'}`}>
                  {error || copiedMessage}
                </div>
              )}
            </div>
          </ToolPanel>

          <ToolPanel>
            <div className="flex items-center gap-2 mb-4">
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
                <div className="font-bold text-sm">
                  {settingMode === "simple" && simpleSettings.selectedLengths.length > 0
                    ? `${strengthLabel(strengthFromEntropy(calculateEntropy(uniqueChars((simpleSettings.pattern === "numbers" ? NUMBERS : LOWERCASE + UPPERCASE + NUMBERS + (simpleSettings.pattern === "symbols" ? SYMBOLS : "")).split('').filter(c => !simpleSettings.excludeAmbiguous || !AMBIGUOUS.includes(c)).join('')).length, simpleSettings.selectedLengths[0])))} ~ ${strengthLabel(strengthFromEntropy(calculateEntropy(uniqueChars((simpleSettings.pattern === "numbers" ? NUMBERS : LOWERCASE + UPPERCASE + NUMBERS + (simpleSettings.pattern === "symbols" ? SYMBOLS : "")).split('').filter(c => !simpleSettings.excludeAmbiguous || !AMBIGUOUS.includes(c)).join('')).length, simpleSettings.selectedLengths[simpleSettings.selectedLengths.length - 1])))}`
                    : strengthLabel(results[0]?.strength || "fair")
                  }
                </div>
              </div>
            </div>
            {((settingMode === "simple" ? simpleSettings.selectedLengths[0] : settings.length) ?? 0) < 12 && (
              <div className={`mt-3 rounded-2xl p-4 text-sm bg-black/5 dark:bg-white/5`}>短いパスワードは入力しやすいですが、重要なアカウントには弱くなります。</div>
            )}
            {!(settingMode === "simple" ? simpleSettings.pattern === "symbols" : settings.includeSymbols) && (
              <div className={`mt-3 rounded-2xl p-4 text-sm bg-black/5 dark:bg-white/5`}>記号を含めないと入力は簡単ですが、総当たりに弱くなります。</div>
            )}
          </ToolPanel>
        </ToolColumn>
      </ToolGrid>
    </ToolPageLayout>
  );
}

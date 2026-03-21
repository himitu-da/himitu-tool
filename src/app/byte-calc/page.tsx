"use client";

import React, { useState, useEffect } from "react";
import { ClipboardPaste, Copy, Check, ArrowLeftRight } from "lucide-react";

import { useToolTheme } from "@/lib/useToolTheme";
import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { ToolGrid } from "@/components/ToolGrid";
import { ToolColumn } from "@/components/ToolColumn";
import { ToolInput } from "@/components/ui/ToolInput";
import { ToolRadio } from "@/components/ui/ToolRadio";
import { ToolButton } from "@/components/ui/ToolButton";

type Prefix = "si" | "binary";
type UnitBaseType = "byte" | "bit";
type Mag = 0 | 1 | 2 | 3 | 4 | 5;

const MAGS: Mag[] = [0, 1, 2, 3, 4, 5];

const getSymbol = (prefix: Prefix, type: UnitBaseType, mag: Mag) => {
  if (mag === 0) return type === "byte" ? "B" : "b";

  const p = ["", "K", "M", "G", "T", "P"][mag];
  if (type === "byte") {
    return prefix === "si" ? `${p}B` : `${p}iB`;
  } else {
    // For bits, SI is often lower case 'k', others uppercase. Bin is 'Kibit' etc.
    const bitP = prefix === "si" ? (mag === 1 ? "k" : p) : `${p}i`;
    return `${bitP}b`; // 'kb', 'Kib', 'Mb', 'Mib' etc.
  }
};

const KANA_SI = ["", "キロ", "メガ", "ギガ", "テラ", "ペタ"];
const KANA_BIN = ["", "キビ", "メビ", "ギビ", "テビ", "ペビ"];

const getReading = (prefix: Prefix, type: UnitBaseType, mag: Mag) => {
  if (mag === 0) return type === "byte" ? "バイト" : "ビット";

  const prefixKana = prefix === "si" ? KANA_SI[mag] : KANA_BIN[mag];
  const tSuffix = type === "byte" ? "バイト" : "ビット";
  return `${prefixKana}${tSuffix}`;
};

const convertValue = (
  valStr: string,
  pIn: Prefix, tIn: UnitBaseType, mIn: Mag,
  pOut: Prefix, tOut: UnitBaseType, mOut: Mag
) => {
  const val = Number(valStr);
  if (isNaN(val) || valStr.trim() === "") return "";

  const baseIn = pIn === "si" ? 1000 : 1024;
  const baseOut = pOut === "si" ? 1000 : 1024;

  const factorIn = tIn === "bit" ? 1 / 8 : 1;
  const factorOut = tOut === "bit" ? 1 / 8 : 1;

  const multIn = Math.pow(baseIn, mIn);
  const bytes = val * multIn * factorIn;

  const multOut = Math.pow(baseOut, mOut);
  const outVal = bytes / (multOut * factorOut);

  return Number(outVal.toPrecision(15)).toString();
};

export default function ByteCalcPage() {
  const { blockCls, inputCls, mutedTextCls } = useToolTheme();

  // Unit 1 State
  const [val1, setVal1] = useState("1");
  const [pref1, setPref1] = useState<Prefix>("si");
  const [type1, setType1] = useState<UnitBaseType>("byte");
  const [mag1, setMag1] = useState<Mag>(2); // MB

  // Unit 2 State
  const [val2, setVal2] = useState("");
  const [pref2, setPref2] = useState<Prefix>("si");
  const [type2, setType2] = useState<UnitBaseType>("byte");
  const [mag2, setMag2] = useState<Mag>(1); // KB

  const [lastEdited, setLastEdited] = useState<"1" | "2">("1");

  const [msg1, setMsg1] = useState("");
  const [msg2, setMsg2] = useState("");
  const [copied1, setCopied1] = useState(false);
  const [copied2, setCopied2] = useState(false);

  useEffect(() => {
    if (lastEdited === "1") {
      setVal2(convertValue(val1, pref1, type1, mag1, pref2, type2, mag2));
    } else {
      setVal1(convertValue(val2, pref2, type2, mag2, pref1, type1, mag1));
    }
  }, [val1, pref1, type1, mag1, val2, pref2, type2, mag2, lastEdited]);

  const handlePaste = async (side: "1" | "2") => {
    const setMsg = side === "1" ? setMsg1 : setMsg2;
    const setVal = side === "1" ? setVal1 : setVal2;

    setMsg("");
    try {
      const text = await navigator.clipboard.readText();
      const numStr = text.replace(/,/g, "").trim();
      if (numStr && !isNaN(Number(numStr))) {
        setVal(numStr);
        setLastEdited(side);
      } else {
        setMsg("数値として認識できませんでした。");
      }
    } catch {
      setMsg("クリップボードの読み取りに失敗しました。");
    }
  };

  const handleCopy = async (side: "1" | "2") => {
    const val = side === "1" ? val1 : val2;
    const setMsg = side === "1" ? setMsg1 : setMsg2;
    const setCopied = side === "1" ? setCopied1 : setCopied2;

    setMsg("");
    if (!val) return;
    try {
      await navigator.clipboard.writeText(val);
      setCopied(true);
      setMsg("コピーしました！");
      setTimeout(() => {
        setCopied(false);
        setMsg("");
      }, 2000);
    } catch {
      setMsg("コピーに失敗しました。");
    }
  };

  const UnitDropdownOptions = () => (
    <>
      <optgroup label="SI接頭語 (1000倍) - バイト">
        {MAGS.map(m => <option key={`si:byte:${m}`} value={`si:byte:${m}`}>{getSymbol("si", "byte", m)}</option>)}
      </optgroup>
      <optgroup label="2進接頭辞 (1024倍) - バイト">
        {MAGS.map(m => <option key={`binary:byte:${m}`} value={`binary:byte:${m}`}>{getSymbol("binary", "byte", m)}</option>)}
      </optgroup>
      <optgroup label="SI接頭語 (1000倍) - ビット">
        {MAGS.map(m => <option key={`si:bit:${m}`} value={`si:bit:${m}`}>{getSymbol("si", "bit", m)}</option>)}
      </optgroup>
      <optgroup label="2進接頭辞 (1024倍) - ビット">
        {MAGS.map(m => <option key={`binary:bit:${m}`} value={`binary:bit:${m}`}>{getSymbol("binary", "bit", m)}</option>)}
      </optgroup>
    </>
  );

  type DetailedUnitSelectorProps = {
    idPrefix: string;
    prefix: Prefix; setPrefix: (v: Prefix) => void;
    type: UnitBaseType; setType: (v: UnitBaseType) => void;
    mag: Mag; setMag: (v: Mag) => void;
  };

  const DetailedUnitSelector = ({ idPrefix, prefix, setPrefix, type, setType, mag, setMag }: DetailedUnitSelectorProps) => (
    <div className={`p-4 rounded-xl space-y-4 ${blockCls} shadow-inner`}>
      <div className="space-y-2">
        <label className={`block text-xs font-bold uppercase ${mutedTextCls}`}>接頭辞</label>
        <div className="grid grid-cols-2 gap-2">
          <ToolRadio name={`${idPrefix}_p`} variant="card" checked={prefix === "si"} onChange={() => setPrefix("si")}
            label={<div className="text-center space-y-0.5"><div className="font-bold">SI接頭語</div><div className="text-xs opacity-70 font-mono tracking-tighter">1000(10³)倍で接頭辞が変わる</div></div>} />
          <ToolRadio name={`${idPrefix}_p`} variant="card" checked={prefix === "binary"} onChange={() => setPrefix("binary")}
            label={<div className="text-center space-y-0.5"><div className="font-bold">2進接頭辞</div><div className="text-xs opacity-70 font-mono tracking-tighter">1024(2¹⁰)倍で接頭辞が変わる</div></div>} />
        </div>
      </div>

      <div className="space-y-2">
        <label className={`block text-xs font-bold uppercase ${mutedTextCls}`}>基本単位</label>
        <div className="grid grid-cols-2 gap-2">
          <ToolRadio name={`${idPrefix}_t`} variant="card" checked={type === "byte"} onChange={() => setType("byte")}
          label={
            <div className="flex flex-col items-center">
              <span className="text-[10px] sm:text-xs opacity-70 mb-0.5">バイト</span>
              <span className="font-bold sm:text-lg tracking-wider">Byte</span>  
            </div>
          } />
          <ToolRadio name={`${idPrefix}_t`} variant="card" checked={type === "bit"} onChange={() => setType("bit")}
          label={
            <div className="flex flex-col items-center">
              <span className="text-[10px] sm:text-xs opacity-70 mb-0.5">ビット</span>
              <span className="font-bold sm:text-lg tracking-wider">bit</span>
            </div>
          } />
        </div>
      </div>

      <div className="space-y-2">
        <label className={`block text-xs font-bold uppercase ${mutedTextCls}`}>スケール</label>
        <div className="grid grid-cols-3 gap-2">
          {MAGS.map(m => (
            <ToolRadio
              key={`${idPrefix}_m_${m}`}
              name={`${idPrefix}_m`}
              variant="card"
              checked={mag === m}
              onChange={() => setMag(m)}
              label={
                <div className="flex flex-col items-center">
                  <span className="text-[10px] sm:text-xs opacity-70 mb-0.5">{getReading(prefix, type, m)}</span>
                  <span className="font-bold sm:text-lg tracking-wider">{getSymbol(prefix, type, m)}</span>
                </div>
              }
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ToolPageLayout title="バイト単位変換" maxWidth="5xl">
      {/* カラムの前に配置し、全幅を使って変換方向を表示 */}
      <div className={`mb-6 p-4 md:p-6 rounded-2xl ${blockCls} shadow-inner flex flex-col gap-6 border border-black/5 dark:border-white/5`}>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          <div className="flex flex-col items-center flex-1 w-full relative">
            <span className={`static md:absolute top-0 left-0 text-xs font-bold uppercase ${mutedTextCls} mb-1 md:mb-0`}>単位 1</span>
            <span className={`text-[10px] md:text-sm font-bold opacity-70 mt-2`}>{getReading(pref1, type1, mag1)}</span>
            <span className="text-3xl md:text-5xl font-black text-center text-blue-600 dark:text-blue-400 break-all">{getSymbol(pref1, type1, mag1)}</span>
          </div>

          <div className="shrink-0 p-3 rounded-full bg-white/50 dark:bg-black/20 shadow-sm border border-black/5 dark:border-white/10 text-gray-500 dark:text-gray-400">
            {/* 双方向なので ArrowLeftRight アイコンを採用 */}
            <ArrowLeftRight size={32} className="opacity-80" />
          </div>

          <div className="flex flex-col items-center flex-1 w-full relative">
            <span className={`static md:absolute top-0 right-0 text-xs font-bold uppercase ${mutedTextCls} mb-1 md:mb-0`}>単位 2</span>
            <span className={`text-[10px] md:text-sm font-bold opacity-70 mt-2`}>{getReading(pref2, type2, mag2)}</span>
            <span className="text-3xl md:text-5xl font-black text-center text-emerald-600 dark:text-emerald-400 break-all">{getSymbol(pref2, type2, mag2)}</span>
          </div>
        </div>

        {/* 変換比率の表示 */}
        <div className="flex flex-col items-center">
          <div>
            <span className="font-bold">1 {getSymbol(pref1, type1, mag1)}</span> = <span className="font-bold">{convertValue("1", pref1, type1, mag1, pref2, type2, mag2)}</span> {getSymbol(pref2, type2, mag2)}
          </div>
          <div>
            <span className="font-bold">1 {getSymbol(pref2, type2, mag2)}</span> = <span className="font-bold">{convertValue("1", pref2, type2, mag2, pref1, type1, mag1)}</span> {getSymbol(pref1, type1, mag1)}
          </div>
        </div>
      </div>

      <ToolGrid>
        {/* Unit 1 */}
        <ToolColumn>
          <ToolPanel title="単位 1">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <ToolInput
                      value={val1}
                      onChange={e => {
                        setVal1(e.target.value);
                        setLastEdited("1");
                      }}
                      type="number"
                      placeholder="値を入力"
                      min={0}
                      className="h-12 text-xl font-bold font-mono tracking-tighter w-full"
                    />
                  </div>
                  <select
                    value={`${pref1}:${type1}:${mag1}`}
                    onChange={(e) => {
                      const [p, t, m] = e.target.value.split(":");
                      setPref1(p as Prefix); setType1(t as UnitBaseType); setMag1(Number(m) as Mag);
                    }}
                    className={`h-12 px-3 py-0 rounded-xl border focus:ring-2 outline-none cursor-pointer sm:w-min max-w-full font-bold shrink-0 ${inputCls}`}
                  >
                    <UnitDropdownOptions />
                  </select>
                </div>
                <div className="flex gap-2 pt-1">
                  <ToolButton variant="secondary" onClick={() => handlePaste("1")} className="px-4 py-2 text-sm flex-1 h-10" title="ペースト">
                    <ClipboardPaste size={16} /> <span className="hidden sm:inline ml-1.5">ペースト</span>
                  </ToolButton>
                  <ToolButton variant="secondary" onClick={() => handleCopy("1")} className="px-4 py-2 text-sm flex-1 h-10" title="結果をコピー">
                    {copied1 ? <Check size={16} /> : <Copy size={16} />} <span className="hidden sm:inline ml-1.5">コピー</span>
                  </ToolButton>
                </div>
                {msg1 && <p className={`text-sm font-bold ${mutedTextCls} text-blue-600 dark:text-blue-400`}>{msg1}</p>}
              </div>

              <DetailedUnitSelector idPrefix="in1" prefix={pref1} setPrefix={setPref1} type={type1} setType={setType1} mag={mag1} setMag={setMag1} />
            </div>
          </ToolPanel>
        </ToolColumn>

        {/* Unit 2 */}
        <ToolColumn>
          <ToolPanel title="単位 2">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <ToolInput
                      value={val2}
                      onChange={e => {
                        setVal2(e.target.value);
                        setLastEdited("2");
                      }}
                      type="number"
                      placeholder="値を入力"
                      min={0}
                      className="h-12 text-xl font-bold font-mono tracking-tighter w-full"
                    />
                  </div>
                  <select
                    value={`${pref2}:${type2}:${mag2}`}
                    onChange={(e) => {
                      const [p, t, m] = e.target.value.split(":");
                      setPref2(p as Prefix); setType2(t as UnitBaseType); setMag2(Number(m) as Mag);
                    }}
                    className={`h-12 px-3 py-0 rounded-xl border focus:ring-2 outline-none cursor-pointer sm:w-min max-w-full font-bold shrink-0 ${inputCls}`}
                  >
                    <UnitDropdownOptions />
                  </select>
                </div>
                <div className="flex gap-2 pt-1">
                  <ToolButton variant="secondary" onClick={() => handlePaste("2")} className="px-4 py-2 text-sm flex-1 h-10" title="ペースト">
                    <ClipboardPaste size={16} /> <span className="hidden sm:inline ml-1.5">ペースト</span>
                  </ToolButton>
                  <ToolButton variant="secondary" onClick={() => handleCopy("2")} className="px-4 py-2 text-sm flex-1 h-10" title="結果をコピー">
                    {copied2 ? <Check size={16} /> : <Copy size={16} />} <span className="hidden sm:inline ml-1.5">コピー</span>
                  </ToolButton>
                </div>
                {msg2 && <p className={`text-sm font-bold ${mutedTextCls} text-emerald-600 dark:text-emerald-400`}>{msg2}</p>}
              </div>

              <DetailedUnitSelector idPrefix="in2" prefix={pref2} setPrefix={setPref2} type={type2} setType={setType2} mag={mag2} setMag={setMag2} />
            </div>
          </ToolPanel>
        </ToolColumn>
      </ToolGrid>
    </ToolPageLayout>
  );
}
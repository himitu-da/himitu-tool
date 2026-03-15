"use client";

import React, { useMemo, useState } from "react";

type TaxBracket = {
  min: number;
  max: number | null;
  rate: number;
  deduction: number;
};

const TAX_BRACKETS: TaxBracket[] = [
  { min: 1000, max: 1_949_000, rate: 0.05, deduction: 0 },
  { min: 1_950_000, max: 3_299_000, rate: 0.1, deduction: 97_500 },
  { min: 3_300_000, max: 6_949_000, rate: 0.2, deduction: 427_500 },
  { min: 6_950_000, max: 8_999_000, rate: 0.23, deduction: 636_000 },
  { min: 9_000_000, max: 17_999_000, rate: 0.33, deduction: 1_536_000 },
  { min: 18_000_000, max: 39_999_000, rate: 0.4, deduction: 2_796_000 },
  { min: 40_000_000, max: null, rate: 0.45, deduction: 4_796_000 },
];

const CHART_COLORS = ["#0ea5e9", "#10b981", "#f59e0b"];

const formatYen = (value: number) => `${Math.floor(value).toLocaleString("ja-JP")}円`;

const parseAmount = (value: string) => {
  if (!value.trim()) return 0;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
};

const findBracket = (taxableIncome: number): TaxBracket | null => {
  if (taxableIncome < 1000) {
    return null;
  }

  return (
    TAX_BRACKETS.find((bracket) => {
      const inMin = taxableIncome >= bracket.min;
      const inMax = bracket.max === null || taxableIncome <= bracket.max;
      return inMin && inMax;
    }) ?? null
  );
};

const toPolarPoint = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
};

const describeSlicePath = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
  const start = toPolarPoint(cx, cy, r, endAngle);
  const end = toPolarPoint(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
};

const linearScaleX = (value: number, min: number, max: number) => {
  const clamped = Math.max(min, Math.min(value, max));
  return (clamped - min) / (max - min);
};

export default function IncomeTaxPage() {
  const [income, setIncome] = useState("");
  const [deduction, setDeduction] = useState("");

  const result = useMemo(() => {
    const incomeValue = parseAmount(income);
    const deductionValue = parseAmount(deduction);
    const taxableIncome = Math.max(0, incomeValue - deductionValue);
    const bracket = findBracket(taxableIncome);

    const incomeTax = bracket ? Math.max(0, Math.floor(taxableIncome * bracket.rate - bracket.deduction)) : 0;
    const taxRate = bracket ? `${Math.round(bracket.rate * 100)}%` : "0%";

    return {
      incomeValue,
      deductionValue,
      taxableIncome,
      incomeTax,
      taxRate,
    };
  }, [income, deduction]);

  const pieSegments = useMemo(() => {
    const totalIncome = Math.max(0, result.incomeValue);
    if (totalIncome === 0) {
      return [] as Array<{ label: string; value: number; color: string; ratio: number }>;
    }

    const deductionPart = Math.min(result.deductionValue, totalIncome);
    const taxablePart = Math.max(0, Math.min(result.taxableIncome, totalIncome - deductionPart));
    const taxPart = Math.min(result.incomeTax, taxablePart);
    const netPart = Math.max(0, totalIncome - deductionPart - taxPart);

    const raw = [
      { label: "控除額", value: deductionPart, color: CHART_COLORS[0] },
      { label: "所得税", value: taxPart, color: CHART_COLORS[2] },
      { label: "課税所得（税引後）", value: netPart, color: CHART_COLORS[1] },
    ];

    return raw
      .filter((item) => item.value > 0)
      .map((item) => ({
        ...item,
        ratio: item.value / totalIncome,
      }));
  }, [result.deductionValue, result.incomeTax, result.incomeValue, result.taxableIncome]);

  const piePaths = useMemo(() => {
    let current = 0;
    return pieSegments.map((segment) => {
      const start = current;
      const end = current + segment.ratio * 360;
      current = end;
      return {
        ...segment,
        path: describeSlicePath(110, 110, 92, start, end),
      };
    });
  }, [pieSegments]);

  const taxRateChart = useMemo(() => {
    const xMin = 0;
    const xMax = 50_000_000;
    const points = [
      { x: 0, y: 0 },
      ...TAX_BRACKETS.map((bracket) => ({
        x: linearScaleX(bracket.min, xMin, xMax),
        y: bracket.rate,
      })),
    ];

    const userIncome = Math.max(xMin, Math.min(result.taxableIncome || 0, xMax));
    const userBracket = findBracket(userIncome);
    const userRate = userBracket ? userBracket.rate : 0;
    const userX = linearScaleX(userIncome, xMin, xMax);

    return {
      points,
      userX,
      userRate,
      userIncome,
      xMin,
      xMax,
    };
  }, [result.taxableIncome]);

  const chartXTicks = [0, 10_000_000, 20_000_000, 30_000_000, 40_000_000, 50_000_000];

  const formatXTick = (tick: number) => {
    if (tick === 0) {
      return "0";
    }
    return `${tick / 10_000}万円`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <section className="rounded-2xl p-5 sm:p-7 bg-black/5 dark:bg-white/5">
        <h1 className="text-2xl sm:text-3xl font-bold">所得税計算ツール</h1>
        <p className="mt-3 opacity-80 text-sm sm:text-base leading-relaxed">
          収入金額と控除金額から、課税所得金額・所得税・適用税率を計算します。
        </p>
      </section>

      <section className="rounded-2xl p-5 sm:p-7 bg-black/5 dark:bg-white/5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="text-sm opacity-80">収入金額（円）</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="例: 5000000"
              className="w-full rounded-xl px-4 py-3 bg-white/70 dark:bg-black/20 text-current placeholder:opacity-60 outline-none border border-black/20 dark:border-white/30"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm opacity-80">控除金額（円）</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={deduction}
              onChange={(e) => setDeduction(e.target.value)}
              placeholder="例: 1200000"
              className="w-full rounded-xl px-4 py-3 bg-white/70 dark:bg-black/20 text-current placeholder:opacity-60 outline-none border border-black/20 dark:border-white/30"
            />
          </label>
        </div>

        <div className="rounded-xl p-4 sm:p-5 bg-white/60 dark:bg-black/20 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="opacity-80">課税所得金額</span>
            <strong className="text-lg">{formatYen(result.taxableIncome)}</strong>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="opacity-80">所得税</span>
            <strong className="text-lg">{formatYen(result.incomeTax)}</strong>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="opacity-80">所得税率</span>
            <strong className="text-lg">{result.taxRate}</strong>
          </div>
        </div>

        <p className="text-xs sm:text-sm opacity-75">
          入力値が空欄の場合は0円として扱います。計算式は「所得税 = 課税所得金額 × 税率 - 控除額」です。
        </p>
      </section>

      <section className="rounded-2xl p-5 sm:p-7 bg-black/5 dark:bg-white/5">
        <h2 className="text-xl sm:text-2xl font-bold">グラフ（補足）</h2>
        <div className="mt-4 space-y-5">
          <div className="rounded-xl p-4 sm:p-5 bg-white/60 dark:bg-black/20">
            <h3 className="text-lg font-semibold">1. 円グラフ（収入の内訳）</h3>
            <div className="mt-4 flex flex-row gap-4 items-center">
              <svg viewBox="0 0 220 220" className="w-28 h-28 sm:w-32 sm:h-32 shrink-0" role="img" aria-label="収入の内訳円グラフ">
                <circle cx="110" cy="110" r="92" fill="rgba(148, 163, 184, 0.25)" />
                {piePaths.map((slice) => (
                  <path key={slice.label} d={slice.path} fill={slice.color} />
                ))}
                <circle cx="110" cy="110" r="44" fill="rgba(255, 255, 255, 0.72)" className="dark:fill-black/45" />
              </svg>

              <div className="space-y-2 text-sm sm:text-base">
                <p className="font-medium">収入合計: {formatYen(result.incomeValue)}</p>
                {(pieSegments.length > 0 ? pieSegments : [{ label: "入力待ち", value: 0, color: "#94a3b8", ratio: 0 }]).map((segment) => (
                  <div key={segment.label} className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
                    <span>
                      {segment.label}: {formatYen(segment.value)}
                      {segment.value > 0 ? ` (${(segment.ratio * 100).toFixed(1)}%)` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl p-4 sm:p-5 bg-white/60 dark:bg-black/20">
            <h3 className="text-lg font-semibold">2. 線形グラフとあなたの課税所得</h3>
            <svg viewBox="0 0 520 280" className="w-full mt-4" role="img" aria-label="課税所得と税率グラフ">
              <rect x="0" y="0" width="520" height="280" fill="transparent" />
              <line x1="56" y1="230" x2="486" y2="230" stroke="currentColor" strokeOpacity="0.35" />
              <line x1="56" y1="24" x2="56" y2="230" stroke="currentColor" strokeOpacity="0.35" />

              {[0.05, 0.1, 0.2, 0.3, 0.4, 0.45].map((rate) => {
                const y = 230 - rate * 420;
                return (
                  <g key={rate}>
                    <line x1="56" y1={y} x2="486" y2={y} stroke="currentColor" strokeOpacity="0.12" />
                    <text x="46" y={y + 4} textAnchor="end" fontSize="11" fill="currentColor" opacity="0.75">
                      {Math.round(rate * 100)}%
                    </text>
                  </g>
                );
              })}

              {chartXTicks.map((tick) => {
                const x = 56 + linearScaleX(tick, taxRateChart.xMin, taxRateChart.xMax) * 430;
                return (
                  <g key={tick}>
                    <line x1={x} y1="230" x2={x} y2="236" stroke="currentColor" strokeOpacity="0.5" />
                    <text x={x} y="252" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.75">
                      {formatXTick(tick)}
                    </text>
                  </g>
                );
              })}

              {taxRateChart.points.map((point, index) => {
                const x = 56 + point.x * 430;
                const y = 230 - point.y * 420;
                const prev = taxRateChart.points[index - 1];
                const next = taxRateChart.points[index + 1];
                const nextX = next ? 56 + next.x * 430 : 486;
                const prevY = prev ? 230 - prev.y * 420 : y;

                return (
                  <g key={`${point.x}-${point.y}`}>
                    {index > 0 && <line x1={x} y1={prevY} x2={x} y2={y} stroke="#38bdf8" strokeWidth="2" />}
                    <line x1={x} y1={y} x2={nextX} y2={y} stroke="#38bdf8" strokeWidth="3" />
                  </g>
                );
              })}

              {result.taxableIncome > 0 && (
                <g>
                  <line
                    x1={56 + taxRateChart.userX * 430}
                    y1="24"
                    x2={56 + taxRateChart.userX * 430}
                    y2="230"
                    stroke="#f97316"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx={56 + taxRateChart.userX * 430}
                    cy={230 - taxRateChart.userRate * 420}
                    r="6"
                    fill="#f97316"
                  />
                </g>
              )}

              <text x="486" y="270" textAnchor="end" fontSize="11" fill="currentColor" opacity="0.8">
                課税所得（0円〜5,000万円）
              </text>
              <text x="20" y="24" textAnchor="start" fontSize="11" fill="currentColor" opacity="0.8">
                税率
              </text>
            </svg>

            <p className="mt-3 text-sm opacity-80">
              あなたの課税所得: {formatYen(result.taxableIncome)} / 適用税率: {result.taxRate}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl p-5 sm:p-7 bg-black/5 dark:bg-white/5">
        <h2 className="text-xl sm:text-2xl font-bold">税率表（補足）</h2>
        <div className="mt-4 overflow-x-auto rounded-xl bg-white/60 dark:bg-black/20">
          <table className="w-full min-w-[640px] text-sm sm:text-base">
            <thead>
              <tr className="bg-black/10 dark:bg-white/10">
                <th className="text-left px-4 py-3 font-semibold">課税される所得金額</th>
                <th className="text-left px-4 py-3 font-semibold">税率</th>
                <th className="text-left px-4 py-3 font-semibold">控除額</th>
              </tr>
            </thead>
            <tbody>
              {TAX_BRACKETS.map((bracket) => {
                const rangeLabel =
                  bracket.max === null
                    ? `${bracket.min.toLocaleString("ja-JP")}円以上`
                    : `${bracket.min.toLocaleString("ja-JP")}円から${bracket.max.toLocaleString("ja-JP")}円まで`;

                return (
                  <tr key={`${bracket.min}-${bracket.max ?? "max"}`}>
                    <td className="px-4 py-3">{rangeLabel}</td>
                    <td className="px-4 py-3">{Math.round(bracket.rate * 100)}%</td>
                    <td className="px-4 py-3">{formatYen(bracket.deduction)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl p-5 sm:p-7 bg-black/5 dark:bg-white/5 space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold">注釈（補足）</h2>
        <p className="text-sm sm:text-base leading-relaxed opacity-85">
          ※1 令和7年分からは、基準所得金額が3億3,000万円を超える場合で、その超える部分の22.5%相当額が通常の所得税及び復興特別所得税を上回るときは、上回る部分の所得税額が加算されます。
        </p>
        <p className="text-sm sm:text-base leading-relaxed opacity-85">
          ※2 平成25年から令和19年までの各年分では、所得税と復興特別所得税（原則としてその年分の基準所得税額の2.1%）を併せて申告・納付します。
        </p>
        <p className="text-xs sm:text-sm opacity-75 leading-relaxed">
          このツールで表示する「所得税」は上記注釈の特例加算や復興特別所得税を含まない、速算表ベースの概算値です。
        </p>
      </section>
    </div>
  );
}

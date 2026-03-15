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

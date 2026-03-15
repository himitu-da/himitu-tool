"use client";

import React, { useState } from "react";

export default function BMIPage() {
  const [height, setHeight] = useState<string>("170");
  const [weight, setWeight] = useState<string>("60");

  const h = parseFloat(height) / 100;
  const w = parseFloat(weight);
  
  const isValid = h > 0 && w > 0 && !isNaN(h) && !isNaN(w);
  const bmi = isValid ? w / (h * h) : null;
  const idealWeight = isValid ? 22 * (h * h) : null;
  const weightDiff = isValid && idealWeight ? w - idealWeight : null;

  const getStatus = (bmiValue: number) => {
    if (bmiValue < 18.5) return "低体重 (痩せ型)";
    if (bmiValue < 25) return "普通体重";
    if (bmiValue < 30) return "肥満 (1度)";
    if (bmiValue < 35) return "肥満 (2度)";
    if (bmiValue < 40) return "肥満 (3度)";
    return "肥満 (4度)";
  };

  const W = 400;
  const H = 300;
  const minW = 30;
  const maxW = 120;
  const minH = 130;
  const maxH = 200;

  const mapX = (val: number) => ((val - minW) / (maxW - minW)) * W;
  const mapY = (val: number) => H - ((val - minH) / (maxH - minH)) * H;

  const generateCurve = (bmiVal: number) => {
    let d = "";
    for (let cW = minW; cW <= maxW; cW += 2) {
      const cH = Math.sqrt(cW / bmiVal) * 100;
      const x = mapX(cW);
      const y = mapY(cH);
      if (cW === minW) d += `M ${x},${y} `;
      else d += `L ${x},${y} `;
    }
    return d;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">BMI計算機</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 左カラム: 入力と結果 */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 opacity-80">身長 (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white dark:bg-black/50 border border-black/20 dark:border-white/20 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="170"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 opacity-80">体重 (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white dark:bg-black/50 border border-black/20 dark:border-white/20 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="60"
                />
              </div>
            </div>
          </div>
          
          <div className="p-6 rounded-2xl bg-blue-500/10 text-center flex flex-col justify-center min-h-[220px]">
            {isValid && bmi ? (
              <div className="animate-in fade-in zoom-in-95 duration-300">
                <div className="text-sm opacity-80 mb-1">現在のBMI</div>
                <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {bmi.toFixed(2)}
                </div>
                <div className="text-xl font-bold mb-4">{getStatus(bmi)}</div>
                
                <div className="flex flex-wrap gap-4 justify-center text-sm mt-6">
                  <div className="pt-2 px-4 pb-3 bg-black/5 dark:bg-white/5 rounded-xl min-w-[120px]">
                    <div className="opacity-80 text-xs mb-1">適正体重</div>
                    <div className="font-bold text-lg">{idealWeight!.toFixed(1)} <span className="text-xs font-normal">kg</span></div>
                  </div>
                  <div className="pt-2 px-4 pb-3 bg-black/5 dark:bg-white/5 rounded-xl min-w-[120px]">
                    <div className="opacity-80 text-xs mb-1">適正との差</div>
                    <div className="font-bold text-lg">
                      {weightDiff! > 0 ? "+" : ""}{weightDiff!.toFixed(1)} <span className="text-xs font-normal">kg</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center opacity-60">
                身長と体重を入力してください
              </div>
            )}
          </div>
        </div>

        {/* 右カラム: グラフ */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5">
            <h3 className="font-bold mb-6 opacity-90">BMI メーター</h3>
            <div className="relative pt-8 pb-4">
              <div className="flex h-4 rounded-full overflow-hidden">
                <div className="bg-blue-400" style={{ width: "21.25%" }} title="〜18.5: 痩せ型"></div>
                <div className="bg-green-400" style={{ width: "16.25%" }} title="18.5〜25: 普通体重"></div>
                <div className="bg-yellow-400" style={{ width: "12.5%" }} title="25〜30: 肥満(1度)"></div>
                <div className="bg-orange-400" style={{ width: "12.5%" }} title="30〜35: 肥満(2度)"></div>
                <div className="bg-red-400" style={{ width: "12.5%" }} title="35〜40: 肥満(3度)"></div>
                <div className="bg-red-600" style={{ width: "25%" }} title="40〜: 肥満(4度)"></div>
              </div>
              
              {isValid && bmi && (
                <div 
                  className="absolute top-2 w-0 h-0 transition-all duration-300 ease-out"
                  style={{ 
                    left: `${Math.max(0, Math.min(100, ((bmi - 10) / 40) * 100))}%`,
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderTop: "10px solid currentColor",
                    transform: "translateX(-50%)"
                  }}
                />
              )}
            </div>
            
            <div className="flex justify-between text-[10px] md:text-xs opacity-60 px-1 relative">
              <span className="absolute" style={{ left: "0%", transform: "translateX(-50%)" }}>10</span>
              <span className="absolute" style={{ left: "21.25%", transform: "translateX(-50%)" }}>18.5</span>
              <span className="absolute" style={{ left: "37.5%", transform: "translateX(-50%)" }}>25</span>
              <span className="absolute" style={{ left: "50%", transform: "translateX(-50%)" }}>30</span>
              <span className="absolute" style={{ left: "62.5%", transform: "translateX(-50%)" }}>35</span>
              <span className="absolute" style={{ left: "75%", transform: "translateX(-50%)" }}>40</span>
              <span className="absolute" style={{ left: "100%", transform: "translateX(-50%)" }}>50</span>
            </div>
          </div>
          
          <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5">
            <h3 className="font-bold mb-4 opacity-90">体格分布図</h3>
            <div className="relative w-full aspect-[4/3] bg-white/50 dark:bg-black/20 rounded-xl overflow-hidden text-[10px]">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
                {/* 軸とグリッド */}
                {[140, 160, 180, 200].map(hAxis => (
                  <g key={`h-${hAxis}`}>
                    <line x1="0" y1={mapY(hAxis)} x2={W} y2={mapY(hAxis)} stroke="currentColor" strokeOpacity="0.1" />
                    <text x="5" y={mapY(hAxis) - 5} fill="currentColor" opacity="0.5">{hAxis}cm</text>
                  </g>
                ))}
                {[40, 60, 80, 100, 120].map(wAxis => (
                  <g key={`w-${wAxis}`}>
                    <line x1={mapX(wAxis)} y1="0" x2={mapX(wAxis)} y2={H} stroke="currentColor" strokeOpacity="0.1" />
                    <text x={mapX(wAxis) + 5} y={H - 5} fill="currentColor" opacity="0.5">{wAxis}kg</text>
                  </g>
                ))}

                {/* BMI 曲線とエリア */}
                <path d={generateCurve(18.5)} stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.6" />
                <text x={mapX(45)} y={mapY(Math.sqrt(45/18.5)*100) - 5} fill="#3b82f6" opacity="0.8">BMI 18.5</text>
                
                <path d={generateCurve(25)} stroke="#22c55e" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.8" />
                <text x={mapX(55)} y={mapY(Math.sqrt(55/25)*100) - 5} fill="#22c55e" opacity="0.8" fontWeight="bold">BMI 25</text>

                <path d={generateCurve(30)} stroke="#eab308" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.6" />
                <text x={mapX(75)} y={mapY(Math.sqrt(75/30)*100) - 5} fill="#eab308" opacity="0.8">BMI 30</text>

                <path d={generateCurve(35)} stroke="#f97316" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.6" />
                <path d={generateCurve(40)} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" fill="none" opacity="0.6" />

                {/* 平均値（男性：20代） */}
                <circle cx={mapX(67.6)} cy={mapY(171.5)} r="4" fill="#3b82f6" />
                <text x={mapX(67.6) + 8} y={mapY(171.5) + 4} fill="currentColor" opacity="0.8" fontWeight="bold">平均男性</text>

                {/* 平均値（女性：20代） */}
                <circle cx={mapX(53.6)} cy={mapY(154.3)} r="4" fill="#ec4899" />
                <text x={mapX(53.6) + 8} y={mapY(154.3) + 4} fill="currentColor" opacity="0.8" fontWeight="bold">平均女性</text>

                {/* ユーザー位置 */}
                {isValid && (
                  <g className="transition-all duration-300 ease-out" style={{ transform: `translate(${mapX(w)}px, ${mapY(h * 100)}px)` }}>
                    <circle cx="0" cy="0" r="8" fill="#8b5cf6" className="animate-pulse" opacity="0.5" />
                    <circle cx="0" cy="0" r="4" fill="#8b5cf6" />
                    <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
                    <text x="12" y="4" fill="#8b5cf6" fontWeight="bold" fontSize="12">あなた</text>
                  </g>
                )}
              </svg>
            </div>
            <p className="text-[10px] md:text-xs opacity-60 mt-3 text-center">
              ※横軸: 体重 / 縦軸: 身長
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 p-6 md:p-8 rounded-2xl bg-black/5 dark:bg-white/5 space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">
            BMI (Body Mass Index) とは
          </h2>
          <p className="leading-relaxed opacity-90">
            BMI（ボディマス指数）とは、体重と身長から算出される、人の肥満度を表す体格指数です。国際的な指標として用いられており、健康を維持するための指標の一つとして重要視されています。
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="bg-black/5 dark:bg-white/5 p-5 rounded-xl flex-1">
            <h3 className="font-bold opacity-80 mb-2 text-sm">計算式</h3>
            <p className="font-mono text-lg font-bold">
              体重(kg) ÷ ｛ 身長(m) × 身長(m) ｝
            </p>
          </div>
          
          <div className="bg-black/5 dark:bg-white/5 p-5 rounded-xl flex-1">
            <h3 className="font-bold opacity-80 mb-2 text-sm">適正体重の計算式</h3>
            <p className="font-mono text-lg font-bold">
              22 × ｛ 身長(m) × 身長(m) ｝
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">日本肥満学会による判定基準</h3>
          <div className="overflow-x-auto rounded-xl bg-black/5 dark:bg-white/5 p-4">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2 px-4 opacity-70 font-normal text-sm">状態</th>
                  <th className="py-2 px-4 opacity-70 font-normal text-sm">BMI (指数)</th>
                </tr>
              </thead>
              <tbody className="opacity-90">
                <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 rounded-l-lg">低体重 (痩せ型)</td>
                  <td className="py-3 px-4 rounded-r-lg">18.5未満</td>
                </tr>
                <tr className="bg-black/5 dark:bg-white/5">
                  <td className="py-3 px-4 font-bold rounded-l-lg text-green-600 dark:text-green-400">普通体重</td>
                  <td className="py-3 px-4 font-bold rounded-r-lg">18.5 以上 〜 25 未満</td>
                </tr>
                <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 rounded-l-lg">肥満 (1度)</td>
                  <td className="py-3 px-4 rounded-r-lg">25 以上 〜 30 未満</td>
                </tr>
                <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 rounded-l-lg">肥満 (2度)</td>
                  <td className="py-3 px-4 rounded-r-lg">30 以上 〜 35 未満</td>
                </tr>
                <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 rounded-l-lg">肥満 (3度)</td>
                  <td className="py-3 px-4 rounded-r-lg">35 以上 〜 40 未満</td>
                </tr>
                <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 rounded-l-lg">肥満 (4度)</td>
                  <td className="py-3 px-4 rounded-r-lg">40 以上</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm opacity-60 mt-4 leading-relaxed">
            ※BMIが22になるときの体重が標準体重で、最も病気になりにくい状態であるとされています。上記は日本国内（日本肥満学会）の基準です。
          </p>
        </div>
      </div>
    </div>
  );
}

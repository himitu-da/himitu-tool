const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'src', 'app');

const TPL_TEXT = (title, name, btn, logic) => `"use client";
import React, { useState } from "react";
export default function ${name}() {
  const [inp, setInp] = useState("");
  const [out, setOut] = useState("");
  const run = () => { try { ${logic} } catch(e) { setOut("エラー"); } };
  return (
    <div className="max-w-2xl mx-auto p-6 rounded-xl shadow-lg border border-opacity-20 border-current bg-white/10 backdrop-blur-sm">
      <h1 className="text-2xl font-bold mb-6 text-center">${title}</h1>
      <div className="flex flex-col gap-4">
        <textarea value={inp} onChange={e=>setInp(e.target.value)} className="w-full h-32 p-3 bg-black/10 rounded-lg border-current focus:ring-2" placeholder="入力..."></textarea>
        <button onClick={run} className="py-3 bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-lg font-bold transition-colors">${btn}</button>
        <textarea value={out} readOnly className="w-full h-32 p-3 bg-black/20 rounded-lg opacity-80" placeholder="結果..."></textarea>
      </div>
    </div>
  );
}`;

const TPL_NUM = (title, name, fields, logic) => `"use client";
import React, { useState } from "react";
export default function ${name}() {
  ${fields.map(f => `const [${f}, set_${f}] = useState("");`).join('\n  ')}
  const [out, setOut] = useState("");
  const run = () => { try { ${logic} } catch(e) { setOut("エラー"); } };
  return (
    <div className="max-w-md mx-auto p-6 rounded-xl shadow-lg border border-opacity-20 border-current bg-white/10 backdrop-blur-sm">
      <h1 className="text-2xl font-bold mb-6 text-center">${title}</h1>
      <div className="flex flex-col gap-4">
        ${fields.map(f => `<input type="number" value={${f}} onChange={e=>set_${f}(e.target.value)} placeholder="${f}" className="p-3 bg-black/10 rounded-lg text-current border-current" />`).join('\n        ')}
        <button onClick={run} className="py-3 bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-lg font-bold transition-colors">計算</button>
        {out && <div className="p-4 bg-black/20 rounded-lg text-center text-xl font-bold break-all">{out}</div>}
      </div>
    </div>
  );
}`;

const db = [
  ['b64-enc', 'Base64エンコード', '🔤', '文字をBase64に', TPL_TEXT('Base64エンコード', 'B64E', '変換', 'setOut(btoa(encodeURIComponent(inp).replace(/%([0-9A-F]{2})/g, (m, p1) => String.fromCharCode("0x" + p1))))')],
  ['b64-dec', 'Base64デコード', '🔡', 'Base64を文字に', TPL_TEXT('Base64デコード', 'B64D', '変換', 'setOut(decodeURIComponent(atob(inp).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")))')],
  ['url-enc', 'URLエンコード', '🔗', '構成要素を安全に', TPL_TEXT('URLエンコード', 'UrlE', 'エンコード', 'setOut(encodeURIComponent(inp))')],
  ['url-dec', 'URLデコード', '🌐', 'エンコード復元', TPL_TEXT('URLデコード', 'UrlD', 'デコード', 'setOut(decodeURIComponent(inp))')],
  ['upper', '大文字変換', '🅰️', '英字を大文字に', TPL_TEXT('大文字変換', 'Up', '変換', 'setOut(inp.toUpperCase())')],
  ['lower', '小文字変換', 'a', '英字を小文字に', TPL_TEXT('小文字変換', 'Lo', '変換', 'setOut(inp.toLowerCase())')],
  ['reverse', '文字反転', '🔄', '文字列を逆順に', TPL_TEXT('文字反転', 'Rev', '反転', 'setOut(inp.split("").reverse().join(""))')],
  ['dedup', '重複行削除', '🗑️', '重複の削除', TPL_TEXT('重複行の削除', 'Ded', '削除', 'setOut(Array.from(new Set(inp.split("\\n"))).join("\\n"))')],
  ['sort-lines', '行ソート', '📋', '辞書順ソート', TPL_TEXT('行のソート', 'SortL', 'ソート', 'setOut(inp.split("\\n").sort().join("\\n"))')],
  ['json-format', 'JSON整形', '｛', 'JSONを見やすく', TPL_TEXT('JSONフォーマッタ', 'JsonF', '整形', 'setOut(JSON.stringify(JSON.parse(inp),null,2))')],
  ['json-min', 'JSON圧縮', '｝', 'JSONの空白削除', TPL_TEXT('JSON圧縮', 'JsonM', '圧縮', 'setOut(JSON.stringify(JSON.parse(inp)))')],
  ['html-enc', 'HTMLエスケープ', '🛡️', '<>を置換', TPL_TEXT('HTMLエンティティ化', 'HtmlE', '置換', 'setOut(inp.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/\\\'/g,"&#039;"))')],
  ['ascii-enc', 'ASCII変換', '🔢', '文字番号化', TPL_TEXT('ASCIIコード変換', 'Asc', '変換', 'setOut(inp.split("").map(c=>c.charCodeAt(0)).join(" "))')],
  ['camel-case', 'キャメルケース', '🐫', 'A B -> aB', TPL_TEXT('キャメルケース変換', 'Cam', '変換', 'setOut(inp.replace(/(?:^\|\\s+)(\\w)/g, (m,p,i)=>i===0?p.toLowerCase():p.toUpperCase()))')],
  ['snake-case', 'スネークケース', '🐍', 'A B -> a_b', TPL_TEXT('スネークケース変換', 'Snk', '変換', 'setOut(inp.trim().replace(/\\s+/g, "_").toLowerCase())')],
  ['kebab-case', 'ケバブケース', '🍢', 'A B -> a-b', TPL_TEXT('ケバブケース変換', 'Keb', '変換', 'setOut(inp.trim().replace(/\\s+/g, "-").toLowerCase())')],
  ['shuffle-lines', '行シャッフル', '🔀', 'ランダムソート', TPL_TEXT('行をシャッフル', 'Shuf', '実行', 'setOut(inp.split("\\n").sort(()=>Math.random()-0.5).join("\\n"))')],
  ['tax-calc', '消費税計算', '💰', '税込/税抜', TPL_NUM('消費税(10%)計算', 'Tax', ['price'], 'setOut("税込: "+Math.floor(Number(price)*1.1)+"円")')],
  ['discount-calc', '割引計算', '📉', '○%オフ価格', TPL_NUM('割引計算', 'Disc', ['price','percent'], 'setOut(Math.floor(Number(price)*(1-Number(percent)/100))+"円")')],
  ['split-bill', '割り勘', '🤝', '人数で割る', TPL_NUM('割り勘計算', 'Split', ['amount','people'], 'setOut("1人: "+Math.ceil(Number(amount)/Number(people))+"円")')],
  ['aspect-ratio', 'アスペクト比', '🖥️', 'W/Hの比率', TPL_NUM('アスペクト比', 'Ratio', ['w','h'], 'const gcd=(a,b)=>b?gcd(b,a%b):a; const g=gcd(w,h); setOut((w/g)+":"+(h/g))')],
  ['random-num', '乱数生成', '🎲', '範囲内の乱数', TPL_NUM('乱数生成', 'Rand', ['min','max'], 'setOut(Math.floor(Math.random()*(Number(max)-Number(min)+1))+Number(min))')],
  ['age-calc', '年齢計算', '🎂', '生年から', TPL_NUM('年齢計算', 'Age', ['year'], 'setOut((new Date().getFullYear()-Number(year))+"歳")')],
  ['byte-calc', 'バイト変換', '💾', 'B > KB/MB/GB', TPL_NUM('バイト単位変換', 'Byte', ['bytes'], 'const b=Number(bytes); setOut("MB: "+(b/1024**2).toFixed(2))')],
  ['percent-calc', 'パーセント計算', '📈', 'AはBの何%？', TPL_NUM('割合計算', 'Perc', ['A','B'], 'setOut((Number(A)/Number(B)*100).toFixed(2)+"%")')],
  ['speed-calc', '速度変換', '🚗', 'km/h > m/s', TPL_NUM('速度変換', 'Speed', ['kmh'], 'setOut((Number(kmh)*1000/3600).toFixed(2)+"m/s")')],
  ['temp-calc', '温度変換', '🌡️', 'C > F', TPL_NUM('温度変換(摂氏・華氏)', 'Temp', ['c'], 'setOut((Number(c)*9/5+32).toFixed(2)+"°F")')],
  ['profit-margin', '利益率', '📊', '原価と売価', TPL_NUM('利益率計算', 'Prof', ['cost','sales'], 'let c=Number(cost),s=Number(sales); setOut(((s-c)/s*100).toFixed(2)+"%")')],
  ['bin-enc', '2進数変換', '0️⃣', '文字をバイナリに', TPL_TEXT('テキスト → 2進数', 'Bin', '変換', 'setOut(inp.split("").map(c=>c.charCodeAt(0).toString(2).padStart(8,"0")).join(" "))')],
  ['hex-enc', '16進数変換', '#️⃣', '文字をHEXに', TPL_TEXT('テキスト → 16進数', 'Hex', '変換', 'setOut(inp.split("").map(c=>c.charCodeAt(0).toString(16).padStart(2,"0")).join(" "))')]
];

const cs = [
  ['uuid', 'UUID生成', '🆔', 'v4フォーマット', `"use client"; import React,{useState} from "react"; export default function U(){const [u,s]=useState(""); return <div className="max-w-md mx-auto p-6 bg-white/10 rounded-xl shadow border border-opacity-20 border-current text-center"><h1 className="text-2xl font-bold mb-6">UUID生成</h1><button onClick={()=>s(crypto.randomUUID())} className="w-full py-3 bg-blue-500/80 text-white rounded-lg font-bold mb-4">生成</button><div className="p-4 bg-black/20 break-all font-mono">{u||"---"}</div></div>;}`],
  ['dice', 'サイコロ', '🎲', '1〜6のランダム', `"use client"; import React,{useState} from "react"; export default function D(){const [v,s]=useState(1); return <div className="max-w-md mx-auto p-6 bg-white/10 rounded-xl shadow border border-opacity-20 border-current text-center"><h1 className="text-2xl font-bold mb-6">サイコロ</h1><div className="text-9xl mb-6">{["⚀","⚁","⚂","⚃","⚄","⚅"][v-1]}</div><button onClick={()=>s(Math.floor(Math.random()*6)+1)} className="px-8 py-3 bg-blue-500/80 text-white rounded-lg font-bold">振る</button></div>;}`],
  ['unix-time', 'UNIXタイム', '🕒', '現在時刻の秒数', `"use client"; import React,{useState,useEffect} from "react"; export default function U(){const [t,s]=useState(Math.floor(Date.now()/1000)); useEffect(()=>{const i=setInterval(()=>s(Math.floor(Date.now()/1000)),1000); return()=>clearInterval(i);},[]); return <div className="max-w-md mx-auto p-6 bg-white/10 rounded-xl border-current border border-opacity-20 text-center"><h1 className="text-2xl font-bold mb-6">UNIX Time</h1><div className="text-4xl font-mono">{t}</div></div>;}`],
  ['color-gen', '色生成', '🎨', 'ランダム配色', `"use client"; import React,{useState} from "react"; export default function C(){const [c,s]=useState("#3b82f6"); return <div className="max-w-md mx-auto p-6 bg-white/10 rounded-xl border border-current border-opacity-20 text-center"><h1 className="text-2xl font-bold mb-6">ランダムカラー</h1><div className="w-full h-32 rounded-lg mb-4" style={{backgroundColor:c}}></div><div className="text-2xl font-mono mb-4">{c}</div><button onClick={()=>s("#"+Math.floor(Math.random()*16777215).toString(16).padStart(6,"0"))} className="px-8 py-3 bg-blue-500/80 text-white rounded-lg font-bold">生成</button></div>;}`],
  ['days-diff', '日付差分', '📅', '日数計算', `"use client"; import React,{useState} from "react"; export default function D(){const [d1,s1]=useState(""); const [d2,s2]=useState(""); const [o,so]=useState(""); return <div className="max-w-md mx-auto p-6 bg-white/10 rounded-xl border border-current border-opacity-20 flex flex-col gap-4 text-center"><h1 className="text-2xl font-bold">日付の差分</h1><input type="date" value={d1} onChange={e=>s1(e.target.value)} className="p-3 bg-black/10 text-current rounded" /><input type="date" value={d2} onChange={e=>s2(e.target.value)} className="p-3 bg-black/10 text-current rounded" /><button onClick={()=>so(Math.abs((new Date(d1)-new Date(d2))/(1000*60*60*24))+"日")} className="py-3 bg-blue-500/80 text-white rounded font-bold">計算</button><div className="font-bold text-xl">{o}</div></div>;}`]
];

const all = [...db.map(x=>({id:x[0], title:x[1], icon:x[2], desc:x[3], code:x[4]})), ...cs.map(x=>({id:x[0], title:x[1], icon:x[2], desc:x[3], code:x[4]}))];

all.forEach(t => {
  const p = path.join(baseDir, t.id);
  if(!fs.existsSync(p)) fs.mkdirSync(p, {recursive:true});
  fs.writeFileSync(path.join(p, 'page.tsx'), t.code);
});

let pSrc = fs.readFileSync(path.join(baseDir, 'page.tsx'), 'utf8');
const linesStr = all.map(t => `    { title: "${t.title}", path: "/${t.id}", icon: "${t.icon}", desc: "${t.desc}" },`).join('\n');
pSrc = pSrc.replace(/\s+\];\s+return\s*\(/m, ',\n' + linesStr + '\n  ];\n\n  return (');
fs.writeFileSync(path.join(baseDir, 'page.tsx'), pSrc);

console.log("Created", all.length, "tools");

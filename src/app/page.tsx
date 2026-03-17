"use client";

import Link from "next/link";
import { useState } from "react";
import { GoogleAd } from "../components/GoogleAd";

export default function Home() {
  const [isMinimized, setIsMinimized] = useState(false);

  const categorizedTools = [
    {
      category: "テキスト・文字列処理",
      tools: [
        { title: "文字数カウント", path: "/char-counter", icon: "📝", desc: "文字・単語・行数をカウント" },
        { title: "大文字変換", path: "/upper", icon: "🅰️", desc: "英字を大文字に" },
        { title: "小文字変換", path: "/lower", icon: "a", desc: "英字を小文字に" },
        { title: "文字反転", path: "/reverse", icon: "🔄", desc: "文字列を逆順に" },
        { title: "重複行削除", path: "/dedup", icon: "✂️", desc: "重複の削除" },
        { title: "行ソート", path: "/sort-lines", icon: "📋", desc: "辞書順ソート" },
        { title: "行シャッフル", path: "/shuffle-lines", icon: "🔀", desc: "ランダムソート" },
        { title: "キャメルケース", path: "/camel-case", icon: "🐫", desc: "A B -> aB" },
        { title: "スネークケース", path: "/snake-case", icon: "🐍", desc: "A B -> a_b" },
        { title: "ケバブケース", path: "/kebab-case", icon: "🍢", desc: "A B -> a-b" },
      ],
    },
    {
      category: "開発・エンコード",
      tools: [
        { title: "Base64エンコード", path: "/b64-enc", icon: "🔤", desc: "文字をBase64に" },
        { title: "Base64デコード", path: "/b64-dec", icon: "🔡", desc: "Base64を文字に" },
        { title: "URLエンコード", path: "/url-enc", icon: "🔗", desc: "構成要素を安全に" },
        { title: "URLデコード", path: "/url-dec", icon: "🌐", desc: "エンコード復元" },
        { title: "HTMLエスケープ", path: "/html-enc", icon: "🛡️", desc: "<>を置換" },
        { title: "ASCII変換", path: "/ascii-enc", icon: "🔢", desc: "文字番号化" },
        { title: "2進数変換", path: "/bin-enc", icon: "0️⃣", desc: "文字をバイナリに" },
        { title: "16進数変換", path: "/hex-enc", icon: "#️⃣", desc: "文字をHEXに" },
        { title: "JSON整形", path: "/json-format", icon: "｛", desc: "JSONを見やすく" },
        { title: "JSON圧縮", path: "/json-min", icon: "｝", desc: "JSONの空白削除" },
      ],
    },
    {
      category: "計算・単位変換",
      tools: [
        { title: "電卓", path: "/calculator", icon: "🧮", desc: "シンプルな電卓" },
        { title: "消費税計算", path: "/tax-calc", icon: "💴", desc: "税込/税抜" },
        { title: "割引計算", path: "/discount-calc", icon: "📉", desc: "○%オフ価格" },
        { title: "割り勘", path: "/split-bill", icon: "🤝", desc: "人数で割る" },
        { title: "パーセント計算", path: "/percent-calc", icon: "📈", desc: "AはBの何%？" },
        { title: "所得税計算", path: "/income-tax", icon: "🧾", desc: "収入と控除から税額を計算" },
        { title: "利益率", path: "/profit-margin", icon: "📊", desc: "原価と売価" },
        { title: "年齢計算", path: "/age-calc", icon: "🎂", desc: "生年から" },
        { title: "BMI計算", path: "/bmi", icon: "🏃", desc: "身長と体重からBMIを計算" },
        { title: "長さの変換", path: "/length", icon: "📏", desc: "ミリからマイルまで変換" },
        { title: "面積の変換", path: "/area", icon: "📐", desc: "平米から坪まで変換" },
        { title: "重さの変換", path: "/weight", icon: "⚖️", desc: "グラムからポンドまで変換" },
        { title: "バイト変換", path: "/byte-calc", icon: "💾", desc: "B > KB/MB/GB" },
        { title: "速度変換", path: "/speed-calc", icon: "🚗", desc: "km/h > m/s" },
        { title: "温度変換", path: "/temp-calc", icon: "🌡️", desc: "C > F" },
        { title: "アスペクト比", path: "/aspect-ratio", icon: "🖼️", desc: "W/Hの比率" },
      ],
    },
    {
      category: "日付・時間",
      tools: [
        { title: "カレンダー", path: "/calendar", icon: "📅", desc: "シンプルなカレンダー" },
        { title: "西暦/元号変換", path: "/year-converter", icon: "🇯🇵", desc: "西暦と和暦の変換" },
        { title: "世界時計", path: "/world-clock", icon: "🌍", desc: "世界の現在時刻" },
        { title: "日付差分", path: "/days-diff", icon: "📆", desc: "日数計算" },
        { title: "UNIXタイム", path: "/unix-time", icon: "🕒", desc: "現在時刻の秒数" },
        { title: "ストップウォッチ", path: "/stopwatch", icon: "⏱️", desc: "ラップ機能付き" },
        { title: "タイマーツール", path: "/timer", icon: "⏲️", desc: "ブラウザで使える便利なタイマー。" },
        { title: "リピートタイマー", path: "/repeat-timer", icon: "🔁", desc: "繰り返し計測" },
        { title: "ポモドーロタイマー", path: "/pomodoro", icon: "🍅", desc: "25分作業＋5分休憩" },
        { title: "給料タイマー", path: "/salary-timer", icon: "💰", desc: "時間あたりの稼ぎを可視化" },
      ],
    },
    {
      category: "ジェネレーター・その他",
      tools: [
        { title: "パスワード生成", path: "/password-generator", icon: "🔑", desc: "安全なパスワードを自動生成" },
        { title: "QRコード生成", path: "/qr-code", icon: "📱", desc: "URLからQRを生成" },
        { title: "画像変換", path: "/image-conv", icon: "🖼️", desc: "画像形式を相互変換" },
        { title: "ハッシュ生成", path: "/hash-generator", icon: "🔒", desc: "テキストからSHA-256を生成" },
        { title: "UUID生成", path: "/uuid", icon: "🆔", desc: "v4フォーマット" },
        { title: "ダミーテキスト生成", path: "/dummy-text", icon: "📃", desc: "文字数指定で生成" },
        { title: "乱数生成", path: "/random-num", icon: "🎲", desc: "範囲内の乱数" },
        { title: "サイコロ", path: "/dice", icon: "🎲", desc: "1〜6のランダム" },
        { title: "色生成", path: "/color-gen", icon: "🎨", desc: "ランダム配色" },
        { title: "カラーコード変換", path: "/color-converter", icon: "🖌️", desc: "HEXとRGBを相互変換" },
      ],
    },
  ];

  return (
    <div>
      <section className="p-6 sm:p-8 bg-black/5 dark:bg-white/5 rounded-xl backdrop-blur-sm text-center">
        <p className="text-lg sm:text-xl font-medium opacity-90 mb-3">
          日常の『ちょっと困った』を1つのサイトで解決したい。
        </p>
        <p className="text-sm sm:text-base opacity-75 leading-relaxed">
          そんな思いから、日本人が作成したツール集です。<br />
          かゆいところに手が届くツールを、この1つのウェブサイトで完結させることを目指しています。
        </p>
      </section>

      <GoogleAd className="mt-10 sm:mt-12" />

      <section className="mt-16 sm:mt-20">
        <div className="flex items-center justify-center gap-2 my-6 sm:my-8">
          <h2 className="text-2xl sm:text-3xl font-bold opacity-80 text-center">ツール一覧</h2>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
            title={isMinimized ? "最大化" : "最小化"}
          >
            {isMinimized ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 14 10 14 10 20"></polyline>
                <polyline points="20 10 14 10 14 4"></polyline>
                <line x1="14" y1="10" x2="21" y2="3"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
            )}
          </button>
        </div>

        {isMinimized ? (
          <div className="mt-12 flex flex-col gap-12">
            {categorizedTools.map((cat) => (
              <div key={cat.category}>
                <h3 className="text-xl font-bold opacity-70 mb-6 text-center sm:text-left">{cat.category}</h3>
                <ul className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  {cat.tools.map((tool) => (
                    <li key={tool.path}>
                      <Link
                        href={tool.path}
                        className="inline-block px-4 py-2 bg-black/5 dark:bg-white/5 rounded-md hover:opacity-75 transition-opacity"
                      >
                        <span className="text-sm font-medium">{tool.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 sm:mt-16 flex flex-col gap-16">
            {categorizedTools.map((cat) => (
              <div key={cat.category}>
                <h3 className="text-2xl font-bold opacity-80 mb-8 text-center sm:text-left">{cat.category}</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cat.tools.map((tool) => (
                    <li key={tool.path}>
                      <Link
                        href={tool.path}
                        className="flex flex-col items-center justify-center p-6 bg-black/5 dark:bg-white/5 rounded-xl hover:-translate-y-1 transition-transform h-full backdrop-blur-sm"
                      >
                        <div className="text-4xl mb-3">{tool.icon}</div>
                        <h3 className="text-xl font-bold mb-2 text-current">{tool.title}</h3>
                        <p className="opacity-70 text-sm text-center">{tool.desc}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

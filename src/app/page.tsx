import Link from "next/link";

export default function Home() {
  const tools = [
    { title: "電卓", path: "/calculator", icon: "🧮", desc: "シンプルな電卓" },
    { title: "長さの変換", path: "/length", icon: "📏", desc: "ミリからマイルまで変換" },
    { title: "面積の変換", path: "/area", icon: "📐", desc: "平米から坪まで変換" },
    { title: "重さの変換", path: "/weight", icon: "⚖️", desc: "グラムからポンドまで変換" },
    { title: "BMI計算", path: "/bmi", icon: "🏃", desc: "身長と体重からBMIを計算" },
    { title: "ストップウォッチ", path: "/stopwatch", icon: "⏱️", desc: "ラップ機能付き" },
    { title: "リピートタイマー", path: "/repeat-timer", icon: "🔁", desc: "繰り返し計測" },
    { title: "ポモドーロタイマー", path: "/pomodoro", icon: "🍅", desc: "25分作業＋5分休憩" },
    { title: "パスワード生成", path: "/password-generator", icon: "🔑", desc: "安全なパスワードを自動生成" },
    { title: "QRコード生成", path: "/qr-code", icon: "📱", desc: "URLからQRを生成" },
    { title: "文字数カウント", path: "/char-counter", icon: "📝", desc: "文字・単語・行数をカウント" },
    { title: "カラーコード変換", path: "/color-converter", icon: "🎨", desc: "HEXとRGBを相互変換" },
    { title: "カレンダー", path: "/calendar", icon: "📅", desc: "シンプルなカレンダー" },
    { title: "西暦/元号変換", path: "/year-converter", icon: "🔄", desc: "西暦と和暦の変換" },
    { title: "世界時計", path: "/world-clock", icon: "🌍", desc: "世界の現在時刻" },
    { title: "ハッシュ生成", path: "/hash-generator", icon: "#️⃣", desc: "テキストからSHA-256を生成" },
    { title: "ダミーテキスト生成", path: "/dummy-text", icon: "📃", desc: "文字数指定で生成" },
    { title: "タイマーツール", path: "/timer", icon: "⏲️", desc: "ブラウザで使える便利なタイマー。" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 border-b pb-2 opacity-80 border-current">ツール一覧</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <li key={tool.path}>
            <Link 
              href={tool.path} 
              className="flex flex-col items-center justify-center p-6 bg-white/5 border border-opacity-20 border-current rounded-xl shadow-sm hover:bg-white/10 hover:scale-105 transition-all h-full backdrop-blur-sm"
            >
              <div className="text-4xl mb-3">{tool.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-current">{tool.title}</h3>
              <p className="opacity-70 text-sm text-center">{tool.desc}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

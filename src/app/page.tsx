import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 border-b pb-2">ツール一覧</h2>
      <ul className="space-y-4">
        <li>
          <Link 
            href="/timer" 
            className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-xl font-bold text-blue-600 mb-2">タイマーツール</h3>
            <p className="text-gray-600">ブラウザで使える便利なタイマー。設定の保存や複数テーマに対応しています。</p>
          </Link>
        </li>
        {/* 他のツールはここに追加 */}
      </ul>
    </div>
  );
}

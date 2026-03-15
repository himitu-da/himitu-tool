import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: '%s | ひみっちゃんのKAMIツール',
    default: 'ひみっちゃんのKAMIツール | 便利なWebツール集',
  },
  description: "ひみっちゃんのKAMIツール一覧",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased font-sans text-gray-900 bg-white">
        <header className="bg-gray-100 border-b border-gray-300">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">
              <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
                ひみっちゃんのKAMIツール
              </Link>
            </h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 min-h-screen">
          {children}
        </main>

        <footer className="bg-gray-800 text-white py-6 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <a href="https://hmts.jp" className="text-blue-300 hover:text-blue-100 transition-colors mb-2 inline-block">
              ひみっちゃんのKAMIサイト
            </a>
            <p className="text-sm text-gray-400">&copy; 2025 ひみっちゃん</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

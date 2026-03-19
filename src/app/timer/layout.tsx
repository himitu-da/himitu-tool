import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "タイマーツール",
  description: "ブラウザで使える便利なタイマーツール。設定の保存や複数テーマ、アラーム音に対応しています。",
};

export default function TimerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

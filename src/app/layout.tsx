import type { Metadata } from "next";
import Script from "next/script";
import { ThemeProvider } from "./ThemeProvider";
import { GlobalHeader } from "./GlobalHeader";
import { ThemeWrapper } from "./ThemeWrapper";
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
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-7YK9QB157S`}
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-7YK9QB157S');
            `,
          }}
        />
      </head>
      <body className="antialiased font-sans flex flex-col min-h-screen">
        <ThemeProvider>
          <ThemeWrapper>
            <GlobalHeader />

            <main className="container mx-auto px-4 py-8 flex-1">
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
          </ThemeWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

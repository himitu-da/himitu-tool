"use client";

import Link from "next/link";
import { useState } from "react";
import { GoogleAd } from "../components/GoogleAd";
import { categorizedTools } from "../lib/tools";

export default function Home() {
  const [isMinimized, setIsMinimized] = useState(false);

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
                <div className="mb-6 text-center sm:text-left">
                  <Link href={cat.path} className="text-xl font-bold opacity-70 transition-opacity hover:opacity-100">
                    {cat.category}
                  </Link>
                </div>
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
                <div className="mb-8 text-center sm:text-left">
                  <Link href={cat.path} className="text-2xl font-bold opacity-80 transition-opacity hover:opacity-100">
                    {cat.category}
                  </Link>
                </div>
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

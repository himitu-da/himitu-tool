"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categorizedTools } from "../lib/tools";

export function RelatedTools() {
    const pathname = usePathname();

    // トップページの場合は何も表示しない
    if (pathname === "/") {
        return null;
    }

    // 現在のツールパスに一致するツールとそのカテゴリを見つける
    let currentCategory = null;
    let currentTool = null;

    for (const cat of categorizedTools) {
        const tool = cat.tools.find((t) => t.path === pathname);
        if (tool) {
            currentCategory = cat;
            currentTool = tool;
            break;
        }
    }

    // ツールが見つからない場合、またはカテゴリ内に他のツールがない場合は何も表示しない
    if (!currentCategory || !currentTool) {
        return null;
    }

    const relatedTools = currentCategory.tools.filter((t) => t.path !== pathname);

    if (relatedTools.length === 0) {
        return null;
    }

    return (
        <section className="mt-16 sm:mt-24 border-t border-black/10 dark:border-white/10 pt-12 sm:pt-16">
            <h2 className="text-2xl sm:text-3xl font-bold opacity-80 text-center mb-12">
                関連ツール ({currentCategory.category})
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedTools.map((tool) => (
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
        </section>
    );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { findToolByPathname } from "../lib/tools";

export function RelatedTools() {
    const pathname = usePathname();

    if (pathname === "/") {
        return null;
    }

    const toolContext = findToolByPathname(pathname);

    if (!toolContext) {
        return null;
    }

    const relatedTools = toolContext.category.tools.filter((tool) => tool.id !== toolContext.tool.id);

    if (relatedTools.length === 0) {
        return null;
    }

    return (
        <section className="mt-16 rounded-2xl bg-black/5 px-4 py-12 dark:bg-white/5 sm:mt-24 sm:px-6 sm:py-16">
            <h2 className="mb-12 text-center text-2xl font-bold opacity-80 sm:text-3xl">
                関連ツール ({toolContext.category.category})
            </h2>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedTools.map((tool) => (
                    <li key={tool.id}>
                        <Link
                            href={tool.path}
                            className="flex h-full flex-col items-center justify-center rounded-xl bg-black/5 p-6 backdrop-blur-sm transition-transform hover:-translate-y-1 dark:bg-white/5"
                        >
                            <div className="mb-3 text-4xl">{tool.icon}</div>
                            <h3 className="mb-2 text-xl font-bold text-current">{tool.title}</h3>
                            <p className="text-center text-sm opacity-70">{tool.desc}</p>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}

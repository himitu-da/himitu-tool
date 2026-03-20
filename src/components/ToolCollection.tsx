import Link from "next/link";

import type { ToolMeta } from "@/lib/tools";

type ToolLike = Pick<ToolMeta, "id" | "path" | "title" | "icon" | "desc">;

type ToolGridProps = {
  tools: ToolLike[];
  variant?: "home" | "category";
};

type CategoryTitleLinkProps = {
  href: string;
  title: string;
  variant?: "homeMin" | "homeMax";
};

export function CategoryTitleLink({ href, title, variant = "homeMax" }: CategoryTitleLinkProps) {
  const className =
    variant === "homeMin"
      ? "text-xl font-bold opacity-70 transition-opacity hover:opacity-100"
      : "text-2xl font-bold opacity-80 transition-opacity hover:opacity-100";

  return (
    <Link href={href} className={className}>
      {title}
    </Link>
  );
}

export function ToolChipList({ tools }: { tools: ToolLike[] }) {
  return (
    <ul className="flex flex-wrap gap-2 justify-center sm:justify-start">
      {tools.map((tool) => (
        <li key={tool.id}>
          <Link
            href={tool.path}
            className="inline-block px-4 py-2 bg-black/5 dark:bg-white/5 rounded-md hover:opacity-75 transition-opacity"
          >
            <span className="text-sm font-medium">{tool.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function ToolGrid({ tools, variant = "home" }: ToolGridProps) {
  const cardClass =
    variant === "category"
      ? "flex h-full flex-col items-center justify-center rounded-2xl bg-black/5 p-6 text-center backdrop-blur-sm transition-transform hover:-translate-y-1 dark:bg-white/5"
      : "flex flex-col items-center justify-center p-6 bg-black/5 dark:bg-white/5 rounded-xl hover:-translate-y-1 transition-transform h-full backdrop-blur-sm";

  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <li key={tool.id}>
          <Link href={tool.path} className={cardClass}>
            <div className="text-4xl mb-3">{tool.icon}</div>
            <h3 className="text-xl font-bold mb-2">{tool.title}</h3>
            <p className="opacity-70 text-sm text-center">{tool.desc}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

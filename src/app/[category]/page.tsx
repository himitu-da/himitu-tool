import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ToolGrid } from "@/components/ToolCollection";
import { categorizedTools, getCategoryById } from "@/lib/tools";

type CategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
};

export function generateStaticParams() {
  return categorizedTools.map((category) => ({
    category: category.id,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const matchedCategory = getCategoryById(category);

  if (!matchedCategory) {
    return {};
  }

  return {
    title: `${matchedCategory.category}のツール一覧`,
    description: `${matchedCategory.category}に属するツール一覧です。`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const matchedCategory = getCategoryById(category);

  if (!matchedCategory) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-black/5 p-6 text-center backdrop-blur-sm dark:bg-white/5 sm:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.24em] opacity-55">Category</p>
        <h1 className="mt-3 text-3xl font-bold opacity-90 sm:text-4xl">{matchedCategory.category}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed opacity-75 sm:text-base">
          このカテゴリに含まれるツールをまとめて確認できます。用途に合うものを選んでください。
        </p>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold opacity-80 sm:text-3xl">ツール一覧</h2>
          <Link
            href="/"
            className="rounded-full bg-black/5 px-4 py-2 text-sm font-medium transition-opacity hover:opacity-75 dark:bg-white/5"
          >
            トップへ戻る
          </Link>
        </div>

        <ToolGrid tools={matchedCategory.tools} variant="category" />
      </section>
    </div>
  );
}

import { MetadataRoute } from "next";

import { categorizedTools } from "@/lib/tools";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://hmts.jp/tool";
  const now = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...categorizedTools.map((category) => ({
      url: `${baseUrl}${category.path}/`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...categorizedTools.flatMap((category) =>
      category.tools.map((tool) => ({
        url: `${baseUrl}${tool.path}/`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
    ),
  ];
}

import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://hmts.jp/tool';

  // src/app ディレクトリからツールの一覧を動的に取得
  const appDir = path.join(process.cwd(), 'src', 'app');
  const dirents = fs.readdirSync(appDir, { withFileTypes: true });
  
  const tools = dirents
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    // Route GroupsやPrivate Foldersなどを除外する
    .filter(name => !name.startsWith('(') && !name.startsWith('_'));

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...tools.map((tool) => ({
      // output: 'export' と trailingSlash: true の設定に合わせる
      url: `${baseUrl}/${tool}/`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];

  return routes;
}

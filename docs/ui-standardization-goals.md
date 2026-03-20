# UIライブラリ統一目標

この文書は、UI統一を段階的に進めるための目標と判定基準を定義する。
開始方針は「新規/改修ページのみ必須」であり、既存ページは改修タイミングで順次適用する。

## 1. 適用範囲
- 対象: `src/app/**/page.tsx` の新規作成または改修ページ
- 例外: 高度機能ページ（Canvas、画像処理、複雑可視化）
- 例外ページは理由付きでESLint allowlistに登録する

## 2. 必須ルール
- ページ骨格は `ToolPageLayout` を使用する
- カード領域は `ToolPanel` を使用する
- テーマ依存スタイルは `useToolTheme` 経由で取得する
- 内部リンクは `Link` を使用する
- 4テーマ（light/dark/ocean/classic）で視認性を確保する

## 3. 禁止ルール
- ページ内での色ユーティリティ直接定義（例: `bg-blue-600`, `text-gray-300`）を常用しない
- 罫線や区切り線をレイアウト分離の主手段にしない
- ページ本文にサイトURLや著作権表示を重複記載しない

## 4. 推奨ルール
- 独自ユーティリティクラスはサイズ、カラム、スペースに限定する
- アイコンSVGの重複は共通コンポーネント化する

## 5. 機械検知（第1段階: ローカル警告）
- ESLint warningで以下を検出する
- `ToolPageLayout` 未使用
- `ToolPanel` 未使用
- `useToolTheme` 未使用
- 色ユーティリティ直書きの検出
- inline SVG過多（目安: 4個以上）

## 6. 優先移行対象
- トップページ: `src/app/page.tsx`
- カテゴリーページ: `src/app/[category]/page.tsx`
- 高度機能の適合改善（例外管理前提）
  - `src/app/paper-size-compare/page.tsx`
  - `src/app/qr-code/page.tsx`
  - `src/app/image-conv/page.tsx`

## 7. 判定ラベル
- 完全適合: 必須ルールを満たし、禁止ルール違反なし
- 一部逸脱: 必須ルールの一部欠落または禁止ルール違反あり
- 例外: allowlist理由付きで運用

## 8. 段階移行
- Phase 1: ルール定義 + warning運用
- Phase 2: 共通UI部品の追加（Field/Button/Badgeなど）
- Phase 3: 警告ノイズ調整後、必要ルールをCI errorへ昇格

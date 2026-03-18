# Component patterns

## Tool page structure

Use this shape by default:

```tsx
"use client";

import { ToolPageLayout } from "@/components/ToolPageLayout";
import { ToolPanel } from "@/components/ToolPanel";
import { useToolTheme } from "@/lib/useToolTheme";

export default function ExampleToolPage() {
  const { inputCls, primaryBtnCls, blockCls, mutedTextCls } = useToolTheme();

  return (
    <ToolPageLayout title="ツール名" maxWidth="2xl">
      <ToolPanel className="space-y-4">
        {/* inputs */}
        {/* actions */}
        {/* results */}
        <div className={`rounded-lg p-3 ${blockCls} ${mutedTextCls}`}>
          補足説明
        </div>
      </ToolPanel>
    </ToolPageLayout>
  );
}
```

## Shared theme classes

- `pageCls`: page background and base text color.
- `panelCls`: card-like background for `ToolPanel`.
- `blockCls`: sub-block background for notes or grouped results.
- `mutedTextCls`: supporting text.
- `inputCls`: shared styling for `input`, `textarea`, and `select`.
- `primaryBtnCls` and `secondaryBtnCls`: shared button colors.

## Styling conventions

- Prefer rounded panels and soft spacing.
- Avoid custom border-heavy card designs because they conflict with project rules.
- If a page needs multiple logical areas, use multiple `ToolPanel` blocks or nested background blocks rather than separators.

## New tool wiring

- Add the tool route under `src/app/<tool-id>/page.tsx`.
- Register the tool metadata in `src/lib/tools.ts` so it appears on the top page.
- After registration, initialize tool-version metadata with `npm run tools:version:init`.

## Validation checklist

- Confirm the page renders correctly in all three themes.
- Run `npm run build`.
- If an existing tool changed, update its tool version entry with a meaningful summary.

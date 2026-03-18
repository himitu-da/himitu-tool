---
name: build-himitu-tool
description: Build or update tool pages in the himitu-tool Next.js repository. Use when Codex adds a new tool, revises an existing tool page, adjusts tool UI, wires a page into the shared tool list, or needs to follow this project's deployment, theming, layout, and tool-version rules.
---

# Build himitu-tool

Read [references/project-rules.md](references/project-rules.md) before making changes. Read [references/component-patterns.md](references/component-patterns.md) when editing page structure or theme-aware UI.

## Workflow

1. Identify whether the request adds a new tool or updates an existing one.
2. For a new tool, create `src/app/<tool-id>/page.tsx`, then register the page in `src/lib/tools.ts`.
3. Build tool pages with `ToolPageLayout`, `ToolPanel`, and `useToolTheme()` unless the request clearly needs a tool-specific abstraction.
4. Keep the body focused on tool-specific content only. Do not duplicate the site URL, copyright, top-page link, or theme switcher because shared layout already renders them.
5. Prefer spacing, subtle background changes, and theme-aware blocks over borders or divider lines. Input fields may keep borders.
6. Verify changes with `npm run build`. Do not use `npm run deploy` for checking because it publishes to production.
7. If the task adds a new tool, run `npm run tools:version:init` after the page is wired in. If the task changes an existing tool, update the tool version with `npm run tools:version:update -- --id=<tool-id> --bump=patch --summary="<summary>"` unless the user says otherwise.

## Implementation notes

- Reuse shared components for generic UI elements before introducing page-local wrappers.
- Keep all themes usable: light, dark, and ocean must retain readable contrast for text, controls, and supporting blocks.
- Match existing tool-page conventions: client component pages, compact state, and straightforward event handlers are preferred unless the feature needs a heavier structure.
- When a request touches navigation or links, prefer project-relative Next.js links that match the repository's existing routing conventions.

## Deliverables

- Leave the edited page ready to ship as static output after a successful build.
- Mention whether tool registration or tool-version commands were required.

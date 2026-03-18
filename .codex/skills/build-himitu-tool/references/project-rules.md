# Project rules

## Deployment safety

- Treat `npm run deploy` as a production action. It builds static assets and uploads them to the rental server.
- Use `npm run build` for local verification.

## Shared header and footer

- Do not add the site URL, copyright text, top-page link, or theme selector inside page content.
- Assume shared layout already provides those elements.

## Theme requirements

- Support `light`, `dark`, and `ocean`.
- Choose text and background combinations with clear contrast in every theme.
- Check not only primary text, but also helper text, placeholder text, button labels, and result blocks.

## Design rules

- Do not use borders for layout separation.
- Do not use divider lines.
- Separate sections with spacing or slight background changes instead.
- Input fields may use borders.

## Shared building blocks

- Use `ToolPageLayout` as the root of tool pages and pass `title="..."`.
- Use `ToolPanel` for grouped input or output areas.
- Use `useToolTheme()` for theme-aware classes instead of hardcoding colors for common controls.
- Reuse existing shared components whenever behavior is not tool-specific.

## Tool versioning

- After adding a new tool, run `npm run tools:version:init`.
- For small fixes, run `npm run tools:version:update -- --id=<tool-id> --bump=patch --summary="<summary>"`.
- For a major tool update, run `npm run tools:version:update -- --id=<tool-id> --version=<version> --summary="<summary>"`.
- To pick older tools for improvement work, run `npm run tools:improve:pick -- --top=10`.

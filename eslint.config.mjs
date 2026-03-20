import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const uiExceptionAllowlist = {
  "src/app/paper-size-compare/page.tsx": "Complex canvas/visualization page",
  "src/app/qr-code/page.tsx": "Complex canvas/image composition page",
  "src/app/image-conv/page.tsx": "Complex image conversion page",
};

const COLOR_TOKEN_PATTERN = /^(?:bg|text|border|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)(?:-\d{2,3})?(?:\/\d+)?$/;

const uiConsistencyPlugin = {
  rules: {
    "require-tool-foundation": {
      meta: {
        type: "suggestion",
        docs: {
          description: "Warn when tool pages do not use foundation UI components.",
        },
      },
      create(context) {
        const filename = context.filename || "";
        const normalized = filename.replaceAll("\\", "/");
        const inToolPage = /\/src\/app\/.+\/page\.(?:t|j)sx$/.test(normalized);
        if (!inToolPage) {
          return {};
        }

        const relative = normalized.split("/himitu-tool/")[1] || normalized;
        const isException = Object.hasOwn(uiExceptionAllowlist, relative);

        let importedToolPageLayout = false;
        let importedToolPanel = false;
        let importedUseToolTheme = false;
        let usedToolPageLayout = false;
        let usedToolPanel = false;
        let usedUseToolTheme = false;
        let usedPeriodTimerPage = false;
        let useStateCount = 0;
        let inlineSvgCount = 0;

        const report = (node, message) => {
          context.report({ node, message });
        };

        return {
          ImportDeclaration(node) {
            if (node.source.value === "@/components/ToolPageLayout") {
              importedToolPageLayout = true;
            }
            if (node.source.value === "@/components/ToolPanel") {
              importedToolPanel = true;
            }
            if (node.source.value === "@/lib/useToolTheme") {
              importedUseToolTheme = true;
            }
          },
          JSXOpeningElement(node) {
            if (node.name?.type === "JSXIdentifier") {
              const name = node.name.name;
              if (name === "ToolPageLayout") {
                usedToolPageLayout = true;
              }
              if (name === "ToolPanel") {
                usedToolPanel = true;
              }
              if (name === "PeriodTimerPage") {
                usedPeriodTimerPage = true;
              }
              if (name === "svg") {
                inlineSvgCount += 1;
              }
            }
          },
          CallExpression(node) {
            if (node.callee?.type === "Identifier") {
              if (node.callee.name === "useToolTheme") {
                usedUseToolTheme = true;
              }
              if (node.callee.name === "useState") {
                useStateCount += 1;
              }
            }
          },
          JSXAttribute(node) {
            if (node.name?.name !== "className") {
              return;
            }
            if (!node.value || node.value.type !== "Literal" || typeof node.value.value !== "string") {
              return;
            }
            const classTokens = node.value.value.split(/\s+/).filter(Boolean);
            const hasHardcodedColorToken = classTokens.some((token) => COLOR_TOKEN_PATTERN.test(token));
            if (!hasHardcodedColorToken) {
              return;
            }
            if (isException) {
              return;
            }
            report(
              node,
              "Hardcoded color utility classes detected in page component. Prefer useToolTheme token classes; use exception allowlist only when required."
            );
          },
          "Program:exit"(node) {
            const isWrapperPage = usedPeriodTimerPage;
            if (!isException && !isWrapperPage) {
              if (!importedToolPageLayout || !usedToolPageLayout) {
                report(node, "Tool page should use ToolPageLayout for consistent page structure.");
              }
              if (!importedToolPanel || !usedToolPanel) {
                report(node, "Tool page should use ToolPanel for consistent panel surface.");
              }
              if (!importedUseToolTheme || !usedUseToolTheme) {
                report(node, "Tool page should use useToolTheme for theme-safe styling.");
              }
            }

            if (!isException && inlineSvgCount > 3) {
              report(node, "Many inline SVG nodes detected. Consider shared icon components.");
            }

            if (!isException && useStateCount > 15) {
              report(node, "Many useState calls detected. Consider extracting hooks/components.");
            }
          },
        };
      },
    },
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/app/**/page.{ts,tsx,js,jsx}"],
    plugins: {
      ui: uiConsistencyPlugin,
    },
    rules: {
      "ui/require-tool-foundation": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

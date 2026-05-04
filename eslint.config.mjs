import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Migrations Payload générées automatiquement, payload/req inutilisés
    // par construction. Pas notre code, pas la peine de lint.
    "migrations/**",
  ]),
  {
    // Audit V20260503 §2.H.1 : la règle no-unescaped-entities est trop
    // pénalisante pour le contenu éditorial français (apostrophes
    // partout). Le runtime gère parfaitement les apostrophes brutes en
    // texte JSX. On passe en warn pour ne plus polluer le diff sans
    // empêcher le build.
    rules: {
      "react/no-unescaped-entities": "warn",
    },
  },
]);

export default eslintConfig;

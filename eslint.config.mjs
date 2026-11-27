import { defineConfig, globalIgnores } from "eslint/config";
import next from "@next/eslint-plugin-next";

export default defineConfig([
  globalIgnores([".next/**", "out/**", "screenshots/**"]),
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { "@next/next": next },
    rules: {
      ...next.configs.recommended.rules,
      "no-debugger": "error",
      "no-dupe-args": "error",
      "no-dupe-keys": "error",
      "no-unreachable": "error",
    },
  },
]);

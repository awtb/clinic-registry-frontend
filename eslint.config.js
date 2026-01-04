import js from "@eslint/js"
import tseslint from "typescript-eslint"
import svelte from "eslint-plugin-svelte"
import svelteParser from "svelte-eslint-parser"
import path from "node:path"

const tsconfigPath = path.resolve("./tsconfig.json")

export default [
  {
    ignores: [".svelte-kit/**", "build/**", "dist/**", "node_modules/**"],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  ...svelte.configs["flat/recommended"],

  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: tsconfigPath,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },

  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tseslint.parser,
        project: tsconfigPath,
        extraFileExtensions: [".svelte"],
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
]

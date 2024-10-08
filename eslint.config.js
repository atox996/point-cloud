import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import { createRequire } from "module";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

const require = createRequire(import.meta.url);
const autoImports = require("./.eslintrc-auto-import.json");

export default tseslint.config(
  {
    ignores: ["dist/"],
    languageOptions: autoImports,
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  /**
   * @see https://github.com/prettier/eslint-plugin-prettier?tab=readme-ov-file#configuration-new-eslintconfigjs
   * @description Must be in the last item
   */
  eslintPluginPrettierRecommended,
);

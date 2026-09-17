import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["node_modules/**", "out/**", "fixtures/**", "mutants/**", "bin/**"] },
  // k6 scripts run inside k6, which provides these globals.
  { files: ["traffic/load/**/*.js"], languageOptions: { globals: { __ENV: "readonly", __ITER: "readonly", __VU: "readonly" } } },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", destructuredArrayIgnorePattern: "^_" }]
    }
  }
);

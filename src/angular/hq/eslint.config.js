// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const prettier = require("eslint-config-prettier");
const rxjsX = require("eslint-plugin-rxjs-x").default;
const rxjsAngularX = require("eslint-plugin-rxjs-angular-x").default;

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      angular.configs.tsRecommended,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    processor: angular.processInlineTemplates,
    plugins: {
      "rxjs-x": rxjsX,
      "rxjs-angular-x": rxjsAngularX,
    },
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "hq",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: ["element", "attribute"],
          prefix: "hq",
          style: "kebab-case",
        },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "rxjs-x/no-ignored-error": "error",
      "rxjs-x/no-ignored-subscribe": "error",
      "rxjs-angular-x/prefer-async-pipe": "error",
      "rxjs-angular-x/prefer-takeuntil": "error",
      "@angular-eslint/prefer-on-push-component-change-detection": "off",
      "@angular-eslint/prefer-inject": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  },
  prettier,
]);

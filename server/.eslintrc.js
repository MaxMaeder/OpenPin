module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "*.eslintrc.js",
    "*.template",
  ],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    quotes: ["error", "double"],
    "import/no-unresolved": 0,
    indent: ["error", 2, { SwitchCase: 1 }],
    "object-curly-spacing": 0,
    "operator-linebreak": 0,
    "require-jsdoc": 0,
    "max-len": ["error", { code: 100 }],
    "valid-jsdoc": ["disabled"],
    "no-warning-comments": ["error", { terms: ["todo", "fixme"], location: "anywhere" }],
  },
};

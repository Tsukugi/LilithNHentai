module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    ignorePatterns: ["dist", ".eslintrc.js"],
    parser: "@typescript-eslint/parser",
};

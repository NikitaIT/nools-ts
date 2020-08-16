module.exports = {
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
  },
  extends: [
    "prettier",
    "plugin:@typescript-eslint/recommended", // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    "prettier/@typescript-eslint", // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    "plugin:prettier/recommended", // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    "plugin:import/errors", // Enables no-cycle import detection
    "plugin:import/warnings",
    "plugin:import/typescript",
  ],
  rules: {
    "import/no-cycle": 1,
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-empty-function": "off", // Uses for () => {}
    "@typescript-eslint/explicit-module-boundary-types": "off", // Need only if return type is generic
    "@typescript-eslint/ban-ts-comment": "off", // todo: fix Uses for old code
    "@typescript-eslint/no-explicit-any": "off", // todo: fix
    "@typescript-eslint/no-non-null-assertion": "off", // todo: fix
  },
};

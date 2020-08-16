module.exports = {
  roots: ["<rootDir>/"],
  transform: {
    "\\.(ts|tsx)?$": "ts-jest",
    "\\.(js|jsx)?$": "./scripts/jestTransform.js",
  },
  transformIgnorePatterns: ["node_modules/(?!(@nools)/)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};

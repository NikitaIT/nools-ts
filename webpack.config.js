const path = require("path");

module.exports = {
  entry: {
    nools: "./dist/index.js",
    rt: "./dist/runtime.js",
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.(ts)$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              reportFiles: ["../**/src/**/*.{ts,tsx}"],
              projectReferences: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "[name].min.js",
    path: path.resolve(__dirname, "dist"),
  },
};

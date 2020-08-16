// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = {
  entry: {
    nools: "./dist/index.js",
    rt: "./dist/runtime.js",
  },
  module: {
    rules: [
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
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: "babel-loader",
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

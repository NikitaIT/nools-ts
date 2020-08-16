const config = {
  babelrc: false,
  presets: ["@babel/preset-env"],
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
module.exports = require("babel-jest").createTransformer(config);

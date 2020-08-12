const gulp = require("gulp");
const shell = require("gulp-shell");

gulp.task("clean", shell.task("rimraf ./dist/"));

gulp.task("compile-ts", shell.task("tsc -m commonjs"));
gulp.task("compile-ts-umd", shell.task("tsc -m umd --outDir ./dist/umd/"));
gulp.task("compile-ts-es", shell.task("tsc -m esnext --outDir ./dist/es/"));

gulp.task("watch-ts", shell.task("tsc -w"));

gulp.task("copy-files", () => {
  return gulp.src(["./package.json", "./README.md"]).pipe(gulp.dest("./dist/"));
});

gulp.task("copy-parser", async () => {
  require("./dist/compile/parser/constraint/grammar.js");
  require("./dist/es/compile/parser/constraint/grammar.js");
});

// "./dist/runtime.js" => "./dist/rt.min.js"
// "./dist/index.js" => "./dist/nools.min.js"
gulp.task(
  "nools",
  shell.task("webpack --config ./webpack.config.js --mode production")
);

gulp.task(
  "default",
  gulp.series(
    "clean",
    "copy-files",
    "compile-ts",
    "compile-ts-umd",
    "compile-ts-es",
    "copy-parser",
    "nools"
  )
);

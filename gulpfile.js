const { src, dest, watch, parallel, series, lastRun } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const less = require("gulp-less");
const cssnano = require("cssnano");
const autoprefixer = require("autoprefixer");
const postcss = require("gulp-postcss");
const terser = require("gulp-terser");
const browsersync = require("browser-sync").create();
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const cache = require("gulp-cache");
const htmlmin = require("gulp-htmlmin");
const babel = require("gulp-babel");
const plumber = require("gulp-plumber");
const notifier = require("gulp-notifier");

/**
 * Helper function to create a watch task
 * @param {string} filePath - File path to watch
 * @param {function} task - Gulp task function to run
 * @param {function} reloadTask - Browsersync reload task
 */
function createWatchTask(filePath, task, reloadTask) {
  watch(filePath, { ignoreInitial: false }, series(task, reloadTask));
}

/**
 * Notifier Defaults Configuration | Optional
 */
/* notifier.defaults({
  messages: {
    sass: "Sass compiled successfully",
    less: "Less compiled successfully",
    js: "JavaScript compiled successfully",
    img: "Images optimized successfully",
    html: "HTML minified successfully",
  },
  prefix: "===>",
  suffix: "<===",
  exclusions: ".map",
}); */

/**
 * Files Path
 * @description Paths to files
 */
const filesPath = {
  sass: "./src/sass/**/*.scss",
  less: "./src/less/**/*.less",
  js: "./src/js/**/*.js",
  img: "./src/img/**/*.+(png|jpg|gif|svg|ico|webp)",
  html: "*.html",
};

/**
 * Sass Task
 * @description Compiles Sass to CSS
 */
function sassTask() {
  return src(filesPath.sass, { sourcemaps: true, since: lastRun(sassTask) })
    .pipe(
      plumber({
        errorHandler: notifier.error,
      })
    )
    .pipe(sass())
    .pipe(
      postcss([
        autoprefixer({
          overrideBrowserslist: ["last 2 versions"],
          cascade: false,
        }),
        cssnano(),
      ])
    )
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest("dist/assets/css", { sourcemaps: "." }));
  // .pipe(notifier.success("sass"));
}

/**
 * Less Task
 * @description Compiles Less to CSS
 */
function lessTask() {
  return src(filesPath.less, { sourcemaps: true, since: lastRun(lessTask) })
    .pipe(
      plumber({
        errorHandler: notifier.error,
      })
    )
    .pipe(less())
    .pipe(
      postcss([
        autoprefixer({
          overrideBrowserslist: ["last 2 versions"],
          cascade: false,
        }),
        cssnano(),
      ])
    )
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest("dist/assets/css", { sourcemaps: "." }));
  // .pipe(notifier.success("less"));
}

/**
 * JavaScript Task
 * @description Minifies JS
 */
function jsTask() {
  return src([filesPath.js], { sourcemaps: true, since: lastRun(jsTask) })
    .pipe(
      plumber({
        errorHandler: notifier.error,
      })
    )
    .pipe(babel({ presets: ["@babel/preset-env"] }))
    .pipe(concat("main.js"))
    .pipe(terser())
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest("dist/assets/js", { sourcemaps: "." }));
  // .pipe(notifier.success("js"));
}

/**
 * Image Optimization Task
 * @description Optimizes images
 */
function imageTask() {
  return src(filesPath.img, { since: lastRun(imageTask) })
    .pipe(cache(imagemin()))
    .pipe(dest("dist/assets/img"));
  // .pipe(notifier.success("img"));
}

/**
 * HTML Minify Task
 * @description Minifies HTML
 */
function htmlMinify() {
  return src(filesPath.html, { since: lastRun(htmlMinify) })
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest("dist"));
  // .pipe(notifier.success("html"));
}

/**
 * Cache Clear Task
 * @description Clears the cache
 */
function cacheClear() {
  return cache.clearAll();
}

/**
 * Browsersync Tasks
 * @description Reloads the browser when a file changes
 */
function browsersyncServe(cb) {
  browsersync.init({
    server: {
      baseDir: ".",
    },
    browser: "chrome",
  });
  cb();
}

function browsersyncReload(cb) {
  browsersync.reload();
  cb();
}

/**
 * Watch Task
 * @description Watches for file changes and runs tasks
 */

function watchTask() {
  watch("*.html", browsersyncReload);
  createWatchTask(filesPath.sass, sassTask, browsersyncReload);
  createWatchTask(filesPath.less, lessTask, browsersyncReload);
  createWatchTask(filesPath.js, jsTask, browsersyncReload);
  createWatchTask(filesPath.img, imageTask, browsersyncReload);
  createWatchTask(filesPath.html, htmlMinify, browsersyncReload);
}

exports.default = parallel(
  sassTask,
  lessTask,
  jsTask,
  imageTask,
  htmlMinify,
  cacheClear,
  browsersyncServe,
  watchTask
);

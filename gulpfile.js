const { task, series, parallel, src, dest, watch } = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const header = require('gulp-header');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const csso = require('gulp-csso');
const sourcemaps = require('gulp-sourcemaps');

const pkg = require('./package.json');
const banner = `/*!
 * <%= pkg.title %> - <%= pkg.version %>
 * <%= pkg.description %>
 *
 * <%= pkg.homepage %>
 *
 * Copyright <%= pkg.author %>
 * Released under the <%= pkg.license %> license.
 */`

let browserifyConfig = { debug: false };

task('dev', () => (browserifyConfig = { debug: true }));

task('browserify', () =>
  browserify(Object.assign({ entries: './src/ui.js' }, browserifyConfig))
    .bundle()
    .pipe(source('astrobench.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(header(banner, { pkg: pkg }))
    .on('error', err => this.emit('end'))
    .pipe(sourcemaps.write('./'))
    .pipe(dest('./dist/')));

task('uglify', () =>
  src('./dist/astrobench.js')
    .pipe(uglify({
      output: { comments: 'some' }
    }))
    .pipe(concat('astrobench.min.js'))
    .pipe(dest('./dist/')));

task('copy-style', () =>
  src('./src/style.css')
    .pipe(concat('astrobench.css'))
    .pipe(dest('./dist/')));

task('minify-style', () =>
  src('./dist/astrobench.css')
    .pipe(sourcemaps.init())
    .pipe(csso())
    .pipe(sourcemaps.write('./'))
    .pipe(dest('./dist/')));

task('default', parallel(
  series('browserify', 'uglify'), series('copy-style', 'minify-style')));

task('watch', () =>
  watch(['src/**/*.js', 'src/**/*.css', 'src/**/*.html'],
    parallel(series('dev', 'browserify'), 'copy-style')));

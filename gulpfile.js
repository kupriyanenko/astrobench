var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var header = require('gulp-header');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

var pkg = require('./package.json');
var banner = ['/*!',
  ' * <%= pkg.title %> - <%= pkg.version %>',
  ' * <%= pkg.description %>',
  ' *',
  ' * <%= pkg.homepage %>',
  ' *',
  ' * Copyright <%= pkg.author %>',
  ' * Released under the <%= pkg.license %> license.',
  ' */',
  ''].join('\n');

var browserifyConfig = {debug: false};

gulp.task('dev', function() {
  browserifyConfig = {debug: true};
});

gulp.task('browserify', function() {
  return browserify(Object.assign({entries:'./src/ui.js'}, browserifyConfig))
    .bundle()
    .pipe(source('astrobench.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(header(banner, {pkg: pkg}))
    .on('error', function (err) {
      this.emit('end');
    })
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('build', ['browserify'], function() {
  return gulp.src('./dist/astrobench.js')
    .pipe(uglify({preserveComments: 'some'}))
    .pipe(concat('astrobench.min.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['build']);

gulp.task('watch', function() {
  gulp.watch(['src/**/*.js', 'src/**/*.html'], ['dev', 'browserify']);
});

const gulp = require('gulp');
const browserSync = require('browser-sync').create();

const paths = require('./paths.js');
const config = require('../config');

const { sass, html, js, templates } = require('./build');

function watch() {
  // gulp.watch('**/*.scss', { cwd: paths.src.sass }, gulp.series(sass))
  //   .on('change', browserSync.reload);

  gulp
    .watch('**/*.scss', { cwd: paths.src.sass }, gulp.series(sass))
    .on('change', browserSync.reload);
  gulp
    .watch('**/*.html', { cwd: paths.src.html }, gulp.series(html))
    .on('change', browserSync.reload);
  gulp.watch('**/*.js', { cwd: paths.src.js }, gulp.series(js)).on('change', browserSync.reload);
  gulp
    .watch('**/*.handlebars', { cwd: paths.src.templates }, gulp.series(templates))
    .on('change', browserSync.reload);
}

function serve() {
  browserSync.init({
    port: config.http.devPort,
    proxy: `${config.http.host}:${config.http.port}`,
  });
}

module.exports = {
  watch,
  serve,
};

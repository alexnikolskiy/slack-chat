const gulp = require('gulp');
const browserSync = require('browser-sync').create();

const paths = require('./paths.js');
require('dotenv').config();

const { sass, html, js, templates } = require('./build');

function watch() {
  gulp
    .watch('**/*.scss', { cwd: paths.src.sass }, gulp.series(sass))
    .on('change', browserSync.reload);
  gulp
    .watch('**/*.html', { cwd: paths.src.html }, gulp.series(html))
    .on('change', browserSync.reload);
  gulp
    .watch(
      ['**/*.js', '!**/__tests__/*.js', '!**/__mocks__/*.js'],
      { cwd: paths.src.js },
      gulp.series(js),
    )
    .on('change', browserSync.reload);
  gulp
    .watch('**/*.handlebars', { cwd: paths.src.templates }, gulp.series(templates))
    .on('change', browserSync.reload);
}

function serve() {
  browserSync.init({
    port: process.env.HTTP_DEV_PORT,
    proxy: `${process.env.HTTP_HOST}:${process.env.HTTP_PORT}`,
  });
}

module.exports = {
  watch,
  serve,
};

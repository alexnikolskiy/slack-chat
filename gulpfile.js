const gulp = require('gulp');

const { clean, sass, html, sprite, images, copy, js, templates } = require('./gulp/build');

const { watch, serve } = require('./gulp/watch');

gulp.task(
  'default',
  gulp.series(
    clean,
    gulp.parallel(sass, gulp.series(templates, js), gulp.series(images, sprite, html, copy)),
  ),
);

gulp.task('templates', gulp.series(templates));

gulp.task('build', gulp.series('default'));

gulp.task('dev', gulp.series('default', gulp.parallel(watch, serve)));

const gulp = require('gulp');
const plugins = require('gulp-load-plugins')({ lazy: true });
const del = require('del');
const include = require('posthtml-include');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const normalize = require('node-normalize-scss');

const paths = require('./paths');
const webpackConfig = require('../webpack.config.js');

const isDevelopment = process.env.NODE_ENV === 'development';

webpackConfig.mode = isDevelopment ? 'development' : 'production';
webpackConfig.devtool = isDevelopment ? 'inline-source-map' : false;

function clean() {
  return del('build');
}

function sass() {
  return gulp
    .src(`${paths.src.sass}style.scss`)
    .pipe(plugins.sassGlob())
    .pipe(plugins.if(isDevelopment, plugins.sourcemaps.init()))
    .pipe(
      plugins.sass({
        includePaths: normalize.includePaths,
      }),
    )
    .pipe(plugins.autoprefixer())
    .pipe(plugins.cleanCss())
    .pipe(
      plugins.if(
        isDevelopment,
        plugins.sourcemaps.write({ sourceRoot: '/_map/css', includeContent: true }),
      ),
    )
    .pipe(gulp.dest(paths.dest.css));
}

function html() {
  return gulp
    .src(`${paths.src.html}**/*.html`)
    .pipe(plugins.posthtml([include()]))
    .pipe(plugins.htmlmin({ collapseWhitespace: false }))
    .pipe(gulp.dest(paths.dest.root));
}

function images() {
  return gulp
    .src([`${paths.src.img}**/*.{png,jpg}`, `${paths.src.img}**/*.svg`])
    .pipe(
      plugins.imagemin([
        plugins.imagemin.optipng({ optimizationLevel: 3 }),
        plugins.imagemin.jpegtran({ progressive: true }),
        plugins.imagemin.svgo(),
      ]),
    )
    .pipe(gulp.dest(file => file.base));
}

function sprite() {
  return gulp
    .src(`${paths.src.img}**/*.svg`)
    .pipe(
      plugins.svgstore({
        inlineSvg: true,
      }),
    )
    .pipe(plugins.rename('sprite.svg'))
    .pipe(gulp.dest(paths.dest.img));
}

function copy() {
  return gulp
    .src([`${paths.src.img}**/*.{png,jpg}`, `${paths.src.root}manifest.webapp`], {
      base: paths.src.root,
    })
    .pipe(gulp.dest(paths.dest.root));
}

function js() {
  return gulp
    .src(`${paths.src.js}*.js`)
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest(paths.dest.js));
}

function templates() {
  return gulp
    .src(`${paths.src.templates}**/*.handlebars`)
    .pipe(plugins.handlebars())
    .pipe(plugins.defineModule('es6'))
    .pipe(gulp.dest(paths.dest.templates));
}

module.exports = {
  clean,
  sass,
  html,
  sprite,
  images,
  copy,
  js,
  templates,
};

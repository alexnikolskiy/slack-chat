const path = require('path');

module.exports = {
  entry: {
    chat: './src/js/index.js',
    login: './src/js/login.js',
  },
  output: {
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                useBuiltIns: 'usage',
                modules: false,
                /*
              targets: {
                "esmodules": true
              }
              */
              },
            ],
          ],
        },
      },
    ],
  },
  plugins: [],
  resolve: {
    alias: {
      handlebars: 'handlebars/runtime.js',
      Templates: path.resolve(__dirname, 'src/templates/build'),
      Utils: path.resolve(__dirname, 'src/js/utils'),
    },
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
      },
    },
  },
};

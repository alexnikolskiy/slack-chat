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
        exclude: [/node_modules/, path.resolve(__dirname, 'config.js')],
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                useBuiltIns: 'usage',
                modules: false,
              },
            ],
          ],
        },
      },
    ],
  },
  resolve: {
    alias: {
      handlebars: 'handlebars/runtime.js',
      Templates: path.resolve(__dirname, 'src/templates/build'),
      Utils: path.resolve(__dirname, 'src/js/utils'),
    },
  },
};

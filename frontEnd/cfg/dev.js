'use strict';

let path = require('path');
let webpack = require('webpack');
let baseConfig = require('./base');
let defaultSettings = require('./defaults');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

let config = Object.assign({}, baseConfig, {
  mode: 'development',
  entry: [
    'webpack-dev-server/client?http://127.0.0.1:' + defaultSettings.port,
    'webpack/hot/only-dev-server',
    './src/index'
  ],
  cache: true,
  devtool: 'eval-source-map',
  optimization: {
    minimizer: [
      new ParallelUglifyPlugin({ // 多进程压缩
        cacheDir: '.cache/',
        uglifyJS: {
          output: {
            comments: false,
            beautify: false
          },
          compress: {
            warnings: false,
            drop_console: true,
            collapse_vars: true,
            reduce_vars: true
          }
        }
      })
    ]
  },
  devServer: {
    stats: 'errors-only',
    contentBase: './src/',
    historyApiFallback: true,
    hot: true,
    port: defaultSettings.port,
    publicPath: defaultSettings.publicPath,
    noInfo: false,
    host: 'localhost',
    proxy: [{
      context: '/api',
      target: 'http://localhost:8987/',
      changeOrigin: true
    }]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"dev"'
    }),
    new webpack.LoaderOptionsPlugin({
      options: {
        port: defaultSettings.port
      }
    }),
    new ProgressBarPlugin({
      complete: '>'
    })
  ],
  module: defaultSettings.getDefaultModules()
});

config.module.rules.push({
  test: /\.(js|jsx)$/,
  loader: 'babel-loader',
  exclude: /node_modules/,
  include: [].concat(
    [ path.join(__dirname, '/../src') ]
  )
});

module.exports = config;

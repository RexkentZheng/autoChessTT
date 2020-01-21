'use strict';
let path = require('path');
let defaultSettings = require('./defaults');

module.exports = {
  devtool: 'eval',
  output: {
    path: path.join(__dirname, '/../dist/assets'),
    filename: 'app.js',
    publicPath: defaultSettings.publicPath
  },
  resolve: {
    extensions: ['.js', '.jsx'],

    alias: {
      lib: `${defaultSettings.srcPath}/lib/`,
      router: `${defaultSettings.srcPath}/router/`,
      actions: `${defaultSettings.srcPath}/actions/`,
      components: `${defaultSettings.srcPath}/components/`,
      sources: `${defaultSettings.srcPath}/sources/`,
      stores: `${defaultSettings.srcPath}/stores/`,
      styles: `${defaultSettings.srcPath}/styles/`,
      config: `${defaultSettings.srcPath}/config/` + process.env.REACT_WEBPACK_ENV,
      'react-dom': '@hot-loader/react-dom'
    }
  },
  module: {}
};

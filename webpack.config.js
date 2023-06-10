//@ts-check

'use strict';

const path = require('path');
const terserPlugin = require("terser-webpack-plugin");

/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  target: 'node', // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
	mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

  entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode', // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    applicationinsights: 'applicationinsights', // ignored because we don't ship native module
    "isomorphic-ws": "isomorphic-ws",
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [
          path.resolve(__dirname, 'node_modules'),
          path.resolve(__dirname, '.idea')
        ],
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
    ]
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  },
};

if(process.env.NODE_ENV === "production"){
  extensionConfig.optimization = {
    minimize: true,
      minimizer: [new terserPlugin({
      extractComments: false,
      terserOptions: {
        compress: {
          pure_funcs: ['console.debug', 'console.info']
        },
      },
    })],
  };
}

module.exports = [ extensionConfig ];
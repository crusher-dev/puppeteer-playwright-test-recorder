const path = require('path');
const webpack = require('webpack');
const ExtensionReloader = require('webpack-extension-reloader');

const customPath = path.join(__dirname, './customPublicPath');
const host = 'localhost';
const port = 3000;
module.exports = {
  mode: 'development', // The plugin is activated only if mode is set to development
  watch: true,
  entry: {
    background: [customPath, path.resolve(__dirname, '../src/background.ts')],
    inject: [customPath, path.resolve(__dirname, '../src/inject.ts')],
    popup: [customPath, path.resolve(__dirname, '../src/scripts/popup/index.tsx')]
  },
  devMiddleware: {
    publicPath: `http://${host}:${port}/js`,
    stats: {
      colors: true,
    },
    noInfo: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  plugins: [
    new webpack.DefinePlugin({
      __HOST__: `'${host}'`,
      __PORT__: port,
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dev/js/'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    // modules: ["node_modules"]
  },
  module: {
    rules: [{
      // Include ts, tsx, js, and jsx files.
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env', "@babel/preset-react"],
        plugins: [
          ["@babel/plugin-transform-react-jsx", { "pragma":"h" }]
        ]
      }
    },
    { test: /\.ts(x)?$/, loader: 'ts-loader' }],
  },
  devtool: 'eval-cheap-module-source-map',
};

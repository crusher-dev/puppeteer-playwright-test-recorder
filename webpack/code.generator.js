const path = require('path');
const webpack = require('webpack');
const ExtensionReloader = require('webpack-extension-reloader');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: {
        puppeteerCodeGenerator:  path.resolve(__dirname, '../src/scripts/code-generator.ts'),
        playwrightCodeGenerator: path.resolve(__dirname, '../src/scripts/puppter-code-generator.ts')
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '../build/js/'),
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        // modules: ["node_modules"]
    },
    externals: [nodeExternals()],
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

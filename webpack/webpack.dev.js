const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const customPath = path.join(__dirname, './customPublicPath');
const host = 'localhost';
const port = 3000;

module.exports = {
    watch: true,
    mode: 'development',
    node: {
        fs: 'empty'
    },
    entry: {
        background: [customPath, path.resolve(__dirname, '../src/background.ts')],
        inject: [customPath, path.resolve(__dirname, '../src/inject.tsx')],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '../dev/js/'),
    },
    hotMiddleware: {
        path: '/js/__webpack_hmr'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.svg$/,
                use: 'file-loader'
            },
            {
                test: /\.png$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            mimetype: 'image/png'
                        }
                    }
                ]
            },
            {
                test: /\.ts(x)?$/,
                use: [
                    'awesome-typescript-loader'
                ],
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [
            '.js',
            '.jsx',
            '.tsx',
            '.ts'
        ]
    },
    devMiddleware: {
        publicPath: `http://${host}:${port}/js`,
        stats: {
            colors: true,
        },
        noInfo: true,
        headers: { 'Access-Control-Allow-Origin': '*' },
    },
    devServer: {
        hot: true,
        inline: true
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            __HOST__: `'${host}'`,
            __PORT__: port,
            'process.env': {
                NODE_ENV: JSON.stringify('development'),
            },
        })
    ],
    devtool: 'eval-cheap-module-source-map',
};

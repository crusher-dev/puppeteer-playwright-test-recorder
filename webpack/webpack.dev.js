var path = require('path');
const ExtensionReloader  = require('webpack-extension-reloader');
module.exports = {
    mode: "development", // The plugin is activated only if mode is set to development
    watch: true,
    entry: {
        'content-script': path.resolve(__dirname, '../src')
    },
    output: {
        path: path.resolve(__dirname, '../out'),
        filename: 'app.bundle.js'
    },
    resolve: {
        extensions: ['.ts']
    },
    module: {
        rules: [{
            // Include ts, tsx, js, and jsx files.
            test: /\.ts?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
        },
            { test: /\.tsx?$/, loader: "ts-loader" }],
    },
    devtool: "source-map",
    plugins: [
        new ExtensionReloader({
            port: 9090, // Which port use to create the server
            reloadPage: true, // Force the reload of the page also
            entries: { // The entries used for the content/background scripts or extension pages
                contentScript: 'content-script',
            }
        }),
    ]
}

const path = require("path");
const webpack = require('webpack')
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { IgnorePlugin } = require('webpack');

const optionalPlugins = [];
if (process.platform !== "darwin") {
    optionalPlugins.push(new IgnorePlugin({ resourceRegExp: /^fsevents$/ }));
}

module.exports = {
    target: 'electron-renderer',
    entry: {
        frontEnd: path.resolve(__dirname, 'index.ts'),
        preferencesWindow: path.resolve(__dirname, 'Templates/preferencesWindow.ts'),
        fatalWindow: path.resolve(__dirname, 'Templates/fatalWindow.ts'),
        gifProcessingWindow: path.resolve(__dirname, 'Templates/gifProcessingWindow.ts'),
        saveCloudlyWindow: path.resolve(__dirname, 'Templates/saveCloudlyWindow.ts')
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'Webpacked'),
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    experiments: {
        topLevelAwait: true,
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env.FLUENTFFMPEG_COV': false
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(__dirname, "index.html"),
            chunks: ['frontEnd']
        }),
        new HtmlWebpackPlugin({
            filename: 'preferencesWindow.html',
            template: path.resolve(__dirname, "Templates/preferencesWindow.html"),
            chunks: ['preferencesWindow']
        }),
        new HtmlWebpackPlugin({
            filename: 'fatalWindow.html',
            template: path.resolve(__dirname, "Templates/fatalWindow.html"),
            chunks: ['fatalWindow']
        }),
        new HtmlWebpackPlugin({
            filename: 'gifProcessingWindow.html',
            template: path.resolve(__dirname, "Templates/gifProcessingWindow.html"),
            chunks: ['gifProcessingWindow']
        }),
        new HtmlWebpackPlugin({
            filename: 'saveCloudlyWindow.html',
            template: path.resolve(__dirname, "Templates/saveCloudlyWindow.html"),
            chunks: ['saveCloudlyWindow']
        }),
    ],
    optimization: {
        minimize: false
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: [/node_modules/],
            }
        ],
    },
};
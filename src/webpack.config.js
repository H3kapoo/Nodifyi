const path = require("path");
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
        gifLogic: path.resolve(__dirname, 'Templates/gifLogic.ts')
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
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(__dirname, "index.html"),
            chunks: ['frontEnd']
        }),
        new HtmlWebpackPlugin({
            filename: 'gifWindow.html',
            template: path.resolve(__dirname, "Templates/gifWindow.html"),
            chunks: ['gifLogic']
        }),
    ],
    // optimization: {
    //     minimize: false
    // },
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
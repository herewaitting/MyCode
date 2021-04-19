import * as HtmlWebpackPlugin from "html-webpack-plugin";
// const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
// import * as ip from "ip";
import * as path from "path";
import * as webpack from "webpack";
import * as WebpackDevServer from "webpack-dev-server";
import * as merge from "webpack-merge";

import { commonConfig } from "./webpack.common";
const argv = require("yargs").argv;

console.log(path.resolve(__dirname, "../"));
const devServer: WebpackDevServer.Configuration = {
    contentBase: [path.resolve(__dirname, "../example/"), path.resolve(__dirname, "../")],
    compress: true,
    // host: ip.address(),
    host: "0.0.0.0",
    port: 9091,
    hot: true,
    open: false,
};

const template = argv.new ? "./src2/index.html" : "./index.html";

const devConfig: webpack.Configuration = {
    devtool: "inline-source-map",
    devServer,
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            filename: "index.html",
            template,
            inject: "head",
        }),
        // new UglifyJsPlugin({
        //     uglifyOptions: {
        //       compress: {
        //         warnings: false,
        //         drop_console: true,
        //         pure_funcs: ["console.log"],
        //       },
        //     },
        //     sourceMap: true,
        //     parallel: true,
        // }),
    ],
};

export default merge(commonConfig, devConfig);

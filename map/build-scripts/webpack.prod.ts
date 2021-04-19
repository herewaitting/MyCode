import * as webpack from "webpack";
import * as merge from "webpack-merge";
// const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
import { commonConfig } from "./webpack.common";
const devConfig: webpack.Configuration = {
    optimization: {
        minimizer: [
            new TerserPlugin({
                cache: true,
                parallel: true,
                sourceMap: true, // Must be set to true if using source-maps in production
                terserOptions: {},
            }),
        ],
    },
    plugins: [
        // new BundleAnalyzerPlugin(),
        // new UglifyJsPlugin({
        //     compress: {
        //         warnings: false,
        //         drop_console: true,
        //         pure_funcs: ["console.log"],
        //     },
        //     sourceMap: false,
        // }),
    ],
};

export default merge(commonConfig, devConfig);

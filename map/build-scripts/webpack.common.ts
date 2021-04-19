import * as WebPack from "webpack";

import * as path from "path";
const argv = require("yargs").argv;
console.log(argv.new, "**************");
const entry = argv.new ? "./src2/index.ts" : "./src/index.ts";
export const commonConfig: WebPack.Configuration = {
    entry: {
        app: entry,
    },
    output: {
        filename: "kvscene.js",
        // chunkFilename: "kvscene.js",
        path: path.resolve(__dirname, "../kvscene/dist"),
        libraryTarget: "umd",
        library: "kvscene",
        globalObject: "this",
        // libraryExport: "kvscene",
    },
    target: "web",
    resolve: {
        // add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"],
    },
    // stats: "verbose",
    module: {
        rules: [
            {
                test: /\.worker\.ts$/, // ts结尾,这也很重要
                use: {
                    loader: "worker-loader",
                    options: {
                        name: "[name]:[hash:8].js", // 打包后chunk的名称
                        inline: true, // 开启内联模式,免得爆缺少标签或者跨域的错误
                    },
                },
            },
            // all files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "ts-loader" },
            {
                test: /\.less$/,
                oneOf: [
                    {
                        use: [
                            { loader: "style-loader" },
                            {
                                loader: "css-loader",
                                options: {
                                    modules: true,
                                    localIdentName: "[local]_[hash:base64:5]",
                                },
                            },
                            {
                                loader: "less-loader",
                                options: {
                                    sourceMap: true,
                                },
                            },
                        ],
                    },
                ],
            },
            {
                test: /\.css$/,
                use: [
                    { loader: "style-loader" },
                    {
                        loader: "css-loader",
                        options: { module: true },
                    },
                ],
            },
            {
                test: /\.(png|jpg|gif|svg|ttf|glb|gltf)$/,
                use: [{ loader: "url-loader", options: {
                    limit: 8192000000,
                    name: "assets/[name].[hash].[ext]",
                }}],
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader",
                        options: { minimize: true },
                    },
                ],
            },
        ],
    },
    plugins: [
        new WebPack.DefinePlugin({ CESIUM_BASE_URL: JSON.stringify("") }),
    ],
    externals: {
        cesium: "Cesium",
    },
};

export default commonConfig;

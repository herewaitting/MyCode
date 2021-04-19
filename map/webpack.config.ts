import * as dev from "./build-scripts/webpack.dev";
import * as prod from "./build-scripts/webpack.prod";

const { env } = process;
let config = dev;
if (env.NODE_ENV === "prod") {
    config = prod;
}

export default config;

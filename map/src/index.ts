export * from "./scene";
export { Point } from "./layers/point/point";
export { Line } from "./layers/line/line";
export { Polygon } from "./layers/polygon/polygon";

import { version } from "../kvscene/package.json";

export const VERSION = version;

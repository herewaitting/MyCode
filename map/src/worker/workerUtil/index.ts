import { ILonLatHeight } from "../../interface";
import defined from "../czmCore/defined.js";
export const judgeItemStyleType = (info: any, condition: any[]): string => {
    if (!condition || !condition.length) {
        return "default";
    }
    let resStr = "default";
    if (!info) {
        return resStr;
    }
    const re = /(\{\{)(\s*\w+\s*)(\}\})/gm;
    const tConditions = [...condition];
    if (tConditions && tConditions.length) {
        for (const c of tConditions) {
            if (resStr !== "default") {
                break;
            }
            if (c.condition) {
                const oldCond = c.condition;
                let newCond = c.condition;
                const variables = c.condition.match(re); //  ["{{  variable  }}", "{{ variable}}"] || null
                if (variables) {
                   for (const variable of variables) {
                       const execArr = re.exec(variable);
                       re.lastIndex = 0;
                       const dataKey = execArr ? execArr[2].trim() : "";
                       if (info[dataKey]) {
                            newCond = newCond.replace(new RegExp(variable), "'" + info[dataKey] + "'");
                            try {
                                // tslint:disable-next-line: no-eval
                                if (eval(newCond)) {
                                    resStr = oldCond;
                                    break;
                                }
                            } catch (err) {
                                resStr = "default";
                            }
                       }
                    }
                } else {
                    continue;
                }
            } else {
                continue;
            }
        }
    }
    return resStr;
};
export const judgeItemFlash = (condTxt: string, condition: any[]) => {
    if (!condition || !condition.length) {
        return false;
    }
    let resBool = false;
    const tConditions = [...condition];
    if (tConditions && tConditions.length) {
        for (const c of tConditions) {
            const oldCond = c.condition;
            if (oldCond === condTxt) {
                const style = c.style;
                resBool = style.flash;
                break;
            }
        }
    }
    return resBool;
};

export const compareArray = (oldArr: any[], newArr: any[], filterKey: string, style?: any) => {
    const havedArr: any[] = [];
    const delArr: any[] = [];
    const appendArr: any[] = [];
    const flashArr: any[] = [];
    if (filterKey) {
        oldArr.forEach((item) => {
            const oldValue = item[filterKey];
            const currHave = newArr.find((newItem) => {
                return newItem[filterKey] === oldValue;
            });
            if (currHave) {
                havedArr.push(currHave);
            } else {
                delArr.push(item);
            }
        });
        newArr.forEach((item) => {
            const newValue = item[filterKey];
            const newCurr = oldArr.find((oldItem) => {
                return oldItem[filterKey] === newValue;
            });
            if (!newCurr) {
                appendArr.push(item);
            }
        });
    } else {
        oldArr.forEach((item) => {
            const currHave = newArr.find((newItem) => {
                return newItem === item;
            });
            if (currHave) {
                havedArr.push(currHave);
            } else {
                delArr.push(item);
            }
        });
        newArr.forEach((item) => {
            const newCurr = oldArr.find((oldItem) => {
                return oldItem === item;
            });
            if (!newCurr) {
                appendArr.push(item);
            }
        });
    }
    if (style && style.condition) {
// oldArr.forEach((item) => {
//     const currStyle = judgeItemStyleType(item, style.condition);
//     // tslint:disable-next-line: max-line-length
// tslint:disable-next-line: max-line-length
//     if (judgeItemFlash(currStyle, style.condition) && delArr.indexOf(item) === -1 && flashArr.indexOf(item[filterKey]) === -1) {
//         flashArr.push(item[filterKey]);
//     }
// });
        newArr.forEach((item) => {
            const currStyle = judgeItemStyleType(item, style.condition);
            // tslint:disable-next-line: max-line-length
            if (judgeItemFlash(currStyle, style.condition) && delArr.indexOf(item) === -1 && flashArr.indexOf(item[filterKey]) === -1) {
                flashArr.push(item[filterKey]);
            }
        });
    }
    return {
        have: havedArr,
        del: delArr,
        append: appendArr,
        flash: flashArr,
    };
};

// 输入点对象数组，返回一维经纬度高度数组集合
export const transformLonLatData = (data: ILonLatHeight[], height?: number): number[] => {
    const dataArr: number[] = [];
    data.forEach((item) => {
        let resHeight = 0;
        if (!item.height) {
            item.height = 0;
        }
        if (defined(item.height)) {
            resHeight = item.height + height! || 0.1;
        } else {
            resHeight = height || 0.5;
        }
        item.longitude = item.longitude ? Number(item.longitude) : Number(item.lon);
        item.latitude = item.latitude ? Number(item.latitude) : Number(item.lat);
        dataArr.push(item.longitude, item.latitude, resHeight);
    });
    return dataArr;
};

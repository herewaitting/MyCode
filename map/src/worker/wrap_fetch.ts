/*
 * @Descripttion:
 * @version:
 * @Author: JohnnyZou
 * @Date: 2020-06-19 10:10:33
 * @LastEditors: JohnnyZou
 * @LastEditTime: 2020-12-04 15:56:04
 */
export default function(ctx: any) {
    return async (
        url = "",
        data: {[k: string]: any} = {},
        type = "GET",
        method = "fetch",
    ): Promise<any> => {
        type = type.toUpperCase();
        if (type === "GET") {
            let dataStr = ""; // 数据拼接字符串
            Object.keys(data).forEach((key) => {
                dataStr += key + "=" + data[key] + "&";
            });
            if (dataStr !== "") {
                dataStr = dataStr.substr(0, dataStr.lastIndexOf("&"));
                url = url + "?" + dataStr;
            }
        }
        if (ctx.fetch && method === "fetch") {
            const requestConfig = {
                credentials: "include", // 为了在当前域名内自动发送 cookie ， 必须提供这个选项
                method: type,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                },
                mode: "cors", // 请求的模式
                cache: "force-cache",
            };

            if (type === "POST") {
                Object.defineProperty(requestConfig, "body", {
                    value: JSON.stringify(data),
                });
            }
            try {
                const response = await fetch(url, requestConfig as any);
                return response;
            } catch (error) {
                throw new Error(error);
            }
        } else {
            return new Promise((resolve, reject) => {
                let requestObj: any;
                requestObj = new ctx.XMLHttpRequest();
                let sendData = "";
                if (type === "POST") {
                    sendData = JSON.stringify(data);
                }
                requestObj.open(type, url, true);
                requestObj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                requestObj.send(sendData);
                requestObj.onreadystatechange = () => {
                    if (requestObj.readyState === 4) {
                        if (requestObj.status === 200) {
                            const obj = requestObj.response;
                            // if (typeof obj !== "object") {
                            //     obj = JSON.parse(obj);
                            // }
                            resolve(obj);
                        } else {
                            reject(requestObj);
                        }
                    }
                };
            });
        }
    };
}

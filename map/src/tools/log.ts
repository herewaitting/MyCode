export interface IKvLog {
    msg: string;
    [key: string]: any;
}

export const KvLog = {
    warn(log: IKvLog) {
        if (log) {
            log.time = new Date().getTime();
            console.warn(JSON.stringify(log));
        } else {
            console.warn("错误消息不存在！");
        }
    },
    log(log: IKvLog) {
        if (log) {
            log.time = new Date().getTime();
            console.log(JSON.stringify(log));
        } else {
            console.log("错误消息不存在！");
        }
    },
    error(log: IKvLog) {
        if (log) {
            log.time = new Date().getTime();
            console.error(JSON.stringify(log));
        } else {
            console.error("错误消息不存在！");
        }
    },
};

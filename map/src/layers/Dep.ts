/*
 * @Descripttion:
 * @version:
 * @Author: JohnnyZou
 * @Date: 2020-07-20 10:39:40
 * @LastEditors: JohnnyZou
 * @LastEditTime: 2020-11-04 11:01:21
 */
export interface IDepOpts {
    isProxy: boolean;
    proxyTarget: any;
}

export interface IObserverTarget {
    [k: string]: any;
}

export interface IChangePropsParams {
    target: IObserverTarget;
    key: string;
    oldValue: any;
    newValue: any;
}
export class Dep {
    public isProxy: boolean = false;
    public proxyTarget: any = null;
    public list: any[] = [];
    public count: number = 0;
    constructor(opts?: IDepOpts) {
        if (opts) {
            this.isProxy = opts.isProxy;
            this.proxyTarget = opts.proxyTarget;
        }
    }
    public add(watcher: (v: any) => void) {
        this.list.push(watcher);
    }
    public notify(newValue: any) {
        for (const fn of this.list) {
            fn(newValue);
        }
    }
    /**
     * @name: observer
     * @description: 数据监测
     * @param {target} 需要监测的目标对象
     * @param {proxyTarget} 代理对象 如果设置了 target的属性会被代理到proxyTarget上面
     */
    public observer(target: IObserverTarget, proxyTarget?: {[k: string]: any} | null) {
        const self = this;
        this.count ++;
        for (let [k, v] of Object.entries(target)) {
            // 如果属性值还是对象 则递归
            if (this.isObj(v) && !(v instanceof Array)) {
                if (this.count === 1) { // 保存对象路径
                    Object.defineProperty(v, "_path", {
                        enumerable: false,
                        writable: true,
                        value: [k],
                    });
                } else {
                    Object.defineProperty(v, "_path", {
                        enumerable: false,
                        writable: true,
                        value: [target._path, k],
                    });
                }
                this.observer(v, v);
            }
            Object.defineProperty(proxyTarget || (this.isProxy && this.proxyTarget) || target, k, {
                configurable: true,
                enumerable: true,
                get() {
                    return v;
                },
                set(newValue) {
                    if (typeof v !== typeof target[k]) {
                        throw new ReferenceError(`类型${typeof v}不能赋值给类型为${typeof target[k]}的${k}`);
                    }
                    const keys = Object.keys(target);
                    if (keys.includes(k)) {
                        if (v !== newValue) {
                            let path = target._path;
                            if (!path) {
                                path = [];
                            }
                            path = path.slice();
                            path.push(k);
                            const key = path.flat(Infinity).join(".");
                            const params: IChangePropsParams = {
                                target,
                                key,
                                oldValue: v,
                                newValue,
                            };
                            self.notify(params);
                            v = newValue;
                        }
                    } else {
                        throw new ReferenceError(`${k}属性在当前目标上不存在`);
                    }
                },
            });
        }
    }
    // 使用Proxy api做代理
    public observer2(target: {[k: string]: any}) {
        const self = this;
        const handler: ProxyHandler<any> = {
            get(target, key, receiver) {
                if (!(key in target)) {
                    throw new ReferenceError("属性不存在");
                }
                return Reflect.get(target, key, receiver);
            },
            set(target, key, value, receiver) {
                // console.log(target, key, value, "in set");
                if (target[key] !== value) {
                    self.notify({
                        key,
                        oldValue: target[key],
                        newValue: value,
                    });
                }
                return Reflect.set(target, key, value, receiver);
            },
        };
        return this.toDeepProxy(target, handler);
    }
    public toDeepProxy(target: any, handler: ProxyHandler<any>) {
        const self = this;
        if (!this.isPureObject(target)) {
            addSubProxy(target, handler);
        }
        return new Proxy(target, handler);
        function addSubProxy(target: any, handler: ProxyHandler<any>) {
            for (const [k, v] of Object.entries(target)) {
                if (self.isObj(v)) {
                    if (!self.isPureObject(v)) {
                        addSubProxy(v, handler);
                    }
                    target[k] = new Proxy(v, handler);
                }
            }
            target = new Proxy(target, handler);
        }
    }
    public isObj(data: any) {
        return Object.prototype.toString.call(data) === "[object Object]";
    }

    // 判断该对象是不是纯对象，没有嵌套
    public isPureObject(object: any) {
        if (typeof object !== "object") {
            return false;
        } else {
            for (const prop in object) {
                if (this.isObj(object[prop])) {
                    return false;
                }
            }
        }
        return true;
    }
}

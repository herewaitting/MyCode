export const GetVec2Nor = (vector: number[]) => {
    if (!vector || vector.length < 2 || !vector[0] && !vector[1]) { return; }
    // tslint:disable-next-line: one-variable-per-declaration
    const rr = [vector[1], -vector[0]];
    const ll = [-vector[1], vector[0]];
    const powTal = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
    rr[0] = rr[0] / powTal;
    rr[1] = rr[1] / powTal;
    ll[0] = ll[0] / powTal;
    ll[1] = ll[1] / powTal;
    return {
        right: rr,
        left: ll,
    };
};

export const NormalizeVec2 = (vector: number[]) => {
    const powTal = Vec2Model(vector);
    return [vector[0] / powTal, vector[1] / powTal];
};

export const Vec2Model = (vec: number[]) => {
    return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
};

export const Line2Polygon = (lines: number[][], width: number) => {
    const len = lines.length;
    let leftArr: any[] = [];
    let rightArr: any[] = [];
    const halfWidth = width / 2;
    let totalDir: any;
    let totalLength = 0;
    let uvx: any[] = [];
    lines.forEach((point, index) => {
        let halfCos = 1;
        if (index > 0 && index < len - 1) {
            const prevP = lines[index - 1];
            const currP = lines[index];
            const nextP = lines[index + 1];
            let prevDir = [currP[0] - prevP[0], currP[1] - prevP[1]];
            let nextDir = [nextP[0] - currP[0], nextP[1] - currP[1]];
            prevDir = NormalizeVec2(prevDir);
            nextDir = NormalizeVec2(nextDir);
            const dotNum = Vec2Dot(prevDir, nextDir);
            const cosNum = dotNum / Vec2Model(prevDir) / Vec2Model(nextDir);
            const radAng = Math.acos(cosNum) / 2;
            halfCos = Math.cos(radAng);
            totalDir = [prevDir[0] + nextDir[0], prevDir[1] + nextDir[1]];
        } else {
            if (index === 0) {
                const currP = lines[0];
                const nextP = lines[1];
                totalDir = [nextP[0] - currP[0], nextP[1] - currP[1]];
            }
            if (index === len - 1) {
                const prevP = lines[index - 1];
                const currP = lines[index];
                totalDir = [currP[0] - prevP[0], currP[1] - prevP[1]];
            }
        }
        const dirNor = GetVec2Nor(totalDir);
        if (dirNor) {
            const currRightP = [point[0] + dirNor.right[0] * halfWidth / halfCos,
            point[1] + dirNor.right[1] * halfWidth / halfCos];
            rightArr.push(currRightP);
            const currLeftP = [point[0] + dirNor.left[0] * halfWidth / halfCos,
            point[1] + dirNor.left[1] * halfWidth / halfCos];
            leftArr.push(currLeftP);
        }
        if (index > 0) {
            const prevP = lines[index - 1];
            const currP = lines[index];
            const currDir = [currP[0] - prevP[0], currP[1] - prevP[1]];
            const currDis = Math.sqrt(currDir[0] * currDir[0] + currDir[1] * currDir[1]);
            totalLength += currDis;
        }
    });
    if (len > 2) {
        const newRightArr: number[][] = [];
        const newLeftArr: number[][] = [];
        let lastSide = ""; // 长边所在的一侧
        uvx = [];
        rightArr.forEach((rightP1, index) => {
            if (index === 0) {
                newRightArr.push(rightArr[0]);
                newLeftArr.push(leftArr[0]);
            } else if (index <= len - 1) {
                const oldP0 = lines[index - 1];
                const oldP1 = lines[index];
                const oldP2 = lines[index + 1];
                const rightP0 = rightArr[index - 1];
                const rightP2 = rightArr[index + 1];
                const leftP0 = leftArr[index - 1];
                const leftP1 = leftArr[index];
                const leftP2 = leftArr[index + 1];
                let offsetDis = 0;
                let nextOffsetDis = 0;
                let xbdir: number[] = [];
                let nextXbdir: number[] = [];
                if (oldP2) {
                    let prevDir = [oldP1[0] - oldP0[0], oldP1[1] - oldP0[1]];
                    const nextDir = [oldP2[0] - oldP1[0], oldP2[1] - oldP1[1]];
                    prevDir = NormalizeVec2(prevDir);
                    const prevDirNorDir = GetVec2Nor(prevDir);
                    const nextDirNor = NormalizeVec2(nextDir);

                    // nextDir = NormalizeVec2(nextDir);
                    const dotNum = Vec2Dot((prevDirNorDir as any).right, nextDirNor);
                    if (dotNum < 0) {
                        lastSide = "right";
                    } else if (dotNum > 0) {
                        lastSide = "left";
                    } else {
                        lastSide = "";
                    }
                    if (lastSide === "right") {
                        xbdir = [leftP1[0] - rightP0[0], leftP1[1] - rightP0[1]];
                        nextXbdir = [leftP1[0] - rightP2[0], leftP1[1] - rightP2[1]];
                    } else {
                        xbdir = [rightP1[0] - leftP0[0], rightP1[1] - leftP0[1]];
                        nextXbdir = [rightP1[0] - leftP2[0], rightP1[1] - leftP2[1]];
                    }
                    const xbdis = Vec2Model(xbdir);
                    const nextDis = Vec2Model(nextXbdir);
                    offsetDis = Math.sqrt(xbdis * xbdis - width * width);
                    nextOffsetDis = Math.sqrt(nextDis * nextDis - width * width);
                    const currDir = [oldP1[0] - oldP0[0], oldP1[1] - oldP0[1]];
                    const currDirNor = NormalizeVec2(currDir);
                    if (index < len - 1) {
                        if (lastSide === "left") {
                            newRightArr.push(rightP1);
                            newRightArr.push(rightP1);
                            newRightArr.push(rightP1);
                            // tslint:disable-next-line: max-line-length
                            newLeftArr.push([leftP0[0] + currDirNor[0] * offsetDis, leftP0[1] + currDirNor[1] * offsetDis]);
                            newLeftArr.push(leftP1);
                            // tslint:disable-next-line: max-line-length
                            newLeftArr.push([leftP2[0] - nextDirNor[0] * nextOffsetDis, leftP2[1] - nextDirNor[1] * nextOffsetDis]);
                        } else if (lastSide === "right") {
                            // tslint:disable-next-line: max-line-length
                            newRightArr.push([rightP0[0] + currDirNor[0] * offsetDis, rightP0[1] + currDirNor[1] * offsetDis]);
                            newRightArr.push(rightP1);
                            // tslint:disable-next-line: max-line-length
                            newRightArr.push([rightP2[0] - nextDirNor[0] * nextOffsetDis, rightP2[1] - nextDirNor[1] * nextOffsetDis]);
                            newLeftArr.push(leftP1);
                            newLeftArr.push(leftP1);
                            newLeftArr.push(leftP1);
                        }
                    }
                }
                //  else {
                //     if (lastSide === "right") {
                //         xbdir = [leftP0[0] - rightP1[0], leftP0[1] - rightP1[1]];
                //     } else {
                //         xbdir = [rightP0[0] - leftP1[0], rightP0[1] - leftP1[1]];
                //     }
                // }
                // if (index > 1) { //
                //     if (lastSide === "right") {
                //         xbdir = [leftP0[0] - rightP1[0], leftP0[1] - rightP1[1]];
                //     } else {
                //         xbdir = [rightP0[0] - leftP1[0], rightP0[1] - leftP1[1]];
                //     }
                //     xbdis = Vec2Model(xbdir);
                //     offsetDis = Math.sqrt(xbdis * xbdis - width * width);

                //     if (lastSide === "right") {
                // tslint:disable-next-line: max-line-length
                //         newRightArr.push([rightP1[0] - currDirNor[0] * offsetDis, rightP1[1] - currDirNor[1] * offsetDis]);
                //         newLeftArr.push(leftArr[len - 2]);
                //     } else {
                //         newRightArr.push(rightArr[len - 2]);
                // tslint:disable-next-line: max-line-length
                //         newLeftArr.push([leftP1[0] - currDirNor[0] * offsetDis, leftP1[1] - currDirNor[1] * offsetDis]);
                //     }
                // }
                if (index === len - 1) { // 最后一个点
                    newRightArr.push(rightArr[len - 1]);
                    newLeftArr.push(leftArr[len - 1]);
                }
            }
        });
        let newTal = 0;
        const newStepDis: number[] = [];
        if (lastSide === "right") {
            newRightArr.forEach((item, index) => {
                if (index > 0) {
                    const prevP = newRightArr[index - 1];
                    const currP = newRightArr[index];
                    const currDir = [currP[0] - prevP[0], currP[1] - prevP[1]];
                    const currDis = Math.sqrt(currDir[0] * currDir[0] + currDir[1] * currDir[1]);
                    newTal += currDis;
                    newStepDis.push(newTal);
                } else {
                    newStepDis.push(0);
                }
            });
        } else {
            newLeftArr.forEach((item, index) => {
                if (index > 0) {
                    const prevP = newLeftArr[index - 1];
                    const currP = newLeftArr[index];
                    const currDir = [currP[0] - prevP[0], currP[1] - prevP[1]];
                    const currDis = Math.sqrt(currDir[0] * currDir[0] + currDir[1] * currDir[1]);
                    newTal += currDis;
                    newStepDis.push(newTal);
                } else {
                    newStepDis.push(0);
                }
            });
        }
        newStepDis.forEach((length) => {
            uvx.push(length / newTal);
        });
        rightArr = newRightArr;
        leftArr = newLeftArr;
    } else {
        uvx = [0, 1];
    }
    return {
        right: rightArr,
        left: leftArr,
        uvx,
        length: totalLength,
    };
};

export const Vec2Dot = (vec1: number[], vec2: number[]) => {
    return vec1[0] * vec2[0] + vec1[1] * vec2[1];
};

export const distanceOfPoint2Line = (x: number, y: number, x1: number, y1: number, x2: number, y2: number) => {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lensq = C * C + D * D;
    let param = -1;
    if (lensq !== 0) { // 线段长度不能为0
        param = dot / lensq;
    }

    let xx;
    let yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

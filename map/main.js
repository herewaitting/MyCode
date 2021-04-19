const gltfPipeline = require('gltf-pipeline');
const fsExtra = require('fs-extra');
const processGltf = gltfPipeline.processGltf;
const btoa = require('btoa');

const argv = process.argv
if (argv.length <= 2) {
    console.log('请指定待处理的文件地址')
    return
}

const inputGltf = argv[2];
const outputGltf = argv[3];
const uvMove = eval(argv[4]) || false;
const extruMove = eval(argv[5]) || false;
const styleBM = argv[6] || "";

console.log("输入文件：" + inputGltf);
console.log("输出文件：" + outputGltf);
// const inputGltf = "./static/gltf/511/cs.gltf";
// const outputGltf = "./static/gltf/jingstc444.gltf";

const  arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i += 1) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);  //base64
  };
    
    
const doptions = {
    dracoOptions: {
        compressionLevel: 10
    }
};
if(inputGltf.indexOf(".glb")>=0){
    const glbToGltf = gltfPipeline.glbToGltf;
    const glb = fsExtra.readFileSync(inputGltf);
    glbToGltf(glb)
    .then(function(results) {
        if (!results.gltf.asset) {
            results.gltf.asset = {}
        }
        results.gltf.asset.use = {
            uvMove: uvMove,
            extruMove: extruMove,
            styleBM: styleBM,
        }
        // fsExtra.writeJsonSync(outputGltf, results.gltf);
        processGltf(results.gltf, doptions)
        .then(function(results1) {
            console.log();
            fsExtra.writeJsonSync(outputGltf, results1.gltf);
        });
    });
} else {
    const gltf = fsExtra.readJsonSync(inputGltf);

    if (!gltf.asset) {
        gltf.asset = {}
    }

    gltf.asset.use = {
        uvMove: uvMove,
        extruMove: extruMove,
        styleBM: styleBM,
    }
    if(gltf.buffers && gltf.buffers[0] && gltf.buffers[0].uri.length > 200){
        processGltf(gltf, doptions)
        .then(function(results) {
            console.log();
            fsExtra.writeJsonSync(outputGltf, results.gltf);
        });
    } else {
        // fsExtra.writeJsonSync(outputGltf, gltf);
        const binUrl = inputGltf.replace(".gltf", ".bin");
        const binFile = fsExtra.readFileSync(binUrl);
        // console.log(btoa(binFile));
        gltf.buffers[0].uri = "data:image/png;base64," + btoa(binFile);
        processGltf(gltf, doptions)
        .then(function(results) {
            console.log();
            fsExtra.writeJsonSync(outputGltf, results.gltf);
        });
    }
}





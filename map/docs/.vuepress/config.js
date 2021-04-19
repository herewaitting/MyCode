module.exports = {
    base: "/kvsceneDocs/",
    title: 'kvscene文档',
    description: 'Just playing around',
    port: 9009,
    host: "0.0.0.0",
    configureWebpack: {
        resolve: {
            alias: {
            '@alias': 'path/to/some/dir'
            }
        }
    },
    extraWatchFiles: [
        ".vuepress/config.js"
    ],
    markdown: {
        lineNumbers: true
    },
    themeConfig: {
        editLinks: true,
        smoothScroll: true,
        lastUpdated: 'Last Updated', // string | boolean
        nav:[ // 导航栏配置
            {
                text: "api",
                link: "/api/",
                // items: [
                //     { 
                //         text: '学前准备',
                //         items: [
                //             {
                //                 text: "KVScene3D",
                //                 link: "/api/KVScene3D/"
                //             },
                //             { text: 'viewer', link: '/api/viewer/' },
                //             { text: 'layerManager', link: '/api/layerManager/' },
                //             { text: 'sceneControl', link: '/api/sceneControl/' },
                //             { text: 'baseMap', link: '/api/baseMap/' },
                //             { text: 'cameraControl', link: '/api/cameraControl/' },
                //             { text: 'lightManager', link: '/api/lightManager/' },
                //         ]
                //     },
                // ]
            },
            {text: "图层", link: "/layer/"},
            {text: "图层列表", link: "/layerList/"},
            {text: 'gitlab', link: 'https://szgitlab.kedacom.com/kdksh/kvmap/tree/newKvmap'}      
        ],
        sidebar: "auto",
        sidebarDepth: 2, // 侧边栏显示2级
    }
}
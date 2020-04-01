window.onload = function() {
    let tree = new Tree({
        tree: { //树形控件的数据结构
            "树形控件": {
                "css": {
                    "tree.css": null
                },
                "js": {
                    "main.js": null,
                    "tree.js": null
                },
                "tree.html": null
            },
            "前端学习笔记": {
                "网络相关": {
                    "缓存": {
                        "强缓存": null,
                        "协商缓存": null
                    },
                    "网络攻击": {
                        "csrf攻击": null,
                        "xss攻击": null
                    },
                    "http": {
                        "http和https": null,
                        "http的变化": null,
                        "三次握手": null
                    }
                },
                "vue": null
            },
            "复习资料": null
        },
        auto: true, //是否默认展开
        lazyload: false, //是否懒加载
        hasCheck: false,
        filters: [],
        id: "tree"
    })
}
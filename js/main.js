window.onload = function() {
    let tree = new Tree({
        tree: [{ //树形控件的数据结构
            name: "tree",
            children: [{
                name: "tree_0",
                children: [{
                    name: "tree_0_0"
                },{
                    name: "tree_0_1"
                }],
                disabled: true
            },{
                name: "tree_1",
                children: [{
                    name: "tree_1_0"
                },{
                    name: "tree_1_1",
                    children: [{
                        name: "tree_1_1_1"
                    },{
                        name: "tree_1_1_2"
                    },{
                        name: "tree_1_1_3"
                    }]
                }]
            },{
                name: "tree_2",
                children: [{
                    name: "tree_2_0"
                },{
                    name: "tree_2_1",
                    children: [{
                        name: "tree_2_1_1"
                    },{
                        name: "tree_2_1_2"
                    },{
                        name: "tree_2_1_3"
                    }],
                    disabled: true
                }]
            }]
        },{
            name: "video"
        }],
        auto: true, //是否默认展开
        lazyload: false, //是否懒加载
        hasCheck: true, //是否开启选项
        filters: [],
        id: "tree"
    })
}
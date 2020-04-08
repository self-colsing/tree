// import "../css/tree.css"
// import {Tree} from "./tree.js"

window.onload = function() {
    let tree = new Tree({
        tree: [{ //树形控件的数据结构
            id: "0",
            name: "tree",
            children: [{
                id: "0-0",
                name: "tree_0",
                children: [{
                    id: "0-0-0",
                    name: "tree_0_0",
                    checked: true //默认选中功能
                },{
                    id: "0-0-1",
                    name: "tree_0_1"
                }],
                disabled: true //禁用功能
            },{
                id: "0-1",
                name: "tree_1",
                children: [{
                    id: "0-1-0",
                    name: "tree_1_0"
                },{
                    id: "0-1-1",
                    name: "tree_1_1",
                    children: [{
                        id: "0-1-1-0",
                        name: "tree_1_1_1"
                    },{
                        id: "0-1-1-1",
                        name: "tree_1_1_2"
                    },{
                        id: "0-1-1-2",
                        name: "tree_1_1_3"
                    }]
                }]
            },{
                name: "tree_2",
                id: "0-2",
                children: [{
                    id: "0-2-0",
                    name: "tree_2_0"
                },{
                    id: "0-2-1",
                    name: "tree_2_1",
                    children: [{
                        id: "0-2-1-0",
                        name: "tree_2_1_1"
                    },{
                        id: "0-2-1-1",
                        name: "tree_2_1_2"
                    },{
                        id: "0-2-1-2",
                        name: "tree_2_1_3"
                    }],
                    disabled: true
                }]
            }]
        },{
            id: "1",
            name: "video"
        }],
        auto: true, //是否默认展开
        lazyload: false, //是否懒加载
        hasCheck: true, //是否开启选项
        filter: true, //是否开启过滤节点
        draggable: true, //是否可拖拽
        id: "tree",
        checkFunc: (a,b)=>{
            console.log(a,b);
        }
    })

    // this.setTimeout(()=>{console.log(tree.getCheck());},1000);
}
class Tree {
    constructor(params) {
        //参数默认值
        let temp = {
            "auto": false,
            "lazyload": false,
            "hasCheck": false,
            "id": "tree"
        }

        //未定义参数赋默认值
        for(let key in temp) {
            if(!params[key]) this[key] = temp[key];
            else this[key] = params[key];
        }
        

        //对树的数据结构进行重构成满足需求的
        if(!params.tree) params.tree = [{
            "name": "newFile",
            "children": []
        }];
        this.tree = [];
        this.setTree(params.tree,this.tree);
        this.createTree();
    }

    //重构树的结构
    setTree(tree,cur) {
        for(let i=0;i<tree.length;i++) {
            cur.push({
                name: tree[i].name,
                children: [],
                spread: this.auto
            })
            if(tree[i].children) this.setTree(tree[i].children,cur[i].children)
        }
    }
    
    //添加节点的具体代码
    //参数:节点，节点对应的tree位置，节点的id名，节点是否应该展开
    setDom(dom,node,str,spread) {
        if(!this.lazyload || spread) {
            for(let i = 0;i<node.length;i++) {
                let div = document.createElement("div");
                let child = document.createElement("div");

                //添加选项框
                if(this.hasCheck) {
                    let checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.className = "treeCheckbox";
                    child.appendChild(checkbox);
                    checkbox.id = str.replace("tree","checkbox")+"_"+i;
                }
                div.className = "treeChild";
                child.id = str+"_"+i;
                child.className = "treeNode";

                //添加类名判断是收缩还是扩展
                if(node[i].children.length!=0) {
                    if(node[i].spread) child.className = child.className + " shrinkNode";
                    else child.className = child.className + " spreadNode";
                }; 

                //非懒加载的方式显示
                if(!this.lazyload) {
                    if(!spread) child.style.display = "none";
                    else child.style.display = "";
                } 

                child.innerHTML = child.innerHTML + node[i].name;
                div.appendChild(child);

                this.setDom(div,node[i].children,str+"_"+i);
                dom.appendChild(div);
            }
        }
        return dom;
    }

    //更新节点的具体代码
    updateDom(dom) {
        let keys = dom.id.split("_");
        keys.shift();
        
        //避免父节点被收缩
        if(keys.length) {
            let cur = this.tree;
            for(let i=0;i<keys.length-1;i++) {
                cur = cur[keys[i]].children;
            }
            cur = cur[keys[keys.length-1]];

            if(cur.children.length) {
                cur.spread = !cur.spread;
                if(cur.spread) dom.className = "treeNode shrinkNode";
                else dom.className = "treeNode spreadNode";
            };

            //去除多余节点
            let parent = dom.parentNode;
            let child = parent.getElementsByClassName("treeChild");
            while(child.length) {
                parent.removeChild(child[0]);
            }

            this.setDom(parent,cur.children,dom.id,cur.spread);
        }
    }

    //对节点进行创建
    createTree() {
        let id = this.id;
        let dom = document.getElementById(id);
        if(!dom) throw new Error("dom is undefined");
        dom.innerHTML = ""; //对节点内部内容进行清除
        dom.className = "treeParent";
        console.log(this.tree);
        this.setDom(dom,this.tree,"tree",true);

        dom.addEventListener("click",this.clickTree.bind(this)); //点击事件委任到父节点上
    }

    //对节点进行更新
    updateTree(editDom) {
        let id = this.id;
        let dom = document.getElementById(id);
        if(!dom) throw new Error("dom is undefined");

        this.updateDom(editDom)
    }

    //节点的扩展和收缩
    clickTree(e) {
        if(e.path[0].nodeName.toLowerCase() === "div") this.updateTree(e.path[0]);
    }
}
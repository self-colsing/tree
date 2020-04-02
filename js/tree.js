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
                spread: this.auto,
                checked: false,
                disabled: tree[i].disabled?true:false
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
                    if(!spread) div.style.display = "none";
                    else div.style.display = "";
                } 
                child.innerHTML = node[i].name;
                div.appendChild(child);

                //添加选项框
                if(this.hasCheck) {
                    let checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.className = "treeCheckbox";
                    child.prepend(checkbox);
                    checkbox.id = str.replace("tree","checkbox")+"_"+i;
                    checkbox.checked = node[i].checked;
                    checkbox.disabled = node[i].disabled;
                }
                this.setDom(div,node[i].children,str+"_"+i,node[i].spread);
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

    //修改底层树的选项
    updateBottomCheck(id,node,parentChecked,disabledStack) {
        if(node.disabled) {
            disabledStack.push({
                node,
                id
            });
        }
        let dom = document.getElementById(id);
        if(node.checked !== parentChecked) {
            dom?dom.checked = parentChecked:"";
            node.checked = parentChecked;

            node.children.forEach((item,index)=> {
                this.updateBottomCheck(id+"_"+index,node.children[index],parentChecked,disabledStack);
            })
        }
    }

    //修改上层树的选项
    updateTopCheck(stack) {
        let id = stack.pop();
        let dom = document.getElementById(id);
        let keys = id.split("_");
        keys.shift();
        let parentId = stack[stack.length-1];

        if(keys.length) { 
            let cur = this.tree;
            for(let i=0;i<keys.length-2;i++) {
                cur = cur[keys[i]].children;
            }
            let parent = cur[keys[keys.length-2]]; //点击选项的上一级选项
            
            if(parent) {
                let parentDom = document.getElementById(parentId);
                if(!dom.checked && parentDom.checked) {
                    parent.checked = false;
                    parentDom.checked = false;
                }
                else if(dom.checked && !parentDom.checked){
                    let allSelect = true; //是否全选中
                    cur = parent.children[keys[keys.length-1]]; //点击的选项
                    let children = parentDom.parentNode.parentNode.children; //同级的选项

                    for(let i=0;i<children.length;i++) {
                        if(children[i].className.indexOf("treeChild")!=-1 && children[i].firstChild.firstChild!=dom) {
                            let otherDom = children[i].firstChild.firstChild;//同级的其他节点
                            otherDom.checked === false?allSelect = false:"";
                        }
                    }
                    if(allSelect) {
                        parent.checked = true;
                        parentDom.checked = true;
                    }
                }
                this.updateTopCheck(stack);
            }
        }
    }

    //修改disabled的节点
    updateDisabledCheck(disabledStack,parentChecked) {
        let cur = disabledStack.pop();
        let { node,id } = cur;
        let dom = document.getElementById(id);
        let allSelect = true;
        node.children.forEach(item=> {
            !item.checked?allSelect = false:"";
        })

        dom?dom.checked = allSelect:"";
        node.checked = allSelect;
    }

    updateCheck(dom) {
        let keys = dom.id.split("_");
        let stack = []; //用于记录父节点id
        for(let i=1;i<keys.length;i++) {
            stack.push(stack.length===0?(keys[0]+"_"+keys[i]):stack[stack.length-1]+"_"+keys[i]);
        }

        keys.shift();
        
        //对这层和底层进行修改
        let cur = this.tree;
        for(let i=0;i<keys.length-1;i++) {
            cur = cur[keys[i]].children;
        }
        cur = cur[keys[keys.length-1]];
        let disabledStack = []; //用于存储disabled的节点
        this.updateBottomCheck(dom.id,cur,!cur.checked,disabledStack);
        
        //对disabled节点进行单独处理
        if(disabledStack.length) this.updateDisabledCheck(disabledStack,cur.checked);

        //对上层进行修改
        this.updateTopCheck(stack);
    }

    //对节点进行创建
    createTree() {
        let id = this.id;
        let dom = document.getElementById(id);
        if(!dom) throw new Error("dom is undefined");
        dom.innerHTML = ""; //对节点内部内容进行清除
        dom.className = "treeParent";
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
        //节点的点击事件
        if(e.path[0].nodeName.toLowerCase() === "div") this.updateTree(e.path[0]);

        //checkbox的点击事件
        if(e.path[0].nodeName.toLowerCase() === "input") this.updateCheck(e.path[0]);
    }
}
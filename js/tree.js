class Tree {
    constructor(params) {
        //参数默认值
        let temp = {
            "auto": false,
            "spreadOnly": false,
            "lazyload": false,
            "hasCheck": false,
            "hasAppend": false,
            "hasDelete": false,
            "id": "tree",
            "filter": false,
            "draggable": false,
            "filterWord": "",
            "checkFunc": ()=>{}
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
        this.set = new Set(); //用于判断id是否唯一
        this.tree = [];
        this.setTree(params.tree,this.tree);
        if(this.filter) this.setFilteTree(this.tree); //对显示数据进行过滤

        this.createTree();
        if(this.filter) this.createFilter();
    }

    //重构树的结构
    setTree(tree,cur) {
        for(let i=0;i<tree.length;i++) {
            if(tree[i].id === undefined || this.set.has(tree[i].id)) throw new Error("id must exist and be unique!");
            this.set.add(tree[i].id);
            cur.push({
                name: tree[i].name,
                id: tree[i].id,
                children: [],
                spread: this.auto,
                checked: tree[i].checked?true:false,
                disabled: tree[i].disabled?true:false
            })
            if(tree[i].children) this.setTree(tree[i].children,cur[i].children);
        }
    }
    //根据id获取树对应的位置
    getNode(id) {
        let keys = id.split("_");
        let cur = this.tree;
        for(let i=1;i<keys.length-1;i++) {
            cur = cur[keys[i]].children;
        }
        cur = cur[keys[keys.length-1]];
        return cur;
    }
    //获取展开的后代节点的数量
    getSpreadChildNum(cur) {
        let count = 0; //标记当前节点子孙数量
        cur.children.forEach(item=> {
            if(item.hasFilter===false) return;
            else count = item.spread?(count + this.getSpreadChildNum(item)+1):count+1;
        })
        return count;
    }

    setFilteTree(node) {
        let parentHasFilter = false;
        node.forEach(item=> {
            let hasFilter = false; //底层是否有过滤关键字;
            if(item.children.length) this.setFilteTree(item.children)?hasFilter=true:"";
            item.name.indexOf(this.filterWord) !== -1?hasFilter = true:"";
            item.hasFilter = hasFilter;

            if(hasFilter) parentHasFilter = true;
        })
        return parentHasFilter;
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
                if(this.draggable) child.draggable = true;
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
                if(node[i].hasFilter!==false) {
                    child.innerHTML = node[i].name;
                    div.appendChild(child);
                }

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

                if(this.hasAppend) {
                    let append = document.createElement("span");
                    append.classList = "treeAppendText";
                    append.innerHTML = "新增";
                    child.appendChild(append);
                }

                if(this.hasDelete) {
                    let del = document.createElement("span");
                    del.classList = "treeDeleteText";
                    del.innerHTML = "删除";
                    child.appendChild(del);
                }

                this.setDom(div,node[i].children,str+"_"+i,node[i].spread);
                dom.appendChild(div);
            }
        }
        return dom;
    }

    //伸展节点动画的具体函数
    //fromChild判断是不是有底层触发的
    spreadTree(dom,fromChild) {
        let keys = dom.id.split("_");
        keys.shift();
        if(keys.length) {
            let cur = this.tree;
            for(let i=0;i<keys.length-1;i++) {
                cur = cur[keys[i]].children;
            }
            cur = cur[keys[keys.length-1]];
            let parent = dom.parentNode;
            //高度的动画
            let totalHeight = (this.getSpreadChildNum(cur)+1)*30; //通过计算节点数量计算高度
            //首次伸展需要一次延迟改变高度
            if(!fromChild) {
                if(!cur.spread && parent.style.height==="") {
                    parent.style.height = totalHeight+"px";
                    setTimeout(()=>{parent.style.height = "30px";},0);
                } else if(cur.spread && parent.style.height===""){
                    parent.style.height = "30px";
                    setTimeout(()=>{parent.style.height = totalHeight+"px";},0);
                } else if(totalHeight === parseInt(parent.style.height)) {
                    parent.style.height = "30px";
                } else {
                    parent.style.height = totalHeight+ "px";
                }
            } else {
                if(totalHeight === parseInt(parent.style.height)) {
                    parent.style.height = "30px";
                } else {
                    parent.style.height = parent.clientHeight+ "px";
                    setTimeout(()=>{parent.style.height = totalHeight+"px";},0);
                }
            }
            //需要对父节点采用动画，否则父节点高度定死
            if(parent.parentNode.firstChild) this.spreadTree(parent.parentNode.firstChild,true);  
        }
    }
    //更新节点的具体代码
    updateDom(dom) {
        let keys = dom.id.split("_");
        keys.shift();
        
        //避免父节点被收缩
        if(keys.length) {
            if(!this.run) {
                this.run = true;
                let parent = dom.parentNode;
                let cur = this.tree;
                for(let i=0;i<keys.length-1;i++) {
                    cur = cur[keys[i]].children;
                }
                cur = cur[keys[keys.length-1]];

                //+和-的切换
                if(cur.children.length) {
                    cur.spread = !cur.spread;
                    dom.className = dom.className.replace(" shrinkNode","").replace(" spreadNode","");
                    if(cur.spread) dom.className = dom.className + " shrinkNode";
                    else dom.className = dom.className + " spreadNode";
                };
                
                if(cur.children.length) this.spreadTree(dom);

                //收缩状态时节点需要在动画播放结束后清楚
                //伸展状态时节点需要在动画播放前添加
                if(cur.spread) {
                    let child = parent.getElementsByClassName("treeChild");
                    while(child.length) {
                        parent.removeChild(child[0]);
                    }
                    this.setDom(parent,cur.children,dom.id,cur.spread);
                    setTimeout(()=> {this.run = false;},200);
                } else {
                    setTimeout(()=> {
                        //去除多余节点
                        let child = parent.getElementsByClassName("treeChild");
                        while(child.length) {
                            parent.removeChild(child[0]);
                        }
                        if(this.run) this.setDom(parent,cur.children,dom.id,cur.spread); //避免在触发前，过滤节点导致bug
                        this.run = false;
                    },200)
                }
            }
        }
    }

    //用于刷新
    refreshTree() {
        let dom = document.getElementById(this.id);
        let children = dom.children;
        let i=0;
        while(i<children.length) {
            if(children[i].className === "treeFilterContainer") i++;
            else {
                dom.removeChild(children[i]);
            }
        }
        this.setDom(dom,this.tree,"tree",true);
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

        let parentId = id.split("_");
        parentId.pop();
        parentId = parentId.join("_");

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

                    parent.children.forEach((item,index)=> {
                        if(index!=keys[keys.length-1]) item.checked === false?allSelect = false:"";
                    })

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
        let canChange = true;
        while(disabledStack.length) {
            let cur = disabledStack.pop();
            let { node,id } = cur;
            let dom = document.getElementById(id);
            let allSelect = true;

            //禁用节点的状态只有底层是不是全选决定
            if(!node.children.length) allSelect = false;

            node.children.forEach(item=> {
                !item.checked?allSelect = false:"";
            })

            dom?dom.checked = allSelect:""; //避免懒加载找不到下层节点
            node.checked = allSelect; 
            if(parentChecked !=node.checked) {
                canChange = false;
            }
        }
        return canChange;
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

        let set = new Set(stack);
        //记录disabled节点
        disabledStack.forEach(item=> {
            let keys = item.id.split("_");
            let stack = []; 
            for(let i=1;i<keys.length;i++) {
                stack.push(stack.length===0?(keys[0]+"_"+keys[i]):stack[stack.length-1]+"_"+keys[i]);
                set.add(stack[stack.length-1]);
            }
        })
        //对disabled节点进行单独处理
        if(disabledStack.length) this.updateDisabledCheck(disabledStack,cur.checked);

        //对上层和disabled的上层进行修改
        this.updateTopCheck(Array.from(set));
    }

    //把所有已经选择的选项清空
    clearCheck(cur) {
        cur?"":cur = this.tree;
        cur.forEach(item=> {
            item.checked = false;
            this.clearCheck(item.children);
        })
        
    }

    //返回勾选的name的名字
    getCheck(cur,arr) {
        if(cur === undefined) {
            arr = [];
            cur = this.tree;
        }
        cur.forEach(item=> {
            if(item.checked) arr.push({
                name: item.name,
                id: item.id
            });
            this.getCheck(item.children,arr);
        })
        return arr;
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

        if(this.draggable) {
            dom.addEventListener("dragstart",this.dragTreeStart.bind(this));
            dom.addEventListener("dragend",this.dragTreeEnd.bind(this));
            dom.addEventListener("dragover",this.dragTreeOver.bind(this));
        }
    }

    filterData() {
        this.filterWord = document.getElementById("treeFilter").value;
        let id = this.id;
        let dom = document.getElementById(id);
        if(!dom) throw new Error("dom is undefined");
        
        this.run = false;
        let children = dom.children;
        let i=0;
        while(i<children.length) {
            if(children[i].className === "treeFilterContainer") i++;
            else {
                dom.removeChild(children[i]);
            }
        }
        this.setFilteTree(this.tree);
        this.setDom(dom,this.tree,"tree",true);
        
        //判断有没有数据
        let noData = true;
        this.tree.forEach(item=> {
            item.hasFilter?noData = false:"";
        })
        if(noData) {
            let p = document.createElement("p");
            p.id = "treeNoData";
            p.innerHTML = "暂无数据";
            document.getElementById("tree").appendChild(p);
        } else {
            let noDataDom =  document.getElementById("treeNoData");
            if(noDataDom) document.getElementById("tree").removeChild(noDataDom);
        }
    }

    //创建过滤表单
    createFilter() {
        let id = this.id;
        let dom = document.getElementById(id);
        if(!dom) throw new Error("dom is undefined");
        let container = document.createElement("div");
        let input = document.createElement("input");
        input.id = "treeFilter";
        input.placeholder = "输入关键字进行过滤";
        container.className = "treeFilterContainer";
        container.append(input);
        dom.prepend(container);

        input.addEventListener("keyup",this.filterData.bind(this));
    }

    //对节点进行更新
    updateTree(editDom) {
        let id = this.id;
        let dom = document.getElementById(id);
        if(!dom) throw new Error("dom is undefined");
        this.updateDom(editDom);
    }

    //点击新增的事件
    clickAppend(dom) {
        let id = dom.parentNode.id;
        let node = this.getNode(id);
        let newId = node.id+"_new";
        while(this.set.has(newId)) newId = newId + "_new";
        this.set.add(newId);
        node.children.push({
            checked: node.checked,
            children: [],
            disabled: false,
            hasFilter: true,
            id: newId,
            name: node.name+"_new",
            spread: this.auto?true:false,
        });

        this.refreshTree();
    }

    //点击删除的事件
    clickDelete(dom) {
        let keys = dom.parentNode.id.split("_");
        keys.pop();
        
        let parent = this.getNode(keys.join("_"));
        let node = this.getNode(dom.parentNode.id);
        //证明是父节点
        if(parent === undefined) {
            for(let i =0;i<this.tree.length;i++) {
                if(this.tree[i] === node) {
                    this.tree.splice(i,1);
                    break;
                }
            }
        } else {
            for(let i =0;i<parent.children.length;i++) {
                if(parent.children[i] === node) {
                    parent.children.splice(i,1);
                    break;
                }
            }
            //查看删除后同层的是否全true
            if(parent.children.length>=1) {
                let allSelect = true;
                for(let i =0;i<parent.children.length;i++) {
                    if(parent.children[i].checked === false) {
                        allSelect = false;
                        break;
                    }
                }
                //如果删除后全是对的并且父的选项为未选中则修改父选项
                if(allSelect && parent.checked === false) {
                    this.updateCheck(dom.parentNode.parentNode.parentNode.firstChild.firstChild);
                }
            }
        }
        this.refreshTree();
        
        
    }

    //节点的扩展和收缩
    clickTree(e) {
        //节点的点击事件
        if(e.path[0].nodeName.toLowerCase() === "div") {
            if(e.path[0].className.indexOf("treeNode") !==-1) {
                let dom = document.getElementsByClassName("hoverNode");
                for(let i=0;i<dom.length;i++) {
                    let item = dom[i];
                    item.className = item.className.replace(" hoverNode","");
                }
                e.path[0].className = e.path[0].className + " hoverNode";
            }
            this.updateTree(e.path[0]);
        }
        //checkbox的点击事件
        else if(e.path[0].type === "checkbox") {
            this.updateCheck(e.path[0])

            let keys = e.path[0].id.split("_");
            let cur = this.tree;
            for(let i = 1;i<keys.length-1;i++) {
                cur = cur[keys[i]].children;
            }
            cur = cur[keys[keys.length-1]];
            this.checkFunc({
                id: cur.id,
                name: cur.name
            });
        }
        //点击新增 
        else if(e.path[0].className === "treeAppendText") this.clickAppend(e.path[0]);    
        //点击删除
        else if(e.path[0].className === "treeDeleteText") this.clickDelete(e.path[0]);   
    }

    //节点拖动事件
    dragTreeStart(e) {
         //获取当前拖动位置id
        let dom = e.path[0];
        let className = e.path[0].className;
        this.drag? "":this.drag = {};
        if(className.indexOf("treeChild")!==-1) {
            this.drag.startNode = e.path[0].firstChild.id;
        } else if(className.indexOf("treeNode")!==-1 || className.indexOf("treeCheckbox"!=-1)) {
            this.drag.startNode = dom.id.replace("checkbox","tree");
        } else return;
    }

    dragTreeOver(e) {
        //获取当前拖动位置id
        let dom = e.path[0];
        let className = e.path[0].className;
        this.drag? "":this.drag = {};
        if(className.indexOf("treeChild")!==-1) {
            !this.drag.overNode ? this.drag.overNode = dom.firstChild.id:"";
            if(this.drag.overNode !== dom.firstChild.id){
                let lastOverDom = document.getElementById(this.drag.overNode);
                lastOverDom.style["borderBottom"] = "1px solid white";
                lastOverDom.style["borderTop"] = "1px solid white";
                lastOverDom.style["background"] = "white";
                this.drag.overNode = dom.firstChild.id;
            }
        } else if(className.indexOf("treeNode")!==-1 || className.indexOf("treeCheckbox")!=-1) {
            !this.drag.overNode ? this.drag.overNode = dom.id.replace("checkbox","tree"):"";
            if(this.drag.overNode !== dom.id.replace("checkbox","tree")){
                let lastOverDom = document.getElementById(this.drag.overNode);
                lastOverDom.style["borderBottom"] = "1px solid white";
                lastOverDom.style["borderTop"] = "1px solid white";
                lastOverDom.style["background"] = "white";
                this.drag.overNode = dom.id.replace("checkbox","tree");
            }
        } else if(className.indexOf("Text") !== -1) {
            !this.drag.overNode ? this.drag.overNode = dom.parentNode.id:"";
            if(this.drag.overNode !== dom.parentNode.id){
                let lastOverDom = document.getElementById(this.drag.overNode);
                lastOverDom.style["borderBottom"] = "1px solid white";
                lastOverDom.style["borderTop"] = "1px solid white";
                lastOverDom.style["background"] = "white";
                this.drag.overNode = dom.parentNode.id;
            }
        }
        else return;

        //对相应位置的节点进行操作
        if(this.drag.overNode.indexOf(this.drag.startNode)==-1) {
            let clientY = e.clientY; //鼠标的位置
            let overDom = document.getElementById(this.drag.overNode);
            let overY = overDom.offsetTop; //节点的位置
            let relativeY = clientY - overY; //相对距离
            //拖动在节点中间
            if(relativeY<=23 && relativeY>=7) {
                overDom.style["borderBottom"] = "1px solid white";
                overDom.style["borderTop"] = "1px solid white";
                overDom.style["background"] = "rgba(0,0,0,0.1)"
                this.drag.dragWay = 1; //中间
            } else if(relativeY>23) {
                overDom.style["borderBottom"] = "1px solid rgba(0,0,0,0.8)";
                overDom.style["borderTop"] = "1px solid white";
                overDom.style["background"] = "white"
                this.drag.dragWay = 2; //下面
            } 
            else {
                overDom.style["borderBottom"] = "1px solid white";
                overDom.style["borderTop"] = "1px solid rgba(0,0,0,0.8)";
                overDom.style["background"] = "white"
                this.drag.dragWay = 0; //上面
            }
        }
    }

    dragTreeEnd() {
        let lastOverDom = document.getElementById(this.drag.overNode);
        lastOverDom.style["borderBottom"] = "1px solid white";
        lastOverDom.style["borderTop"] = "1px solid white";
        lastOverDom.style["background"] = "white";

        //数据结构修改相关代码
        let start = this.drag.startNode.split("_");
        start.shift();
        let over = this.drag.overNode.split("_");
        over.shift();

        let startNode = this.tree;
        for(let i=0;i<start.length-1;i++) {
            startNode = startNode[start[i]].children;
        }        
        startNode = startNode.splice(start[start.length-1],1); //把需要移动节点切出来

        let overNode = this.tree;
        for(let i=0;i<over.length-1;i++) {
            overNode = overNode[over[i]].children;
        }

        switch(this.drag.dragWay) {
            case 0:
                overNode.splice(over[over.length-1],0,startNode[0]);
                break;
            case 1:
                overNode[over[over.length-1]].children.push(startNode[0]);
                break;
            case 2:
                overNode.splice(over[over.length-1]+1,0,startNode[0]);
                break;
            default:
                break;
        }

        this.clearCheck();
        this.refreshTree();
    }
}

module.exports = {Tree};
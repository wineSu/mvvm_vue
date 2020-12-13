import Watcher from './watcher'

class Compile{
    constructor(el, vm){
        this.vm = vm;
        this.el = document.querySelector(el);
        this.fragment = null;
        this.init();
    }
    init() {
        if (this.el) {
            this.fragment = this.nodeToFragment(this.el);
            //操作内存中的dom
            this.compileElement(this.fragment);
            this.el.appendChild(this.fragment);
        } else {
            console.log('Dom元素不存在');
        }
    }
    nodeToFragment(el) {
        var fragment = document.createDocumentFragment();
        var child = el.firstChild;

        while (child) {
            // 将Dom元素移入fragment中
            fragment.appendChild(child);
            child = el.firstChild
        }
        return fragment;
    }
    compileElement(el) {
        var childNodes = el.childNodes;
        [].slice.call(childNodes).forEach(node => {
            var reg = /\{\{(.*)\}\}/;
            var text = node.textContent;
            if (this.isElementNode(node)) {
                //用户编写的dom节点 排除浏览器解析后自带的text节点
                this.compile(node);
            } else if (this.isTextNode(node) && reg.test(text)) {
                //{{title}}  节点中的内容
                this.compileText(node, reg.exec(text)[1]);
            }
            //递归子节点
            if (node.childNodes && node.childNodes.length) {
                this.compileElement(node);
            }
        });
    }
    compile(node) {
        var nodeAttrs = node.attributes;
        var self = this;
        Array.prototype.forEach.call(nodeAttrs, (attr) => {
            var attrName = attr.name;
            //  v- 属性
            if (self.isDirective(attrName)) {
                //v-model="title"中的title   这个会传给watcher
                var exp = attr.value;
                var dir = attrName.substring(2);
                if (self.isEventDirective(dir)) {  // 事件指令
                    self.compileEvent(node, self.vm, exp, dir);
                } else {  // v-model 指令
                    self.compileModel(node, self.vm, exp, dir);
                }
                //移除
                node.removeAttribute(attrName);
            }
        });
    }
    compileText(node, exp) {
        var self = this;
        var initText = this.vm[exp];
        //首先赋值为初始定义的值
        this.updateText(node, initText);
        //监听 数据修改   同时dom更新渲染
        new Watcher(this.vm, exp, function (value) {
            self.updateText(node, value);
        });
    }
    compileEvent(node, vm, exp, dir) {
        //事件绑定
        var eventType = dir.split(':')[1];
        var cb = vm.methods && vm.methods[exp];

        if (eventType && cb) {
            node.addEventListener(eventType, cb.bind(vm), false);
        }
    }
    compileModel(node, vm, exp, dir) {
        var self = this;
        var val = this.vm[exp];
        //初始输入框赋值
        this.modelUpdater(node, val);
        //添加监听
        new Watcher(this.vm, exp, function (value) {
            self.modelUpdater(node, value);
        });

        node.addEventListener('input', function(e) {
            var newValue = e.target.value;
            if (val === newValue) {
                return;
            }
            self.vm[exp] = newValue;
            val = newValue;
        });
    }
    updateText(node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    }
    modelUpdater(node, value, oldValue) {
        node.value = typeof value == 'undefined' ? '' : value;
    }
    isDirective(attr) {
        return attr.indexOf('v-') == 0;
    }
    isEventDirective(dir) {
        return dir.indexOf('on:') === 0;
    }
    isElementNode(node) {
        return node.nodeType == 1;
    }
    isTextNode(node) {
        return node.nodeType == 3;
    }
}
export default Compile;
import Compile from './compile';
import {observe} from './observer';

function MVVM(options){
    this.data = options.data;
    this.methods = options.methods;

    //注册监视  this.title = '...'操作
    Object.keys(this.data).forEach(item => {
        this.proxyKeys(item)
    })

    //this.title修改数据后  添加监听器触发
    observe(this.data)

    //模板解析
    new Compile(options.el, this)
}

MVVM.prototype = {
    proxyKeys: function(key){
        Object.defineProperty(this, key, {
            enumerable: false,
            configurable: true,
            get(){
                return this.data[key]
            },
            set(newVal){
                this.data[key] = newVal
            }
        })
    }
}
export default MVVM;
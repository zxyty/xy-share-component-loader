## 说明

安装：
```shell
npm i xy-share-component-loader
```

使用：
* 在`.babelrc.js`等babel配置文件中添加如下配置：

```js
const plugins = [
    ...
    "module:xy-share-component-loader/lib/index.js"
]

module.exports = {
  plugins
};
```

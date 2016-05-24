# 云引擎常见问题和解答

## 如何判断当前是预备环境还是生产环境？

请参考文档 [云引擎开发指南 Node.js](leanengine_webhosting_guide-node.html#预备环境和生产环境) / [Python](/leanengine_guide-python.html#运行环境区分) - 运行环境区分。

## 怎么添加第三方模块

云引擎 2.0 开始支持添加第三方模块（请参考 [云引擎指南 - 升级到 2.0](leanengine_guide-cloudcode.html#云引擎_2_0_版)），只需要像普通的 Node.js 项目那样，在项目根目录创建文件 `package.json`，下面是一个范例：

``` 
{
  "name": "cloud-engine-test",
  "description": "Cloud Engine test project.",
  "version": "0.0.1",
  "private": true,
  "dependencies": {
    "async": "0.9.0",
    "moment": "2.9.0"
  }
}
```

`dependencies` 内的内容表明了该项目依赖的三方模块（比如示例中的 `async` 和 `moment`）。

然后在项目根目录执行：

``` 
npm install
```

即可下载相关三方包到 `node_modules` 目录。

然后即可在代码中引入三方包：

``` 
var async = require('async');
```

**注意**：命令行工具部署时是不会上传 `node_modules` 目录，因为云引擎服务器会根据 `package.json` 的内容自动下载三方包。所以也建议将 `node_modules` 目录添加到 `.gitignore` 中，使其不加入版本控制。

## Maximum call stack size exceeded 如何解决？

`AV.Object.extend` 产生的对象需要作为全局变量保存（即定义在 AV.Cloud.define 方法之外）。因为每调用一次，就会产生一个新的类的实例，并且和之前创建的实例形成一个链表。调用次数过多后（几万次）就会堆栈溢出。如果你的应用时不时出现 **Maximum call stack size exceeded** 错误，请确认是否误用了 `AV.Object.extend` 方法。

我们在 [JavaScript 指南 - AV.Object](./js_guide.html#AV_Object) 章节中也进行了描述。

## 目前支持哪些语言？

我们提供了 JavaScript SDK，支持 Node.js 和 Python 环境，未来可能会引入 PHP 等其他语言。

## Web Hosting 备案如何操作？

只有网站类的才需要备案，并且在主域名已备案的情况下，二级子域名不需要备案。 如果主站需要托管在我们这边，且还没有备案过，我们可以协助你完成备案，请参考文档 [绑定独立域名 Node.js](leanengine_webhosting_guide-node.html#绑定独立域名) / [Python](leanengine_guide-python.html#绑定独立域名)。

## 调用云引擎方法如何收费？

云引擎中如果有 LeanCloud 的存储等 API 调用，按 [API 收费策略](faq.html#API_调用次数的计算) 收费。另外如果使用的是云引擎专业版，该服务也会产生使用费，具体请参考 [云引擎运行方案](leanengine_plan.html#价格)。

## 「定义函数」和「Git 部署」可以混用吗？

「定于函数」的产生是为了方便大家初次体验云引擎，或者只是需要一些简单 hook 方法的应用使用。我们的实现方式就是把定义的函数拼接起来，生成一个云引擎项目然后部署。

所以可以认为「定义函数」和 「git 部署」最终是一样的，都是一个完整的项目。

是一个单独功能，可以不用使用基础包，git 等工具快速的生成和编辑云引擎。

当然，你也可以使用基础包，自己写代码并部署项目。

这两条路是分开的，任何一个部署，就会导致另一种方式失效掉。

## 为什么查询 include 没有生效？

以 JavaScript 云引擎为例子，很多时候，经常会定义一个云函数，在里面使用 `AV.Query` 查询一张表，并 include 其中一个 pointer 类型的字段，然后返回给客户端:

``` javascript
AV.Cloud.define('querySomething', function(req, res) {
  var query = new AV.Query('Something');
  //假设 user 是 Something 表的一个 Pointer 列。
  query.include('user');
  //……其他条件或者逻辑……
  query.find().then(function(results) {
    //返回查询结果给客户端
    res.success(results);
  }).catch(function(err){
    //返回错误给客户端
  });
});
```

你会看到返回的结果里， user 仍然是 pointer 类型，似乎 include 没有生效？

``` json
{
 result: [
   {
     ……Something 其他字段
     "user": {
       "className": "_User",
       "__type": "Pointer",
       "objectId": "abcdefg"
     }
   }
   ……
 ]
}
```

这其实是因为 `res.success(results)` 会调用到 `AV.Object#toJSON` 方法，将结果序列化为 JSON 对象返回给客户端。

而 `AV.Object#toJSON` 方法为了防止循环引用，当遇到属性是 Pointer 类型会返回 pointer 元信息，不会将 include 的其他字段添加进去。

因此，你需要主动将该字段进行 JSON 序列化，例如：

``` javascript
 query.find().then(function(results) {
    //主动序列化 json 列。
    results.forEach(function(result){
      result.set('user', result.get('user') ?  result.get('user').toJSON() : null);
    });
    //再返回结果
    res.success(results);
  }).catch(function(err){
    //返回错误给客户端
  });
```

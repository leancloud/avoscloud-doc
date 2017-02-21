{% extends "./sdk_setup.tmpl" %}
{% set platform_name = "JavaScript" %}

{% block libs_tool_automatic %}

#### npm 安装

LeanCloud JavaScript SDK 也可在 Node.js 等服务器端环境运行，可以使用 [云引擎](leanengine_overview.html) 来搭建服务器端。

```
# 存储服务（包括推送和统计）
$ npm install leancloud-storage --save
# 实时消息服务
$ npm install leancloud-realtime --save
```

如果因为网络原因，无法通过官方的 npm 站点下载，推荐可以通过 taobao 镜像来下载，操作步骤如下：

```
# 存储服务（包括推送和统计）
$ npm install leancloud-storage --save --registry=https://registry.npm.taobao.org
# 实时消息服务
$ npm install leancloud-realtime --save --registry=https://registry.npm.taobao.org
```

#### CDN 加速

```html
<!-- 存储服务 -->
<script src="//cdn1.lncld.net/static/js/{{jssdkversion}}/av-min.js"></script>
```

#### Github 仓库地址

可以直接通过 Github 仓库使用，也可以通过 Github 给我们提出您的建议

- ** 存储服务 leancloud-storage ** Github 仓库地址：[https://github.com/leancloud/javascript-sdk](https://github.com/leancloud/javascript-sdk)
- ** 实时通讯 leancloud-realtime ** Github 仓库地址：[https://github.com/leancloud/js-realtime-sdk](https://github.com/leancloud/js-realtime-sdk)

### ES6 与 ES7 支持

随着 ECMAScript 6 标准的确定（也被称为 ES2015），以及 ECMAScript 7 新草案的不断发布，越来越多人已经开始尝试使用这些新语法来写自己的 JavaScript 程序。如果现阶段打算使用 ES6 直接来写浏览器端程序可能仍然会遇到兼容性问题，更多的是在 Nodejs 环境或通过编译的方式来实现兼容。

目前比较流行的方案是通过 [Babel](http://babeljs.io/) 来实现预编译或构建一个拥有新特性的运行时环境。在所有环境中，都可以通过 babel 将代码编译为相应环境能够支持的代码版本，或者直接编译为 ES5 版本的 JavaScript 代码。在 Nodejs 环境中，可以通过使用 `require hook` 的方式直接载入一个拥有 babel 兼容代码的运行时环境，这样就不需再编译即可在 Nodejs 中直接使用 ES6\ES7，具体配置过程参考 babel 文档。

ES7 中有许多很不错的新语法，其中一个就是 `async/await`。对于异步程序，JavaScript 中一直没有非常优雅的方式去书写，从 callback 到 Promise，目前可以通过 babel 尝试使用 async/await。详情参考 [blog](https://blog.leancloud.cn/3910/)

### TypeScript 支持

当使用 npm 安装时，LeanCloud 的 JavaScript SDK 均附带了 `d.ts` 定义文件。

注意，TypeScript 针对异步函数有多种写法，本文以 [Promise](#Promise) 作为默认的示例代码书写方式，仅供参考。
[Promise](#Promise) 以及 TypeScript 中的 [async/await](https://blogs.msdn.microsoft.com/typescript/2015/11/03/what-about-asyncawait/) 的不同写法的支持取决于在 TypeScript 项目中的 `tsconfig.json` 的 `compilerOptions` 配置里面选择 `target` 是什么版本，例如，要支持 [async/await](https://blogs.msdn.microsoft.com/typescript/2015/11/03/what-about-asyncawait/) 需要进行如下配置：

```json
{
  ...
  "compilerOptions": {
    ...
    "target": "es6",
    "module": "commonjs",
    ...
  },
  ...
}
```

{% endblock %}

{% block init_with_app_keys %}
如果是在前端项目里面使用 LeanCloud JavaScript SDK，那么可以在页面加载的时候调用一下初始化的函数：

```javascript
var APP_ID = '{{appid}}';
var APP_KEY = '{{appkey}}';
AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});
```
```es7
const appId = '{{appid}}';
const appKey = '{{appkey}}';
AV.init({ appId, appKey });
```

{% endblock %}

{% block sdk_switching_node %}
```javascript
var APP_ID = '{{appid}}';
var APP_KEY = '{{appkey}}';
AV.init({
  appId: APP_ID,
  appKey: APP_KEY,
  {% if node != 'qcloud' %}
  // 启用美国节点
  region: 'us'
  {% else %}
  // 目前仅支持中国节点
  region: 'cn'
  {% endif %}
  
});
```
```es7
const appId = '{{appid}}';
const appKey = '{{appkey}}';
AV.init({
  appId,
  appKey,
  // 启用美国节点
  region: 'us',
});
```
{% endblock %}


{% block save_a_hello_world %}
```javascript
var TestObject = AV.Object.extend('TestObject');
var testObject = new TestObject();
testObject.save({
  words: 'Hello World!'
}).then(function(object) {
  alert('LeanCloud Rocks!');
})
```
```es7
const TestObject = AV.Object.extend('TestObject');
const testObject = new TestObject();
await testObject.save({ words: 'Hello World!' });
alert('LeanCloud Rocks!');
```
{% endblock %}

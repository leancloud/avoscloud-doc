把下面这行代码加入你的测试页面中：


```
<script src="https://cdn1.lncld.net/static/js/av-mini-{{sdkversion.javascript}}.js"></script>
```

进行代码初始化，加入这行代码后，就可以创建 class 或任何其他操作了。想要跟进最新功能，可以到官方的 [GitHub Repo](https://github.com/leancloud/javascript-sdk) 。

```
AV.initialize('{{appid}}', '{{appkey}}');
// 初始化 param1：应用 id、param2：应用 key
```

SDK 的初始化方法默认使用中国大陆节点，切换到其他可用节点的方法是：

```
// 初始化 param1：应用 id、param2：应用 key
AV.initialize('{{appid}}', '{{appkey}}');
// 启用美国节点
AV.useAVCloudUS();
```

创建应用后，可以在 `控制台 - 应用设置` 里面找到应用对应的 id 和 key。

开始测试。初始化后加入下面代码：

```
var TestObject = AV.Object.extend('TestObject');
var testObject = new TestObject();
testObject.save({
  testabc: 'abc123'
}).then(function() {
  alert('LeanCloud works!');
}).catch(function(err) {
  alert('error:' + err);
});
```

大功告成，访问 `控制台 - 数据管理` 可以看到上面创建的 TestObject 的相关数据。

如果你希望在 [Node.js](http://nodejs.org/) 环境使用 JavaScript SDK 也可以，使用 npm 安装 SDK：

```
npm install avoscloud-sdk --save
```

然后代码中使用 SDK：

```
var AV = require('avoscloud-sdk');
AV.initialize('{{appid}}', '{{appkey}}');
```

LeanCloud 同时也提供了一个完整的 Nodejs 环境，我们称之为 LeanEngine，更推荐基于 LeanEngine 来实现并部署 Nodejs 相关的代码。详细请参考[云引擎文档](/docs/leanengine_overview.html) 。


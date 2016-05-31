{% extends "./sdk_setup.tmpl" %}

{% block language %}JavaScript{% endblock %} 

{% block libs_tool_automatic %}
#### npm 安装

LeanCloud JavaScript SDK 也可在 Node.js 等服务器端环境运行，可以使用 [云引擎](leanengine_overview.html) 来搭建服务器端。

```
# 存储服务
$ npm install avoscloud-sdk --save
# 实时消息服务
$ npm install leancloud-realtime --save
```
如果因为网络原因，无法通过官方的 npm 站点下载，推荐可以通过 [CNPM](https://cnpmjs.org/) 来下载，操作步骤如下：

首先，在本地安装 cnpm 工具，执行如下命令：

```
$ npm install -g cnpm --registry=http://r.cnpmjs.org
```

然后执行：

```
# 存储服务
$ cnpm install avoscloud-sdk --save
# 实时消息服务
$ cnpm install leancloud-realtime --save
```

#### bower 安装

```
$ bower install leancloud-javascript-sdk --save
```

#### CDN 加速

```html
<script src="https://cdn1.lncld.net/static/js/av-mini-<版本号>.js"></script>
<!-- 如果只用存储、推送等最核心的功能，可以使用精简版的 core.js -->
<script src="https://cdn1.lncld.net/static/js/av-core-mini-<版本号>.js"></script>
```

### TypeScript SDK 安装
#### 通过 typings 工具安装

首先需要安装 [typings 命令行工具](https://www.npmjs.com/package/typings)

```sh
npm install typings --global
```

然后再执行如下命令即可：

```sh
typings install leancloud-jssdk --save
```


#### 直接引用 d.ts 文件
TypeScript 使用 JavaScript SDK 是通过定义文件来实现调用的，因此我们也将定义文件开源在 GitHub 上，地址是：
[typed-leancloud-jssdk](https://github.com/leancloud/typed-leancloud-jssdk)


#### Web 安全

如果在前端使用 JavaScript SDK，当你打算正式发布的时候，请务必配置 **Web 安全域名**。配置方式为：进入 [控制台 / 设置 / 安全中心 / **Web 安全域名**](/app.html?appid={{appid}}#/security)。这样就可以防止其他人，通过外网其他地址盗用你的服务器资源。

具体安全相关内容可以仔细阅读文档 [数据和安全](data_security.html) 。
{% endblock %}

{% block import_sdk %}
LeanCloud JavaScript SDK 是分模块使用的，可根据下列表格对应选择所需要的模块：

```
├── av-core-mini.js      // LeanCloud 核心框架（压缩版，建议用于生产环境）
├── av-core.js           // LeanCloud 核心框架（未压缩版）
├── av-mini.js           // LeanCloud 接口框架（压缩版）
├── av.js                // LeanCloud 接口框架（未压缩版）
├── AV.push.min.js       // LeanCloud 推送模块（压缩版）
├── AV.push.js           // LeanCloud 推送模板（未压缩版）
├── AV.realtime.min.js   // LeanCloud 实时消息模块（压缩版）
└── AV.realtime.js       // LeanCloud 实时消息模块（未压缩版）
```

**使用存储服务的时候，`av.js(min)` 和 `av-core.js(min)`  必须一起引用。**

聊天和推送各自可以独立引用。

{% endblock %}

{% block init_with_app_keys %}
如果是在前端项目里面使用 LeanCloud JavaScript SDK，那么可以在页面加载的时候调用一下初始化的函数：

```javascript
//参数依次为 AppId, AppKey
AV.initialize('{{appid}}', '{{appkey}}');
```

{% endblock %}

{% block sdk_switching_node %}
```javascript
//参数依次为 AppId, AppKey
AV.initialize('{{appid}}', '{{appkey}}');
// 启用美国节点
AV.useAVCloudUS();
```
{% endblock %}


{% block save_a_hello_world %}
```
var TestObject = AV.Object.extend('TestObject');
var testObject = new TestObject();
testObject.save({
  words: 'Hello World!'
}, {
  success: function(object) {
    alert('LeanCloud Rocks!');
  }
});
```
{% endblock %}

{% extends "./realtime_guide.tmpl" %}

{% block language %}JavaScript{% endblock%}


#  实时通信 SDK

## 简介

感谢你使用 JavaScript 的实时通信 SDK，LeanCloud 的实时通信服务每天处理请求数超过百万级，安全可靠，你的明智之选。

你可以通过使用我们提供的 SDK，一行后端代码都不用写，就可以做一个功能完备的实时聊天应用、也可以做一个实时对战类的游戏，总之一切与实时通信相关的业务都可以使用 LeanCloud 提供的实时通信服务。

你还可以通过实时通信 SDK 配合「[云代码](https://leancloud.cn/docs/cloud_code_guide.html)」简单的实现之前可能需要很多人才能完成的实时通信相关需求的开发，并且如果你达到我们的收费额度，也会以极低的成本支付你的使用费用，成本远远小于同等规模自建实时通信服务。

## 兼容性

本 SDK 实现轻量、高效、无依赖。支持移动终端的浏览器及各种 WebView，包括可以使用在微信、PhoneGap、Cordova 的 WebView 中。 
同时 SDK 提供插件化的、无痛兼容 IE8+ 老版本 IE 浏览器的方式，具体请看下面「[兼容 IE8+](#兼容_IE8_)」部分的说明，默认不兼容且性能最佳。

## Demo

在开始一切之前，你可以尝试一下「[简单聊天 Demo](http://leancloud.github.io/js-realtime-sdk/demo/demo2/)」，也可以直接查看它的[源码](https://github.com/leancloud/js-realtime-sdk/tree/master/demo/demo2)，还有热心用户提供的简单实时对战游戏 [Demo](http://cutpage.sinaapp.com/)。

## 概念

在你开始使用之前，首先来了解一下实时通信 SDK 的基本结构。实时通信在 SDK 里面分为两个层次：

* 一层是底层实时通信基础模块，负责与服务器匹配和授权，建立基础的连接和底层控制。这个层次只会派发一些基础的事件出来，你可以通过 SDK 监听这些事件。这个层面 SDK 会保证底层连接的稳定，包括断开重试，心跳连接等策略；

* 另一层是业务逻辑层，用户可以使用 SDK 建立不同的 Conversation（对话）。一个 Conversation 就是一个独立的通信单元，但 Conversation 间一般是无法通信的。当然你可以自己在业务逻辑层，通过派发自定义事件的方式来封装其他自定义的逻辑。当创建一个新 Conversation 之后，对应的服务器端就会自动生成这个 Conversation，除非你自行删除，否则该 Conversation 一直存在。但是用户如果没有连接，该房间不会占用服务器资源，只是存储的一个数据条目；

如果想了解实时通信的整体概念，请阅读「[实时通信开发指南](https://leancloud.cn/docs/realtime_v2.html)」。另外，我们也提供「[实时通信 REST API](https://leancloud.cn/docs/realtime_rest_api.html)」。

## 特别说明

Conversation（对话）这个概念有些人更喜欢叫做 Room（房间），就是几个客户端节点在通信之前要放到同一个房间中，其实这两个是一个道理，只是名字不同，SDK 中为了让大家好理解，两个名字都可以使用。如果你觉得更喜欢 Room 这个概念，那就可以使用 room 方法创建 Room，如果喜欢 Conversation，那就使用 conv 方法创建 Conversation。

也许说到这里你已经跃跃欲试了，好的，那你可以试用一下看看了。

注：如果还不是很了解 LeanCloud 的使用方式，建议先从「[快速入门](https://leancloud.cn/start.html)」开始尝试。

## Github 仓库地址

可以直接通过 Github 仓库使用 SDK（src 目录中），也可以通过 Github 给我们提出您的建议

Github 仓库地址：[https://github.com/leancloud/js-realtime-sdk](https://github.com/leancloud/js-realtime-sdk)

所有的 Release 地址：[https://github.com/leancloud/js-realtime-sdk/releases](https://github.com/leancloud/js-realtime-sdk/releases)

## 通过 bower 安装

运行命令：
```
bower install leancloud-realtime -- save
```
安装之后，页面直接加载 bower_components/leancloud-realtime/src/AV.realtime.js 即可。

[什么是 bower ?](http://bower.io/)

## 文档贡献

如果觉得这个文档写的不够好，也可以帮助我们来不断完善。

Github 仓库地址：[https://github.com/leancloud/docs](https://github.com/leancloud/docs)

##示例代码

如果您觉得一点点阅读文档较慢，可以直接看我们的「[Demo 代码](https://github.com/leancloud/js-realtime-sdk/tree/master/demo)」，并且下载自己运行一下试试看，Demo 代码可以通过开两个浏览器标签的方式来模拟两个用户的互相通信，代码中也有详细的注释方便你来了解使用方法。

```javascript
// 最简的示例代码，请换成自己的 appId，可以通过浏览器多个标签模拟多用户通信
var appId = '{{appid}}';
// clientId 就是实时通信中的唯一用户 id
var clientId = 'LeanCloud01';
var realtimeObj;
var conversationObj;

// 创建实时通信实例（支持单页多实例）
realtimeObj = AV.realtime({
    appId: appId,
    clientId: clientId,
    // 是否开启 HTML 转义，SDK 层面开启防御 XSS
    encodeHTML: true,
    // 是否开启服务器端认证
    // auth: authFun
});

// 当前 SDK 版本
console.log('当前 SDK 版本是 ' + AV.realtime.version);

// 实时通信服务连接成功
realtimeObj.on('open', function() {
    console.log('实时通信服务建立成功！');

    // 创建一个聊天室，conv 是 conversation 的缩写，也可以用 room 方法替换
    conversationObj = realtimeObj.conv({
        // 人员的 id
        members: [
            'LeanCloud02'
        ],
        // 默认名字
        name: 'LeanCloud-Room',
        // 默认的属性，可以放 Conversation 的一些初始值等
        attr: {
            test: 'testTitle'
        }
    }, function(data) {
        if (data) {
            console.log('Conversation 创建成功!', data);
        }
    });
});

// 当聊天断开时触发
realtimeObj.on('close', function() {
    console.log('实时通信服务被断开！');
});

// 接收断线或者网络状况不佳的事件（断网可测试）
realtimeObj.on('reuse', function() {
    console.log('正在重新连接。。。');
});

// 当 Conversation 被创建时触发，当然您可以使用回调函数来处理，不一定要监听这个事件
realtimeObj.on('create', function(data) {

    // 向这个 Conversation 添加新的用户
    conversationObj.add([
        'LeanCloud03', 'LeanCloud04'
    ], function(data) {
        console.log('成功添加用户：', data);
    });

    // 从这个 Conversation 中删除用户
    conversationObj.remove('LeanCloud03', function(data) {
        console.log('成功删除用户：', data);
    });

    // 向这个 Conversation 中发送消息
    conversationObj.send({
        abc: 123
    }, function(data) {
        console.log('发送的消息服务端已收收到：', data);
    });

    setTimeout(function() {
        // 查看历史消息
        conversationObj.log(function(data) {
            console.log('查看当前 Conversation 最近的聊天记录：', data);
        });
    }, 2000);

    // 当前 Conversation 接收到消息
    conversationObj.receive(function(data) {
        console.log('当前 Conversation 收到消息：', data);
    });

    // 获取当前 Conversation 中的成员信息
    conversationObj.list(function(data) {
        console.log('列出当前 Conversation 的成员列表：', data);
    });

    // 取得当前 Conversation 中的人数
    conversationObj.count(function(num) {
        console.log('取得当前的用户数量：' + num);
    });
});

// 监听所有用户加入的情况
realtimeObj.on('join', function(data) {
    console.log('有用户加入某个当前用户在的 Conversation：', data);
});

// 监听所有用户离开的情况
realtimeObj.on('left', function(data) {
    console.log('有用户离开某个当前用户在的 Conversation：', data);
});

// 监听所有 Conversation 中发送的消息
realtimeObj.on('message', function(data) {
    console.log('某个当前用户在的 Conversation 接收到消息：', data);
});
```

如果 A 创建了一个包含 B 的 Conversation ，并向其发送消息。
那么，B 可以通过 on 方法监听 message 事件获取此消息（可以是离线消息），即使 B 尚未主动加入该 Conversation 。
message 事件是接收消息最底层的实现，所以即使你通过 conversationObj.receive 监听了该消息，依然会触发 message 事件。
message 事件回调函数传入参数中的 cid 字段，即是该 Conversation 的 id 。
通过此 id 即可创建同样的 Conversation ，然后对其回复。

## 安全

### 安全域名

如果是纯前端使用 JavaScript SDK，请务必配置「控制台」-「设置」-「基本信息」-「JavaScript 安全域名」，防止其他人盗用你的服务器资源。实时通信的安全域名设置会有三分钟的延迟，所以设置完毕后，请耐心等待下。

详细请看「[数据和安全](https://leancloud.cn/docs/data_security.html)」指南中的「Web 安全域名」部分。

### 权限和认证

为了满足开发者对权限和认证的需求，我们设计了签名的概念。

详细请看「[实时通信开发指南](https://leancloud.cn/docs/realtime_v2.html)」中的 「权限和认证」部分。

### 防御 XSS

Web 端实现任何可以将用户输入直接输出到界面上的应用都要注意防止产生 XSS（跨站脚本攻击），实时通信 SDK 支持在 SDK 层面开启这个防御，但是我们默认不开启，所以你可以在实例化 realtimeObject 的时候，开启这个选项。

注意：我们没有对 clientId 做任何过滤，也不建议直接输出 clientId，如果你要输出 clientId 到 Web 页面中，记得要自己手工做 HTML 转义，防止 XSS。

```javascript
// 创建实时通信实例（支持单页多实例）
var appId = '{{appid}}';
realtimeObj = AV.realtime({
    appId: appId,
    clientId: clientId,
    // 是否开启 HTML 转义，SDK 层面开启防御 XSS
    encodeHTML: true,
    // 是否开启服务器端认证
    // auth: authFun
});
```

## 与 iOS、Android 等 SDK 通信

JavaScript 实时通信 SDK 可以与其他类型 SDK 通信。当你不仅仅只是基于 Web 来实现一个实时通信程序，也想通过使用 LeanCloud 提供的其他类型（iOS、Android、Windows Phone等）的 SDK 实现多端互通，就需要在发送数据时使用媒体类型配置项，具体要到 [roomObject.send](#RoomObject_send) 方法中详细了解。

Web 端本身无论处理什么类型的数据，浏览器都可以自动解析并渲染，比如图片，只需要一个 img 标签。但是其他终端就不行，比如 iOS，所以你需要告知其他终端你发送的是什么类型的消息，这样其他客户端接收到之后会有相应的渲染处理方式，详情请看相应 SDK 的文档。目前支持：text（文本）、image（图片）、audio（声音）、video（视频）、location（地理位置）、file（各种类型文件）等类型。 

## 兼容

### 兼容 IE8+ 

JavaScript 实时通信 SDK 设计时目标是面向未来、全面支持移动端、灵活高效，所以考虑主要实现轻量、提升性能、减少流量等特性（所以都没有默认支持 Promise），但是因为国内目前浏览器市场中仍然有很大量的 IE8+ 浏览器，所以我们提供一种非常轻量的插件方式来兼容 IE8+。

当你通过 Bower 或者 Github 下载 SDK，会有一个 plugin 目录，其中就是兼容 IE8+ 所需要用到的插件。主要实现原理就是通过 Flash 的 Socket 实现 WebSocket 协议通信，然后 JavaScript 包装下 window.WebSocket，再通过 Flash 与 JavaScript 通信完成对 SDK 的兼容。我们的 Demo 中是兼容 IE8+ 的，也可以参考代码。

**具体兼容方式：**

1、在页面中加入以下代码，路径改为你自己的路径

```html
<!-- 引入插件，兼容低 IE8+ 等低版本浏览器，注意看下面的注释。如果不需要兼容，可以去掉这部分。 -->
<!--[if lt IE 10]>
<script type="text/javascript" src="../../plugin/web-socket-js/swfobject.js"></script>
<script type="text/javascript" src="../../plugin/web-socket-js/web_socket.js"></script>
<script type="text/javascript">
// 设置变量，配置插件中 WebSocketMain.swf 的引用路径
WEB_SOCKET_SWF_LOCATION = "../../plugin/web-socket-js/WebSocketMain.swf";
</script>
<![endif]-->
<!-- 引入插件部分结束 -->

<!-- 引入 LeanCloud 实时通信 SDK -->
<script src="../../src/AV.realtime.js"></script>
```

2、IE8+ 等老版本浏览器中 JavaScript 的问题，要小心

* 要注意不能有 console.log，否则在不开启调试器的情况下 IE8 脚本会停在那个位置却不报错
* IE8 中的 JSON.stringify 会把中文转为 unicode 编码
* IE8 中支持 CORS 跨域请求，不需要使用 jsonp 来 hack，而是用 XDomainRequest 发 request，不过注意这个 request 成功回来没有 response.status

### 其他兼容问题

如果要想在 Android WebView 中使用，请务必开启 WebSocket 支持。另外根据用户反馈，在部分 Android 机型的 WebView 中不支持 WebSocket 的安全链接，所以需要从 wss 协议转为 ws 协议，关闭 WebSocket 的 SSL，RealtimeObject 在初始化时提供 secure 选项可以关闭，详细使用方式请看 [AV.realtime](#AV_realtime) 方法。

## 暂态对话

标准的 Conversation（对话） 每个最多只能支持 500 个 client，假如想要创建一个有非常大量的用户的聊天室，可以使用方法来创建一个「暂态对话」（或者也叫开放聊天室）。但是这种方式创建的 Conversation 不支持消息历史等方法，具体请了解[文档](https://leancloud.cn/docs/realtime_v2.html#暂态对话_transient_conversation_)。

具体如何创建，请看下面实例化一个 Conversation 的方法 [RealtimeObject.conv](#RealtimeObject.conv)

## 方法列表

### 全局命名空间

LeanCloud JavaScript 相关 SDK 都会使用「AV」作为命名空间。

### AV.realtime

使用:
```javascript
AV.realtime(options, callback)
```

描述：

* 这是创建实时通信对象的方法，会启动实时通信的连接。自动调用 open 方法，内部与服务器匹配，并建立 WebSocket 连接。内部会自动维持与服务器的链接稳定，控制心跳数据包的频率，超时检测等，如果发生中断可以通过监听对应的事件来给用户界面上的变化提示。

* 另外，此方法支持多实例，也就是说，你可以在一个页面中，创建多个 RealtimeObject 来实现聊天。

参数：

* options {Object} （必须） 配置实时通信服务所需的必要参数。其中包括：

    * appId {String} （必须）应用的 AppId，在「控制台」-「设置」-「基本信息」中可以查看；

    * clientId {String} （必须）当前客户端的唯一 id，用来标示当前客户端；

    * encodeHTML {Boolean} （可选）是否开启 HTML 转义，在 SDK 层面直接防御 XSS（跨站脚本攻击），该选项默认不开启；true 为开启，false 为关闭。

    * authFun {Function}（可选）可以传入权限认证的方法，每次当建立连接的时候就会去服务器请求认证，或者许可之后才能建立连接，详细阅读「[权限和认证](https://leancloud.cn/docs/realtime.html#权限和认证)」相关文档，也可以参考 [demo](https://github.com/leancloud/js-realtime-sdk/tree/master/demo) 中的示例；

    * secure {Boolean}（可选）是否关闭 WebSocket 的安全链接，即由 wss 协议转为 ws 协议，关闭 SSL 保护，默认开启。true 为开启，false 为关闭。

返回：

* {Object} 返回 RealtimeObject（实时通信对象），其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appid,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId,
   // 是否开启 HTML 转义，SDK 层面开启防御 XSS
   encodeHTML: true,
   // auth 是权限校验的方法函数
   // auth: authFun,
   // 是否关闭 WebSocket 的安全链接，即由 wss 协议转为 ws 协议，关闭 SSL 保护
   secure: true
}, function() {
   console.log('与服务器连接成功！');
});

// 监听 open 事件会得到同样的效果
realtimeObject.on('open', function() {
   console.log('与服务器连接成功！');
});
```

### AV.realtime.version

用法：
```javascript
AV.realtime.version
```

描述：

* 获取当前 SDK 的版本信息

返回：

* {String} 返回当前版本

例子：

```javascript
// 返回版本号
console.log('当前版本是：' + AV.realtime.version);   
```

### RealtimeObject.open

用法：
```javascript
RealtimeObject.open(callback)
```

描述：

* 该方法一般情况下，你不需要调用，SDK 会自动启动与服务的连接。该方法可以启动实时通信的连接，与服务器匹配建立 websocket 连接；

参数：

* callback {Function}（可选）创建成功并且与服务器建立连接后触发的回调，此时也会派发一个私有的事件「open」到 RealtimeObject 内部，也可以通过监听当前的 RealtimeObject 实例的 open 事件来处理连接成功的业务逻辑；

返回：

* {Object} 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 真正使用时这里也无需调用，实例化 RealtimeObject 的时候 SDK 会自动调用 open 方法
realtimeObject.open(function() {
   // 与服务器连接成功
   console.log('open');
});

realtimeObject.on('open', function() {
   console.log('open,too.');
});
```

### RealtimeObject.close

用法：
```javascript
RealtimeObject.close()
```

描述：

* 关闭实时通信的连接，并且内部会关闭 websocket 连接。该方法没有回调，因为调用会立刻关闭 WebSocket。

返回：

* {Object} 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

realtimeObject.close();

realtimeObject.on('close', function() {
   console.log('与服务器已经断开！');
});
```

### RealtimeObject.on

用法：
```javascript
RealtimeObject.on(eventName, callback)
```

描述：

* 监听 RealtimeObject 内部的事件，基于一个局部的事件中心，事件每次派发就会被触发一次；

参数：

* eventName {String} （必须）监听的事件名称

* callback {Function} （必须）当事件被派发时会调用的回调

返回：

* {Object} 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 当新建一个 Room 的时候就会触发
realtimeObject.on('create', function(data) {
   console.log(data);
});

// 有人加入 Room 的时候会被触发
realtimeObject.on('join', function(data) {
   console.log(data);
});
```

### RealtimeObject.once

用法：
```javascript
RealtimeObject.once(eventName, callback)
```

描述：

* 监听 RealtimeObject 内部的事件，基于一个局部的事件中心，事件只会被触发一次；

参数：

* eventName {String} （必须）监听的事件名称

* callback {Function} （必须）当事件被派发时会调用的回调

返回：

* {Object} 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 当服务建立之后会被触发
realtimeObject.once('open', function() {
   console.log('opened');
});

// 当服务关闭的时候会被触发
realtimeObject.once('close', function() {
   console.log('closed');
});
```

### RealtimeObject.emit

用法：
```javascript
RealtimeObject.emit(eventName, dataObject)
```

描述：

* 派发一个事件到 RealtimeObject 中，局部的事件中心

参数：

* eventName {String} （必须）派发的事件名称

* dataObject {Obejct}（可选）传递的参数，可以在监听的回调中通过第一个参数获取

返回：

* {Object} 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 当事件被派发的时候会触发
realtimeObject.on('LeanCloud123', function(data) {
   // 会输出 test
   console.log(data.aaa);
});

// 派发了一个自定义的事件，名字叫「LeanCloud123」。
realtimeObject.emit('LeanCloud123', {
    aaa: 'test'
});
```

### RealtimeObject.off

用法：
```javascript
RealtimeObject.off(eventName, callback)
```

描述：

* 从 RealtimeObject 中的私有的事件中心，删除一个事件对应的回调函数绑定

参数：

* eventName {String} （必须）一个绑定过的事件名称

* callback {Function}（必须）要在这个事件中移除的函数

返回：

* {Object} 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

var eventFun = function(data) {
   // 会输出 test
   console.log(data.aaa);
};

// 当事件被派发的时候会触发
realtimeObject.on('LeanCloud123', eventFun);

// 事件方法从事件监听中删除
realtimeObject.off('LeanCloud123', eventFun);

// 派发了一个自定义的事件，名字叫「LeanCloud123」。
realtimeObject.emit('LeanCloud123', {
    aaa: 'test'
});
```

### RealtimeObject.conv

用法：
```javascript
RealtimeObject.conv(options, callback)
```

描述：

* 创建一个 Conversation（对话），实时通信的最小单元。conv 和 room 方法实现的是同样的方法，为了保持概念上的统一，详见「[特别说明](#特别说明)」；

参数：

* options {Object} （可选）传入配置信息
    
    * members {Array} （可选）创建 conversation 时可以直接加入成员的 clientId，如 ['LeanCloud1', 'LeanCloud2']

    * attr {Object} （可选）自定义的数据信息，如 title、image、xxx 等

    * name {String} （可选）Conversation 的名字

    * transient {Boolean} （可选）是否为暂态的 conversation，暂态的 conversation 可以支持大量用户（超过 500 人）同时在此聊天，但是不支持消息回执和历史记录。
    **普通聊天每个 conversation 最多只能支持 500 人，如果预计单个 conversation 会超过这个数字，那请开启这个选项。**

    * callback {Function} （可选）创建成功后的回调函数，此时也会在 RealtimeObject 内部派发一个 create 事件，可以通过 RealtimeObject.on() 方法来监听；

返回：

* {Object} 返回 convObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.conv({
    // 人员的 id
    members: [
        'LeanCloud02'
    ],
    // 默认名字
    name: 'LeanCloud-Room',
    // 创建暂态的聊天室
    // transient: true,
    // 默认的属性，可以放 Conversation 的一些初始值等
    attr: {
        test: 'testTitle'
    }
}, function(result) {
    console.log('Conversation created callback');
});

// 当新 Room 被创建时触发
realtimeObject.on('create', function(data) {
   console.log(data);
});
```

### RealtimeObject.conv

用法：
```javascript
RealtimeObject.conv(convId, callback)
```

描述：

* 匹配一个在服务器端已有的 Conversation（对话），并生成对应的 convObject，此时不派发任何事件；

参数：

* convId {String} （必须）传入已有 Conversation（对话） 的 id

* callback {Function} （可选）创建成功后的回调函数，此时不会派发任何事件；

返回：

* {Object} 返回 convObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

var convId = 'sasfalklkjdlfs123';
var conv;

// 获取已有的 conversation
realtimeObject.conv(convId, function(obj) {
  // 判断服务器端是否存在这个 conversation
  if (obj) {
    // 获取到这个 conversation 的实例对象
    conv = obj;
    console.log('可以取到 id', conv.id);
    console.log('可以取到 name', conv.name);
    console.log('可以取到属性', conv.attr);
  } else {
    console.log('服务器端不存在这个 conversation。');      
  }
});
```

### RealtimeObject.room

用法：
```javascript
RealtimeObject.room(options, callback)
```

描述：

* 创建一个 Room（房间），实时通信的最小单元。room 方法就是 conv 方法的一个别名，为了保持概念的统一，详见「[特别说明](#特别说明)」，使用方式和 conv 完全相同。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});
// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    // 成员列表
    members: [
        'LeanCloud02'
    ],
    // 默认名字
    name: 'LeanCloud-Room',
    // 默认的属性，可以放 Conversation 的一些初始值等
    attr: {
        test: 'testTitle'
    }
}, function(result) {
    console.log('Room created callback');
});

// 当新 Room 被创建时触发
realtimeObject.on('create', function(data) {
   console.log(data);
});
```

### RealtimeObject.room

用法：
```javascript
RealtimeObject.room(roomId, callback)
```

描述：

* 匹配一个在服务器端已有的 room，并生成对应的 RoomObject，此时不派发任何事件；room 方法就是 conv 方法的一个别名，为了保持概念的统一，详见「[特别说明](#特别说明)」，使用方式和 conv 完全相同。

参数：

* roomId {String} （必须）传入已有 Room 的 id

* callback {Function} （可选）创建成功后的回调函数，此时不会派发任何事件；

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

var roomId = 'sasfalklkjdlfs123';
var room;
realtimeObject.room(roomId, function(obj) {
  if (obj) {
    room = obj;
    console.log('room id:', room.id);
    console.log('room name:', room.name);
    console.log('room data:', room.attr);
  } else {
    console.log('服务器不存在这个 room。');
  }
});
```

### RealtimeObject.query

用法：
```javascript
RealtimeObject.query(callback)
```

描述：

* 获取当前用户所在的 Room 信息

参数：

* callback {Function} （必须）创建成功后的回调函数，参数中可以获取到 Room 的列表；

返回：

* {Object} 返回 realtimeObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 当实时通信建立成功之后
realtimeObject.on('open', function() {
   // 查询当前用户所在的组
   realtimeObject.query(function(data) {
      console.log(data);  // list
   });
});
```

### RealtimeObject.query

用法：
```javascript
RealtimeObject.query(options, callback)
```

描述：

* 查询实时通信表中的数据

参数：

* options {Object} （可选）一些配置参数

  * where {Object} （可选）默认为包含自己的查询 {m: clientId}

  * sort {String} （可选）默认为 -lm，最近对话反序

  * limit {Number} （可选）一次获取的条目数量，默认为 10

  * skip {Number} （可选）跳过多少个索引，比如 skip: 1000，就是从 1001 开始查询，默认为 0

  * compact {Boolean} （可选）是否要去掉内置大字段（成员列表，静音列表和当前用户静音的状态），默认 false

* callback {Function} （必须）创建成功后的回调函数，参数中可以获取到 Room 的列表

返回：

* {Object} 返回 RealtimeObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 当实时通信建立成功之后
realtimeObject.on('open', function() {
   // 各种条件查询
   realtimeObject.query({
       where: {m: 'abc123'},
       sort: '-lm',
       limit: 100,
       skip: 200,
       compact: false
   },function(data) {
      console.log(data);  // list
   });
});
```

### RealtimeObject.ping

用法：
```javascript
RealtimeObject.ping(clientIdList, callback)
```

描述：

* 查询对应的 clientId 是否处于服务在线状态

参数：

* clientIdList {Array} （必须）传入已有用户的 clientId 的数组，如 ['LeanCloud1', 'LeanCloud2']。**注意：每次最多只能判断 20 个 clientId，超过 20 个只查询前 20 个，因为消息过长可能导致 WebSocket 包过长而被服务器断开连接。**

* callback {Function} （必须）回调函数，可以在参数中获得在线的 clientIdList，比如返回 ['LeanCloud2']，则说明 LeanCloud2 在线

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud01',
        'LeanCloud02'
    ],
    data: {
        title: 'testTitle'
    }
});

realtimeObject.ping([
    'LeanCloud01',
    'LeanCloud02'
], function(data) {
    // 返回传入的 id 中，在线的用户 id
    console.log(data);
});
```

### RealtimeObject.ping

用法：
```javascript
RealtimeObject.ping(clientId, callback)
```

描述：

* 查询对应的 clientId 是否处于服务在线状态

参数：

* clientId {String} （必须）传入已有用户的 clientId，如 'LeanCloud1'

* callback {Function} （必须）回调函数，可以在参数中获得在线的 clientIdList，比如返回 ['LeanCloud1']，则说明 LeanCloud1 在线

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud01',
        'LeanCloud02'
    ],
    data: {
        title: 'testTitle'
    }
});

realtimeObject.ping('LeanCloud01', function(data) {
    if (data.length) {
       console.log('用户在线');
    } else {
       console.log('用户不在线');
    }
});
```

### RoomObject.add

用法：
```javascript
RoomObject.add(clientId, callback)
```

描述：

* 向当前 RoomObject 中添加一个用户

参数：

* clientId {String} （必须）传入已有用户的 clientId

* callback {Function} （可选）创建成功后的回调函数，此时会在 RealtimeObject 内部派发一个 join 事件；

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02'
    ],
    data: {
        title: 'testTitle'
    }
});

room.add('LeanCloud03', function() {
    console.log('Add success.');
});

// 当前 Room 有新的 client 加入时触发
realtimeObject.on('join', function(data) {
   console.log(data);
});
```

### RoomObject.add

用法：
```javascript
RoomObject.add(clientIdList, callback)
```

描述：

* 向当前 RoomObject 中添加多个用户

参数：

* clientIdList {Array} （必须）传入已有用户的 clientId 的 list，每个元素是 client

* callback {Function} （可选）创建成功后的回调函数，此时会在 RealtimeObject 内部派发一个 join 事件；

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02'
    ],
    data: {
        title: 'testTitle'
    }
});

room.add(['LeanCloud03', 'LeanCloud04'], function() {
    console.log('Add success.');
});

// 当前 Room 有新的 client 加入时触发
realtimeObject.on('join', function(data) {
   console.log(data);
});
```

### RoomObject.remove

用法：
```javascript
RoomObject.remove(clientId, callback)
```

* 描述：从当前 RoomObject 中删除一个用户

参数：

* clientId {String} （必须）传入已有用户的 clientId

* callback {Function} （可选）删除成功后的回调函数，此时会在 RealtimeObject 内部派发一个 left 事件；

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02'
    ],
    data: {
        title: 'testTitle'
    }
});

room.remove('LeanCloud02', function() {
    console.log('Remove success.');
});

// 当前 Room 有 client 立刻时触发
realtimeObject.on('left', function(data) {
   console.log(data);
});
```

### RoomObject.remove

用法：
```javascript
RoomObject.remove(clientIdList, callback)
```

描述：

* 从当前 RoomObject 中删除多个用户

参数：

* clientIdList {Array} （必须）传入已有用户的 clientId 的 list，每个元素是 client

* callback {Function} （可选）创建成功后的回调函数，此时会在 RealtimeObject 内部派发一个 left 事件；

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    data: {
        title: 'testTitle'
    }
});

room.remove(['LeanCloud02', 'LeanCloud03'], function() {
    console.log('Remove success.');
});

// 当前 Room 有 client 立刻时触发
realtimeObject.on('left', function(data) {
   console.log(data);
});
```

### RoomObject.join

用法：
```javascript
RoomObject.join(callback)
```

描述：

* 加入当前这个 Room

参数：

* callback {Function} （可选）加入成功后的回调函数，此时会在 RealtimeObject 内部派发一个 join 事件；

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var roomId = 'safjslakjlfkjla123';
var room;
realtimeObject.room(roomId, function(object) {
    // 判断服务器是否存在这个 room
    if (object) {
        room = object;
        room.join(function() {
            console.log('join');
        });
    }
});

// 当前 Room 有新的 client 加入时触发
realtimeObject.on('join', function(data) {
   console.log(data);
});
```

### RoomObject.leave

用法：
```javascript
RoomObject.leave(callback)
```

描述：

* 从当前 RoomObject 中离开

参数：

* clientIdList {Array} （必须）传入已有用户的 clientId 的 list，每个元素是 client

* callback {Function} （可选）创建成功后的回调函数，此时会在 RealtimeObject 内部派发一个 left 事件；

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    data: {
        title: 'testTitle'
    }
});

room.leave();

// 当前 Room 有 client 立刻时触发
realtimeObject.on('left', function(data) {
   console.log(data);
});
```

### RoomObject.list

用法：
```javascript
RoomObject.list(callback)
```

描述：

* 获取当前 RoomObject 中的成员列表

参数：

* callback {Function} （必须）获取成员列表的回调函数；

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    data: {
        title: 'testTitle'
    }
});

room.list(function(data) {
  console.log(data); // room 中成员 list
});
``` 

### RoomObject.send

用法：
```javascript
RoomObject.send(dataObject, callback)
```

描述：

* 向当前这个 RoomObject 中发送消息

参数：

* dataObject {Object} （必须）发送的数据内容

* callback {Function} （可选）发送到服务器成功后的回调函数，不一定对方已经接收了，但是服务器已经收到。

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    data: {
        title: 'testTitle'
    }
});

room.send({
    testMsg: 'abcde'
}, function() {
    console.log('server ack.');
});

// 当前用户所在的组，有消息时触发
realtimeObject.on('message', function(data) {
   console.log(data);
});
```

### RoomObject.send

用法：
```javascript
RoomObject.send(dataObject, options, callback)
```

描述：

* 向当前这个 RoomObject 中发送消息

参数：

* dataObject {Object} （必须）发送的数据内容

* options {Object} （可选）发送消息时的配置项

    * receipt {Boolean} （可选）默认 false。是否需要接收是否收到的回执信息，true 为接收，可以在 RoomObject.receipt 方法中接收

    * transient {Boolean} (可选) 默认 false。是否发送的是「暂态消息」，暂态消息不会有回调，不会存在历史记录中，可以用来发送用户的输入状态（如：「正在输入。。。」的效果）

    * type {String} （可选） 无默认值。该参数在多端通信中会用到，当你打算与基于 LeanCloud iOS、Android 等客户端通信时，需要使用此选项来设置不同的媒体类型，这样其他客户端接收到之后会有相应的渲染处理方式，详情请看相应 SDK 的文档。目前支持：text（文本）、image（图片）、audio（声音）、video（视频）、location（地理位置）、file（各种类型文件），具体使用方式请参考下面的例子。 

* callback {Function} （可选）发送到服务器成功后的回调函数，不一定对方已经接收了，但是服务器已经收到

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    data: {
        title: 'testTitle'
    }
});

room.send({
    abc: 123
}, {
    // 需要获取阅读回执
    receipt: true,
    // 是否是暂态消息
    transient: false
}, function(data) {
    console.log('信息发送成功，该信息会获取阅读回执');
});

// 当前用户所在的组，有消息时触发
room.receipt(function(data) {
   // 已经收到的 clientId
   console.log(data); 
});

// 与 iOS、Android 等 SDK 通信

// 发送文本
room.send({
    text: '文本内容'
}, {
    type: 'text'
}, function(data) {
    // 发送成功之后的回调
});

// 发送图片
room.send({
    // 描述信息
    text: '图片测试',
    // 自定义的属性，可选填，非必须项
    attr: {
        aaa: 123
    },
    url: 'https://leancloud.cn/images/123.png',
    // 图片相关信息，所有选项可选填，非必须项
    metaData: {
        // 图片名字
        name:'logo',
        // 文件格式
        format:'png',
        // 高度，单位像素 px
        height: 123,
        // 宽度，单位像素 px
        width: 123,
        // 文件大小，单位比特 b
        size: 888
    }
}, {
   type: 'image'
}, function(data) {
    console.log('图片数据发送成功！');
});
```

### RoomObject.receive

用法：
```javascript
RoomObject.receive(callback)
```

描述：

* 接收到当前这个 RoomObject 中的消息

参数：

* callback {Function} （必须）收到当前 Room 中信息的处理函数

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    data: {
        title: 'testTitle'
    }
});

// 当前用户所在的组，有消息时触发
room.receive(function(data) {
   // 接收到的信息
   console.log(data); 
});
```

### RoomObject.receipt

用法：
```javascript
RoomObject.receipt(callback)
```

描述：

* 如果你通过 RoomObject.send 方法发送了需要有回执功能的信息，那么通过 RoomObject.receipt 可以接收当前这个房间中的所有这类回执信息；回执表示从实时通信服务本身，对方的客户端已经收到该信息

参数：

* callback {Function} （必须）收到的回执信息

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    data: {
        title: 'testTitle'
    }
});

room.send({
    abc: 123
}, {
    // 需要获取阅读回执
    receipt: true
}, function(data) {
    console.log('信息发送成功，该信息会获取阅读回执');
});

// 当前用户所在的组，有消息时触发
room.receipt(function(data) {
   // 已经收到的 clientId
   console.log(data);
});
```

### RoomObject.log

用法：
```javascript
RoomObject.log(callback)
```

描述：

* 获取当前 RoomObject 中的消息历史。这个是一个简单的方式，可以获取最近 20 条历史消息。

参数：

* callback {Function} （必须）回调函数，参数中可以取得历史消息数据

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var roomId = 'safjslakjlfkjla123';
var room;
realtimeObject.room(roomId, function(object) {
    // 判断这个 room 在服务器端是否存在
    if (object) {
        // 当前用户所在的组，有消息时触发
        room.log(function(data) {
           console.log(data);
        });
    }
};
```

### RoomObject.log

用法：
```javascript
RoomObject.log(options, callback)
```

描述：

* 获取当前 RoomObject 中的消息历史。

参数：

* options {Object} （可选）查询历史条目的参数

  * t {String|Number} （可选）查询历史消息的时间戳，查询这个时间之前的消息

  * mid {String} （可选）message id 消息的 id，当接收到消息的时候会有这个 id，用来辅助查询，防止同一时间戳下有两条一样的消息

  * limit {Number} （可选）返回消息历史的条目数量，默认是查询最近 20 条历史消息 

* callback {Function} （必须）回调函数，参数中可以取得历史消息数据

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var roomId = 'safjslakjlfkjla123';
var room;
realtimeObject.room(roomId, function(object) {
    
    // 判断这个 room 在服务器端是否存在
    if (object) {
     
      // 当前用户所在的组，有消息时触发
      room.log({
         // 时间戳，查询这个时间之前的消息
         t: 1429545834932
         // message id
         // mid: 'afsadsa_ds2w',
         // 返回条目数量
         limit: 20
      }, function(data) {
         console.log(data);
      });
    }
};
```

### RoomObject.count

用法：
```javascript
RoomObject.count(callback)
```

描述：

* 获取当前这个 Room（或者 Conversation）中的用户数量

参数：

* callback {Function} （必须）返回的数据中可以获取到用户数量

返回：

* {Object} 返回 RoomObject，其中有后续调用的方法，支持链式调用。

例子：

```javascript
var appId = '{{appid}}';
var clientId = 'abc123';
var realtimeObject = AV.realtime({
   // appId 需要换成你自己的 appId
   appId: appId,
   // clientId 是自定义的名字，当前客户端可以理解的名字
   clientId: clientId
});

// 这里创建一个 room，也可以通过 room id 获取一个 room
var room = realtimeObject.room({
    members: [
        'LeanCloud02',
        'LeanCloud03'
    ],
    data: {
        title: 'testTitle'
    }
});

// 当前用户所在的组，有消息时触发
room.count(function(data) {
   // 当前用户数量
   console.log(data); 
});
```

## 全局事件

SDK 会默认派发一些事件，这些事件仅会在 RealtimeObject 内部被派发（注意：RoomObject 内部默认不会派发任何事件），你可以通过监听这些事件来完成你的操作。这些事件往往都是脱离 Room（或者 Conversation）的，你可以监听到其他 Room 中的相关信息。

以下是默认事件的说明：

### open

描述：

* 与服务器建立好连接之后就会被派发，包括当服务断开重新被连接上时也会被触发

### close

描述：

* 与服务器连接断开就会被派发，包括网络中断

### create

描述：

* 新建一个 Room 成功之后会被触发

### join

描述：

* 当一个 Room 新增了一个成员之后会被触发

### left

描述：

* 当一个 Room 中有成员离开之后会被触发

### message

描述：

* 当收到消息时会被触发，收到的消息是当前客户端（clientId）存在的 Room 中的信息，所有这些数据都可以在服务器端看到。

### reuse

* 发生连接错误，可能是网络原因，SDK 在自动尝试重连。可以监听这个状态，给用户「服务器已断开，正在重新连接。。。」之类的提示。

### receipt

* 收到消息回执的时候会被触发


# 实时通信开发指南

## 开始之前必要的知识储备
### 实时通信可以实现什么需求？

- 在线客服类
- 多对多社交类
- 直播间聊天室类

### 实时通信支持哪些种类的消息？

- 纯文本消息
- 表情消息
- 语音消息
- 视频消息
- 文件（附件）消息
- 多种类混合消息


在继续阅读本文档之前，请先阅读[《实时通信开发指南》](realtime_v2.html)，了解一下实时通信的基本概念和模型。


## SDK 安装与初始化

### SDK 安装和获取

- [Android](sdk_setup-android.html)
- [Objective-C](sdk_setup-objc.html)
- [JavaScript](sdk_setup-js.html)
- [C#](sdk_setup-dotnet.html)

### SDK 初始化

```c#
Websockets.Net.WebsocketConnection.Link();
string appId = "{{appId}}";
string appKey = "{{appKey}}";
var config = new AVRealtime.Configuration()
{
    ApplicationId = appId,
    ApplicationKey = appKey,
};
var realtime = new AVRealtime(config);
// 建议将 realtime 当做全局变量保存在系统中
```

## 需求场景

### 在线客服类
根据开发者普遍需求，参考一些大型电商网站的客服系统，实时通信也提供了一套完整的接口给开发者实现一个在线客服类的应用。

#### 客服上线
首先，我们明确一个概念

> 不管是客服还是消费者，他们在进行在线交谈的时候，都是这个系统的终端用户，他们都被定义为客户端

首先，我们假设系统的第一个客服人员叫做「小赵」，她在系统内部有一个唯一的 ID 与之对应 `kf001`,下面的代码将帮助小赵登录到系统:


```cs
// 以小赵的 ID 为客户端标识 ID 登录到 LeanCloud 云端
var clientId = "kf001";
var xiaozhao = await realtime.CreateClient(clientId);
```

#### 消费者上线
消费者小刘(ID：`xfz001`)打开自己的订单，有一些疑问，想找客服，这个时候可以使用下面的代码帮助 TA 登录到系统：

```cs
var clientId = "xfz001";
var xiaoliu = await realtime.CreateClient(clientId);
```

> LeanCloud 并不对开发者所使用的 client Id 做管理，开发者在自己的系统里面维护 client Id 的唯一性即可，一个 client Id 对应着一个用户即可，长度不能超过 50 个字符。


#### 消费者与客服进行聊天
一般情况下，消费者在后台可以看见哪个客服是在线的，或者有一个按钮「我要找客服」，点击之后，系统随机分配一个在线的客服给消费者，因此我们提供了一个接口可以查询客户端的在线状态，逻辑如下：

假设系统里面内置了 5 个客服，那么他们的 id 从 kf001 到 kf005 递增，在页面的坐上叫有一个列表显示了这 5 个客服的头像，我们需要用如下代码一次性查询这 5 个客服是否在线：

```cs
var kfIds = new string[] {"kf001","kf002","kf003","kf004","kf005"};
var result = await xiaoliu.PingAsync(kfIds);
foreach(var tuple in result)
{
    
}
```

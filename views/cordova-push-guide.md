# 在 Cordova 项目中使用 LeanCloud

伴随着 Cordova 的发展，已经有不少用户在尝试着结合 LeanCloud 强大的后端以及 Cordova 强大的跨平台能力来开发客户端应用，因此这篇教程将详细讲解如何在 Cordova 中正确，有效地使用 LeanCloud 的各项服务。

![Cordova-log](https://cordova.apache.org/static/img/cordova_bot.png)

## 安装
首先，Cordova 本质上是一个 Web 项目，它的开发语言目前还是主流的 JavaScript 以及一小部分特立独行的 TypeScript ，因此在任何一个基于 Cordova 开发环境中都可以直接使用 LeanCloud JavaScript SDK：

- [LeanCloud JavaScript SDK 安装指南](sdk_setup-js.html)
- [LeanCloud JavaScript SDK 数据存储开发指南](leanstorage_guide-js.html)
- [LeanCloud JavaScript SDK 实时通信开发指南](realtime_guide-js.html)

我们的主要的两个功能模块[数据存储](leanstorage_guide-js.html)以及[实时通信](realtime_guide-js.html)的安装包里面都已经包含了 TypeScript 的定义文件，因此如果您正在使用 ionic2+ 进行开发也毫无问题，不会遇到编译出错的问题。

## Native 插件
在 Cordova 的插件市场里面有很多关于使用 JavaScript 去调用平台特殊的本地组件去实现一些浏览器运行时内无法实现的需求，例如苹果的支付功能(Apple Pay)，因此针对与 LeanCloud 相关的服务，我们也开发了一套插件给 Cordova 的开发者使用。

### LeanCloud 推送插件
推送服务是 LeanCloud 的云服务里面的一个模块，它提供了稳定的针对移动设备的推送服务。

#### 安装和使用
点击前往插件的仓库地址：[https://github.com/leancloud/cordova-plugin-leancloud](https://github.com/leancloud/cordova-plugin-leancloud) 查看安装以及初始化的说明。


#### 推送插件与实时通信离线消息的关联
假如项目中还引入了 LeanCloud 实时通信功能，一定会遇到客户端下线之后的离线消息与推送设备的对应的问题，类似于 QQ 的离线消息推送，某一个用户在一台安卓设备上登录了自己微信，而后又换到一台苹果手机上登录，服务端需要明确的知道该用户最后一次登录的设备是哪台，这样才能准确地将消息推送到目标设备，因此使用 [JavaScript 实时通信](realtime_guide-js.html) 的开发者需要在登录到实时通信服务器之后做一次关联操作即可，代码如下：


```js
var clientId = 'Tom';// 假设当前用户的 Client Id 是 Tom
// 将 client Id 作为当前设备推送订阅的频道，就可以实现离线消息针对 Client Id 所登录的设备做关联
window.LeanPush.subscribe(clientId, function(success){
    // 成功绑定
}，function(error){
    // 失败的话就打印一下 error 看看出错的原因
}); 
```

注意：上述代码需要确保已经成功的安装并且初始化了[LeanCloud 推送插件](#LeanCloud 推送插件)。

同样的道理，假设您在使用 [JavaScript 实时通信](https://leancloud.cn/docs/realtime_guide-js.html) 使用了[单点登录](realtime_guide-js.html#单点登录) 就需要在[处理登录冲突](realtime_guide-js.html#处理登录冲突)中对当前设备的 Installation 解绑：

```js
tom.on('conflict', function() {
  // 弹出提示，告知当前用户的 Client Id 在其他设备上登陆了
    window.LeanPush.unsubscribe('Tom', function(success){
          // 成功解绑
    }，function(error){
          // 失败的话就打印一下 error 看看出错的原因
    }); 
});
```

注意，用户退出需要调用 [AVIMClient#close](realtime_guide-js.html#退出登录) 的方法，与此同时也需要执行上述代码来确认用户退出之后，不会再收到离线的消息推送。


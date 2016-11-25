# 在微信小程序中使用 LeanCloud

微信小程序是一个全新的跨平台移动应用平台，LeanCloud 为小程序提供一站式后端云服务，为你免去服务器维护、证书配置等繁琐的工作，大幅降低你的开发和运维成本。本文说明了如何在微信小程序中使用 LeanCloud 提供的各项服务。

## 准备工作
### 创建应用
- 如果你还没有创建过 LeanCloud 应用，请登录 LeanCloud 控制台 [创建一个新应用](/applist.html#/newapp)。
- 如果你还没有小程序帐号，请访问 [微信公众平台](https://mp.weixin.qq.com) 注册一个小程序帐号。如果你不需要进行真机调试可以跳过这一步。
- 下载 [小程序开发工具](https://mp.weixin.qq.com/debug/wxadoc/dev/devtools/download.html)，按照 [小程序开发教程](https://mp.weixin.qq.com/debug/wxadoc/dev/) 创建一个项目。

### 配置域名白名单
请按照 [小程序域名白名单配置](weapp-domains.html) 的步骤配置。如果你不需要进行真机调试可以跳过这一步。

## 存储 SDK

要使用 LeanCloud 的数据存储、用户系统、调用云引擎等功能，需要使用 LeanCloud 存储 SDK。

<div class="callout callout-info">目前存储 SDK 支持微信开发者工具与 iOS 真机，我们已经确认小程序在 Android 真机上无法访问我们的 REST API，我们正在积极与微信团队沟通该问题。</div>

### Demo
为了更直观地展示小程序中存储 SDK 的用法，我们在小程序上实现了 LeanTodo 应用。在这个 Demo 中你可以看到：

- 如何对云端数据进行查询、增加、修改与删除
- 查询结果为一个列表时，如何将其绑定到视图层进行展示以及如何在点击事件中得到对应的数组项
- 如何自动登录 LeanCloud 用户系统
- 如何在登录后设置帐号与密码以供用户在其他平台的 LeanTodo 应用上登录
- 如何实现下拉刷新

目前小程序公测阶段暂时无法直接在微信上体验到 Demo，但你仍然可以获取源码通过微信开发者工具本地进行调试与真机预览。 Demo 的源码与运行说明请参考 [https://github.com/leancloud/leantodo-weapp](https://github.com/leancloud/leantodo-weapp)。

### 安装与初始化
2. 下载 [`av-weapp.js`](https://unpkg.com/leancloud-storage@^2.0.0-beta/dist/av-weapp.js)（[镜像](https://raw.githubusercontent.com/leancloud/javascript-sdk/dist/dist/av-weapp.js)），移动到 `libs` 目录。
3. 在 `app.js` 中使用 `const AV = require('./libs/av-weapp.js');` 获得 `AV` 的引用。在其他文件中使用时请将路径替换成对应的相对路径。 
4. 在 `app.js` 中初始化应用： 
  ```javascript 
  AV.init({ 
    appId: '{{appid}}', 
    appKey: '{{appkey}}', 
  }); 
  ```

### 对象存储
所有的对象存储 API 都能正常使用，详细的用法请参考 [JavaScript 数据存储开发指南](leanstorage_guide-js.html)。

#### 数据绑定
直接使用 `this.setData()` 将 `AV.Object` 对象设置为当前页面的 data，即可在 WXML 中使用 Mustache 语法访问绑定的数据了。下面这个例子展示了如何将一个 Query 的查询结果显示在页面上：

```javascript
// pages/todos/todos.js
Page({
  data: {
    todos: [],
  },
  onReady: function() {
    new AV.Query('Todo')
      .descending('createdAt')
      .find()
      .then(todos => this.setData({ todos }))
      .catch(console.error);
  },
});
```

```html
<!-- pages/todos/todos.js -->
<block wx:for="{{todos}}" wx:for-item="todo" wx:key="objectId">
  <text data-id="{{todo.objectId}}">
    {{todo.content}}
  </text>
</block>
```

### 文件存储

在小程序中，可以将用户相册或拍照得到的图片上传到 LeanCloud 服务器进行保存。首先通过 `wx.chooseImage` 方法选择或拍摄照片，得到本地临时文件的路径，然后按照下面的方法构造一个 `AV.File` 将其上传到 LeanCloud：

```javascript
wx.chooseImage({
  count: 9,
  sizeType: ['original', 'compressed'],
  sourceType: ['album', 'camera'],
  success: function(res) {
    var tempFilePath = res.tempFilePaths[0];
    new AV.File('file-name', {
      blob: {
        uri: tempFilePath,
      },
    }).save().then(
      file => console.log(file.url())
    ).catch(console.error);
  }
});
```

上传成功后可以通过 `file.url()` 方法得到服务端的图片 url。

### 用户系统

小程序中提供了登录 API 来获取微信的用户登录状态，应用可以访问到用户的昵称、性别等基本信息，但是如果想要保存额外的用户信息，如用户的手机号码、收货地址等，则需要使用 LeanCloud 的用户系统。

#### 一键登录
LeanCloud 的用户系统现已支持一键使用微信用户身份登录。要使用一键登录功能，需要先设置小程序的 AppID 与 AppSecret：

1. 登录 [微信公众平台](https://mp.weixin.qq.com)，在 **设置** > **开发设置** 中获得 AppID 与 AppSecret。
2. 前往 LeanCloud 控制台 > **组件** > **社交**，保存「微信小程序」的 AppID 与 AppSecret。

现在，你可以在应用中使用 `AV.User.loginWithWeapp()` 方法来使用当前用户身份登录了。

```javascript
AV.User.loginWithWeapp().then(user => {
  this.globalData.user = user.toJSON();
}).catch(console.error);
```

如果该用户是第一次使用此应用，调用登录 API 会创建一个新的用户，你可以在 控制台 > **存储** 中的 `_User` 表中看到该用户的信息，如果该用户曾经使用该方式登录过此应用，再次调用登录 API 会返回同一个用户。

用户的登录状态会保存在客户端中，可以使用 `AV.User.current()` 方法来获取当前登录的用户，下面的例子展示了如何同步登录用户的信息：

```javascript
// 获得当前登录用户
const user = AV.User.current();
// 调用小程序 API，得到用户信息
wx.getUserInfo({
  success: ({userInfo}) => {
    // 更新当前用户的信息
    user.set(userInfo).save().then(user => {
      // 成功，此时可在控制台中看到更新后的用户信息
      this.globalData.user = user.toJSON();
    }).catch(console.error);
  }
});
```

#### 启用其他登录方式
由于 `AV.User.loginWithWeapp()` 只能在小程序中使用，所以使用该 API 创建的用户无法直接在小程序之外的平台上登录。如果需要使用 LeanCloud 用户系统提供的其他登录方式，如用手机号验证码登录、邮箱密码登录等，在小程序一键登录后设置对应的用户属性即可：

```javascript
// 小程序登录
AV.User.loginWithWeapp().then(user => {
  // 设置并保存手机号
  user.setMobilePhoneNumber('13000000000');
  return user.save();
}).then(user => {
  // 发送验证短信
  AV.User.requestMobilePhoneVerify(user.getMobilePhoneNumber());
}).then({
  // 用户填写收到短信验证码后再调用 AV.User.verifyMobilePhone(code) 完成手机号的绑定
  // 成功后用户将可以在其他平台上使用手机号动态验证码登录了
}).catch(console.error);
```

#### 绑定现有用户
如果你的应用已经在使用 LeanCloud 的用户系统，或者用户已经通过其他方式注册了你的应用（比如在 Web 端通过用户名密码注册），可以通过在小程序中调用 `AV.User#linkWithWeapp()` 来关联已有的账户：

```javascript
// 首先，使用用户名与密码登录一个已经存在的用户
AV.User.logIn('username', 'password').then(user => {
  // 将当前的微信用户与当前登录用户关联
  return user.linkWithWeapp();
}).catch(console.error);
```

### 云引擎
使用云引擎可以方便地实现一些在服务器执行的逻辑，比如处理敏感信息、数据聚合、采集数据等，并且不需要准备额外的服务器。

SDK 所有的云引擎相关的 API 都能正常使用，详细的用法请参考 [云函数开发指南](leanengine_cloudfunction_guide-node.html)。

## 实时通讯 SDK

要使用 LeanCloud 的聊天、实时消息功能，需要使用 LeanCloud 实时通讯 SDK。

<div class="callout callout-info">实时通讯功能暂时只支持微信开发者工具，我们正在进行真机上的适配工作。</div>

### 安装与初始化
2. 下载 [`realtime.weapp.js`](https://unpkg.com/leancloud-realtime@^3.3.0/dist/realtime.weapp.js)（[镜像](https://raw.githubusercontent.com/leancloud/js-realtime-sdk/dist/dist/realtime.weapp.js)），移动到 `libs` 目录。
3. 在 `app.js` 中使用 `const Realtime = require('./libs/realtime.weapp.js').Realtime;` 获得 `Realtime` 的引用。在其他文件中使用时请将路径替换成对应的相对路径。
4. 在 `app.js` 中初始化应用：
  ```javascript
  const realtime = new Realtime({
    appId: '{{appid}}',
    noBinary: true,
  });
  ```

实时通讯 SDK 的详细用法请参考 [实时通信开发指南](realtime_guide-js.html)。

### 富媒体消息
要在小程序中使用实时通讯 SDK 的富媒体消息插件，有一些额外的约束：

1. 安装存储 SDK 至 `libs` 目录，并将文件重命名为 `leancloud-storage.js`。
2. 安装实时通讯 SDK 至 `libs` 目录，并将文件重命名为 `leancloud-realtime.js`。
3. 下载 [`leancloud-realtime-plugin-typed-messages.js`](https://unpkg.com/leancloud-realtime-plugin-typed-messages@^1.0.0)，移动到 `libs` 目录。必须保证<u>三个文件在同一目录中</u>。
4. 在 `app.js` 中<u>依次加载</u> `leancloud-storage.js`、`leancloud-realtime.js` 和 `leancloud-realtime-plugin-typed-messages.js`。
  ```javascript
  const AV = require('./libs/leancloud-storage.js');
  const Realtime = require('./libs/leancloud-realtime.js').Realtime;
  const TypedMessagesPlugin = require('./libs/leancloud-realtime-plugin-typed-messages.js').TypedMessagesPlugin;
  const ImageMessage = require('./libs/leancloud-realtime-plugin-typed-messages.js').ImageMessage;
  ```
5. 在 `app.js` 中初始化应用：
  ```javascript
  // 初始化存储 SDK
  AV.init({
    appId: '{{appid}}',
    appKey: '{{appkey}}',
  });
  // 初始化实时通讯 SDK
  const realtime = new Realtime({
    appId: '{{appid}}',
    noBinary: true,
    plugins: [TypedMessagesPlugin], // 注册富媒体消息插件
  });
  ```

富媒体消息的用法请参考 [实时通信开发指南 - 富媒体消息](realtime_guide-js.html#富媒体消息)。

## 反馈
如果在微信小程序中使用 LeanCloud SDK 时遇到问题，欢迎通过我们的 [论坛](https://forum.leancloud.cn/c/jing-xuan-faq/weapp) 进行反馈。

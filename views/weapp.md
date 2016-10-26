# 在微信小程序中使用 LeanCloud

微信小程序是一个全新的跨平台移动应用平台。本文演示了如何在微信小程序中使用 LeanCloud SDK。

## 存储 SDK

要使用 LeanCloud 的数据存储、用户系统、调用云引擎等功能，需要使用 LeanCloud 存储 SDK。

### 安装与初始化
1. 首先下载 [小程序开发工具](https://mp.weixin.qq.com/debug/wxadoc/dev/devtools/download.html)，按照 [小程序开发教程](https://mp.weixin.qq.com/debug/wxadoc/dev/) 新建一个项目。
2. 下载 [`av-weapp.js`](https://unpkg.com/leancloud-storage@^2.0.0-beta/dist/av-weapp.js)，移动到 `utils` 目录。
3. 在 `app.js` 中使用 `const AV = require('./utils/av-weapp.js');` 获得 `AV` 的引用。在其他文件中使用时请将路径替换成对应的相对路径。
4. 在 `app.js` 中初始化应用：
  ```javascript
  AV.init({
    appId: '{{appid}}',
    appKey: '{{appkey}}',
  });
  ```

### 对象存储
所有的对象存储 API 都能正常使用，详细的用法请参考 [JavaScript 数据存储开发指南](leanstorage_guide-js.html)。

### 文件存储

在小程序中通过 `wx.chooseImage` 方法得到选定照片的本地临时文件的路径，仅在小程序本次启动期间可以正常使用，如需持久保存可以通过 `AV.File` 将其上传到 LeanCloud：

```javascript
wx.chooseImage({
  count: 9,
  sizeType: ['original', 'compressed'],
  sourceType: ['album', 'camera'],
  success: function(res) {
    var tempFilePath = res.tempFilePaths[0];
    new AV.File('file-name', {
      blob: {
        uri: tempFilePaths,
      },
    }).save().then(
      file => console.log(file.url())
    ).catch(console.error);
  }
});
```

上传成功后可以通过 `file.url()` 方法得到服务端的图片 url。

### 用户系统
如果你的应用已经在使用 [LeanCloud 的用户系统](leanstorage_guide-js.html#用户)，现有的注册登录 API 都能正常使用。比如下面的代码展示了如何使用用户名与密码进行登录：

```javascript
AV.User.logIn('username', 'password').then(user => {
  this.globalData.user = user;
}, console.error);
```

此外，我们即将提供一个新的登录 API 来一键将微信的用户关联到 LeanCloud 的用户系统。

### 云引擎
使用云引擎可以方便地实现一些在服务器执行的逻辑，比如处理敏感信息、数据聚合、采集数据等，并且不需要准备额外的服务器。

SDK 所有的云引擎相关的 API 都能正常使用，详细的用法请参考 [云函数开发指南](leanengine_cloudfunction_guide-node.html)。

## 实时通讯 SDK

要使用 LeanCloud 的聊天、实时消息功能，需要使用 LeanCloud 实时通讯 SDK。

### 安装与初始化

1. 首先下载 [小程序开发工具](https://mp.weixin.qq.com/debug/wxadoc/dev/devtools/download.html)，按照 [小程序开发教程](https://mp.weixin.qq.com/debug/wxadoc/dev/) 新建一个项目。
2. 下载 [`realtime.weapp.js`](https://unpkg.com/leancloud-realtime@^3.3.0/dist/realtime.weapp.js)，移动到 `utils` 目录。
3. 在 `app.js` 中使用 `const Realtime = require('./utils/realtime.weapp.js').Realtime;` 获得 `Realtime` 的引用。在其他文件中使用时请将路径替换成对应的相对路径。
4. 在 `app.js` 中初始化应用：
  ```javascript
  const reatlime = new Realtime({
    appId: '{{appid}}',
    noBinary: true,
  });
  ```

实时通讯 SDK 的详细用法请参考 [实时通信开发指南](realtime_guide-js.html);

### 富媒体消息
要在小程序中使用富媒体消息插件，有一些额外的约束：

1. 安装存储 SDK 至 `utils` 目录，并将文件重命名为 `leancloud-storage.js`。
2. 安装实时通讯 SDK 至 `utils` 目录，并将文件重命名为 `leancloud-realtime.js`。
3. 下载 [`leancloud-realtime-plugin-typed-messages.js`](https://unpkg.com/leancloud-realtime-plugin-typed-messages@^1.0.0)，移动到 `utils` 目录。必须保证**三个文件在同一目录中**。
4. 在 `app.js` 中**依次加载** `leancloud-storage.js`，`leancloud-realtime.js`，`leancloud-realtime-plugin-typed-messages.js`。
  ```javascript
  const AV = require('./utils/leancloud-storage.js');
  const Realtime = require('./utils/leancloud-realtime.js').Realtime;
  const TypedMessagesPlugin = requrie('./utils/leancloud-realtime-plugin-typed-messages.js').TypedMessagesPlugin;
  const ImageMessage = require('./utils/leancloud-realtime-plugin-typed-messages.js').ImageMessage;
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

富媒体消息的用法请参考 [实时通信开发指南 - 富媒体消息](realtime_guide-js.html#富媒体消息);

## 反馈
如果在微信小程序中使用 LeanCloud SDK 时遇到问题，欢迎通过我们的 [论坛](https://forum.leancloud.cn/c/jing-xuan-faq/weapp) 进行反馈。

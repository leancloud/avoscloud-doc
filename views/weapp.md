# 在微信小程序中使用 LeanCloud

微信小程序是一个全新的移动应用平台。本文演示了如何在微信小程序中使用 LeanCloud SDK。

## 安装与初始化 SDK
1. 首先，下载 [小程序开发工具](https://mp.weixin.qq.com/debug/wxadoc/dev/devtools/download.html)，按照 [小程序开发教程](https://mp.weixin.qq.com/debug/wxadoc/dev/) 新建一个项目。
2. 下载 [https://cdn1.lncld.net/static/js/av-weapp-2.0.0-beta.1.js](https://cdn1.lncld.net/static/js/av-weapp-2.0.0-beta.1.js)，移动到 `utils` 目录。
3. 在 app.js 中使用 `const AV = require('./utils/av-weapp-2.0.0-beta.1.js')` 获得 `AV` 的引用。在其他文件中使用时请将路径替换成对应的相对路径。
4. 在 app.js 中初始化应用：
```javascript
AV.init({
  appId: "{{appid}}",
  appKey: "{{appkey}}",
});
```

## 用户系统
如果你的应用已经在使用 [LeanCloud 的用户系统](https://leancloud.cn/docs/leanstorage_guide-js.html#用户)，现有的注册登录 API 都能正常使用。比如下面的代码展示了如何使用用户名与密码进行登录：

```javascript
AV.User.logIn('username', 'password').then(user => {
  this.globalData.user = user;
}, console.error);
```

此外，我们即将提供一个新的登录 API 来一键将微信的用户关联到 LeanCloud 的用户系统。

## 存储
所有的对象存储 API 都能正常使用，详细的用法请参考 [JavaScript 数据存储开发指南](https://leancloud.cn/docs/leanstorage_guide-js.html)。

<div class="callout callout-danger">目前公测阶段模拟器上没有实现 [文件上传 API](https://mp.weixin.qq.com/debug/wxadoc/dev/api/network-file.html?t=1475052049525#wxuploadfileobject)，因此 SDK 的文件存储功能暂时无法使用。
</div>

## 云引擎
使用云引擎可以方便地实现一些在服务器执行的逻辑，比如处理敏感信息、数据聚合、采集数据等，并且不需要准备额外的服务器。

SDK 所有的云引擎相关的 API 都能正常使用，详细的用法请参考 [云函数开发指南](https://leancloud.cn/docs/leanengine_cloudfunction_guide-node.html)。

## 反馈
如果在微信小程序中使用 LeanCloud SDK 时遇到问题，欢迎通过我们的 [论坛](https://forum.leancloud.cn/c/jing-xuan-faq/weapp) 进行反馈。

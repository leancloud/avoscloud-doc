# 在云引擎中使用推送服务

在阅读本文之前，请确保您已经阅读以下文档：

- [消息推送服务总览](push_guide.html)
- [iOS 消息推送开发指南](ios_push_guide.html)
- [Android 消息推送开发指南](android_push_guide.html)

## 准备工作
首先，推送服务针对的是 iOS 以及 Androd 等移动平台的需求，因此开发者根据本文指南首次进行尝试调用以及开发的时候，一定要确保如下几个条件：

- app 已经部署在目标设备上
- 如果是 iOS 设备，请正确的在控制台上传了 iOS 推送证书，详情请点击：[配置 iOS 推送证书](ios_push_cert.html)
- 如果是 Android 设备，请正确的配置 `AndroidManifest.xml`，详情请点击：[AndroidManifest.xml 配置](android_push_guide.html#配置)


随着云引擎被更多用户使用，往往一些与移动端无关的逻辑操作需要在服务端完成，例如一些鉴权，账单等操作，与此类同的就是消息推送，比如一些天气类的应用，当它的服务端检测到北京的温度变化较快，它的服务端会统一地向 iOS，Android，Web 端进行推送，因此在云引擎中使用推送服务往往能减少客户端编码，并且业务逻辑便于统一。

因此，假设我们第一个简单的需求就是：从云引擎中向所有的已经安装了 app 的设备推送一条消息「Hello,LeanCloud!」。

## 发送给所有设备

我们需要通过调用对应的 SDK 接口告知 LeanCloud 云端，向设备推送消息：

```js
"use strict";
var AV = require('leancloud-storage');

AV.Push.send({
  data: {
    alert: 'Hello,LeanCloud!'
  }
}); 
```

注意，一定请确保在 iOS 以及 Android 正确调用了保存 _Installation 的 API。

## 接收推送消息
接收推送消息请参照以下文档进行代码编写：

- iOS:[iOS 接收推送通知](ios_push_guide.html#接收推送通知)
- Android:[自定义 Receiver](android_push_guide.html#自定义_Receiver)

### 推送给指定的设备

假设当前在 `_Installation` 表中存在如下一条数据：

```json
{
  "valid": true,
  "timeZone": "Asia/Shanghai",
  "ACL": {
    "*": {
      "read": true,
      "write": true
    }
  },
  "deviceToken": "df2d434cd2097f250eecbab0f4fe45916ff17a13a9af99d015a72db1aa6c7302",
  "deviceType": "ios",
  "badge": 0,
  "objectId": "cSAeHD347fQRRCQlmf2PCgxqVH51Nsy5",
  "createdAt": "2016-10-17T16:51:15.604Z",
  "updatedAt": "2016-10-30T03:07:39.090Z"
}
```

在云引擎中，向这台设备推送消息的代码如下：

```js
"use strict";
let AV = require('leancloud-storage');

let query = new AV.Query('_Installation');
query.equalTo('installationId', 'cSAeHD347fQRRCQlmf2PCgxqVH51Nsy5');
AV.Push.send({
    where: query,
    data: {
        alert: 'Hello,LeanCloud!'
    }
});
```

### 批量推送

批量推送一般有如下两种场景：

- 静态设定：用户主动关注，类似于我们订阅报纸，报社需要每天向主动订阅了北京晚报的用户派送北京晚报，而推送就是向订阅了某一个频道的这些用户进行批量推送。
- 动态查询：服务端根据业务逻辑需求向一些用户动态的发送推送，有可能每一次推送的用户群都是浮动的。经典的案例就是，当你在淘宝浏览过某些商品之后，你再回到微博的网页上，你会看见微博的网页会根据你在淘宝浏览的商品给你显示相关的商品推荐。推送也是如此，一些用户的动态行为可以为推送服务提供算法参考。因此这些用户是动态的。

#### 静态设定-Channel

我们不推荐开发者在 `_Installation` 表上放过多的自定义属性，我们更推荐用户使用频道（Channel）的概念，例如在客户端 SDK 中，一个注册用户以自己的用户名或者 objectId 订阅了一个频道，这样就在云引擎上向这些用户推送内容就会简单很多。

例如，在某个天气应用里面，用户选择「苏州」作为关注的城市，那么我们为了向该用户推送「苏州」天气变化，可以在代码里面为该用户订阅苏州这个频道的推送渠道：

```objc
// 使用 iOS SDK API 进行订阅操作
// 当用户关注 SuZhou，则为其订阅该频道。
AVInstallation *currentInstallation = [AVInstallation currentInstallation];
[currentInstallation addUniqueObject:@"SuZhou" forKey:@"channels"];// 为用户订阅 SuZhou 频道
[currentInstallation saveInBackground];
```

而在云引擎中，我们可以向苏州这个频道推送苏州明天的天气情况：

```js
AV.Push.send({
    channels: ['SuZhou'],
    data: {
        alert: '苏州明天（2016月11月3日）天气晴，气温最高 18°，最低6°。'
    }
});
```

##### LeanCloud 是如何使用 Channel 的？
如果是 LeanCloud 的实时消息的用户，并且详细阅读过开源的 [iOS SDK](https://github.com/leancloud/objc-sdk) 源代码，可能会发现，LeanCloud 实时消息 SDK 也是通过 Channel 来实现聊天消息的离线推送的。它的具体逻辑就是：每一个用户都会订阅以自己名字命名的频道。这样服务端在发现某一个用户下线了，并且已知了该用户的 ID，只要往这个频道推送这条离线消息就可以了。

#### 动态查询-Query

推送的对象逻辑上针对的是设备，因此需要推送给指定的用户的话，需要开发者自己维护一个关系：设备与用户对应的关系。
用过微博和手机 QQ 的用户都会有经过里一个场景：当你在 iPad 上和手机上都登录了自己的 QQ 账号的时候，一旦你有消息，默认情况下，你的 iPad 以及手机上是同时收到推送的。要在 LeanCloud 实现这个需求也是很简单的。

首先，你需要建立一张新的表，叫做：user_installation，它的样例如下：

objectId|user|installation|createdAt|updatedAt
----|-----|-----|-----|----
58156499da2f60005dbf70ab|58156499c4c97100554acaaf| cSAeHD347fQRRCQlmf2PCgxqVH51Nsy5|2016-10-30T03:10:17.874Z|2016-10-30T03:10:17.874Z

而你建立这个关系的代码如下：


```objc
AVInstallation *currentInstallation = [AVInstallation currentInstallation];
AVUser *currentUser = [AVUser currentUser];
AVObject *user_installation = [AVObject objectWithClassName:@"user_installation"];
[user_installation setObject:currentUser forKey:@"user"];
[user_installation setObject:currentInstallation forKey:@"installation"];
[user_installation saveInBackground];
```

其中，user 类型是一个指向 `_User` 表的 `Pointer`，installation 是指向 `_Installation` 的 `Pointer`，比如一个用户可能存在如下两条数据，可以理解为一个用户在 iPad 和手机上都登录成功过：

objectId|user|installation|createdAt|updatedAt
----|-----|-----|-----|----
58156499da2f60005dbf70ab|`58156499c4c97100554acaaf`| cSAeHD347fQRRCQlmf2PCgxqVH51Nsy5|2016-10-30T03:10:17.874Z|2016-10-30T03:10:17.874Z
581564992e958a0054999374 | `58156499c4c97100554acaaf` | yOVXDS63SRytpcarrYk0kUWfBAK6yNtx |2016-09-21T07:58:34.015Z|2016-09-21T07:58:34.015Z

这说明有一个用户在两个设备上登录了自己的账户，那么我在针对这个用户做推送的时候，我需要向他的两个设备进行推送，在云引擎中可以使用如下代码操作：


```js
  var userQuery = new AV.Query('user_installation');
  var user = AV.Object.createWithoutData('_User', '58156499da2f60005dbf70ab');
  userQuery.equalTo('user', user);
  userQuery.find().then(function (user_installations) {
      var installationQuery = new AV.Query('_Installation');
      var insIdArray = user_installations.map(function (v, i, a) {
          var ins = v.get('installation');
          return ins.id;
      });
      console.log(insIdArray);
      installationQuery.containedIn('objectId', insIdArray);
      AV.Push.send({
          where: installationQuery,
          data: {
              alert: '苏州明天（2016月11月3日）天气晴，气温最高 18°，最低6°。'
          }
      });
  });
```

注意，使用中间表方式来管理「设备-用户」这种多对多的关系具备很强大的灵活性，比如，你可以在 `user_installation` 这张表里存储一些自定义的属性。

我们不建议开发者在 `_Installation` 表里添加过多的自定义字段，它本身的查询权限是关闭的，我们不允许客户端直接查询 `_Installation` 表，因此利用中间表（或者称之为「关联表」）提高实用性以及预防查询的过载。


### 发送推送消息
LeanCloud 所有的 SDK 都是基于 REST API 的封装，关于这部分的可以参考[使用 REST API 推送消息](https://leancloud.cn/docs/push_guide.html#推送消息)。









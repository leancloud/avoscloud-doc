# 交友类（微信、陌陌）聊天应用开发指南

## 概述
本文旨在引导开发者使用最佳的建模和数据管理方式来构建一个交友类的聊天应用，所涵盖的内容包括但不局限于如下：


- [登录与注册](#登录与注册)
- [好友关系管理和黑名单](#好友关系管理和黑名单)
- [对话创建与消息发送](#对话创建与消息发送)
- [消息记录获取](#消息记录获取)
- [消息的送达回执和已读回执](#消息的送达回执和已读回执)
- [图片语音消息的收发](#图片语音消息的收发)
- [实时视频语音通话](#实时视频语音通话)
- [群聊和讨论组](#群聊和讨论组)
- [群聊的加人和删人](#群聊的加人和删人)
- [离线消息推送](#离线消息推送)
- [系统退出与关闭](#系统退出与关闭)

<!-- - [用户头像存储](#用户头像存储)
- [查找附近的人](#查找附近的人)
- [朋友圈](#朋友圈)
- [最近的对话列表展现](#最近的对话列表展现) -->

## 登录与注册

首先我们推荐使用内置的 AVUser 对象来存储用户

### 注册

```js
var user = new AV.User();
user.username = 'Tom';
user.password = '!23$56';
user.signUp().then(function(user){
    console.log(user.id);
});
```

### 登录

```js
var realtime = new Realtime({
  appId: 'appId'
});
// 用户验证
AV.User.logIn('Tom','!23$56').then(function(user){
    // 打开长连接，登录到聊天服务端
    return realtime.createClient(user);
}).then(function(client){
    console.log('client connected.');
});
```

## 好友关系管理和黑名单

### 用 Friend 表存储好友关系

示例数据如下：

申请人|被申请人|申请状态|申请方式|通过状态|通过方式
--|--|--|--|--|--
A|B|已申请|搜索手机号|尚未通过|N/A
A|C|已申请|搜索昵称|已通过|iOS 端验证通过
A|D|已申请|搜索手机号|已拒绝|iOS 端操作拒绝

保存好友关系代码如下：

```js
var user = AV.User.current();
var bUser = ...//假设从服务端查询了一个用户

var friend = new AV.Object('Friend');
// 好友关系申请者
friend.set('applicant',user);
// 被申请人
friend.set('respondent',bUser);
```

### 获取好友列表

```js
// 当前用户
var currentUser = AV.User.current();

var applicantQuery = new AV.Query('Friend');
// 查找我主动添加的好友
applicantQuery.equalTo('applicant',currentUser);

var respondentQuery = new AV.Query('Friend');
// 查找向我申请加好友的用户
respondentQuery.equalTo('respondent',currentUser);

var friendQuery = AV.Query.or(applicantQuery,respondentQuery);
friendQuery.find().then(friendList =>{
    
    console.log(friendList);
    // friends 为 AV.User 数组，表示我的好友
    var friends = friendList.map(f => {
        var applicant = f.get('applicant');
        var respondent = f.get('respondent');
        if(applicant.id == currentUser.id){
            return respondent;
        } else return applicant;
    });
});
```
上述代码实现的逻辑是我加的好友，以及别人加我为好友的这两种情况都查询出来。

### 黑名单实现

#### 用 Block 表来存储黑名单

示例数据如下：

操作人|被拉黑的人|拉黑方式
--|--|--
A|B|N/A
A|C|iOS 端操作拉黑
A|D|web 端操作拉黑

```js
var user = AV.User.current();
var bUser = ...//假设从服务端查询了一个用户

var friend = new AV.Object('Block');
// 拉黑操作发起人
friend.set('host',user);
// 被拉黑的人
friend.set('block',bUser);
friend.set('way','web');

friend.save();
```

## 对话创建与消息发送

我们已经建立了两个人的好友关系，基于好友关系创建一个专属的对话:

```js
// 用户验证
AV.User.logIn('Tom','!23$56').then(function(user){
    // 打开长连接，登录到聊天服务端
    return realtime.createClient(user);
}).then(function(client){
    console.log('client connected.');
    return client.createConversation(['Jerry']);
}).then(function(conversation){
    console.log('conversation created.');
});
```

对话创建完成之后，开始发送消息：

```js
// 用户验证
AV.User.logIn('Tom','!23$56').then(function(user){
    // 打开长连接，登录到聊天服务端
    return realtime.createClient(user);
}).then(function(client){
    console.log('client connected.');
    return client.createConversation(['Jerry']);
}).then(function(conversation){
    console.log('conversation created.');
    return conversation.send(new AV.TextMessage('您好，我是喵星人 Tom'));
});
```

## 消息记录获取
消息记录可以在加载对话的时候获取一下最新的 10（这个数字一般情况下都是建议小于 1000） 条，用来显示在聊天界面上

详细的使用方法在 SDK 开发指南里面有详细的描述，请参考：

- [JavaScript 实时通信 SDK 接口使用文档-聊天记录](realtime_guide-js.html#聊天记录)
- [iOS 实时通信 SDK 接口使用文档-聊天记录](realtime_guide-objc.html#聊天记录)
- [Android 实时通信 SDK 接口使用文档-聊天记录](realtime_guide-android.html#聊天记录)

<!-- ### 消息记录的查找

注意：目前暂时不支持根据关键字来查找聊天记录，正在计划内，近期发布。 -->

<!-- ### 消息记录导出
目前 iOS 和 Android 在 SDK 中已经实现了消息的缓存功能，可以直接通过通过查询本地的 sqlite 文件来获取聊天记录，并且可以导出成目标的格式的数据。

#### 导出为 json 格式

## 消息的送达回执和已读回执 -->


### 单点登录 - 禁止用户同时登录多个客户端
微信的登录就是强制的单点登录：你在一台手机上登录之后一定会将另一台手机上的同一微信号给踢下线。

要实现这个功能请参考：

- [JavaScript 实时通信 SDK 接口使用文档-单点登录](realtime_guide-js.html#单点登录)
- [iOS 实时通信 SDK 接口使用文档-单点登录](realtime_guide-objc.html#单点登录)
- [Android 实时通信 SDK 接口使用文档-单点登录](realtime_guide-android.html#单点登录)

## 图片语音消息的收发

### 外链图片消息发送

```js
var file = AV.File.withURL('Satomi_Ishihara.gif', 'http://ww3.sinaimg.cn/bmiddle/596b0666gw1ed70eavm5tg20bq06m7wi.gif');
file.save().then(function() {
  var message = new AV.ImageMessage(file);
  message.setText('发自网页版');
  message.setAttributes({ actress: '石原里美' });
  return conversation.send(message);
}).then(function() {
  console.log('发送成功');
}).catch(console.error.bind(console));
```

### 图片和语音消息接收

```js
// 在初始化 Realtime 时，需加载 TypedMessagesPlugin
// var realtime = new Realtime({
//   appId: appId,
//   plugins: [AV.TypedMessagesPlugin,]
// });
// 注册 message 事件的 handler
client.on('message', function messageEventHandler(message, conversation) {
  // 请按自己需求改写
  var file;
  switch (message.type) {
    case AV.TextMessage.TYPE:
      console.log('收到文本消息， text: ' + message.getText() + ', msgId: ' + message.id);
      break;
    case AV.FileMessage.TYPE:
      file = message.getFile(); // file 是 AV.File 实例
      console.log('收到文件消息，url: ' + file.url() + ', size: ' + file.metaData('size'));
      break;
    case AV.ImageMessage.TYPE:
      file = message.getFile();
      console.log('收到图片消息，url: ' + file.url() + ', width: ' + file.metaData('width'));
      break;
    case AV.AudioMessage.TYPE:
      file = message.getFile();
      console.log('收到音频消息，url: ' + file.url() + ', width: ' + file.metaData('duration'));
      break;
    case AV.VideoMessage.TYPE:
      file = message.getFile();
      console.log('收到视频消息，url: ' + file.url() + ', width: ' + file.metaData('duration'));
      break;
    case AV.LocationMessage.TYPE:
      var location = message.getLocation();
      console.log('收到位置消息，latitude: ' + location.latitude + ', longitude: ' + location.longitude);
      break;
    default:
      console.warn('收到未知类型消息');
  }
});
```

更多自定义消息类型请查看：

- [JavaScript 实时通信 SDK 接口使用文档-富媒体消息](realtime_guide-js.html#富媒体消息)
- [iOS 实时通信 SDK 接口使用文档-富媒体消息](realtime_guide-objc.html#富媒体消息)
- [Android 实时通信 SDK 接口使用文档-富媒体消息](realtime_guide-android.html#富媒体消息)

## 实时视频语音通话

LeanCloud 并不提供视频/音频流服务，但是经过许多客户的推荐和反馈，直接在聊天中接入第三方的服务也是很方便的。

假设正在开发的聊天应用需要视频通话、语音通话和直播功能，我们推荐以下服务商：

### 声网 - agora.io

声网提供直播/视频通话/音频通话 三个模块化的云服务，配合 LeanCloud 实现一个微信的私聊功能完全没问题。

- [全互动直播](https://www.agora.io/cn/broadcast/)
- [视频通话](https://www.agora.io/cn/videocall/)
- [音频通话](https://www.agora.io/cn/audiocall/)


## 群聊和讨论组

群聊与私聊本质上就是对话的参与人数的不同，因此在 LeanCloud 系统中不区分群聊和私聊，这个完全交由开发者自己去管理那些对话是群聊，哪些是私聊。

如下代码将创建一个拥有拥有 3 个人的群聊:


```js
// 用户验证
AV.User.logIn('Tom','!23$56').then(function(user){
    // 打开长连接，登录到聊天服务端
    return realtime.createClient(user);
}).then(function(client){
    console.log('client connected.');
    return client.createConversation(['Jerry','Harry']);
}).then(function(conversation){
    console.log('group chat conversation created.');
});
```

对比之前的私聊可以发现， 仅仅实在创建对话的时候传入的成员数量上有所区别，其余的代码是一样的。

创建对话的时候有更多的选项，可以参考 SDK 开发指南:

- [JavaScript 实时通信 SDK 接口使用文档-对话](realtime_guide-js.html#对话)
- [iOS 实时通信 SDK 接口使用文档-对话](realtime_guide-objc.html#对话)
- [Android 实时通信 SDK 接口使用文档-对话](realtime_guide-android.html#对话)

## 群聊的加人和删人

群聊的加人和删人都是针对对话来操作的，例如下面的代码将会把 `Mary` 加入到对话:

```js
conversation.add(['Mary']).then(function(conversation) {
  console.log('添加成功', conversation.members);
  // 添加成功 ['Bob', 'Harry', 'William', 'Tom', 'Mary']
}).catch(console.error.bind(console));
```

下面的代码实现从对话中删除成员 `William`:

```js
conversation.remove(['William']).then(function(conversation) {
  console.log('删除成功', conversation.members);
  // 添加成功 ['Bob', 'Harry', 'William','Mary']
}).catch(console.error.bind(console));
```

而成员变更是会触发通知事件的，在对话内的成员都会收到事件通知，详细请参考 SDK 开发指南:

- [JavaScript 实时通信 SDK 接口使用文档-对话的成员管理](realtime_guide-js.html#对话的成员管理)
- [iOS 实时通信 SDK 接口使用文档-对话的成员管理](realtime_guide-objc.html#对话的成员管理)
- [Android 实时通信 SDK 接口使用文档-对话的成员管理](realtime_guide-android.html#对话的成员管理)

## 离线消息推送

正在聊天的时候，对方如果切换到其他应用或者下线了，就会触发离线消息的推送机制，目前在 iOS 和 Android 上是自动帮用户做了离线消息推送，并且也支持用户自定义推送的内容，例如微信的一个功能：在离线的时候如果收到一张图片消息，它会直接在推送栏里面显示： `xxx:[图片] ` 这样的推送内容，提高用户体验。

如下代码实现的在发消息的时候指定消息的离线推送内容:

```js
var realtime = new Realtime({ appId: '', region: 'cn' });
realtime.createIMClient('Tom').then(function (host) {
    return host.createConversation({
        members: ['Jerry'],
        name: 'Tom & Jerry',
        unique: true
    });
}).then(function (conversation) {
    console.log(conversation.id);
    return conversation.send(new AV.TextMessage('耗子，今晚有比赛，我约了 Kate，咱们仨一起去酒吧看比赛啊？！'), {
        pushData: {
            "data": {
                "alert": "Jerry: 耗子，今晚有比赛，我约了 Kate...",
                "category": "消息",
                "badge": 1,
                "sound": "default",
            }
        }
    });
}).then(function (message) {
    console.log(message);
}).catch(console.error);
```

更多关于更多发送消息时的参数选项可以参考 SDK 开发指南：

- [JavaScript 实时通信 SDK 接口使用文档-消息发送选项](realtime_guide-js.html#消息发送选项)
- [iOS 实时通信 SDK 接口使用文档-消息发送选项](realtime_guide-objc.html#消息发送选项)
- [Android 实时通信 SDK 接口使用文档-消息发送选项](realtime_guide-android.html#消息发送选项)



## 系统退出与关闭

当用户决定退出登录，不再接收消息时，需要主动的调用关闭的接口:


```objc
[self.client closeWithCallback:^(BOOL succeeded, NSError *error) {
    //成功退出了登录，并不再接收离线消息推送
}];
```
```java
AVIMClient tom = AVIMClient.getInstance("Tom");
tom.open(new AVIMClientCallback(){

  @Override
  public void done(AVIMClient client,AVIMException e){
      if(e==null){
        //登录成功
        client.close(new AVIMClientCallback(){
            @Override
            public void done(AVIMClient client,AVIMException e){
                if(e==null){
                //登出成功
                }
            }
        });
      }
  }
});
```

- [iOS 实时通信 SDK 接口使用文档-退出登录](realtime_guide-objc.html#退出登录)
- [Android 实时通信 SDK 接口使用文档-退出登录](realtime_guide-android.html#退出登录)

退出之后不会再收到离线消息推送，类似于微信的关闭微信的效果。




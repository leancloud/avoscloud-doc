# 交友类（微信、陌陌）聊天应用开发指南

## 概述
本文旨在引导开发者使用最佳的建模和数据管理方式来构建一个交友类的聊天应用，所涵盖的内容包括但不局限于如下：

- 登录与注册
- 好友关系管理和黑名单
- 对话创建与消息发送
- 消息记录获取和保存
- 消息的送达回执和已读回执
- 多端消息同步
- 图片语音消息的收发
- 实时视频语音通话
- 群聊与对话类型
- 群聊的加人和删人
- 离线消息推送
- 系统退出与关闭

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

### 黑名单实现

#### 用 Block 表来实现

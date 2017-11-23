# OAuth 关联 AVUser 开发指南

## 必备知识点

- OAuth 授权协议|[OAuth Wiki](https://en.wikipedia.org/wiki/OAuth)|[OAuth 认证流程详解](http://www.jianshu.com/p/0db71eb445c8)
- 比较知名的开放了 OAuth 授权的互联网服务商：

产品名称|OAuth-网站版|OAuth-移动应用版
--|--
新浪微博|[微博开放平台 OAuth](http://open.weibo.com/wiki/Oauth)|[微博移动应用SSO授权](http://open.weibo.com/wiki/移动应用SSO授权)
微信|[微信开放平台网站应用开发](https://open.weixin.qq.com/cgi-bin/frame?t=home/web_tmpl&lang=zh_CN)|[微信开放平台移动应用开发](https://open.weixin.qq.com/cgi-bin/frame?t=home/app_tmpl&lang=zh_CN)

### 应用类型的区分（重要概念）

> Q： 为什么各大厂商会要求开发者在创建 OAuth 应用的时候一定要严格区分网站应用和移动应用？

主要原因有如下几个：

1. 用户信的息安全性（核心原因） - 移动应用的授权一般情况下需要开发者在自己的应用内集成当前厂商提供的授权 SDK，而开发者只需要配置一下自己申请的应用信息就可以最快的速度拿到授权信息并且这种方式是**较为安全**的，也是各大厂商比较推荐的方式，甚至有一些厂商会明确指出如果您创建的移动应用，但是你在手机端却采用内置 WebView 走完整个 OAuth 授权拿到了用户的授权信息，这种行为一旦被厂商发觉，他们甚至会封杀您的第三方应用。
2. 厂商自身服务的安全性 - 大部分厂商都会以开放的 REST API 的方式提供数据的访问接口，但是也因为会暴露一些安全问题，例如某一个应用的 App Id 被恶意的用来扫描数据或者一些网络爬虫用来做非正常业务的访问，这个时候如果区分了网站类应用和移动应用，厂商可以迅速的针对网站应用的 App Id 进行封杀，不至于影响到这个第三方开发者的移动应用。
3. 应用场景不同 - 网站类的应用一般意义上会有自己垂直领域的服务内容可能会与厂商自身的业务内容产生竞争，因此各大厂商针对网站类应用都比较谨慎，而且开放出来的 REST API 都比较谨慎，功能相对于厂商提供的移动端 SDK 会有所削减，比如微信的网页版登录只能用来登录，是不可以直接从网站上去发布朋友圈的。


## 网站应用的 OAuth 授权与 AVUser 的绑定

网站应用我们采用微博授权为例

### 1. 申请微博的网站应用

请参阅官方文档：[微博开放平台-网站接入](http://open.weibo.com/connect)

### 2. 发起微博授权

首先建议您阅读[微博 OAuth 授权验证回调服务器开发指南](webhosting_oauth.html)

走完上述教程里面流程，一定可以学会 OAuth 授权的基本流程。

### 3. 拿到微博返回的授权信息

在完成 OAuth 授权之后，微博会返回一个如下的 json 对象给您设置的回调服务器：

```json
{
    "access_token": "SlAV32hkKG",
    "remind_in": 3600,
    "expires_in": 3600 
}
```

### 4. 调用 LeanCloud SDK 提供的接口，传入微博的授权信息(Auth Data)创建一个新的 AVUser 

在调用 AV.User.signUpOrlogInWithAuthData 的时候，需要使用传入返回的 auth data ，并且明确告知云端这个 auth data 的服务商标识是微博(weibo)

```js
AV.User.signUpOrlogInWithAuthData({
    access_token: "SlAV32hkKG",
    remind_in: 3600,
    expires_in: 3600},'weibo').then(user =>{
        console.log('user',user);
    });
```

此时可以打开控制台，查看是否有新增的用户，如果成功了会看见如下图一样的内容：



### 如何区分新用户的注册和老用户的登录？

首先，LeanCloud 云端已经在内部做了处理，逻辑如下：

调用 signUpOrlogInWithAuthData 的时候我们需要传入的 auth data 对应的厂商标识(例如 weibo)，云端会进行搜索和比对，如果发现在同一个厂商标识下存在多个已授权信息，就会用本次传入的 auth data 里面的信息进行比对，如果发现有相同的 access_token，则会认为当前操作是老用户登录而不会重新创建信的 _User 对象。

### 如何为老用户绑定更多的第三方授权信息？

首先，用户必须已经登录，然后可以调用 AV.User 的实例方法：

```js
AV.User.associateWithAuthData({
    access_token: "SlAV32hkKG",
    remind_in: 3600,
    expires_in: 3600},'weibo').then(associated =>{
        console.log('');
    });
```


## 常备知识点

### 1. 常见的登录页面
如下界面是大多数网站应用的基本需求：

![oauth-login-sample](images/oauth-login-sample-.jpg)

因此，您的网站最好需要针对微博，微信和 QQ 等开放平台单独配置一个专门用来处理 OAuth 回调的路由例如，可以在云引擎里面配置如下路由：

```
https://{您设置的云引擎二级域名}.leanapp.cn/weibo/oauthcallback
https://{您设置的云引擎二级域名}.leanapp.cn/weixin/oauthcallback
https://{您设置的云引擎二级域名}.leanapp.cn/qq/oauthcallback
```

然后分别在回调的页面分别针对不同的 Auth Data 创建用户








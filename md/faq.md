# LeanCloud FAQ

## 账户和平台常见问题

### LeanCloud 部署在哪个云平台上

LeanCloud 部署在国内多个云计算平台上，并采用在双线机房内同时使用虚拟机和实体机的混合部署策略，来保证应用的访问体验和可靠性。

### 获取客服支持有哪些途径

* 访问 [技术问答社区](https://forum.leancloud.cn/)，进行提问。
* 登录进入官网 [控制台](/applist.html)，选择页面顶部菜单：**帮助** > **技术支持**，进入工单系统，提交问题。
* 发送邮件到 <support@leancloud.rocks>，获取帮助。
* 紧急情况拨打客服电话：010-82800646。

### 计费是基于账号还是应用

计费都基于用户账号，详细信息请参考 [价格](/pricing.html) 页面。

### 如果没有缴费会怎么样

账单逾期四周未缴，账户服务将被停止；应用数据被置于不可见模式，但仍会在 LeanCloud 云端保留一个月。如需要恢复服务和访问应用数据，请登录控制台，支付欠款。

我们为账单支付提供一段缓冲期，请在收到账单的十天内完成缴费即可。在此期间，我们会通过邮件或者电话等方式与您联系，因此强烈建议完整填写 [开发者信息](/settings.html#/setting/info)，以免错过我们的提醒和最佳付款时机。

### 如何付费

* 支付宝 [充值](/bill.html#/bill/charge)

  我们将每个月自动从您的账户余额里扣除上月账单的费用。每次扣费优先使用充值金额，其次是赠送金额。

* 对公账户付款

  公司名称：**美味书签（北京）信息技术有限公司**  
  开户　行：**中国银行北京大运村支行**  
  银行账号：**344159259324**  

### 如何申请开具发票

* 申请开发票前，请先按系统要求，完善所有必填的用户信息。

* 无论采取哪一种付款方式，只有当累计支付金额达到人民币**壹仟元**后系统才允许申请，单笔开票金额不低于人民币**壹仟元**。

* 如有特别需求，如按月度账单金额结算，或先开发票后付款，请联系我们的市场部专员 <business@leancloud.rocks>，QQ号：2607695496。

* 开具发票时段为每月 10 日至 30 日，发票以快递寄送。如需开具增值税专用发票，也请联系我们的市场部专员。

* 发票免费邮寄。


### 哪里获取平台的更新信息

通常情况下，我们新版本的更新周期为一到两周。获取更新信息可以通过：

* [官方博客](http://blog.leancloud.cn/)（每次更新的详细信息都会发布在那里）
* [官方微博](http://weibo.com/avoscloud)
* 每月初，我们会将每月的更新摘要发送到您的注册邮箱。
* 控制台页面的右上方有一个 **消息中心** 功能，请注意查看新通知。

### API 开放吗

我们的 API 完全开放。我们提供的 SDK 也都是基于开放 API 实现的。详情请阅读 [REST API 详解](/docs/rest_api.html)。

### 提供哪些平台的 SDK

目前官方提供的 SDK 种类包括：

* iOS 和 OS X
* Android
* JavaScript
* Windows Phone
* Unity

来自第三方的开源项目有：

* [C#](https://github.com/freewing99/BaasReponsitory)
* [PHP](https://github.com/killme2008/avoscloud-php-library)

详情请访问 [SDK 下载](/docs/sdk_down.html) 页面。

### iOS 和 Android 是否可以使用同一个 App

当然可以。使用我们的 SDK，可以为同一个应用开发多个平台的版本，共享后端数据。


### Unity 3D 支持如何

请到 [SDK 下载](https://leancloud.cn/docs/sdk_down.html) 页面，下载 Unity SDK。

### 开发文档有提供搜索功能吗

官网 **文档** 首页右上角就有搜索框，也可以直接访问 [搜索](/search.html) 页面。

## API 相关

### 可以在线测试 API 吗

请访问 [API 在线测试工具](/apionline/)。

### 403 错误

403 错误分为两类：

* 错误信息 `The user cannot be altered by a client without the session.`：用户没有登录，无法修改用户信息。
* 错误信息 `Forbidden to write by class permissions.` 或者 `Forbidden to read by class permissions.`：想要修改的 class 表没有打开「读」或者「写」的权限。在 [数据](/data.html) 管理平台，点击相应的 class，在右侧选择 **其他** 下拉菜单，进入 **权限管理** 来设置 class 权限。

![image](images/permission.png)

### Unauthorized 错误

应用 API 授权失败，请检查是否初始化了 App Id 和 App Key。

* 如何进行初始化，请查看 [快速入门](/start.html)。
* App Id 和 App Key 在应用的 **设置** 菜单里可以找到。

### 错误信息代码和详细解释在哪里

* [错误代码详解](./error_code.html)
* iOS SDK：[AVConstants](/docs/api/iOS/docs/AVConstants.html)
* Android SDK：[AVException](/docs/api/android/doc/index.html)

REST API 返回的错误信息跟 SDK 保持一致。

### 其他语言调用 REST API 如何对参数进行编码

REST API 文档使用 curl 作为示范，其中 `--data-urlencode` 表示要对参数进行 URL encode 编码。如果是 GET 请求，直接将经过 URL encode 的参数通过 `&` 连接起来，放到 URL 的问号后。如 `https://leancloud.cn/1.1/login?username=xxxx&password=xxxxx`。

### 如何实现大小写不敏感的查询

目前不提供直接支持，可采用正则表达式查询的办法，具体参考 [StackOverflow 的帖子](http://stackoverflow.com/questions/1863399/mongodb-is-it-possible-to-make-a-case-insensitive-query)。

使用各平台 SDK 的 AVQuery 对象提供的 `matchesRegex` 方法（Android SDK 用 `whereMatches` 方法）。


### 应用内用户的密码需要加密吗

不需要加密密码，我们的服务端已使用随机生成的 salt，自动对密码做了加密。 如果用户忘记了密码，可以调用 `requestResetPassword` 方法（具体查看 SDK 的 AVUser 用法），向用户注册的邮箱发送邮件，用户以此可自行重设密码。 在整个过程中，密码都不会有明文保存的问题，密码也不会在客户端保存，只是会保存 sessionToken 来标示用户的登录状态。

### API 调用次数有什么限制吗

我们每个月提供 100 万次的免费额度，超过的部分才收费。免费额度不会将完全免费的推送服务和统计服务计算进去。另外，对于免费版和专业版，默认情况下，每个应用都有每秒 1000 次的并发访问上限，如果需要提高上限，请与我们联系。

对于从控制台或者使用 JavaScript SDK 上传文件（包括云代码内），我们限制每秒最多上传 1 个文件，一分钟内最多上传 30 个文件。


## 控制台相关

### 如何导入或者导出数据？

请参考《数据与安全》文档的 [导入数据](./data_security.html#导入数据) 和 [导出数据](./data_security.html#导出数据) 部分。


### 如何在 App 邮件内完全使用自己的品牌

请参考博文 [《自定义应用内用户重设密码和邮箱验证页面》](http://blog.leancloud.cn/blog/2014/01/09/zi-ding-yi-ying-yong-nei-yong-hu-zhong-she-mi-ma-he-you-xiang-yan-zheng-ye-mian/)。

### 创建唯一索引失败

请确认想要创建索引的列没有已经存在的重复值。

### 如何上传文件

任何一个 Class 如果有 File 类型的列，就可以直接在 **数据** 管理平台中将文件上传到该列。如果没有，请自行创建列，类型指定为 File。

### 如何在应用之间共享数据

请参考这篇 [博文](http://blog.leancloud.cn/blog/2014/03/31/2014nian-3yue-di-4zhou-avos-cloud-geng-xin/)。

## iOS/OS X SDK

### 安装 Cocopods 失败怎么解决

推荐使用淘宝提供的 Gem 源，访问 [http://ruby.taobao.org/](http://ruby.taobao.org/)。

```sh
$ gem sources --remove https://rubygems.org/
$ gem sources -a http://ruby.taobao.org/
$ gem sources -l
*** CURRENT SOURCES ***
http://ruby.taobao.org
# 请确保只有 ruby.taobao.org
$ gem install cocoapods
```

### 编译失败

#### Symbol(s) not found x86_64

请使用 32 位模拟器进行编译和调试.

#### Undefined symbols for architecture

一般是由于 Framework 的链接找不到造成的，建议用 CocoaPods 更新一下。没使用 CocoaPods 的项目可以删除对 Framework 的引用，然后再重新加进来。

LeanCloud 依赖的 Framework 包括：

* SystemConfiguration.framework
* MobileCoreServices.framework
* CoreTelephony.framework
* CoreLocation.framework

如果是 `for architecture arm64`，这是因为 Xcode 更新到 5.1 后，CocoaPods 没有及时更新对 64 位 CPU 的支持，解决方法参考 [这里](http://stackoverflow.com/questions/19213782/undefined-symbols-for-architecture-arm64)

### 请求报错

请查阅请求返回的错误码的 [详细说明](/docs/error_code.html)。

### 地理位置查询错误

如果错误信息类似于 `can't find any special indices: 2d (needs index), 2dsphere (needs index), for 字段名`，就代表用于查询的字段没有建立 2D 索引，可以在 Class 管理的 **其他** 菜单里找到 **索引** 管理，点击进入，找到字段名称，选择并创建「2dsphere」索引类型。

![image](images/geopoint_faq.png)


## Android SDK

### 对 AVObject 对象使用 getDate("createdAt") 方法读取创建时间为什么会返回 null

请用 `AVObject` 的 `getCreatedAt` 方法；获取 `updatedAt` 用 `getUpdatedAt`。

## JavaScript SDK

### 有没有同步 API

JavaScript SDK 由于平台的特殊性（运行在单线程运行的浏览器或者 Node.js 环境中），不提供同步 API，所有需要网络交互的 API 都需要以 callback 的形式调用。我们提供了 [Promise 模式](https://leancloud.cn/docs/js_guide.html#promise) 来减少 callback 嵌套过多的问题。

## 消息推送

### 推送的到达率如何

关于到达率这个概念，业界并没没有统一的标准。我们测试过，在线用户消息的到达率基本达到 100%。我们的 SDK 做了心跳和重连等功能，尽量维持对推送服务器的长连接存活，提升消息到达用户手机的实时性和可靠性。

### 推送是基于 XMPP 还是其他协议

老版本推送基于 XMPP 协议，v2.4.1 版本开始，推送采用了 WebSocket 协议，方便支持多平台，包括将要推出的 Web 端消息推送功能。

### iOS 推送如何区分测试证书和生产证书

暂不提供在同一个 App 里同时上传测试证书和生产证书。推荐创建单独的测试 App，可以利用数据导出和导入来快速模拟生产环境。

### Android 消息接收能不能自定义 Receiver 不弹出通知

可以。请参考 [消息推送开发指南](/docs/push_guide.html#%E8%87%AA%E5%AE%9A%E4%B9%89-receiver)。

如果要自定义 receiver，必须在消息的 data 里带上自定义的 action。LeanCloud 在接收到消息后，将广播 action 为您定义的值的 intent 事件，您的 receiver 里也必须带上 `intent-filter` 来捕获该 action 值的 intent 事件。

## 统计

### 统计服务免费吗

统计服务完全免费，不占用每月的 API 免费额度。

### 统计服务支持哪些平台

目前支持

* iOS
* OS X
* Android

更多平台 SDK 正在开发中。

### 统计支持哪些发送策略

* 启动时发送（默认策略，推荐使用）
* 批量发送
* 按最小间隔发送

可以在 **分析** > **Android（或者iOS）统计** > **统计设置** > **数据发送策略** 的菜单里实时修改这些策略。

## 云代码

### 定时器 crontab 的语法

请参考 [Quartz 文档](http://www.quartz-scheduler.org/documentation/quartz-1.x/tutorials/crontrigger)。

### 云端代码为什么只支持 Node.js

因为我们官方目前只提供了 JavaScript SDK 和运行沙箱环境，暂时只支持 Node.js。未来可能会引入 PHP 等其他语言。

### 云代码如何上传文件

请参考这篇 [博文](http://blog.leancloud.cn/blog/2013/11/23/zai-yun-dai-ma-zhong-chu-li-shang-chuan-wen-jian/)，或者 [ 云代码指南](https://leancloud.cn/docs/cloud_code_guide.html#%E4%B8%8A%E4%BC%A0%E6%96%87%E4%BB%B6) 中的相关内容。

### 云代码中如何处理用户登录和 Cookie

请参考这篇 [博文](http://blog.leancloud.cn/blog/2013/12/16/zai-yun-dai-ma-zhong-chu-li-yong-hu-deng-lu/)，或者 [云代码指南](https://leancloud.cn/docs/cloud_code_guide.html#%E5%A4%84%E7%90%86%E7%94%A8%E6%88%B7%E7%99%BB%E5%BD%95%E5%92%8C%E7%99%BB%E5%87%BA) 中的相关内容。


### 云代码的二级域名多久生效

我们设置的 TTL 是 10 秒，但是因为使用 Amazon 的 DNS 服务，因此可能国内部分地区会有一定延迟，最迟应该在 24 小时内生效。如果没有，请及时联系我们处理。

### 云代码二级域名可以启用 HTTPS 吗

请参考这篇 [博文](http://blog.leancloud.cn/blog/2013/12/20/wei-yun-dai-ma-tuo-guan-wang-zhan-qi-yong-https/)。

### 云代码 Web Hosting 备案

只有网站类的才需要备案，并且在主域名已备案的情况下，二级子域名不需要备案。

如果主站需要托管在我们这边，而且主站还没经过备案，请参考《云代码指南》中 [域名备案流程](/docs/cloud_code_guide.html#域名备案流程) 部分来了解具体的备案流程。

## 文件

### 文件存储有 CDN 加速吗？

有的。我们的文件存储目前由 [七牛](http://qiniu.com) 提供，都有 CDN 加速访问。

### 文件存储有大小限制吗？

没有。除了在浏览器里通过 JavaScript SDK 上传文件，或者通过我们网站直接上传文件，有 10 MB 的大小限制之外，其他 SDK 都没有限制。 JavaScript SDK 在 Node.js 环境中也没有大小限制。

### 存储图片可以做缩略图等处理吗？

可以。默认我们的 `AVFile` 类提供了缩略图获取方法，可以参见各个 SDK 的开发指南。如果要自己处理，可以通过获取 `AVFile` 的 `URL` 属性，使用 [七牛图片处理 API](http://docs.qiniu.com/api/v6/image-process.html) 执行处理，例如添加水印、裁剪等。

## 短信

### 短信 100 条的免费额度是针对每个账户还是每个应用？

每个 LeanCloud 账户拥有 100 条免费的短信测试额度，不是每个应用。使用完毕就需要付费。可以通过 [充值](/bill.html#/bill/charge) 菜单来购买短信。

### 短信的到达率如何？

我们通过接入多个短信提供商来提升短信的到达率。从我们实际使用来看，整体的到达率还是令人满意的。但是请注意，短信是无法保证 100% 送达，因此，除了短信之外，应该加入其他备份手段来向用户提供应用的重要功能。

### 短信签名是什么？必须的吗？
根据运营商的要求，短信签名是必须的。短信签名是指短信里 `【】` 括起来的短信发送方名称。我们只允许自定义短信模板的用户自定义签名，其他用户都使用应用名称。
**短信签名限制在 10 个字符内，应用名称可以在应用设置里修改，并且短信签名必须出现在短信内容的开头或者结尾。**

### 短信有什么限制吗？

针对验证码类短信，有两个限制：

* 针对同一个手机号码，一分钟只能发送一条验证码短信。
* 每天只能发送 10 条验证短信给同一个手机号码。

以上限制对测试手机号码也同样有效。

通知类短信没有流控限制。但是我们禁止下列短信：

* 推广营销用途
* 包含不明下载地址
* 涉及色情、政治等法律禁止情况

如果涉及上述不正当用途，我们将停止您的短信使用权限。

### 短信支持港澳台和国外吗？

抱歉，暂时不支持。我们将尽快支持。

### 短信余额不足有预警通知吗？

有。请在 [开发者帐户](/settings.html#/setting/info) 里填写手机号码，我们将提前通过邮件和短信的方式向您 发送告警信息。



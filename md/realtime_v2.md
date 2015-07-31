# 实时通信服务开发指南

实时通信服务是 LeanCloud 消息服务中的重要一环。通过它，你不但可以在应用中加入实时聊天、私信等，更可以用来实现游戏对战等实时互动功能。

目前，我们提供 Android、iOS、JavaScript、Windows Phone 四个主要平台的客户端 SDK，也提供了一些 Demo 帮助您快速入门：

* iOS 聊天应用：
  * [LeanMessageDemo iOS 版](https://github.com/leancloud/LeanMessage-Demo) (推荐)
  * [LeanChat iOS 版](https://github.com/leancloud/leanchat-ios)

* Android 聊天应用：
  * [LeanMessageDemo Android 版](https://github.com/leancloud/LeanMessage-Demo) (推荐)
  * [LeanChat Android 版](https://github.com/leancloud/leanchat-android)

* JavaScript 聊天应用
  * [聊天 Demo](http://leancloud.github.io/js-realtime-sdk/demo/demo2/) (可与 iOS/Android 版 LeanMessageDemo 通信)
  * [Demo 源码](https://github.com/leancloud/js-realtime-sdk/tree/master/demo)

关于这些项目的更多介绍、截图预览，可见 [LeanCloud Demos](https://github.com/leancloud/leancloud-demos) 。

目前新版本实时通信服务接口与旧版本并不兼容，不能互相通信。我们推荐所有新用户直接使用新版本。已有的旧版本用户可以继续参考 [v1 版本文档](./realtime.html)，我们仍然会对已有版本提供支持，并可能在未来提供无缝的迁移方案。已经发布的旧版本用户不会在功能、资源等各个方面受到任何影响，请放心使用。

## 功能和特性

LeanCloud 实时通信服务定位于完美实现网络层的通讯能力，所以设计目标聚焦在：

* **快捷**  
  LeanCloud 云端要能支持上亿终端同时在线，并且消息传递延时需要严格控制在毫秒以内。
* **灵活**  
  既要为完全依托 LeanCloud 平台的开发者考虑，也要为自有账户系统的用户设计：如果用户自己有完备的后台和账户系统，应该完全不用暴露内部数据就能使用我们的服务。而且，消息通知的手段要多样化，要让开发者有更多定制的能力。譬如聊天时对方不在线，应该能走 Push Notification 通道来及时提醒对方，Push 消息的内容还应该能让开发者进行「私人定制」，等等。
* **安全**  
  除了简单的 appId 和 secretKey 之外，还应该赋予开发者更多的安全控制能力，来保证聊天通道的私密性。

LeanCloud 实时通信服务的特性主要有：

* **与账户系统解耦合**  
  任何终端用户要加入聊天，只需要提供一个唯一标识自己的 clientId 即可，这样可以尽量避免自有账户系统的应用数据暴露，也可以促使通信服务专注做好底层的「信使」角色；
* **多账号登录**  
  支持单个设备多个账号、单个账号多个设备同时登录，实时消息同步到所有设备。
* **完整的聊天功能**  
  支持单聊、群聊、聊天室等不同聊天形式，并且具备完善的群组管理功能。
* **支持富媒体、自定义类型消息**  
  支持文本、图片、音频、视频和地理位置等多种格式的富媒体消息，并且开发者还可方便地自定义扩展；
* **离线消息推送**  
  消息在对方离线时，会自动通过 [消息推送（Push Notification）](#聊天离线时可以推送吗_) 来及时送达对方，并且推送的消息文本可以由开发者自己控制；
* **敏感词过滤**  
  实时消息中出现的敏感词，会自动被过滤掉；对于部分 VIP 客户，我们还允许自定义仅属于自己应用的敏感词列表。
* **聊天记录保存在云端**  
  聊天记录自动保存在云端，允许开发者自由获取。
* **第三方操作鉴权机制**  
  为了保证信道的安全，也给开发者最大的控制自由，我们提供了操作鉴权的机制：开发者使用自己的服务器来充当鉴权服务器，对消息流向进行许可控制。对于消息路由过程中的重要操作（譬如登录、开启对话、邀请加入群组、从群组踢出某人，等），实时消息 SDK 在发送请求之前，会先到鉴权服务器获得操作签名，LeanCloud 云端会验证签名有效性并完全按照鉴权结果来对操作放行或拒绝。

## 核心概念

### clientId

实时通信服务中的每一个终端称为一个 client。client 拥有一个在应用内唯一标识自己的 id。这个 id 由应用自己定义，必须是不多于 64 个字符的字符串。

在大部分场合，这里的 client 都可以对应到应用中的某个「用户」，但是并不是只有真的「用户」才能当成这里的 client，你完全可以把一个探测器当成一个 client，把它收集到的数据通过实时通信服务广播给更多「人」。

LeanCloud 的通信服务允许一个 clientId 在多个不同的设备上登录，也允许一个设备上有多个 clientId 同时登录。开发者可以根据自己的应用场景选择合适的使用方式。

### 对话（Conversation）

用户登录之后，与其他人进行消息沟通，即为开启了一个对话（Conversation）。开始聊天之前，需要先创建或者加入一个对话，然后再邀请其他人进来，之后所有参与者在这个对话内进行交流。所有消息都是由某一个 client 发往一个「对话」。

对话支持如下默认属性：

属性名|类型|约束|说明
:---|:---|:---:|:---
attributes|Object|可选|自定义属性供开发者自己扩展用。
conversationId|String||对话 id（只读），对话创建之后由 LeanCloud 云端赋予一个全局唯一的 id。
creator|String||对话创建者的 clientId（只读），标识对话创建者信息
members|Array||对话参与者，这里记录了所有的参与者
mute|Array||将对话设为静音的参与者，这部分参与者不会收到推送。
name|String|可选|对话的名字，可用来对于群组命名。
transient|Boolean||表示对话是否为暂态对话

每创建一个对话，就会在 LeanCloud 后台 _Conversation 表中增加一条记录，这可以在 LeanCloud 控制台 > **应用** > **存储** > **数据** 里面看到。各属性与 _Conversation 表中字段名的对应关系为：

属性名|_Conversation 表字段名|类型
:---|:---|:---
attributes|attr|Object
conversationId|objectId|String
creator|c|String
members|m|Array
mute|mu|Array
name|name|String
transient|tr|Boolean

除了在各平台的 sdk 里面可以调用 API 创建对话外，我们也提供 [REST API](./realtime_rest_api.html#通过_REST_API_创建_更新_删除对话数据) 可以让大家预先建立对话：对话的信息存储在 `_Conversation` 表中，你可以直接通过[数据存储相关的 REST API](./rest_api.html#%E5%AF%B9%E8%B1%A1-1) 对其进行操作。

这里要特别讨论一下**单聊**、**群聊**、**聊天室**的概念。

* **单聊**  
  就是两个 client 之间的对话，公开与否（能否让其他人看到这个对话存在）由应用层自己控制。一般而言，它是私密的，并且加入新的成员之后，会切换到新的对话（当然，也可以依然不离开当前对话，这一点还是由应用层来决定）。
* **群聊**  
  就是两个（含）以上 client 之间的对话，一般而言，可以添加和删除成员，并且会赋予群聊一个名字。随着成员的减少，群聊也可能只有两个甚至一个成员（成员的多少并不是区分群聊和单聊的关键）。群聊能否公开（譬如支持名字搜索），由应用自己决定。
* **聊天室**  
  很多应用使用的开放聊天室、弹幕、网页直播等都可以抽象成「聊天室」，它与群聊类似，都是多人参与的群组，但是也有一些区别：其一在于聊天室人数可能远大于群聊人数；其二在于聊天室强调的是在线人数，所有参与者进入聊天界面就算加入，关闭界面就算退出，所以聊天室不需要离线消息和推送通知，在线成员数比具体成员列表更有意义。

LeanCloud 实时通信服务统一使用「对话」来表示这三种使用场景，为了支持「聊天室」的需求，我们分离出了两种对话：

#### 普通对话（Normal Conversation）

就是我们经常会用到的「对话」，单聊和群聊都可以通过它来实现。我们建议开发者将单聊/群聊、私密/公开等属性存入到 `Conversation.attributes` 之中，在应用层进行区别对待。

#### 暂态对话（Transient Conversation）

这是专门用来处理「聊天室」这种需求的。与普通对话一样，它也支持创建、加入/踢出成员等操作，消息记录会被保存并可供获取；但根据应用场景，暂态对话与普通对话在功能上存在一定的取舍，具体为：

* 暂态对话不支持查询成员列表，你可以通过相关 API 查询在线人数。
* 暂态对话不支持离线消息、离线推送通知等功能。
* 暂态对话没有成员加入、离开的通知。
* 一个用户一次登录只能加入一个暂态对话，加入新的暂态对话后会自动离开旧的暂态对话。
* 加入暂态对话后半小时内断网重连会自动加入原暂态对话，超过这个时间则需要重新加入。

### 消息（Message）

实时通信服务的消息。我们的消息允许用户一次传输不超过 **5 KB** 的文本数据。开发者可以在文本协议基础上定义自己的应用层协议。

消息分为「普通消息」和「暂态消息」。LeanCloud 云端对于普通消息会提供接收回执、自动持久化存储、离线推送等功能。但是暂态消息，则不会被自动保存，也不支持延迟接收，离线用户更不会收到推送通知，所以适合用来做控制协议。譬如聊天过程中「某某正在输入中...」这样的状态信息，就适合通过暂态消息来发送，而用户输入的正式消息，则应该用普通消息来发送。

为了方便开发者使用，我们提供了几种封装好的富媒体消息类型（TypedMessage），譬如：

- 文本（TextMessage）
- 图片（ImageMessage）
- 音频（AudioMessage）
- 视频（VideoMessage）
- 位置（LocationMessage）
 
这些消息类型可最大程度地简化使用步骤，能更好地满足通用需求。开发者也可以基于我们的框架，方便地扩展出自己的消息类型。

这些消息类型的层次关系为：

```
                                    Message
                                       |
                                  TypedMessage
                                       |
     __________________________________|__________________________________
     |             |            |             |               |           |
TextMessage  ImageMessage  AudioMessage  VideoMessage  LocationMessage   。。。
```

## 权限和认证

为了保证聊天通道的安全，我们设计了签名的概念。默认这一功能是关闭的，你可以在 LeanCloud 应用控制台 > **设置** > **应用选项** 中强制启用签名。启用后，所有的用户登录、新建/加入对话、邀请/踢出对话成员等操作都需要包含签名，这样你可以对聊天过程进行充分的控制。

![image](images/leanmessage_signature2.png)

1. 客户端进行登录或新建对话等操作，SDK 会调用 SignatureFactory 的实现，并携带用户信息和用户行为（登录、新建对话或群组操作）请求签名；
2. 应用自有的权限系统，或应用在 LeanCloud 云引擎上的签名程序收到请求，进行权限验证，如果通过则利用**下文所述的签名算法**生成时间戳、随机字符串和签名返回给客户端；
3. 客户端获得签名后，编码到请求中，发给 LeanCloud 实时通信服务器；
4. 实时通信服务器对请求的内容和签名做一遍验证，确认这个操作是被应用服务器允许的，进而执行后续的实际操作。

### 云引擎签名范例

我们提供了一个运行在 LeanCloud [云引擎](https://cn.avoscloud.com/docs/cloud_code_guide.html)上的
[签名范例程序](https://github.com/leancloud/realtime-messaging-signature-cloudcode)
，它提供了基于 Web Hosting 和云函数两种方式的签名实现，你可以根据实际情况选择自己的实现。

### 用户登录的签名

签名采用 **Hmac-sha1** 算法，输出字节流的十六进制字符串（hex dump），签名的消息格式如下：

```
appid:clientid::timestamp:nonce
```

其中：

* `appid` - 你的应用 ID。
* `clientid` - 登录时使用的 clientId。
* `timestamp` - 当前的 UTC 时间距离 unix epoch 的**秒数**。
* `nonce` - 随机字符串。

> 注意！
> 签名的 key 必须是应用的 **master key**，您可以在应用设置的 应用 Key 里找到，请保护好 Master Key ，不要泄露给任何无关人员。

开发者可以实现自己的 SignatureFactory，调用远程服务器的签名接口获得签名。如果你没有自己的服务器，可以直接在 LeanCloud 云引擎上通过 Web Hosting 实现自己的签名接口。在移动应用中直接做签名是**非常危险**的，它可能导致你的 **master key** 泄漏。

### 开启对话的签名

新建一个对话的时候，签名的消息格式为：

```
appid:clientid:sorted_member_ids:timestamp:nonce
```

其中：

* `appid`、`clientid`、`timestamp` 和 `nonce` 的含义同上。
* `sorted_member_ids` 是 `:` 分隔的**升序排序**的 user id，即邀请参与该对话的成员列表。

### 群组功能的签名

在群组功能中，我们对**加群**、**邀请**和**踢出群**这三个动作也允许加入签名，签名格式是：

```
appid:clientid:convid:sorted_member_ids:timestamp:nonce:action
```

其中：

* `appid`、`clientid`、`sorted_member_ids`、`timestamp` 和 `nonce` 的含义同上。对加入群的情况，这里 `sorted_member_ids` 是空字符串。
* `convid` - 此次行为关联的对话 id。
* `action` - 此次行为的动作，行为分别对应常量 `invite` （加群和邀请）和 `kick`（踢出群）。

### Super User

为了方便开发者的特殊场景，我们设计了超级用户（Super User）的概念。超级用户可以往任何一个对话（conversation）发送消息。超级用户的使用需要强制签名认证。

签名格式是在普通用户的签名消息后加常量 `su`。

```
appid:clientid:convid:sorted_member_ids:timestamp:nonce:su
```

## 云引擎 Hook

对于普通消息，如果发送时部分成员不在线，LeanCloud 提供了选项，支持将离线消息以 Push Notification 形式发送到客户端。但是，推送的内容开发者如果希望进行修改的话，该怎么实现呢？

可以使用「云引擎 Hook」！

云引擎 hook 允许你通过自定义的云引擎函数处理实时通信中的某些事件，修改默认的流程等等。目前开放的 hook 云函数包括：

* **_messageReceived**  
  消息达到服务器，群组成员已解析完成之后。
* **_receiversOffline**  
  消息发送完成，存在离线的收件人。
* **_conversationStart**  
  创建对话，在签名校验（如果开启）之后，实际创建之前。
* **_conversationAdd**  
  向对话添加成员，在签名校验（如果开启）之后，实际加入之前，包括主动加入和被其他用户加入两种情况。
* **_conversationRemove**  
  从对话中踢出成员，在签名校验（如果开启）之后，实际踢出之前，用户自己退出对话不会调用。

关于如何定义云函数，你可以参考 [云引擎部分的说明](https://cn.avoscloud.com/docs/cloud_code_guide.html#cloud-函数)。所有云引擎调用都有默认超时时间和容错机制，在出错的情况下将按照默认的流程执行后续的操作。需要注意的是，实时通信的云引擎 hook 要求云引擎部署在云引擎生产环境，测试环境用于开发者手动调用测试。由于缓存的原因，首次部署的云引擎 hook 需要至多三分钟的时间正式生效，后续修改会实时生效。

### 使用场景

示例应用 [LeanChat](https://github.com/leancloud/leanchat-android) 也用了云引擎 Hook 功能来自定义消息推送，通过解析上层消息协议获取消息类型和内容，通过 `fromPeer` 得到发送者的名称，组装成 `pushMessage`。这样，能使推送通知的用户体验更好。可参考 [leanchat-cloudcode 代码](https://github.com/leancloud/leanchat-cloudcode/blob/master/cloud/mchat.js)。

Conversation 相关的 hook 可以在应用签名之外增加额外的权限判断，控制对话是否允许被建立、某些用户是否允许被加入对话等。你可以用这个 hook 实现黑名单功能。

### _messageReceived

这个 hook 发生在消息到达 LeanCloud 云端之后。如果是群组消息，我们会解析出所有消息收件人。

你可以通过返回参数控制消息是否需要被丢弃，删除个别收件人，还可以修改消息内容。返回空对象则会执行系统默认的流程。

如果你使用了 LeanCloud 默认提供的富媒体消息格式，云引擎参数中的 `content` 接收的是 JSON 结构的字符串形式。关于这个结构的详细说明，请参考 [实时通信 REST API 指南 - 富媒体消息格式说明](./realtime_rest_api.html#富媒体消息格式说明)。

#### 参数

参数 | 说明
--- | ---
fromPeer | 消息发送者的 ID
convId   | 消息所属对话的 ID
toPeers | 解析出的对话相关的 Client ID
transient | 是否是 transient 消息
content | 消息体字符串
receipt | 是否要求回执
timestamp | 服务器收到消息的时间戳，毫秒
sourceIP | 消息发送者的 IP

#### 返回

参数 | 说明
--- | ---
drop | 可选，如果返回真值消息将被丢弃
content | 可选，修改后的 content，如果不提供则保留原消息
toPeers | 可选，数组，修改后的收件人，如果不提供则保留原收件人

### _receiversOffline

这个 hook 发生在有收件人离线的情况下，你可以通过这个 hook 自定义离线推送行为，包括推送内容、被推送用户或略过推送。你也可以直接在 hook 中触发自定义的推送。发往暂态对话的消息不会触发此 hook。

#### 参数

参数 | 说明
--- | ---
fromPeer | 消息发送者 ID
convId   | 消息所属对话的 ID
offlinePeers | 数组，离线的收件人列表
content | 消息内容
timestamp | 服务器收到消息的时间戳，毫秒

#### 返回

参数 | 说明
--- | ---
skip | 可选，如果为真将跳过推送（比如已经在云引擎里触发了推送或者其他通知）
offlinePeers | 可选，数组，筛选过的推送收件人
pushMessage | 可选，推送内容，支持自定义 JSON 结构
force | 可选，如果为真将强制推送给 offlinePeers 里 mute 的用户，默认 false

### _conversationStart

在创建对话时调用，发生在签名验证之后、创建对话之前

#### 参数

参数 | 说明
--- | ---
initBy | 由谁发起的 clientId
members | 初始成员数组，包含初始成员

#### 返回

参数 | 说明
--- | ---
reject | 是否拒绝，可选，默认为 `false`

### _conversationAdd

在将用户加入到对话时调用，发生在签名验证之后、加入对话之前。如果是自己加入，那么 `initBy` 和 `members` 的唯一元素是一样的。

#### 参数

参数 | 说明
--- | ---
initBy | 由谁发起的 clientId
members | 要加入的成员，数组
convId | 对话 id

#### 返回

参数 | 说明
--- | ---
reject | 是否拒绝，默认为 `false`

### _conversationRemove

在创建对话时调用，发生在签名验证之后、从对话移除成员之前。
移除自己时不会触发这个 hook

#### 参数

参数 | 说明
--- | ---
initBy | 由谁发起
members | 要踢出的成员，数组
convId | 对话 id

#### 返回

参数 | 说明
--- | ---
reject | 是否拒绝，默认为 `false`

## Android 开发指南

参考 [Android 实时通信开发指南](./android_realtime_v2.html)

## iOS 开发指南

参考 [iOS 实时通信开发指南](./ios_realtime_v2.html)

##  JavaScript 开发指南

参考 [JavaScript 实时通信开发指南](./js_realtime.html)。另外，我们已经开源了 JavaScript  Realtime SDK， 见 [leancloud/js-realtime-sdk Github 资源库](https://github.com/leancloud/js-realtime-sdk) 。

## REST API

参考 [实时通信 REST API](./realtime_rest_api.html)。

## 服务器端错误码说明

实时通信的错误码会以 SDK 异常或 WebSocket 关闭状态码的形式返回给客户端。当出现异常情况时，SDK 会输出状态码到日志里，以下是对部分状态码的简单说明：

代码|说明
---|---
`0`|websocket 正常关闭，可能发生在服务器重启，或本地网络异常的情况。SDK 会自动重连，无需人工干预。
`1006`|websocket 连接非正常关闭，通常见于路由器配置对长连接限制的情况。SDK 会自动重连，无需人工干预。
`4100`|应用不存在或应用禁用了实时通信服务
`4103`|Client Id 格式错误，超过 64 个字符。
`4105`|Session 没有打开就发送消息，或执行其他操作。常见的错误场景是调用 open session 后直接发送消息，正确的用法是在 Session 打开的回调里执行。
`4107`|读超时，服务器端长时间没有收到客户端的数据，切断连接。SDK 包装了心跳包的机制，出现此错误通常是网络问题。SDK 会自动重连，无需人工干预。
`4108`|登录超时，连接后长时间没有完成 session open。通常是登录被拒绝等原因，出现此问题可能是使用方式有误，可以 [创建工单](http://ticket.leancloud.cn/)，由我们技术顾问来给出建议。
`4109`|包过长。消息大小超过 5 KB，请缩短消息或者拆分消息。
`4110`|设置安全域名后，当前登录的域名与安全域名不符合。
`4200`|服务器内部错误，如果反复出现请收集相关线索并 [创建工单](http://ticket.leancloud.cn/)，我们会尽快解决。
`4201`|通过 API 发送消息超时
`4302`|对话相关操作签名错误
`4303`|发送消息，或邀请等操作对应的对话不存在。
`4304`|对话成员已满，不能再添加。
`4305`|对话操作被应用的云引擎 hook 拒绝
`4306`|更新对话操作失败
`4307`|该对话为只读，不能更新或增删成员。
`4308`|该对话禁止当前用户发送消息
`4401`|发送消息的对话不存在，或当前用户不在对话中。
`4402`|发送的消息被应用的云引擎 hook 拒绝


## 常见问题 FAQ

### 要让单个群组消息进入「免打扰模式」，该如何做

对于普通对话的新消息，LeanCloud 实时通信服务有选项支持将消息以 Push Notification 的方式通知当前不在线的成员，但是有时候，这种推送会非常频繁对用户造成干扰。LeanCloud 提供选项，支持让单个用户关闭特定对话的离线消息推送。具体可以看相应平台的开发指南文档。

### 敏感词过滤怎么做

LeanCloud 服务器端已经存有一份敏感词的列表对消息进行过滤，这部分功能无需用户参与，是内置默认支持的。

### 聊天好友关系如何实现

LeanCloud 实时通信服务是完全独立的实时通信业务抽象，专注在实时通信本身，所以实时通信的业务逻辑中，并不含有好友关系，以及对应的聊天用户数据信息（如头像、名称等）。实时通信与其他业务逻辑完全隔离，不耦合，唯一关联的就是 clientId。这样做的好处是显而易见的，比如你可以很容易让匿名用户直接通信，你也可以自定义一些好友逻辑，总之可以做成因为任意逻辑而匹配产生的聊天行为。

当然，如果你想维护一套好友关系，完全可以使用你自己的逻辑，只要存储着每个用户在实时通信中的 clientId 即可。我们推荐使用 LeanCloud 的存储，这样也可以结合 LeanCloud 中的 User 相关对象简单的实现账户系统，以及账户中的相关存储，详情可以阅读对应的 SDK 开发指南。

### 聊天离线时可以推送吗

当然可以。我们的 Android 聊天服务是和后台的推送服务共享连接的，所以只要有网络就永远在线，不需要专门做推送。消息达到后，你可以根据用户的设置来 判断是否需要弹出通知。网络断开时，我们为每个对话保存 20 条离线消息。

iOS 在应用退出前台后即离线，这时收到消息会触发一个 APNs 的推送。因为 APNs 有消息长度限制，且你们的消息正文可能还包含上层协议，所以 我们现在 APNs 的推送内容是让应用在控制台设置一个静态的 APNs json，如“您有新的消息” 。你可以通过上文提到的云引擎 hook `_receiversOffline` 来根据消息内容、对话信息等上下文信息来自定义推送内容。推送默认使用**生产证书**，你也可以在 json 中增加一个 `_profile` 内部属性来选择实际推送的证书，如 `{"alert": "你有一条未读消息", "_profile": "dev"}`。`_profile` 属性不会实际发送到 APNs 。

注意，我们的 SDK 会在登录时自动关联设备和 Client Id，并不需要用户手动操作。

另外，由于实时通信触发的推送量比较大，内容单一，这部分记录不会保存到 `_Notification` 表中。

![image](images/realtime_ios_push.png)

目前，设置界面的推送内容支持部分内置变量，你可以将上下文信息直接设置到推送内容中：

* `${convId}` 推送相关的对话 ID
* `${timestamp}` 触发推送的时间戳（Unix 时间戳）
* `${fromClientId}` 消息发送者的 Client ID

![image](images/rtm-push.png)

桌面图标也会有相应的红点 badge，清除 badge 的操作请参考 [iOS 推送指南 - 清除 badge](./push_guide.html#清除_badge)。

云引擎 Hook 已支持自定义消息推送，可推送具体的消息内容，可参考 [云引擎 Hook](#云引擎_Hook) 章节。


### 为什么我的 iPhone 收不到离线消息推送

请先看上一个 FAQ。在控制台的设置页面，填写「您有新的未读消息」后，当对方不在线的时候，便会触发一个 APNs 的推送。首先，请确保控制台能向 iOS 推送消息，也即如下图所示的推送能顺利到达 iOS 系统，请参考 [消息推送指南](push_guide.html#ios消息推送)。

![image](images/realtime_faq_push.png)

之后，还要确保对方确实是离线，如果对方程序在前台并且网络良好，则不会触发推送。如果对方网络未连接，则下次联网的时候收到回调，也不触发推送。也可以利用控制台实时消息页的用户状态查询来确保对方是在离线状态，如下图。

![image](images/realtime_faq_console.png)

离线消息推送默认用的是生产环境编辑框里上传的证书。所以，调试时可能要上传开发证书，并在推送内容中设置 `_profile` 属性来选择开发证书推送，如 `{"alert": "你有一条未读消息", "_profile": "dev"}`

检查方法总结如下：

* 检查普通的 iOS 推送是否到达
* 检查证书设置
* 在控制台检查接收方是否在离线状态

### 聊天记录的保存时间和条数

我们暂时不限制用户应用中聊天记录的保存时间和条数。未来如有变化我们会提前通知用户，你也随时可以通过 [REST API](./realtime_rest_api.html#%E8%8E%B7%E5%8F%96%E8%81%8A%E5%A4%A9%E8%AE%B0%E5%BD%95) 将聊天记录同步到自己的服务器上。

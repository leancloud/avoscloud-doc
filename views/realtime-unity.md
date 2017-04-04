{% import "views/_helper.njk" as docs %}
# 实时通信开发指南 · Unity（C#）

## 准备工作

### 开发工具

<dl><dt>Unity 5.3.x 以上的版本</dt>
<dd>这个是因为在 Unity 5.3 之后，官方使用 UnityWebRequest 取代了原有的 WWW 类作为 HTTP 请求的客户端，因此 LeanCloud SDK 在实时通信上是使用了 UnityWebRequest 来获取云端分配的 WebSocket 链接地址。</dd>
<dt>Visual Studio 2015 以上的版本</dt>
<dd>微软针对 Unity 有一个工具包可以让 Unity 和 Visual Studio 联调，详细请看[使用 Visual Studio Tools for Unity](https://msdn.microsoft.com/zh-cn/library/dn940020.aspx)，因此建议用户在 Windows 上开发 Unity 的体验会更好，当然在 Mac OS 以及其他操作系统上开发也没有任何问题。</dd>

### .NET 4.5+ 编程知识
Unity 支持 Mono 使用 .NET 语言来实现跨平台开发的解决方案，所以 LeanCloud 采用了 C# 来实现客户端的 SDK。如果你有 .NET 方面的编程经验，就很容易掌握 LeanCloud Unity SDK 接口的风格和用法。

LeanCloud Unity SDK 在很多重要的功能点上都采用了微软提供的[基于任务的异步模式 (TAP)](https://msdn.microsoft.com/zh-cn/library/hh873175.aspx)，所以如果你具备 .NET Framework 4.5 的开发经验，或对 .NET Framework 4.5 的 新 API 有所了解，将有助于快速上手。

### LeanCloud 实时通信概览

在继续阅读本文档之前，请先阅读[《实时通信概览》](realtime_v2.html)，了解一下实时通信的基本概念和模型。

### WebSocket 协议
LeanCloud 实时消息是基于 WebSocket 和私有通讯协议实现的一套聊天系统，因此开发者最好是提前了解一下 WebSocket 协议的相关内容。推荐没有接触过的开发者可以阅读下面这个链接里面的内容来做一个简单的了解[WebSocket 是什么原理？为什么可以实现持久连接？ - 回答作者: Ovear](http://zhihu.com/question/20215561/answer/40316953)

### Unity 可用的 WebSocket 库
目前 SDK 内置的 WebSocket 库是一个来自于开源社区的版本 [sta/websocket-sharp](https://github.com/sta/websocket-sharp)，它有个致命的缺陷——不支持 iOS 9.0 以上的版本，因此我们推荐开发者可以考虑购买一个付费的版本：[WebSocket for desktop, web and mobile](https://www.assetstore.unity3d.com/cn/#!/content/27658)。

如果开发者有自己实现 WebSocket 客户端的能力也可以自己实现，并且 SDK 支持在初始化的时候指定 WebSocket 客户端。详情可以阅读自定义配置中的 [自定义 WebSocket 客户端](#自定义_SDK)。

## 安装 SDK

### 下载和导入

最新版本的 SDK 下载地址：<https://github.com/leancloud/realtime-SDK-dotNET/> 或选择 [SDK 镜像地址](https://releases.leanapp.cn/#/leancloud/realtime-SDK-dotNET/releases)，下载时请选择最新版本即可。例如 `LeanCloud-Unity-Realtime-SDK-20170330.3.zip`，代表这个版本是 2017 年 3 月 30 日当天的第 3 次自动化发布。

下载之后解压，把里面包含的所有的 Dll 文件（除去 `UnityEngine.dll`）都引入到 Unity 的 `Assets/LeanCloud` 文件夹（在 `Assets` 下面新建一个 `LeanCloud` 文件夹用来存放 LeanCloud SDK）下即可。

### 初始化
初始化**必须**在 Unity Editor 上将 AVInitializeBehaviour 挂载在某一个 GameObject 下，如下图：

![AVInitializeBehaviour](https://dn-lhzo7z96.qbox.me/1490770179090)

![mount](https://dn-lhzo7z96.qbox.me/1490770533536)

## 核心概念

### 对话 - AVIMConversation
对话（AVIMConversation）是 LeanCloud 实时消息服务定义的一个抽象概念，它是一个聊天的载体，例如微信的私聊是一个对话，群聊也是一个对话，唯一的区别就是私聊是两个人的对话，群聊是多人的对话，本文之后所有针对聊天的模型描述里面使用了对话都特指 LeanCloud 实时消息定义的这个抽象概念——对话（AVIMConversation）。

#### 对话的种类

LeanCloud 内置了三种对话类别：

- **普通对话**：类似于微信的私聊和群聊
- **暂态对话**：类似于直播间的聊天室
- **系统对话**：类似于系统广播，GM 群发消息

### 客户端 - AVIMClient
LeanCloud 实时消息中的客户端是指游戏中客户端与云端之间的单个长连接，而不局限于一个用户（玩家）。例如 QQ 里面有一种机制，一个 QQ 号支持同时在一台手机设备和一台电脑设备上登录，在 LeanCloud 实时消息中就把这两个登录的设备视为两个客户端，但是它们共享了一个客户端 ID（ClientId） ，只要是同一个 ClientId，不管多少个设备，LeanCloud 云端都可以支持。

#### 客户端的互斥
当然，游戏中更多的情况是，玩家在 iOS 上登录之后，他在其他设备上较早前的登录就会被踢下线，这是游戏的客户端独占性，因此游戏开发者可以完全将 AVIMClient 理解为一个玩家，他们之间是一对一的关系。LeanCloud 将这种行为定义为「单点登录」，实现方法请参考 [单点登录](#单点登录)。

## 常见的游戏聊天模型

游戏中常见的聊天场景有：

- 帮派或者公会群聊频道
- 游戏中好友一对一的私聊
- 战场或副本内的临时群聊

### 帮派和工会案例「桃园三结义」

帮派（公会）是一个持久存在的、某些玩家共有的一个频道，它具备以下特点：

- 持久化存储
- 玩家加入或者离开时的通知送达
- 管理员可以加人和删人

经过分析，我们给出一个符合编程语义的定义，即帮派或公会本质上是一个对话，这个对话具备如下特征：

- 非暂态对话
- 成员的变动通知
- 某一个特殊权限的客户端可以邀请或者踢出其他客户端

假设开发一款三国题材的游戏，每一个玩家是三国时期的一位名将，游戏的第一个剧情就是桃园结义，有三个玩家分别叫**刘备**（ID 1001）、**关羽**（ID 1002）、**张飞**（ID 1003）。当这三个玩家进入了游戏，他们偶然相遇，刘备一时兴起说道「我们结拜吧」，于是他们新建了一个帮派叫做「桃园」，下面以刘备作为玩家视角开始构建 AVIMClient，并打开与 LeanCloud 云端的长链接，创建「桃园」聊天频道。

#### 初始化聊天服务

```cs
AVRealtime avRealtime;

void Start()
{
    // 使用 AppId 和 App Key 初始化 SDK
    avRealtime = new AVRealtime("uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap", "kfgz7jjfsk55r5a8a3y4ttd3je1ko11bkibcikonk32oozww");
    // 方便调试将 WebSocket 日志打印在 Debug.Log 控制台上
    AVRealtime.WebSocketLog(Debug.Log);
}
```

#### 登录

然后以刘备的游戏 ID 作为 Client Id 登录到 LeanCloud 实时消息的云端：

```cs
AVIMClient liubei = null;
// 以刘备的游戏 ID 1001 作为 client Id 构建 AVIMClient
avRealtime.CreateClient("1001").ContinueWith(t => 
{
    liubei = t.Result;
});
```

紧接着，关羽登录到了系统，而张飞因为喝酒睡过了，暂时没有上线。


#### 创建对话

此时，三个人之间是没有任何联系的，他们之间暂时无法通讯，因此我们需要创建一个对话，让这三个人成为该对话的成员，然后开始三个人之间的群聊，群聊的名称就用之前提到的「桃园」：

```cs
AVIMClient liubei = null;
// 以刘备的游戏 ID 1001 作为 client Id 构建 AVIMClient
avRealtime.CreateClient("1001").ContinueWith(t =>
{
    liubei = t.Result;
}).ContinueWith(s =>
{
    // 以关羽、张飞的游戏 ID 作为受邀进入对话的成员列表
    var memberList = new List<string>()
    {
        "1002",
        "1003"
    };

    // 以「桃园」作为帮派的名称 
    var name = "桃园";

    // 以「桃园」作为名称，以关羽、张飞作为成员，建立对话
    // 对话的创建者刘备（client id：1001）会默认加入对话，因此无需重复添加到 memberList 里面去
    return liubei.CreateConversationAsync(name: name, members: memberList);
});
```

#### 成员变更通知
刘备新建了一个聊天频道，关羽此时也在线，只要关羽订阅了通知事件，当刘备邀请他加入「桃园」聊天时，他就可以收到通知。以下是关羽登录的代码，需注意其中与刘备不同的地方：


```cs
public void GuanYULogIn()
{
    AVIMClient guanyu = null;
    // 以关羽的游戏 ID 1002 作为 client Id 构建 AVIMClient
    avRealtime.CreateClient("1002").ContinueWith(t =>
    {
        guanyu = t.Result;
    }).ContinueWith(s =>
    {
        guanyu.OnInvited += Guanyu_OnInvited;
    });
}

private void Guanyu_OnInvited(object sender, AVIMOnInvitedEventArgs e)
{
    // e.InvitedBy 是该项操作的发起人, e.ConversationId 是该项操作针对的对话 Id
    Debug.Log(string.Format("你被 {0} 邀请加入了 {1} 对话", e.InvitedBy, e.ConversationId));
}
```

注意，此时张飞正在睡觉，尽管他也会受邀加入对话，但是成员变更操作只针对在线人员进行通知，类似于 QQ 你多年没有上线，有一天你上线了，发现自己被某个群踢了，其实这个通知并不是在踢你的时候产生的，而是 QQ 根据你之前的群组记录对比你现在的群组列表，做了合并操作，发现你被踢了，就生成一个通知给你。

上述代码实现了关羽可以监听自己被邀请进入对话之后的通知。

#### 发送消息

刘备想在「桃园」频道发一条消息「兄弟们，睡什么睡，起来嗨！」，只需要在刘备的客户端代码做如下修改：

```cs
AVIMClient liubei = null;
// 以刘备的游戏 ID 1001 作为 client Id 构建 AVIMClient
avRealtime.CreateClient("1001").ContinueWith(t =>
{
    liubei = t.Result;
}).ContinueWith(s =>
{
    // 以关羽、张飞的游戏 ID 作为受邀进入对话的成员列表
    var memberList = new List<string>()
    {
        "1002",
        "1003"
    };

    // 以「桃园」作为帮派的名称 
    var name = "桃园";

    // 以「桃园」作为名称，以关羽、张飞作为成员，建立对话 
    return liubei.CreateConversationAsync(name: name, members: memberList);
}).Unwrap().ContinueWith(x => 
{
    // 「桃园」是一个 AVIMConversation 实例
    var TaoYuanConversation = x.Result;
    // 创建一个文本消息
    var textMessage = new AVIMTextMessage("兄弟们，睡什么睡，起来嗨！");
    // 将该文本消息发送出去
    return TaoYuanConversation.SendMessageAsync(textMessage);
});
```

#### 接收消息

关羽此时已经登录了，并知晓自己已经加入了「桃园」这个对话，因此他需要继续订阅接收消息的事件通知：

```cs
public void GuanYULogIn()
{
    AVIMClient guanyu = null;
    // 以关羽的游戏 ID 1002 作为 client Id 构建 AVIMClient
    avRealtime.CreateClient("1002").ContinueWith(t =>
    {
        guanyu = t.Result;
    }).ContinueWith(s =>
    {
        // 监听自己被邀请加入对话
        guanyu.OnInvited += Guanyu_OnInvited;
        // 监听接收消息
        guanyu.OnMessageReceived += Guanyu_OnMessageReceived;
    });
}

private void Guanyu_OnMessageReceived(object sender, AVIMMesageEventArgs e)
{
    if (e.Message is AVIMTextMessage)
    {
        var textMessage = (AVIMTextMessage)e.Message;
        // textMessage.ConversationId 是该条消息所属于的对话 Id
        // textMessage.TextContent 是该文本消息的文本内容
        // textMessage.FromClientId 是消息发送者的 client Id
        Debug.Log(string.Format("你收到来自于 Id 为 {0} 的对话的文本消息，消息内容是： {1}，发送者的 client Id 是 {2}", textMessage.ConversationId, textMessage.TextContent, textMessage.FromClientId));
    }
}

private void Guanyu_OnInvited(object sender, AVIMOnInvitedEventArgs e)
{
    // e.InvitedBy 是该项操作的发起人,e.ConversationId 是该项操作针对的对话的 Id
    Debug.Log(string.Format("你被 {0} 邀请加入了 {1} 对话", e.InvitedBy, e.ConversationId));
}
```

#### 获取对话
至此，刘备向对话中发送消息的功能已经实现了，关羽作为受邀加入对话的成员，他可以通过获取自己所在的对话实例，然后调用对话实例的发送消息的接口，回发消息给刘备：


```cs
public void GuanYULogIn()
{
    AVIMClient guanyu = null;
    // 以关羽的游戏 ID 1002 作为 client Id 构建 AVIMClient
    avRealtime.CreateClient("1002").ContinueWith(t =>
    {
        guanyu = t.Result;
    }).ContinueWith(s =>
    {
        // 监听自己被邀请加入对话
        guanyu.OnInvited += Guanyu_OnInvited;
        // 监听接收消息
        guanyu.OnMessageReceived += Guanyu_OnMessageReceived;
        // 构建对话的查询
        var query = guanyu.GetQuery();
        // 查询我所在的对话列表，默认返回的是最近活跃的 20 个，这个数量可以更改，最大支持 1000
        return query.FindAsync();
    }).Unwrap().ContinueWith(x => 
    {
        // 从对话列表中找出「桃园」 这个对话
        AVIMConversation TaoYuanConversation = null;
        var conversationList = x.Result;
        // 搜索「桃园」这个对话 
        TaoYuanConversation = conversationList.First(conversation => conversation.Name == "桃园");
        // 同样的，关羽也创建一个文本消息
        var textMessage = new AVIMTextMessage("大哥，我在郊外打猎，三弟昨晚喝多了，他还在睡，要不您到城外，我们一起骑马打猎啊？");
        return TaoYuanConversation.SendMessageAsync(textMessage);
    });
}

private void Guanyu_OnMessageReceived(object sender, AVIMMesageEventArgs e)
{
    // 如果是文本消息
    if (e.Message is AVIMTextMessage)
    {
        var textMessage = (AVIMTextMessage)e.Message;
        // textMessage.ConversationId 是该条消息所属于的对话 Id
        // textMessage.TextContent 是该文本消息的文本内容
        // textMessage.FromClientId 是消息发送者的 client Id
        Debug.Log(string.Format("你收到来自于 Id 为 {0} 的对话的文本消息，消息内容是： {1}，发送者的 client Id 是 {2}", textMessage.ConversationId, textMessage.TextContent, textMessage.FromClientId));
    }
}

private void Guanyu_OnInvited(object sender, AVIMOnInvitedEventArgs e)
{
    // e.InvitedBy 是该项操作的发起人,e.ConversationId 是该项操作针对的对话的 Id
    Debug.Log(string.Format("你被 {0} 邀请加入了 {1} 对话", e.InvitedBy, e.ConversationId));
}
```

同样，刘备也需要监听 `AVIMClient.OnMessageReceived` 这个事件通知，就能收到关羽发送的消息了。

#### 离线消息

假设刚才在所有操作发生的时候，张飞依然在呼呼大睡，他完全不知道大哥创建了一个对话，并且大哥和二哥已经在对话里面聊了起来，此时他上线，就会收到许多离线消息。在张飞登录的时候，需要再监听一下离线消息的事件通知，这样他就不会丢失消息：


```cs
public void ZhangFeiLogIn()
{
    AVIMClient zhangfei = null;
    // 以张飞的游戏 ID 1002 作为 client Id 构建 AVIMClient
    avRealtime.CreateClient("1003").ContinueWith(t =>
    {
        zhangfei = t.Result;
    }).ContinueWith(s => 
    {
        // 张飞监听自己离线消息
        zhangfei.OnOfflineMessageReceived += Zhangfei_OnOfflineMessageReceived;
    });
}

private void Zhangfei_OnOfflineMessageReceived(object sender, AVIMMesageEventArgs e)
{
    if (e.Message is AVIMTextMessage)
    {
        var textMessage = (AVIMTextMessage)e.Message;
        // textMessage.ConversationId 是该条消息所属于的对话 Id
        // textMessage.TextContent 是该文本消息的文本内容
        // textMessage.FromClientId 是消息发送者的 client Id
        Debug.Log(string.Format("你收到来自于 Id 为 {0} 的对话的离线文本消息，消息内容是：{1}，发送者的 client Id 是 {2}", textMessage.ConversationId, textMessage.TextContent, textMessage.FromClientId));
    }
}
```

#### 邀请其他成员加入

刘备、关羽和张飞后来遇上了五虎上将的另一位赵云，刘备将赵云加入「桃园」中 ，首先需要获取「桃园」这个实例，第一种方法是上述关羽通过 `AVIMClient.GetQuery` 的方法来获取查询，然后通过名称比对来找出「桃园」。这个方法我们推荐在展现列表页的时候使用。

如果一个对话很活跃，我们推荐开发者在客户端缓存对话的 ID(`AVIMConversation.ConversationId`)，然后通过 `AVIMConversation.CreateWithoutData` 来构建一个对话，这样效率更高，用法更友好： 

```cs
public void InviteZhaoYun()
{
    // 假设刘备缓存了「桃园」的 ID 
    var TaoYuanConversationId = "58dca69e2e9af6631e113d8a";

    // 赵云的 client Id
    var zhaoyun_ClintId = "1004";

    AVIMClient liubei = null;
    // 以刘备的游戏 ID 1001 作为 client Id 构建 AVIMClient
    avRealtime.CreateClient("1001").ContinueWith(t =>
    {
        liubei = t.Result;
    }).ContinueWith(s => 
    {
        // 构建对话的时候需要指定一个 AVIMClient 实例做关联
        var TaoYuanConversation = AVIMConversation.CreateWithoutData(TaoYuanConversationId, liubei);
        // 直接邀请赵云加入对话
        return liubei.InviteAsync(TaoYuanConversation, zhaoyun_ClintId);
    });
}
```

而其他在线成员就会收到 `AVIMClient.OnMembersJoined` 的通知，而赵云本人会收到`AVIMClient.OnInvited` 的通知。

#### 删除其他成员

等到后来在新野的时候，徐庶前来相投，刘备也将徐庶加入了「桃园」，但无奈的是，曹操俘虏了徐庶的母亲，徐庶只能含泪告别刘备，在徐庶离开新野北上之后，刘备将徐庶从「桃园」中删除。代码如下：

```cs
public void KickXuShu()
{
    // 假设刘备缓存了「桃园」的 ID 
    var TaoYuanConversationId = "58dca69e2e9af6631e113d8a";
    AVIMClient liubei = null;
    // 以刘备的游戏 ID 1001 作为 client Id 构建 AVIMClient
    avRealtime.CreateClient("1001").ContinueWith(t =>
    {
        liubei = t.Result;
    }).ContinueWith(s =>
    {
        // 构建对话的时候需要指定一个 AVIMClient 实例做关联
        var TaoYuanConversation = AVIMConversation.CreateWithoutData(TaoYuanConversationId, liubei);
        // 刘备将徐庶从对话中删除
        return liubei.KickAsync(TaoYuanConversation, "1005");
    });
}
```

其他在线成员会收到 `AVIMClient.OnMembersLeft`，而徐庶本人会收到 `AVIMClient.OnKicked`。


### 私聊案例 - 曹操三问谋士

相对于刘备来说，曹操不太喜欢群聊，因此他总是单独约见某一个手下的谋士进行私聊，这里我们拿曹操与程昱、荀彧以及郭嘉的私聊来举例。

前面我们说过，在 LeanCloud 中并没有限制对话的类型，群聊和私聊的本质区别就是成员的数量。那么假设曹操的 Client ID 是 2001，程昱是 2002，荀彧是 2003，郭嘉是 2004。

#### 创建私聊

曹操麻利地创建了一个私聊：

```cs
public void CreatePrivateConversation()
{
    AVIMClient caocao = null;
    // 以曹操的游戏 ID 2001 作为 client Id 构建 AVIMClient
    avRealtime.CreateClient("2001").ContinueWith(t =>
    {
        caocao = t.Result;
    }).ContinueWith(s =>
    {
        // 曹操建立与程昱的私聊
        caocao.CreateConversationAsync(member: "2002", name: "曹操与程昱的私聊");
    });
}
```

上述代码跟刘备创建「桃园」时的区别只有一个，刘备传入的是关羽和张飞两个人的 client Id  作为一个集合参数，曹操传入的是程昱一人的 client Id，因此本质上我们依然只能通过成员数量来判断是群聊还是单聊。

{% call docs.noteWrap() -%}
为了日后更好区分单聊和私聊，我们推荐开发者在创建对话的时候给对话赋予一个自定义的属性，来标记这个对话的类型。
{%- endcall %}

```cs
caocao.CreateConversationAsync(member: "2002",
    name: "曹操与程昱的私聊",
    options: new Dictionary<string, object>()
    {
        { "category","private"}
    });
```

增加 `category` 的标签，是为了日后在构建查询的时候，方便传入这个条件，这样曹操就可以迅速找到自己所有的私聊，实现代码如下：

#### 获取私聊
```cs
public void QueryPrivateConversations()
{
    AVIMClient caocao = null;
    // 以曹操的游戏 ID 2001 作为 client Id 构建 AVIMClient
    avRealtime.CreateClient("2001").ContinueWith(t =>
    {
        caocao = t.Result;
    }).ContinueWith(s =>
    {
        var query = caocao.GetQuery().WhereEqualTo("category", "private");
        return query.FindAsync();
    }).Unwrap().ContinueWith(x => 
    {
        var privateConversations = x.Result;
        foreach (var conv in privateConversations)
        {
            //这就找到了所有曹操所在的私聊
        }
    });
}
```

其他关于成员操作的通知和离线消息，与刘备的「桃园」这个群聊没任何区别。

#### 私聊和群聊的隔离

假设曹操需要一个群聊来发布一些政令，他可以沿用上述创建群聊的代码。多数情况下，我们推荐用户创建一个新的对话，而不建议直接向原来的私聊添加成员，因为这会让聊天记录的获取显得比较尴尬——假设向私聊里面加入一个新成员，那么这个新成员是无权获取他加入之前的聊天记录的，因此我们十分建议用户将私聊和群聊从创建开始就区分开了，这样会在日后的开发中节省很多理解成本。

### 战场和副本案例 - 赤壁之战

时间来到赤壁之战，孙刘联盟，蔡中蔡和两兄弟假意投降，将干也被曹操派来做间谍，因此周瑜需要一个特殊的对话来实现临时的聊天需求——暂态对话；通俗地说就是聊天室。在这个聊天室里面有诸葛亮、黄盖、将干、蔡中蔡和。周瑜是这个对话的创建人，因此他需要如下代码来实现这个需求：

#### 创建暂态对话
```cs
public void CreateChatRoom()
{
    AVIMClient zhouyu = null;
    // 以周瑜的游戏 ID 3002 作为 client Id 构建 AVIMClient
    avRealtime.CreateClient("3002").ContinueWith(t =>
    {
        zhouyu = t.Result;
    }).ContinueWith(s =>
    {
        // 关键参数是 isTransient: true
        zhouyu.CreateConversationAsync(member: "2002",
            name: "江东讨贼大联盟",
            isTransient: true,
            options: new Dictionary<string, object>()
            {
                {"topic","如何击败曹操的 80 万大军"}
            });
    });
}
```

这样创建出来的对话就是暂态对话。

暂态对话和普通对话有如下不同的设定：

- 无人数限制，而普通对话最多允许 500 人加入。
- 不支持查询成员列表，但可以通过相关 API 查询在线人数。
- 不支持离线消息、离线推送通知、消息回执等功能。
- 没有成员加入、成员离开的通知。
- 一个用户一次登录只能加入一个聊天室，加入新的聊天室后会自动离开原来的聊天室。
- 加入后半小时内断网重连会自动加入原聊天室，超过这个时间则需要重新加入。

#### 获取暂态对话
在介绍 [查询私聊](#获取私聊) 时我们构建了一个对话的查询，我们可以继续使用该查询，只要修改查询条件就可以找出当前 client 所参与的所有暂态对话：

```cs
public void QueryTransientConversations()
{
    AVIMClient caocao = null;
    // 以周瑜的游戏 ID 3002 作为 client Id 构建 AVIMClient
    avRealtime.CreateClient("2001").ContinueWith(t =>
    {
        caocao = t.Result;
    }).ContinueWith(s =>
    {
        var query = caocao.GetQuery().WhereEqualTo("tr", true);
        return query.FindAsync();
    }).Unwrap().ContinueWith(x => 
    {
        var privateConversations = x.Result;
        foreach (var conv in privateConversations)
        {
            //这就找到了所有周瑜所在的所有聊天室
        }
    });
}
```

## 单点登录

游戏对应着多个客户端，例如 Android 客户端和 iOS 客户端。每一个客户端是互斥的，换言之，较早前登录的客户端会被新登录的设备踢下线，这在聊天系统里面也很常见，因此我们提供了实现这个需求的机制，具体代码如下：

```cs
avRealtime.CreateClient("1001", tag: "Unity", deviceId: "iOS-Device-Id");
```
需要理解的参数含义：

- `tag`：标记这次登录的标签
- `deviceId`：当前登录的设备绝对不变的 Id。开发者可以自行维护这个 id，也可以通过 API  来获取，云端不做校验。

为了让开发者更好地理解这些参数，我们以 QQ 来举例。假设当前开发者在 Windows 上登录 QQ 桌面版客户端，那么在 SDK 中可以用如下代码模拟 QQ 的登录：

```cs
// 假设 QQ 号位 123456789，tag 是桌面版，deviceId 是 33C46106-4EE2-4084-9547-56AC8D778E6D
avRealtime.CreateClient("123456789", tag: "Desktop", deviceId: "33C46106-4EE2-4084-9547-56AC8D778E6D");
```

而当同一个 Client Id 使用相同的 tag 登录的时候，较早前登录的就会被云端强制踢下线：

```cs
// 新的登录
avRealtime.CreateClient("123456789", tag: "Desktop", deviceId: "50904E08-3DC0-42C4-810C-DEC64D033EF3");
```

而使用不同 Tag 登录的不会产生冲突，这是为了方便用户实现多端同步，类似于 QQ 手机版和 QQ 电脑版是可以同时登录：

```cs
avRealtime.CreateClient("123456789", tag: "Mobile", deviceId: "201113D4-D329-4971-81EE-A2F2E526BE31");
```

#### 监听单点登录被踢下线

通过订阅 `AVIMClient.OnSessionClosed` 可以监听云端关闭连接的原因：

```cs
public void SessionConflicted()
{
    AVIMClient liubei = null;
    avRealtime.CreateClient("1001", tag: "Unity", deviceId: "iOS-Device-Id").ContinueWith(t =>
    {
        liubei = t.Result;
    }).ContinueWith(s =>
    {
        liubei.OnSessionClosed += Liubei_OnSessionClosed;
    });
}

private void Liubei_OnSessionClosed(object sender, AVIMSessionClosedEventArgs e)
{
    // 云端错误码
    if (e.Code == 4111)
    {
        Debug.Log("您的 client Id 在别处登录，当前登录失效，连接已断开。");
    }
}
```

错误码可以参考：[云端错误码](realtime_v2.html#云端错误码说明)。

## 自定义 SDK

Unity 的聊天 SDK 将 WebSocket 客户端的基本行为封装成了一个接口：

```cs
/// <summary>
/// LeanCloud WebSocket 客户端接口
/// </summary>
public interface IWebSocketClient
{

    /// <summary>
    /// 客户端 WebSocket 长连接是否打开
    /// </summary>
    bool IsOpen { get; }

    /// <summary>
    /// WebSocket 长连接关闭时触发的事件回调
    /// </summary>
    event Action<int, string, string> OnClosed;

    /// <summary>
    /// WebSocket 客户端遇到了错误时触发的事件回调
    /// </summary>
    event Action<string> OnError;

    /// <summary>
    /// 暂时留作日后打开日志跟踪时，当前版本并未调用，无需实现
    /// </summary>
    event Action<string> OnLog;
    /// <summary>
    /// 云端发送数据包给客户端，WebSocket 接收到时触发的事件回调
    /// </summary>
    event Action<string> OnMessage;

    /// <summary>
    /// 客户端 WebSocket 长连接成功打开时，触发的事件回调
    /// </summary>
    event Action OnOpened;

    /// <summary>
    /// 主动关闭连接
    /// </summary>
    void Close();

    /// <summary>
    /// 打开连接
    /// </summary>
    /// <param name="url">wss 地址</param>
    /// <param name="protocol">子协议</param>
    void Open(string url, string protocol = null);
    /// <summary>
    /// 发送数据包的接口
    /// </summary>
    /// <param name="message"></param>
    void Send(string message);
}
```

在 Unity SDK 中默认提供的使用的是 [sta/websocket-sharp](https://github.com/sta/websocket-sharp) 作为 WebSocket 客户端，这里给出以 [sta/websocket-sharp](https://github.com/sta/websocket-sharp) 实现上述接口的代码如下：

```cs
using System;
using WebSocketSharp;

/// <summary>
/// LeanCluod Unity Realtime SDK 内置默认的 WebSocketClient
/// 开发者可以在初始化的时候指定自定义的 WebSocketClient
/// </summary>
public class DefaultWebSocketClient : IWebSocketClient
{
    WebSocket ws;
    public bool IsOpen
    {
        get
        {
            return ws.IsAlive;
        }
    }

    public event Action<int, string, string> OnClosed;
    public event Action<string> OnError;
    public event Action<string> OnLog;
    public event Action<string> OnMessage;
    public event Action OnOpened;

    public void Close()
    {
        ws.CloseAsync();
        ws.OnOpen -= OnOpen;
        ws.OnMessage -= OnWebSokectMessage;
        ws.OnClose -= OnClose;
    }

    public void Open(string url, string protocol = null)
    {
        ws = new WebSocket(url);
        ws.OnOpen += OnOpen;
        ws.OnMessage += OnWebSokectMessage;
        ws.OnClose += OnClose;
        ws.ConnectAsync();
    }

    private void OnClose(object sender, CloseEventArgs e)
    {
        AVRealtime.PrintLog("Unity websocket closed without parameters.");
        if (this.OnClosed != null)
            this.OnClosed(e.Code, e.Reason, "");
    }

    private void OnWebSokectMessage(object sender, MessageEventArgs e)
    {
        if (this.OnMessage != null)
            this.OnMessage(e.Data);
    }

    private void OnOpen(object sender, EventArgs e)
    {
        if (this.OnOpened != null)
            this.OnOpened();
    }

    public void Send(string message)
    {
        if (this.IsOpen)
        {
            ws.SendAsync(message, (b) =>
            {

            });
        }

    }
}
```


假设开发者自己实现了上述接口，可以在初始化时指定给 SDK，这样 SDK 就会调用指定的 IWebSocketClient 来访问聊天服务端：

```cs
public class ChatTest : MonoBehaviour
{
    AVRealtime realtime;

    void Start()
    {
        var config = new AVRealtime.Configuration()
        {
            ApplicationId = "应用 appId",
            ApplicationKey = "应用 appKey",
            WebSocketClient = new MyWebSocketClient()// 这里可以换成开发者自己的实现
        };
        realtime = new AVRealtime(config);
    }
}
```


## 消息

### 自定义消息类型

之前的代码和示例仅演示了文本消息类型的发送和接收，在游戏中文本消息固然是一种主要类型，但更为普遍的是表情消息，一般情况下实现表情消息的步骤如下：

1. 客户端将表情图片事先按照编号（类似于 #1、#2）存储在客户端的资源包里
2. 消息发送的时候，从本地资源包内加载表情列表，然后用户选择一个表情，点击发送
3. 发送的时候，并没有实际发送这个表情的物理文件，而是将编号发送给对方接收端
4. 接收端收到编号之后，在加载消息详情时，根据编号读取物理文件，显示出来

这是传统网游在实现表情消息的逻辑，实际上可以看出，表情消息在代码层面本质上依然是个文本消息，接下来我们就来自定义一个表情消息。

#### 类型编码

在介绍自定义消息之前，开发者可以在调试过程中打开日志打印的功能，每一次客户端和云端的相互发送 WebSocket 消息的内容会打印在 `UnityEngine.Debug.Log` 的控制台上：

```cs
AVRealtime.WebSocketLog(UnityEngine.Debug.Log);
```

然后可以运行一下之前刘备给关羽发消息的代码，这样在控制台就能看到如下日志内容：

```json
websocket=>{"msg":"{\"_lctype\":-1,\"_lctext\":\"兄弟们，睡什么睡，起来嗨！\"}","cid":"58ddc56e92509726c3dc3322","r":true,"i":-65533,"cmd":"direct","appId":"uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap","peerId":"1001"}
websocket<={"uid":"_6jfc+4KT7KtkEgw8lJnAA","t":1490929028400,"i":-65533,"cmd":"ack","appId":"uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap","peerId":"1001"}
```

- `websocket=>` 后面的内容是：由客户端发往 LeanCloud 云端。
- `websocket<=` 则代表：由云端发往客户端的内容。

从上面的日志可以看出，一条文本消息的主要内容就是 msg 这个字段里面的内容：

```json
{"msg":{"_lctype":-1,"_lctext":"兄弟们，睡什么睡，起来嗨！"}}
```

一条文本消息由两个字段组成：类型和文本内容。在 LeanCloud 实时通讯私有协议里面，带有下划线 `_lc` 是受保护字段，SDK 都会主动识别这个字段的含义。

因此要实现一个表情消息，开发者可以自定义这个 `_lctype` 的值，比如设置成 1。

{{ docs.alert("注意：不建议开发者对 `_lctype` 使用负数值，而建议使用从 1 开始的正数。") }}


### 1.消息子类化

首先，我们定义一个表情消息类：

```cs
/// <summary>
/// 自定义表情消息
/// </summary>
[AVIMMessageClassName(1)]
public class Emoji : AVIMMessage
{
    /// <summary>
    /// 表情编号
    /// </summary>
    [AVIMMessageFieldName("eCode")]
    public string ECode { get; set; }

    /// <summary>
    /// 构建消息体
    /// </summary>
    /// <returns></returns>
    public override Task<AVIMMessage> MakeAsync()
    {
        this.Attribute("_lctype", 1);
        this.Attribute("ecode", ECode);
        return base.MakeAsync();
    }
}
```

然后在程序初始化的时候一定要注册这个子类：

```cs
AVIMMessage.RegisterSubclass<Emoji>();
```

发送的时候如下：

```cs
Emoji emojiMessage = new Emoji() { ECode = "U+1F601" };
currentConveration.SendMessageAsync(emojiMessage);
```

接收方代码如下：

```cs
private void OnEmojiMessageReceived(object sender, AVIMMesageEventArgs e)
{
    if (e.Message is Emoji)
    {
        var emojiMessage = (Emoji)e.Message;
        var ecode = emojiMessage.ECode;
        Debug.Log(string.Format("received emoji with code is {0}", ecode));
    }
}
```

注意：接收方也一定要注册子类。

可以打开日志查看：

```cs
websocket=>{"msg":"{\"_lctype\":1,\"ecode\":\"U+1F601\"}","cid":"58ddc56e92509726c3dc3322","r":true,"i":-65533,"cmd":"direct","appId":"uay57kigwe0b6f5n0e1d4z4xhydsml3dor24bzwvzr57wdap","peerId":"1001"}
```

`AVIMMessageClassName` 属性标记的就是最后 `_lctype` 的值，我们设定的是 1。

### 2.Free-Schema 消息体（非子类化）
根据开发者反应，诸多限制会让游戏开发者选择一种自由的格式去收发自定义的消息体，子类化只是满足的一部分的需求，因此我们也设计了一种方式让开发者可以自由定义消息格式并不一定要继承自 `AVIMMessage`，比如某一个需求是游戏当中需要发送一个二进制消息的格式，我们以此为案例从自定义消息类型声明，发送消息，以及接收消息三个步骤来实现这个需求。

#### 2.1消息字典
为了方便开发者自由的使用 `IDictionary<string,object>` 作为消息体，`AVIMMessage` 默认提供了一个构造函数:

```cs
/// <summary>
/// 根据字典创建一个消息
/// </summary>
/// <param name="body"></param>
public AVIMMessage(IDictionary<string, object> body);
```

`body` 里面的键值对就会作为消息体发送出去。另外需要格外强调的是 `body` 里面的内容会按照[数据类型](https://leancloud.cn/docs/rest_api.html#数据类型)进行 JSON 格式转化，而 SDK 会在接收到字典之后，自动做一次反序列化，例如如下消息:

```cs
IDictionary<string, object> messageBody = new Dictionary<string, object>()
{
    {"key1","value1" },
    {"key2",2 },
    {"key3",true },
    {"key4",DateTime.Now },
    {"key5",new List<string>() { "str1","str2","str3"} },
};
var message = new AVIMMessage(messageBody);
convsersation.SendMessageAsync(message);
```

接收的时候直接读取即可:

```cs
private void OnMessageReceived(object sender, AVIMMesageEventArgs e)
{
    if (e.Message.Body.ContainsKey("key4"))
    {
        var datetime = e.Message.Body["key4"] as DateTime;
    }   
}
```


#### 2.2自定义消息类型声明
参考如下定义，我们声明了一个二进制消息：

```cs
/// <summary>
/// 二进制消息
/// </summary>
public class BinaryMessage
{
    private string dataString;
    /// <summary>
    /// 从 bytes[] 构建一条消息
    /// </summary>
    /// <param name="data"></param>
    public BinaryMessage(byte[] data)
    {
        //用 Base64 编码，这里也可以选择其他的编码方式
        dataString = System.Convert.ToBase64String(data);
    }

    /// <summary>
    /// 自行构建消息字典
    /// </summary>
    /// <returns></returns>
    public AVIMMessage EncodeForSending()
    {
        var msgBody = new Dictionary<string, object>()
        {
            { "data" , dataString},
            { "myType" , "bin"}
        };
        return new AVIMMessage(msgBody);
    }
}
```

##### 发送自定义消息
假设我们发送的二进制内容是一个字符串：“I love Unity”，那么使用这个类型并且发送这个类型消息的代码如下：

```cs
private Task SendBinaryMessageAsync()
{
    var text = "I love Unity";
    var textBytes = System.Text.Encoding.UTF8.GetBytes(text);
    var binaryMessage = new BinaryMessage(textBytes);
    var afterEncode = binaryMessage.EncodeForSending();
    convsersation.SendMessageAsync(afterEncode);
}
```

打开日志监听可以看见 websocket 发送的内容如下：
```json
websocket=>{"msg":"{\"data\":\"SSBsb3ZlIFVuaXR5\",\"myType\":\"bin\"}","cid":"58d4c2472e9af6631e10092f","r":true,"i":-65532,"cmd":"direct","appId":"021h1hbtd5shlz38pegnpkmq9d3qf8os1vt0nef4f2lxjru8","peerId":"junwu"}
```

##### 接收方获取自定义消息
接收方通过订阅 `AVIMClient.OnMessageReceived` 事件来监听消息的接受:
```cs
private void AVIMClient_OnMessageReceived(object sender, AVIMMesageEventArgs e)
{
    if (e.Message.Body.ContainsKey("myType"))
    {
        if ("bin".Equals(e.Message.Body["myType"]))
        {
            string dataStr = e.Message.Body["data"] as string;
            var base64EncodedBytes = System.Convert.FromBase64String(dataStr);
            // 这里拿到的 text 就应该是发送的内容：I love Unity
            var text = System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
        }
    }   
}
```

## 聊天记录

首先我们需要十分谨慎地对待聊天记录。我们要明确一个重要的设定：Unity 目前没有针对聊天记录做本地缓存，根据一般的游戏场景需求，每一次登录，一般情况下，除了一些极少数的游戏提供了可以搜索私聊的聊天记录之外，允许玩家大量搜索聊天记录或者展现聊天记录的需求很少，加之将 Unity 操作 sqlite 的能力集成在 SDK 这一层并不是很方便，因此 LeanCloud Unity 实时通讯 SDK 没有实现缓存功能。

我们提供了实时获取聊天记录的功能，但是因为这个功能很消耗服务端的性能，因此我们建议开发者可以自行实现本地缓存的功能（假设有需求的情况下），另外我们需要声明：我们暂时不限制用户应用中聊天记录的保存时间和条数。未来如有变化我们会提前通知用户，开发者可以随时通过 REST API 将聊天记录同步到自己的服务器上。

获取聊天记录的接口如下：

```cs
public void QueryMessageHistory() 
{
    avRealtime.CreateClient("junwu").ContinueWith(t =>
    {
        avIMClient = t.Result;
    }).ContinueWith(s =>
    {
        // 通过 Id 和 AVIMClient 构建 AVIMConversation 实例
        AVIMConversation conversation = AVIMConversation.CreateWithoutData("58be1f5392509726c3dc1c8b", avIMClient);
        return conversation.QueryMessageAsync();
    }).Unwrap().ContinueWith(x => 
    {
        var history = x.Result;
        foreach (var message in history) 
        {
            if (message is AVIMTextMessage) 
            {
                var textMessage = message as AVIMTextMessage;
                Debug.Log(textMessage.TextContent);
            }
        }
    });
}
```

要实现翻页效果需要额外传入其他参数：

参数名|类型|说明|用法
---|---|---|---
`beforeMessageId`|string|从 `beforeMessageId` 开始向前查询（和 `beforeTimeStampPoint` 共同使用，为防止某毫秒时刻有重复消息）|`conversation.QueryMessageAsync("某一条消息的 Id")`
`afterMessageId`|string|截止到某个 afterMessageId (不包含)|`conversation.QueryMessageAsync(afterMessageId:"某一条消息的 Id")`
`beforeTimeStampPoint`|DateTime?|从 `beforeTimeStampPoint` 开始向前查询|`conversation.QueryMessageAsync(beforeTimeStampPoint:DateTime.Now)`
`afterTimeStampPoint`|DateTime?|拉取截止到 `afterTimeStampPoint` 时间戳（不包含）|`conversation.QueryMessageAsync(afterTimeStampPoint:DateTime.Now.AddDays(2))`

## 鉴权与签名
实时通讯系统中往往会存在一定的管理需求，例如游戏中 GM 会禁言某一些不良行为的玩家，或者说不允许某一个玩家加入到某个频道，在 LeanCloud 实时通讯中采用的签名鉴权的方式，关于签名鉴权的流程开发者一定要详细阅读如下内容：[权限和认证](https://leancloud.cn/docs/realtime_v2.html#权限和认证),而在 SDK 中，开发者需要通过实现 `ISignatureFactory` 接口，并且在初始化的时候指定给 `AVRealtime` ：

### 云引擎签名实例
为了配合如下代码的运行，首先开发者需要部署：[LeanCloud 实时通信云引擎签名 Demo](https://github.com/leancloud/realtime-messaging-signature-cloudcode) 到您应用的云引擎中。

```cs
public class LeanEngineSignatureFactory : ISignatureFactory
{
    public Task<AVIMSignature> CreateConnectSignature(string clientId)
    {
        var data = new Dictionary<string, object>();
        data.Add("client_id", clientId);
        return AVCloud.CallFunctionAsync<IDictionary<string,object>>("sign2", data).OnSuccess(_ => 
        {
            var jsonData = _.Result;
            var s = jsonData["signature"].ToString();
            var n = jsonData["nonce"].ToString();
            var t = long.Parse(jsonData["timestamp"].ToString());
            var signature = new AVIMSignature(s,t,n);
            return signature;
        });
    }

    public Task<AVIMSignature> CreateConversationSignature(string conversationId, string clientId, IEnumerable<string> targetIds, ConversationSignatureAction action)
    {
        var actionList = new string[] { "invite", "kick" };
        var data = new Dictionary<string, object>();
        data.Add("client_id", clientId);
        data.Add("conv_id", conversationId);
        data.Add("members", targetIds.ToList());
        data.Add("action", actionList[(int)action]);
        return AVCloud.CallFunctionAsync<IDictionary<string, object>>("sign2", data).OnSuccess(_ =>
        {
            var jsonData = _.Result;
            var s = jsonData["signature"].ToString();
            var n = jsonData["nonce"].ToString();
            var t = long.Parse(jsonData["timestamp"].ToString());
            var signature = new AVIMSignature(s, t, n);
            return signature;
        });
    }

    public Task<AVIMSignature> CreateQueryHistorySignature(string clientId, string conversationId)
    {
        return Task.FromResult<AVIMSignature>(null);
    }

    public Task<AVIMSignature> CreateStartConversationSignature(string clientId, IEnumerable<string> targetIds)
    {
        var data = new Dictionary<string, object>();
        data.Add("client_id", clientId);
        data.Add("members", targetIds.ToList());
        return AVCloud.CallFunctionAsync<IDictionary<string, object>>("sign2", data).OnSuccess(_ =>
        {
            var jsonData = _.Result;
            var s = jsonData["signature"].ToString();
            var n = jsonData["nonce"].ToString();
            var t = long.Parse(jsonData["timestamp"].ToString());
            var signature = new AVIMSignature(s, t, n);
            return signature;
        });
    }
}
```

然后在初始化的时候制定给 `AVRealtime`：

```cs
var config = new AVRealtime.Configuration()
{
    ApplicationId = "{{appId}}",
    ApplicationKey = "{{appKey}}",
    SignatureFactory = new LeanEngineSignatureFactory()
};
var realtime = new AVRealtime(config);
```

如此做就实现了云引擎对聊天签名鉴权的操作。
开发者可以在云引擎的云函数里面实现自己的鉴权逻辑，谁可以加入对话，谁可以踢人加人都有云函数返回的签名是否正确来判断，如果允许就返回一个符合算法的签名，LeanCloud 云端经过比对签名就可以放行，而开发者的云函数返回了一个错误的签名，比如随便一个字符串“no!”，这样 SDK 会带着这个签名去 LeanCloud 云端请求，而 LeanCloud 云端发现签名不匹配就会拒绝这次请求。


## 常见问题

### 游戏中的「世界频道」对应 LeanCloud 聊天的哪个类型的对话？

世界频道的特点是：

- 几乎无上限数量的参与人员（服务器最大承受能力的玩家数量）
- 没有离线消息的概念，玩家在线就能收到，不在线就收不到

显然世界频道就是聊天室，请使用暂态对话来解决这个需求。
  


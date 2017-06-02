{% import "views/_helper.njk" as docs %}
{% macro customMessage() %}

## 消息

### 自定义消息类型

之前的代码和示例仅演示了文本消息类型的发送和接收，在游戏中文本消息固然是一种主要类型，但更为普遍的是表情消息，一般情况下实现表情消息的步骤如下：

1. 客户端将表情图片事先按照编号（类似于 #1、#2）存储在客户端的资源包里
2. 消息发送的时候，从本地资源包内加载表情列表，然后用户选择一个表情，点击发送
3. 发送的时候，并没有实际发送这个表情的物理文件，而是将编号发送给对方接收端
4. 接收端收到编号之后，在加载消息详情时，根据编号读取物理文件，显示出来

这是传统网游在实现表情消息的逻辑，实际上可以看出，表情消息在代码层面本质上依然是个文本消息，接下来我们就来自定义一个表情消息。

#### 类型编码
在介绍自定义消息之前，开发者可以在调试过程中打开日志打印的功能[打开调试日志](#打开调试日志)，每一次客户端和云端的相互发送 WebSocket 消息的内容会打印在控制台上

然后可以运行一下发送消息的代码，在控制台就能看到如下日志内容：

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

因此要实现一个表情消息，开发者可以自定义使用 `AVIMTypedMessageTypeIntAttribute` 标注一个 `AVIMTypedMessage` 的子类，SDK 在发送消息的时候会自动的在消息体内部把它的值转化为 `_lctype` 的值，比如设置成 2：

```cs
[AVIMMessageClassName("MyTypedMessage")]
[AVIMTypedMessageTypeIntAttribute(2)]// 加了这个标记之后，2 会被自动添加为 `_lctype` 的类型值
public class MyTypedMessage: AVIMTypedMessage {
    public MyTypedMessage()
    {

    }
}
```
控制台可以看见如下的日志：
```json
websocket=>{"msg":"{\"...\":\"...\",\"_letype\":2}","cid":"58d4c2472e9af6631e10092f","r":true,"i":-65532,"cmd":"direct","appId":"021h1hbtd5shlz38pegnpkmq9d3qf8os1vt0nef4f2lxjru8","peerId":"1002"}
```


{{ docs.alert("注意：不建议开发者对 `_lctype` 使用负数值，而建议使用从 1 开始的正数。") }}

### 1. 消息子类化

#### 1.1 继承 AVIMTypedMessage
定义一个 `Emoji` 类:

```cs
/// <summary>
/// 自定义表情消息
/// </summary>
[AVIMMessageClassName("Emoji")]
[AVIMTypedMessageTypeIntAttribute(2)]// 加了这个标记之后，2 会被自动添加为 `_lctype` 的类型值
public class Emoji: AVIMTypedMessage
{
    [AVIMMessageFieldName("Ecode")]
    public string Ecode { get; set; }
}
```

然后在程序初始化的时候一定要注册这个子类：

```cs
avRealtime.RegisterMessageType<Emoji>();
```

发送的时候如下：

```cs
var emojiMessage = new Emoji()
{
    Ecode = "#e001",// 应用内置的表情编码
};
currentConveration.SendMessageAsync(emojiMessage);
```

接收方代码如下：

```cs
private void OnMessageReceived(object sender, AVIMMessageEventArgs e)
{
    if (e.Message is Emoji)
    {
        var emojiMessage = (Emoji)e.Message;
        var ecode = emojiMessage.Ecode;
        Debug.Log(string.Format("received emoji with code is {0}", ecode));
        // 当接收方接收到了这条表情消息，可以在客户端做一些酷炫的 UI 展现
    }
}
```

注意：接收方也一定要注册子类。

可以打开日志查看：

```json
websocket=>{"msg":"{\"ECode\":\"#e001\",\"_letype\":2}","cid":"58d4c2472e9af6631e10092f","r":true,"i":-65532,"cmd":"direct","appId":"021h1hbtd5shlz38pegnpkmq9d3qf8os1vt0nef4f2lxjru8","peerId":"1002"}
```

#### AVIMTypedMessage 详解

`AVIMTypedMessage` 的设计目的是为了提供默认的基于 JSON 消息体的基类，例如 `AVIMTextMessage` 类对应为文本消息，它的消息体是如下格式的 JSON 字符串：

```json
{\"_lctext\":\"text content\",\"_lctype\":-1}
```

而加了 `AVIMTypedMessageTypeIntAttribute` 标记之后会自动的被 SDK 识别为 `_lctype` 发送到对话中，例如上面的 `Emoji` 消息：

```json
{\"ECode\":\"#e001\",\"_letype\":2}
```

因此 `AVIMTypedMessage` 的子类都会对 msg 字段进行 JSON 序列化和反序列化。

#### 1.2 继承 AVIMMessage 

为了更加开放地允许开发者自定义自己的消息类，SDK 提供了一个接口，只要开发者实现自定义的消息类实现了这个接口，这个消息就可以在 SDK 中发送，并且在接收时返回的也是这个消息的实例。继续以上面的表情消息做例子，这次我们定义为一个 V2 版本的表情消息：

```cs
[AVIMMessageClassName("EmojiV2")]
public class EmojiV2 : AVIMMessage
{
    // 默认构造函数
    public EmojiV2()
    {

    }
    public EmojiV2(string ecode)
    {
        Content = ecode;
    }
}
```

十分重要的细节：**子类化的时候，子类必须有一个默认的构造函数，否则在注册的时候会跑出 ArgumentException 的错误**。

注册子类：

```cs
avRealtime.RegisterMessageType<EmojiV2>();
```

发送的代码如下：

```cs
var emojiV2Message = new EmojiV2("#e001");
conversation.SendMessageAsync(emojiV2Message);
```

在日志中可以看到它实际发送的内容：

```json
websocket=>{"msg":"#e001","cid":"58d4c2472e9af6631e10092f","r":true,"i":-65532,"cmd":"direct","appId":"021h1hbtd5shlz38pegnpkmq9d3qf8os1vt0nef4f2lxjru8","peerId":"1001"}
```

### 2. Free-Schema 消息体（非子类化）
我们了解到诸多限制会让游戏开发者选择一种自由的格式去收发自定义的消息体，子类化只是满足了一部分需求，因此我们也设计了一种方式，让开发者可以自由定义消息格式而并不一定要继承自 `AVIMMessage`，比如在游戏当中需要发送一个二进制格式的消息，我们按照自定义消息类型声明、发送消息、以及接收消息三个步骤来实现这个需求。


#### 2.1 实现 IAVIMMessage 接口

参考如下定义，我们声明了一个二进制消息：

```cs
 /// <summary>
/// 二进制消息
/// </summary>
[AVIMMessageClassName("BinaryMessage")]
public class BinaryMessage : IAVIMMessage
{
    public BinaryMessage()
    {

    }
    /// <summary>
    /// 从 bytes[] 构建一条消息
    /// </summary>
    /// <param name="data"></param>
    public BinaryMessage(byte[] data)
    {
        BinaryData = data;
    }

    public byte[] BinaryData { get; set; }

    public string ConversationId
    {
        get; set;
    }

    public string FromClientId
    {
        get; set;
    }

    public string Id
    {
        get; set;
    }

    public long RcpTimestamp
    {
        get; set;
    }

    public long ServerTimestamp
    {
        get; set;
    }

    public IAVIMMessage Deserialize(string msgStr)
    {
        var spiltStrs = msgStr.Split(':');
        this.BinaryData = System.Convert.FromBase64String(spiltStrs[1]);
        return this;
    }

    public string Serialize()
    {
        return "bin:" + System.Convert.ToBase64String(this.BinaryData);
    }

    public bool Validate(string msgStr)
    {
        var spiltStrs = msgStr.Split(':');
        return spiltStrs[0] == "bin";
    }
```

注册子类:

```cs
realtime.RegisterMessageType<BinaryMessage>();
```

##### 发送自定义消息
假设我们发送的二进制内容是一个字符串「I love Unity」，那么使用这个类型并且发送这个类型消息的代码为：

```cs
private Task SendBinaryMessageAsync()
{
    var text = "I love Unity";
    var textBytes = System.Text.Encoding.UTF8.GetBytes(text);
    var binaryMessage = new BinaryMessage(textBytes);
    convsersation.SendMessageAsync(binaryMessage);
}
```

打开日志监听可以看见 websocket 发送的内容如下：

```json
{"msg":"bin:SSBsb3ZlIFVuaXR5","cid":"58d4c2472e9af6631e10092f","r":true,"i":-65531,"cmd":"direct","appId":"021h1hbtd5shlz38pegnpkmq9d3qf8os1vt0nef4f2lxjru8","peerId":"1001"}
```

##### 接收方获取自定义消息

接收方通过订阅 `AVIMClient.OnMessageReceived` 事件来监听消息的接收:

```cs
private void AVIMClient_OnMessageReceived(object sender, AVIMMessageEventArgs e)
{
    if (e.Message is BinaryMessage)
    {
        var binaryMessage = e.Message as BinaryMessage;
        var binaryData = binaryMessage.BinaryData;
        // 下面的字符串内容就是 I love Unity
        var text = System.Text.Encoding.UTF8.GetString(binaryData);
    } 
}
```
{% endmacro %}


{% macro signature() %}
## 鉴权与签名
实时通讯系统中往往会存在一定的管理需求，例如游戏中 GM 会禁言某一些不良行为的玩家，或者说不允许某一个玩家加入到某个频道。LeanCloud 实时通讯采用签名鉴权的方式，请开发者务必详细了解 [权限和认证](realtime_v2.html#权限和认证)。而在 SDK 中，开发者需要通过实现 `ISignatureFactory` 接口，并且在初始化的时候指定给 `AVRealtime`：

### 云引擎签名实例
为了配合如下代码的运行，首先开发者需要部署 [LeanCloud 实时通信云引擎签名 Demo](https://github.com/leancloud/realtime-messaging-signature-cloudcode) 到你应用的云引擎中。

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

然后在初始化的时候指定给 `AVRealtime`：

```cs
var config = new AVRealtime.Configuration()
{
    ApplicationId = "{{appId}}",
    ApplicationKey = "{{appKey}}",
    SignatureFactory = new LeanEngineSignatureFactory()
};
var realtime = new AVRealtime(config);
```

按照以上步骤就能实现云引擎对聊天签名鉴权的操作。

开发者可以使用云引擎的云函数来实现自己的鉴权逻辑，比如谁可以加入对话、谁可以踢人加人，都由云函数返回的签名是否正确来判断——如果允许就返回一个符合算法的签名，LeanCloud 云端比对过签名就可以放行，而开发者的云函数返回了一个错误签名时，比如随便一个字符串「no!」，SDK 带着这个签名去 LeanCloud 云端请求，云端发现签名不匹配便会拒绝这次请求。

{% endmacro %}

{% macro exception() %}

## 异常处理
在所有 SDK 内部的异步方法中(返回值为`Task`类型的接口)，异常都不会直接抛出而是会在 `Task.Exception` 里面获取，参考如下处理方式。

假设场景是因为意外情况短断线，但是用户恰巧在断线的时候点击发送消息，那么 SDK 会抛出一个异常

```cs
conversation.SendMessageAsync(new AVIMTextMessage("兄弟们，睡什么睡，起来嗨！")).ContinueWith(s =>
{
    if (s.Exception != null)
    {
        // 通过获取异常集合来判断该项操作所可能导致了多种异常
        var inners = s.Exception.InnerExceptions;

        if (inners != null)
        {
            Debug.Log("inners");
            foreach (var e in inners)
            {
                // 这里一定会有一个异常消息为：未能连接到服务器，无法发送消息。
                Debug.Log(e.Message);
            }
        }
    }
});
```

更为直接的方式是直接判断 `Task.IsFaulted` 就可以知道 `Task` 是否在执行的时候存在错误:

```cs
conversation.SendMessageAsync(new AVIMTextMessage("兄弟们，睡什么睡，起来嗨！")).ContinueWith(s =>
{
    if (s.IsFaulted)
    {
        Debug.Log("发送失败");
    }
});
```

{% endmacro %}
# .Net Standard SDK 迁移指南

如果你还在使用我们老版的 .Net SDK，要迁移到新版的 .Net Standard SDK，请阅读以下指南。如果你使用的已经是新版的 SDK，那么可以忽略本文档。

## 新老版本的差异说明

与老版本 SDK 相比，新版 SDK 的主要改进有以下几方面：

- 全部开源。
- 使用 .Net Standard 2.0 接口标准，减少第三方库依赖。
- 支持更多平台，包括 .Net Core，Unity，Xamarin，Mono 等。
- 完善 API 接口。
- 即时通讯的协议升级为 protobuf。

## 新版 SDK 结构说明

- Common：基础工具库。
- Storage：数据存储功能。
- Realtime：即时通讯功能。
- LiveQuery：实时数据同步功能。

## 新版 SDK 主要改动

### 类名前缀

由之前的 AV 改为 LC。

### 简化异步函数命名

去掉 Async 结尾。

### 简化初始化

旧版 SDK 在 Unity 下需要挂载 `AVInitializeBehavior` 脚本，即时通讯还要挂载 AVRealtimeBehavior，经常由于 SDK 升级等原因，导致挂载脚本缺失。所以在新版 SDK 中只要统一初始化即可：

```csharp
LCApplication.Initialize("APP_ID", "APP_KEY", "SERVER_URL");
```

LCRealtime 不需要单独初始化，直接创建 LCIMClient 即可：

```csharp
LCIMClient c1 = new LCIMClient("CLIENT_ID");
```

### 子类化

之前有用户反馈旧版 SDK 定义子类化时 Attribute 参数大小写混淆的问题，所以在新版 SDK 去掉了 Attribute。

```csharp
// 定义子类
internal class Hello : LCObject {
  internal World World => this["objectValue"] as World;
  internal Hello() : base("Hello") {
  }
}

// 注册
LCObject.RegisterSubclass("Hello", () => new Hello());
```

### LiveQuery

不需要额外初始化，直接注册即可：

```csharp
// 引入包
using LeanCloud.LiveQuery;

// 注册查询条件
LCQuery<LCObject> query = new LCQuery<LCObject>("Account");
query.WhereGreaterThan("balance", 100);
liveQuery = await query.Subscribe();
```

### 即时通讯接口

#### 新增查询接口

- LCIMConversationQuery#Compact：忽略对话成员。

- LCIMConversationQuery#WithLastMessageRefreshed：带上最新消息。

#### 新增回调

- 连接断开回调

  ```csharp
  public Action<int, string> OnClose;
  ```

- 对话回调

  ```csharp
  // 对话成员被拉黑
  public Action<LCIMConversation, ReadOnlyCollection<string>, string> OnMembersBlocked;
  // 对话成员被解除黑名单
  public Action<LCIMConversation, ReadOnlyCollection<string>, string> OnMembersUnblocked;
  // 对话成员被禁言
  public Action<LCIMConversation, ReadOnlyCollection<string>, string> OnMembersMuted;
  // 对话成员被解除禁言
  public Action<LCIMConversation, ReadOnlyCollection<string>, string> OnMembersUnmuted;
  // 对话成员属性更新
  public Action<LCIMConversation, string, string, string> OnMemberInfoUpdated;
  // 最新送达消息更新
  public Action<LCIMConversation> OnLastDeliveredAtUpdated;
  // 最新已读消息更新
  public Action<LCIMConversation> OnLastReadAtUpdated;
  ```

- 消息回调

  ```csharp
  // 消息已送达回调
  public Action<LCIMConversation, string> OnMessageDelivered;
  // 消息已读回调
  public Action<LCIMConversation, string> OnMessageRead;
  ```

- 完善接口

  旧版 SDK 在`消息`相关回调后，需要用户单独查询对话，新版将这一逻辑实现在 SDK 内部，如：

  ```csharp
  // 接收消息
  public Action<LCIMConversation, LCIMMessage> OnMessage;
  // 消息撤回
  public Action<LCIMConversation, LCIMRecalledMessage> OnMessageRecalled;
  // 消息修改
  public Action<LCIMConversation, LCIMMessage> OnMessageUpdated;
  ```

#### 调整接口

- 旧版 SDK 「连接状态回调」由 AVRealtime 调整为 LCClient：
  - AVRealtime#OnDisconnected 调整为 LCClient.OnPaused。
  - AVRealtime#OnReconnected 调整为 LCClient.OnResume。


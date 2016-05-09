# JavaScript 实时通信 SDK v3 迁移指南

本文介绍了 JavaScript Realtime SDK version 2 API 在 version 3 中对应的用法。

## callback
v2 中所有带的 callback 参数在 v3 中均会返回 Promise，请在 Promise 的回调中处理异步 API 的成功、失败情况。下面不再赘述 callback 参数的变化。

## RealtimeObject
<span class='text-nowrap'>`RealtimeObject`</span> 在 v3 中对应的是 <span class='text-nowrap'>`Realtime`</span> 与 <span class='text-nowrap'>`IMClient`</span>，它们是分开的两个概念，一个 <span class='text-nowrap'>`Realtime`</span>  实例可以对应多个 <span class='text-nowrap'>`IMClient`</span>，与具体 <span class='text-nowrap'>`IMClient`</span> 无关的信息由 <span class='text-nowrap'>`Realtime`</span> 管理。

v2 | v3 | v3 说明
--|--|--
<span class='text-nowrap'>`AV.realtime`</span>|<span class='text-nowrap'>`Realtime`</span><br/><span class='text-nowrap'>`Realtime#createIMClient`</span>|<span class='text-nowrap'>`Realtime`</span> 需要使用 new 关键字进行初始化
└ 参数 <span class='text-nowrap'>`appId`</span>|<span class='text-nowrap'>`Realtime`</span> 参数 <span class='text-nowrap'>`appId`</span>|
└ 参数 <span class='text-nowrap'>`secure`</span>|<span class='text-nowrap'>`Realtime`</span> 参数 <span class='text-nowrap'>`ssl`</span>|
└ 参数 <span class='text-nowrap'>`clientId`</span>|<span class='text-nowrap'>`createIMClient`</span> 参数 <span class='text-nowrap'>`id`</span>|
└ 参数 <span class='text-nowrap'>`auth`</span>|<span class='text-nowrap'>`createIMClient`</span> 参数<br/><span class='text-nowrap'>`signatureFactory`</span> 以及<br/> <span class='text-nowrap'>`conversationSignatureFactory`</span>|
└ 参数 <span class='text-nowrap'>`encodeHTML`</span>|无|请使用前端模板引擎或包含视图层的前端框架。
<span class='text-nowrap'>`RealtimeObject#open`</span>|无|不再需要关心。
<span class='text-nowrap'>`RealtimeObject#close`</span>|<span class='text-nowrap'>`IMClient#close`</span>|<span class='text-nowrap'>`IMClient#close`</span> 是一个异步方法。
<span class='text-nowrap'>`RealtimeObject#on`</span><br/><span class='text-nowrap'>`RealtimeObject#once`</span><br/><span class='text-nowrap'>`RealtimeObject#emit`</span><br/><span class='text-nowrap'>`RealtimeObject#off`</span>|<span class='text-nowrap'>`Realtime`</span> 与 <span class='text-nowrap'>`IMClient`</span> 的同名方法|具体事件的变更详见 [事件](#事件)。
创建对话<br/><span class='text-nowrap'>`RealtimeObject#conv`</span> /<br/><span class='text-nowrap'>`RealtimeObject#room`</span>|<span class='text-nowrap'>`IMClient#createConversation`</span>|
获取指定 ID 的对话<br/><span class='text-nowrap'>`RealtimeObject#conv`</span> /<br/><span class='text-nowrap'>`RealtimeObject#room`</span>|<span class='text-nowrap'>`IMClient#getConversation`</span>|
<span class='text-nowrap'>`RealtimeObject#query`</span>|<span class='text-nowrap'>`IMClient#getQuery`</span>|<span class='text-nowrap'>`IMClient#getQuery`</span> 同步返回一个 <span class='text-nowrap'>`ConversationQuery`</span> 实例用于构造查询条件，再调用其 <span class='text-nowrap'>`find`</span> 方法执行该查询。
<span class='text-nowrap'>`RealtimeObject#ping`</span>|<span class='text-nowrap'>`IMClient#ping`</span>|

## RoomObject
v2 | v3 | v3 说明
--|--|--
<span class='text-nowrap'>`RoomObject#add`</span>|<span class='text-nowrap'>`Conversation#add`</span>|
<span class='text-nowrap'>`RoomObject#remove`</span>|<span class='text-nowrap'>`Conversation#remove`</span>|
<span class='text-nowrap'>`RoomObject#join`</span>|<span class='text-nowrap'>`Conversation#join`</span>|
<span class='text-nowrap'>`RoomObject#leave`</span>|<span class='text-nowrap'>`Conversation#quit`</span>|
<span class='text-nowrap'>`RoomObject#list`</span>|无|请直接访问 <span class='text-nowrap'>`Conversation`</span> 的 <span class='text-nowrap'>`members`</span> 属性，有成员变动时该属性会自动更新。
<span class='text-nowrap'>`RoomObject#send`</span>|<span class='text-nowrap'>`Conversation#send`</span>|需要 send 一个 <span class='text-nowrap'>`Message`</span> 实例，而不是一个 JSON 对象。
└ 参数 <span class='text-nowrap'>`receipt`</span><br/>└ 参数 <span class='text-nowrap'>`transient`</span><br/>└ 参数 <span class='text-nowrap'>`type`</span>|无|现在这些信息不再是「发送选项」而是 <span class='text-nowrap'>`Message`</span> 的信息。你需要调用 <span class='text-nowrap'>`Message#setNeedReceipt`</span>、 <span class='text-nowrap'>`Message#setTransient`</span> 以及构造对应类型的 <span class='text-nowrap'>`Message`</span>。
<span class='text-nowrap'>`RoomObject#receive`</span> |订阅 <span class='text-nowrap'>`Conversation`</span> 的 <span class='text-nowrap'>`message`</span> 事件|
<span class='text-nowrap'>`RoomObject#receipt`</span>|订阅 <span class='text-nowrap'>`Conversation`</span> 的 <span class='text-nowrap'>`receipt`</span> 事件|
<span class='text-nowrap'>`RoomObject#log`</span>|<span class='text-nowrap'>`Conversation#queryMessages`</span> 或<br/><span class='text-nowrap'>`Conversation#createMessagesIterator`</span>|
<span class='text-nowrap'>`RoomObject#count`</span>|<span class='text-nowrap'>`Conversation#count`</span>|
<span class='text-nowrap'>`RoomObject#update`</span>|<span class='text-nowrap'>`Conversation#setName`</span><br/><br/><span class='text-nowrap'>`Conversation#setAttribute`</span> 或<br/><span class='text-nowrap'>`Conversation#setAttributes`</span><br/><br/><span class='text-nowrap'>`Conversation#save`</span>|

## 事件
v2 中所有的事件都在 <span class='text-nowrap'>`RealtimeObject`</span> 上派发，v3 中与对话相关的事件会同时在 <span class='text-nowrap'>`Conversation`</span> 上派发。
断线重连机制已重新设计，请参考 [《JavaScript 实时通信开发指南》- 网络状态响应](./realtime_guide-js.html#网络状态响应)。

v2 | v3 | v3 说明
--|--|--
<span class='text-nowrap'>`open`</span>|无|原初始化成功时派发的 <span class='text-nowrap'>`open`</span> 事件已被移除，请使用 <span class='text-nowrap'>`Realtime#createIMClient`</span> 返回的 Promise 的成功回调代替。
<span class='text-nowrap'>`open`</span>|<span class='text-nowrap'>`reconnect`</span>|原断线重连成功时派发的 <span class='text-nowrap'>`open`</span> 事件由 <span class='text-nowrap'>`reconnect`</span> 事件代替。
<span class='text-nowrap'>`close`</span>|无|原主动断开连接时派发的 <span class='text-nowrap'>`close`</span> 事件已被移除，请使用 <span class='text-nowrap'>`IMClient.close`</span> 返回的 Promise 的成功回调代替。
<span class='text-nowrap'>`close`</span>|<span class='text-nowrap'>`disconnect`</span>|原断线时派发的 <span class='text-nowrap'>`close`</span> 事件由 <span class='text-nowrap'>`disconnect`</span> 事件代替。
<span class='text-nowrap'>`reuse`</span>|<span class='text-nowrap'>`schedule`</span><br/><span class='text-nowrap'>`retry`</span>|请参考 [《JavaScript 实时通信开发指南》- 网络状态响应](./realtime_guide-js.html#网络状态响应)。
<span class='text-nowrap'>`create`</span>|无|请使用 <span class='text-nowrap'>`IMClient#createConversation`</span> 返回的 Promise 的成功回调代替。
<span class='text-nowrap'>`invited`</span><br/><span class='text-nowrap'>`membersjoined`</span><br/><span class='text-nowrap'>`kicked`</span><br/><span class='text-nowrap'>`membersleft`</span><br/><span class='text-nowrap'>`message`</span><br/><span class='text-nowrap'>`receipt`</span>|<span class='text-nowrap'>`invited`</span><br/><code class='text-nowrap'><u>member</u>joined</code><br/><span class='text-nowrap'>`kicked`</span><br/><code class='text-nowrap'><u>member</u>left</code><br/><span class='text-nowrap'>`message`</span><br/><span class='text-nowrap'>`receipt`</span>|这些事件会同时在 <span class='text-nowrap'>`Conversation`</span> 上派发。**请额外注意 <span class='text-nowrap'>`members`</span> 改为 <span class='text-nowrap'>`member`</span>**，与其他 SDK 保持统一。

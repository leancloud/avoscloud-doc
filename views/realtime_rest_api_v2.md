{% import "views/_im.njk" as im %}
{% import "views/_helper.njk" as docs %}

# 实时通信 REST API v2 使用指南

## 请求格式
对于 POST 和 PUT 请求，请求的主体必须是 JSON 格式，而且 HTTP Header 的 Content-Type 需要设置为 `application/json`。

请求的鉴权是通过 HTTP Header 里面包含的键值对来进行的，参数如下表：

Key|Value|含义|来源
---|----|---|---
`X-LC-Id`|{{appid}}|当前应用的 App Id|可在控制台->设置页面查看
`X-LC-Key`| {{appkey}}|当前应用的 App Key |可在控制台->设置页面查看

## 相关概念
 
`_Conversation` 表 包含一些内置的关键字段定义了对话的属性、成员等，所有对话均在此表中，可以在 [实时通信概览 - 对话](./realtime_v2.html#对话_Conversation_) 中了解。

## 单聊/群聊

### 创建对话

创建一个对话即在 `_Conversation` 表中创建一条记录。对于没有使用过实时通信服务的新用户， `_Conversation` 表会在第一条记录创建后出现。

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"name":"My First Conversation","m": ["BillGates", "SteveJobs"]}' \
  https://{{host}}/1.2/rtm/conversations
```

上面的例子会创建一个最简单的对话，包括两个 client ID 为 BillGates 和 SteveJobs 的初始成员。对话创建成功会返回 objectId，即实时通信中的对话 ID，客户端就可以通过这个 ID 发送消息了。

返回
```
{"objectId"=>"5a5d7432c3422b31ed845e75", "createdAt"=>"2018-01-16T03:40:32.814Z"}
```

需要注意，群聊与单聊的唯一区别是 client 数量，API 层面保持一致。

### 更新对话

```sh
curl -X PUT \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Conversation"}' \
  https://{{host}}/1.2/rtm/conversations/{conv_id}
```

`_Conversation` 表除 m 字段均可通过这个接口更新。

返回
```
{"updatedAt"=>"2018-01-16T03:40:37.683Z", "objectId"=>"5a5d7433c3422b31ed845e76"}
```

### 删除对话

```sh
curl -X DELETE \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  https://{{host}}/1.2/rtm/conversations/{conv_id}
```

返回
```
{}
```

### 增加成员

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"client_ids": ["Tom", "Jerry"]}' \
  https://{{host}}/1.2/rtm/conversations/{conv_id}/members
```

返回
```
{"updatedAt"=>"2018-01-16T03:40:37.683Z", "objectId"=>"5a5d7433c3422b31ed845e76"}
```

### 移除成员

```sh
curl -X DELETE \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"client_ids": ["Tom", "Jerry"]}' \
  https://{{host}}/1.2/rtm/conversations/{conv_id}/members
```

返回

```
{"updatedAt"=>"2018-01-16T03:40:37.683Z", "objectId"=>"5a5d7433c3422b31ed845e76"}
```


### 查询成员

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  https://{{host}}/1.2/rtm/conversations/{conv_id}/members
```

返回

```
["client1", "client2"]
```


### 增加禁言用户

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \ 
  -d '{"conv_id": "some-conv-id", "ttl": 50}' \
  https://{{host}}/1.2/rtm/conversations/{conv_id}/mutes
```

参数 | 说明
--- | ---
client_id | 要禁言的 id，字符串
ttl | 禁言的时间，秒数，最长 24 小时

返回

```
{"updatedAt"=>"2018-01-16T03:40:37.683Z", "objectId"=>"5a5d7433c3422b31ed845e76"}
```


### 移除禁言用户

```sh
curl -X DELETE \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -G \
  --data-urlencode 'client_id=some-client-id' \
  https://{{host}}/1.2/rtm/conversations/{conv_id}/mutes
```

参数 | 说明
--- | ---
client_id | 要禁言的 id，字符串

返回

```
{"updatedAt"=>"2018-01-16T03:40:37.683Z", "objectId"=>"5a5d7433c3422b31ed845e76"}
```

### 查询禁言用户

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  https://{{host}}/1.2/rtm/conversations/{conv_id}/mutes
```

返回

```
["client1", "client2"]
```

### 发消息

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
  -d '{"from_client": "", "message": ""}' \
  https://{{host}}/1.2/rtm/conversations/{conv_id}/messages
```
**注意**，由于这个接口的管理性质，当你通过这个接口发送消息时，我们不会检查 **from_client** 是否有权限给这个对话发送消息，而是统统放行，请谨慎使用这个接口。
如果你在应用中使用了我们内部定义的 [富媒体消息格式](./realtime_v2.html#消息_Message_)，在发送消息时 **message** 字段需要遵守一定的格式要求，[富媒体消息格式说明](./realtime_rest_api.html#富媒体消息格式说明) 中有详细说明。


参数 | 约束 | 说明
---|---|---
from_client | 必填 |消息的发件人 client Id
message | 必填 | 消息内容（这里的消息内容的本质是字符串，但是我们对字符串内部的格式没有做限定，<br/>理论上开发者可以随意发送任意格式，只要大小不超过 5 KB 限制即可。）
transient | 可选|是否为暂态消息，默认 false
no_sync | 可选|默认情况下消息会被同步给在线的 from_peer 用户的客户端，设置为 true 禁用此功能。
push_data | 可选 | 以消息附件方式设置本条消息的离线推送通知内容。如果目标接收者使用的是 iOS 设备并且当前不在线，我们会按照该参数填写的内容来发离线推送。请参看 [离线推送通知](./realtime_v2.html#离线推送通知)
priority | 可选 | 定义消息优先级，可选值为 high、normal、low，分别对应高、中、低三种优先级。该参数大小写不敏感，默认为高优先级 high。本参数仅对暂态消息或聊天室的消息有效，高优先级下在服务端与用户设备的连接拥塞时依然排队。

返回说明：

默认情况下发送消息 API 使用异步的方式，调用后返回消息 id 和接收消息的服务器时间戳，例如 
`{"msg-id":"qNkRkFWOeSqP65S9fDyHJw", "timestamp":1495431811151}`。

### 修改消息

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
  -d '{"from_client": "", "message": "", "timestamp": 123}' \
  https://{{host}}/1.2/rtm/conversations/{conv_id}/messages/{mid}
```

参数 | 约束 | 说明
---|---|---
from_client | 必填 | 消息的发件人 client ID
mid | 必填 | 消息 ID
message | 必填 | 消息体
timestamp | 必填 | 消息的时间戳

返回：
```
{"result": {}}
```

### 撤回消息

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
  -d '{"from_client": "", "message": "", "timestamp": 123}' \
  https://{{host}}/1.2/rtm/conversations/{conv_id}/messages/{mid}/recall
```

参数 | 约束 | 说明
---|---|---
from_client | 必填 | 消息的发件人 client ID
mid | 必填 | 消息 ID
timestamp | 必填 | 消息的时间戳


返回：
```
{"result": {}}
```

### 删除消息

```sh
curl -X DELETE \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
  --data-urlencode 'client_id=some-client-id' \
  --data-urlencode 'timestamp=123' \
  https://{{host}}/1.2/rtm/conversations/{conv_id}/messages/{mid}
```

参数 | 约束 | 说明
---|---|---
from_client | 必填 | 消息的发件人 client ID
mid | 必填 | 消息 ID
timestamp | 必填 | 消息的时间戳


返回：
```
{"result": {}}
```

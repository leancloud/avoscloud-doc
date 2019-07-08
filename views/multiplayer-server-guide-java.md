# Multiplayer Server 开发指南 &middot; Java

阅读此文档前请先阅读 [Multiplayer Server 总览](multiplayer-server.html)及 [Multiplayer Server 快速入门](multiplayer-server-quick-start-java.html)，了解基本架构及概念。

多人在线对战公有云中在运行的代码就是 Multiplayer Server 中的代码。在 Multiplayer Server 中撰写自定义逻辑逻辑的方法是，将自己的代码写入到预先定义好的 Server Hook 函数中。

## 基础概念

### Plugin
一个 Plugin 里面包含多个 Hook 函数，不同的 Plugin 中可以撰写不同的逻辑，客户端在。例如 PluginA 和 PluginB 里面都可以写 `onCreateRoom()` 函数，但两个 Plugin 中同一个函数的逻辑不同，客户端在创建房间时可以指定使用其中某一个 Plugin 中的逻辑。

Plugin 中的代码写完之后，我们会将其打包给本地的 Multiplayer Server 加载或部署到服务端的 Multiplayer Server 中。

### Hook 函数
从进入房间的一刻起，房间内的各种操作会触发相关的 Hook 函数：

* **`onCreateRoom`**：MasterClient 发起创建房间请求时，服务端在成功创建房间前触发该函数。我们可以在这里做一些本局游戏初始化的操作。
* **`onBeforeJoinRoom`**：Client 请求加入房间，服务端将 Client 加入房间前该函数被触发。
* **`onBeforeSetRoomSystemProperties`**：MasterClient 修改房间的系统属性时，服务端设置属性前该函数被触发。房间的系统属性指创建房间时指定的属性，包括：房间是否可见、房间是否关闭、房间内最大玩家数量、玩家离线后保留玩家数据的时间、房间的条件匹配属性 key 、为没有来的玩家预留的位置。
* **`onBeforeSetRoomProperties`**：Client 请求设置房间自定义属性，服务端设置属性前该函数被触发。
* **`onBeforeSetPlayerProperties`**：Client 请求设置 Player 自定义属性，服务端设置属性前该函数被触发。
* **`onBeforeSendEvent`**：Client 发送自定义事件，服务端转发自定义事件给接收者之前该函数被触发。
* **`onBeforeLeaveRoom`**：每一个玩家离开房间时，服务端的该函数被触发。
* **`onCloseRoom`**：所有人离开房间，房间即将被销毁前触发该函数。


## 实现 Plugin

### PluginFactory

`PluginFactory` 用来指定多个 Plugin 的集合。客户端在创建房间时可以指定使用 `PluginFactory` 中的任意一个 `Plugin` 中的 Hook 逻辑，例如不同玩法的房间使用不同的 `Plugin`，或不同的 `plugin` 支持不同的游戏版本。

我们通过继承 `PluginFactory` 来实现自己的 Factory，`PluginFactory` 中只有一个 `create` 方法需要实现：

```java
public class MyFancyPluginFactory implements PluginFactory {
    @Override
    public Plugin create(BoundRoom room, String pluginName, Map<String, Object> initConfigs) {
      if (pluginName != null && pluginName.length() > 0) {
        switch (pluginName) {
          case "somePlugin":
            return new NameOfSomePlugin(room, initConfigs);
          case "otherPlugin":
            return new NameOfOtherPlugin(room);
          default:
            return new DefaultPlugin(room);
        }
      }
      Log.error("unknown plugin name {}", pluginName);
      return null;
    }
}
```

在上面的代码中，`create` 方法中有这三个参数：
* BoundRoom。触发当前逻辑的 room，可以通过 BoundRoom 中的方法获取房间的各种信息、发送自定义时间、修改房间属性等。
* pluginName。MasterClient 创建 room 时传入的 Plugin 名称，根据这个名称 Plugin Factory 可以返回不同的 Plugin。
* initConfigs。Plugin 的初始配置，一般情况下不需要关心。

MasterClient 在创建房间时，可以使用以下代码来指定 Plugin：

```js
const options = {
  plugin : "somePlugin"
};
client.createRoom({ roomOptions:options });
```

```c#
var options = new RoomOptions()
{
    plugin = "otherPlugin"
};

play.CreateRoom(roomOptions: options);
```

### Plugin 文件
下面我们来实现 `PluginFactory` 的 `create` 方法中返回的 Plugin 类。这里示例的 Plugin 类名为 `DefaultPlugin`，继承自 `AbstractPlugin`。`DefaultPlugin` 需要一个 constructor 方法，除此之外，我们还实现了一个hook 函数 `onCreateRoom()`。您还可以在这个类中撰写其他 Hook 函数。

```java
public class DefaultPlugin extends AbstractPlugin {
  public DefaultPlugin(BoundRoom room) {
    super(room);
  }

  @Override
  public void onCreateRoom(CreateRoomContext ctx) {
    Log.info("onCreateRoom 被触发");
    ctx.continueProcess();
  }
}
```


## 实现 Hook 函数

### 获取房间内信息
Plugin 提供了获取 `BoundRoom` 实例的方法 `getBoundRoom()`，每一个 Hook 函数都可以调用该方法获取与 Hook 绑定的 `BoundRoom` 实例，例如：

```java
public class DefaultPlugin extends AbstractPlugin {
  public DefaultPlugin(BoundRoom room) {
    super(room);
  }

  @Override
  public void onCreateRoom(CreateRoomContext ctx) {
    BoundRoom room = getBoundRoom();
    ctx.continueProcess();
  }
}
```

`BoundRoom` 下可以获取房间内的以下信息：
* `getRoomName()`：获取房间名称。
* `getMaster()`：获取 Master 玩家的 Actor 实例。
* `getRoomProperties()`：获取房间自定义属性。
* `getAllActors()`：获取房间所有玩家列表。
* `getMaxPlayerCount()`：获取房间最大玩家数量限制。
* `getEmptyRoomTtlSecs()`：获取所有玩家离开房间后，空房间的最大保留时长。
* `getPlayerTtlSecs()`：获取允许玩家的最大离线时间，默认为 0 表示玩家一旦断线就自动从房间离开。
* `getExpectUsers()`：获取在房间占位的玩家 ID 列表，包括已经加入房间的和没有加入房间的。
* `isVisible()`：房间是否可见。默认为可见，即所有玩家都能自动匹配到本房间。
* `isOpen()`：房间是否关闭。房间关闭后不允许新玩家加入。
* `getLobbyKeys()`：获取用于房间匹配的房间自定义属性键。不在本列表内的房间自定义属性不会用来做房间匹配


### Hook 的处理
Hook 中有以下处理请求的方式：

1. `continueProcess()`。同意本次请求，Server 会执行 Hook 之后的操作。
2. `rejectProcess(Reason reason)`。拒绝本次请求，并发送 Reason 信息给发送请求的玩家。
3. `skipProcess()`。拒绝本次请求，但不返回任何信息给发送请求的玩家。仅部分 Hook 支持。
4. `deferProcess()`。不立刻处理请求，稍后再处理请求。仅部分 Hook 支持。在 hook 中可能需要一些耗时的操作，例如定时器、异步请求等，此时可以先告知 server defer 后再执行请求，请求完成后再调用 `continueProcess()` `rejectProcess(Reason reason)` 或 `skipProcess()`。

其中 `rejectProcess(Reason reason)` 的 Reason 可以指定具体的错误码及信息，例如：

```java
@Override
public void onCreateRoom(CreateRoomContext ctx) {
  Reason reson = Reason.of(1, "unauthorized"); // 第一个参数是错误 code，第二个参数是错误 message。
  ctx.rejectProcess(reson);
}
```


### Hook 函数中的参数
每一个 Hook 函数都有一个接口参数 `Context`，通过 `Context` 可以拿到触发当前 hook 的请求参数，也可以通过调用[Hook 的处理](Hook 的处理)中的方法通知 Server 如何处理触发 Hook 调用的请求。

`Context` 可以获取以下信息：
* `getHookName()`：获取当前 Context 所属 Hook 名称。
* `getRequest()`：获取当前 hook 的 `request` 实例。
* `getStatus()`：获取当前 hook 的状态：
  * `ContextStatus.NEW`：Hook 请求还未被处理。
  * `ContextStatus.DEFERRED`：Hook 请求被延迟处理。
  * `ContextStatus.CONTINUED`：Hook 请求被通过。
  * `ContextStatus.REJECTED`：Hook 请求被拒绝。
  * `ContextStatus.SKIPPED`：Hook 请求被拒绝，不会返回信息给发送请求的玩家。


### Hook 函数
#### onCreateRoom

触发时机：MasterClient 发起创建房间请求时，服务端在成功创建房间前触发该函数。

```java
@Override
public void onCreateRoom(CreateRoomContext ctx) {
  Log.info("onCreateRoom 被触发");
  CreateRoomRequest request = ctx.getRequest();   // 获取 request 请求
  int emptyRoomTtl = request.getEmptyRoomTtlSecs();  // 获取 request 请求中的空房间保留时间
  List<String> expectedUsers = request.getExpectUsers();  // 获取 request 请求中的占位的 userId
  List<String > matchKeys = request.getLobbyKeys();  // 获取 request 请求中用作匹配的 key
  int maxPlayerCount = request.getMaxPlayerCount();  // 获取 request 请求中设置的房间最大人数。
  PlayObject roomProperties = request.getRoomProperties();  // 获取 request 请求中设置的房间属性。
  ctx.continueProcess();
}
```

支持的操作：
* `ctx.continueProcess();` 同意本次请求。
* `ctx.rejectProcess(Reason reason)` 拒绝本次请求。


#### onBeforeJoinRoom

触发时机：Client 请求加入房间，服务端将 Client 加入房间前该函数被触发。///////////////////////////

```java
@Override
public void onBeforeJoinRoom(BeforeJoinRoomContext ctx) {
  // 允许该玩家加入房间
  ctx.continueProcess();
  // 获取当前加入房间的玩家
  const player = ................;
  
  // 更新当前 player 的信息
  PlayObject playerAProperties = new PlayObject();
  playerAProperties.put("speed", 20);
  BoundRoom room = getBoundRoom();
  room.updatePlayerProperty(player.getActorId(), playerAProperties);
}
```

支持的操作：
* `ctx.continueProcess();` 同意本次请求。
* `ctx.rejectProcess(Reason reason)` 拒绝本次请求。

#### onBeforeSetRoomSystemProperties

触发时机：MasterClient **修改**房间的系统属性时，该 hook 函数被触发。房间的系统属性指创建房间时指定的属性，包括：为没有来的玩家预留的位置、房间是否关闭、房间是否可见、房间内可容纳的最大玩家数量。

<!-- 玩家离线后保留玩家数据的时间、房间的条件匹配属性 key  -->
下面的代码中给出了一些示例代码，包括以下逻辑：
* 获取预留位置的玩家 ID 后，增加、移除、重置、清空预留的位置。
* 获取房间的关闭状态并修改状态。
* 获取房间的可见状态并修改状态。
* 获取房间内可容纳的最大人数并修改最大人数。

```java
@Override
public void onBeforeSetRoomSystemProperties(BeforeSetRoomSystemPropertiesContext ctx) {
  SetRoomSystemPropertiesRequest request = ctx.getRequest();

  // 获取本次请求中为其预留位置的玩家 ID
  SetRoomSystemPropertiesRequest.ExpectedUserIdsProperty userIdsProperty = request.getExpectedUserIdsProperty().get();
  // 为新的玩家预留位置
  Set<String> needUserIds = new HashSet<>();
  needUserIds.add("user3");
  needUserIds.add("user4");
  userIdsProperty.add(needUserIds);
  // 移除之前为某位玩家预留的位置
  Set<String> doNotNeededUserIds = new HashSet<>();
  doNotNeededUserIds.add("user2");
  userIdsProperty.remove(doNotNeededUserIds);
  // 不管之前给谁预留了位置，全部一把梭重置给指定的玩家
  Set<String> userIds = new HashSet<>();
  userIds.add("user99");
  userIds.add("user100");
  // 请空所有的预留位置
  userIdsProperty.drop();
  // 更新本次请求中的预留位置
  request.setExpectedUserIdsProperty(userIdsProperty);

  // 获取本次请求中，当前房间关闭还是开启，处在关闭状态的房间不允许任何人加入房间
  SetRoomSystemPropertiesRequest.OpenRoomProperty openRoomProperty = request.getOpenRoomProperty().get();
  // 修改请求中的房间关闭状态，开启房间
  request.setOpenRoomProperty(SetRoomSystemPropertiesRequest.OpenRoomProperty.set(true));

  // 获取本次请求中，当前房间是否可见，可见情况下允许其他人通过随机匹配的方式加入房间，不可见情况只能通过 roomName 加入房间。
  SetRoomSystemPropertiesRequest.ExposeRoomProperty exposeRoomProperty =  request.getExposeRoomProperty().get();
  // 修改请求中的房间可见状态，设置为可见
  request.setExposeRoomProperty(SetRoomSystemPropertiesRequest.ExposeRoomProperty.set(true));

  // 获取本次请求中，当前房间允许进入的最大 client 人数。
  SetRoomSystemPropertiesRequest.MaxPlayerCountProperty maxPlayerCountProperty = request.getMaxPlayerCountProperty().get();
  // 修改请求中的房间最大人数
  request.setMaxPlayerCountProperty(SetRoomSystemPropertiesRequest.MaxPlayerCountProperty.set(6));

  // 同意本次请求，允许设置房间的系统属性
  ctx.continueProcess();

}
```

支持的操作：
* `ctx.continueProcess();` 同意本次请求。
* `ctx.rejectProcess(Reason reason)` 拒绝本次请求。

#### onBeforeSetRoomProperties

触发时机：Client 修改房间的自定义属性时被触发。


```java
@Override
public void onBeforeSetRoomProperties(BeforeSetRoomPropertiesContext ctx) {
  SetRoomPropertiesRequest request = ctx.getRequest();

  // 获取本次请求中的自定义属性
  PlayObject properties = request.getProperties();
  // 修改本次请求中的自定义属性
  properties.put("newKey", "newValue");
  request.setProperties(properties);

  // 获取请求中更新属性时的判断条件
  PlayObject expectedValues = request.getExpectedValues();
  // 更新本次请求中的判断条件
  expectedValues.put("someKey", "newValue");
  request.setExpectedValues(expectedValues);

  // 同意本次请求，允许设置房间的自定义属性
  ctx.continueProcess();
}
```

支持的操作：
* `ctx.continueProcess();` 同意本次请求。
* `ctx.rejectProcess(Reason reason);` 拒绝本次请求。
* `ctx.skipProcess();` 拒绝本次请求，但不返回任何信息给发送请求的玩家
* `ctx.deferProcess();` 延迟处理本次请求


#### onBeforeSetPlayerProperties
触发时机：Client 修改玩家的自定义属性时被触发。

```java
@Override
public void onBeforeSetPlayerProperties(BeforeSetPlayerPropertiesContext ctx) {
  SetPlayerPropertiesRequest request = ctx.getRequest();
  // 要修改哪个玩家的自定义属性
  int targetActorId = request.getTargetActorId();

  // 获取请求中的自定义属性
  PlayObject properties = request.getProperties();
  // 修改本次请求中的自定义属性
  properties.put("newKey", "newValue");
  request.setProperties(properties);

  // 获取请求中更新属性时的判断条件
  PlayObject expectedValues = request.getExpectedValues();
  // 更新本次请求中的判断条件
  expectedValues.put("someKey", "newValue");
  request.setExpectedValues(expectedValues);

  // 同意本次请求，允许设置玩家的自定义属性
  ctx.continueProcess();
}
```

支持的操作：
* `ctx.continueProcess();` 同意本次请求。
* `ctx.rejectProcess(Reason reason)` 拒绝本次请求。
* `ctx.skipProcess();` 拒绝本次请求，但不返回任何信息给发送请求的玩家
* `ctx.deferProcess();` 延迟处理本次请求


#### onBeforeSendEvent
触发时机：Client 发送自定义事件时被触发。

```java
@Override
public void onBeforeSendEvent(BeforeSendEventContext ctx) {
  SendEventRequest request = ctx.getRequest();
  
  // 获取本地请求的 eventId
  byte eventId = request.getEventId();
  if (eventId == 1) {
    // 获取本次请求中的事件内容
    PlayObject eventData = request.getEventData();
    // 根据当前收到的 event 做一些自定义的逻辑。
    doSomeCustomLogic(eventData);
  }

  // 同意本次请求，允许发送自定义事件
  ctx.continueProcess();
}
```

支持的操作：
* `ctx.continueProcess();` 同意本次请求。
* `ctx.rejectProcess(Reason reason)` 拒绝本次请求。
* `ctx.skipProcess();` 拒绝本次请求，但不返回任何信息给发送请求的玩家
* `ctx.deferProcess();` 延迟处理本次请求

#### onBeforeLeaveRoom

触发时机：有玩家要离开房间时被触发。

```java
@Override
public void onBeforeLeaveRoom(BeforeLeaveRoomContext ctx) {
  LeaveRoomRequest request = ctx.getRequest();

  // 是否是 MasterClient 踢出玩家
  boolean isByMaster = request.byMaster();

  /**
    * 获取发起离开房间操作的 Actor Id。如果是某 Actor 自己要离开房间，则返回
    * 待离开房间 Actor 的 Id。如果是某 Actor 被踢，则这里获取的是发起踢人操作
    * 的 Actor 的 Id。
    */
  int fromActorId = request.getFromActorId();

  // 获取要离开的 ActorId
  int targetActorId = request.getTargetActorId();

  // 获取离开的原因，只有在踢人场景下发起踢人请求一方可以提供踢人原因。
  Reason reason = request.getLeaveRoomReason();

  // 同意本次请求，允许离开房间
  ctx.continueProcess();
}
```

支持的操作：
* `ctx.continueProcess();` 同意本次请求。
* `ctx.rejectProcess(Reason reason)` 拒绝本次请求。

#### onDestroyRoom

触发时机：房间内已经没有任何玩家，即将被销毁前触发。

```java
@Override
public void onDestroyRoom(DestroyRoomContext ctx) {
  Log.info("房间即将被销毁，可以做一些清理工作");
  // 同意本次请求，销毁房间。
  ctx.continueProcess();
}
```

支持的操作：
* `ctx.continueProcess();` 同意本次请求。

### Hook 中的当前房间

在每一个 Hook 中都可以通过 `getBoundRoom()` 方法获取触发当前 Hook 的 `room` 对象，通过这个 `room` 对象我们可以做很多工作，因此这里专门列出 room 对象可以做的常见操作供参考。

```java
BoundRoom room = getBoundRoom();
```

**注：`room` 对象的任何操作都不会触发 Hook 函数。**

#### 获取房间信息

```java
String roomName = room.getRoomName(); // 获取房间名称
List<Actor> allActors = room.getAllActors(); // 获取房间内的所有玩家列表
List<Actor> actors = room.getActorByActorIds(Arrays.asList(1, 2)); // 根据 ActorId 获取玩家的 Actor 对象
int roomTtl = room.getEmptyRoomTtlSecs(); // 获取空房间的保留时间，单位是秒
List<String> expectUsers = room.getExpectUsers(); // 获取占位置的玩家 userId 列表
List<String> lobbyKeys = room.getLobbyKeys(); // 获取该房间用于在大厅做匹配的 Key
int maxPlayerCount = room.getMaxPlayerCount(); // 获取房间可容纳的最大人数
int playerTtls = room.getPlayerTtlSecs(); // 获取房间内保留掉线玩家数据的时长，单位是秒
PlayObject roomProperties = room.getRoomProperties(); // 获取房间的自定义属性
Actor masterActor = room.getMaster(); // 获取当前房间内的 MasterClient 的 Actor 对象
boolean isOpen = room.isOpen(); // 房间是否关闭。关闭后房间不允许新玩家加入。
boolean isVisible = room.isVisible(); // 房间是否可见。默认为可见，即所有玩家都能在大厅上查看、自动匹配到本房间
```

#### 更改房间系统属性

```java
room.updateRoomSystemProperty(SetRoomSystemPropertiesRequest.MaxPlayerCountProperty.set(6)); // 修改房间可容纳的最大人数
room.updateRoomSystemProperty(SetRoomSystemPropertiesRequest.ExposeRoomProperty.set(true)); // 设置房间在大厅可见
room.updateRoomSystemProperty(SetRoomSystemPropertiesRequest.OpenRoomProperty.set(true)); // 设置房间关闭状态，此处设置为开启房间。

// 更改房间的占位信息
Set<String> newExpectUsers = new HashSet<>();
newExpectUsers.addAll(expectUsers);
newExpectUsers.add("user123");
room.updateRoomSystemProperty(SetRoomSystemPropertiesRequest.ExpectedUserIdsProperty.set(newExpectUsers));
```

#### 更改房间的自定义属性

您可以通过 room 直接修改房间的自定义属性，这个方法只会更新自定义属性中指定的 key 值，如果 key 不存在，则会增加这个 key。

```java
PlayObject properties = new PlayObject();
properties.put("oldKey", "newValue");
properties.put("newKey", "someValue");
room.updateRoomProperty(properties);
```

您还可以根据 CAS 操作来更新自定义属性，只有当房间的某些属性符合期望的值时，才会成功更新属性。例如当房间内有多个人使用下方代码抢夺一把屠龙刀时，只有房间原有属性屠龙刀主人 `ownerOfTLSword` 为 `nobody` 时，`ownerOfTLSword` 这个属性才会更新成功，也就是说只有当屠龙刀没有主人时才可以抢夺成功。

```java
PlayObject properties = new PlayObject();
properties.put("ownerOfTLSword", "tom");
PlayObject expectedValues = new PlayObject();
expectedValues.put("ownerOfTLSword", "nobody");
room.updateRoomProperty(properties, expectedValues);
```

#### 更改玩家的自定义属性

```java
PlayObject properties = new PlayObject();
properties.put("oldKey", "newValue");
properties.put("newKey", "someValue");
room.updatePlayerProperty(targetPlayer.getActorId(), properties);
```

上面更新属性代码中的第一个参数是房间内玩家的 `actorId`，其中 `targetPlayer` 是一个 `Actor` 类型的对象。


#### 发送自定义事件

在服务端可以直接通过 room 来发送自定义事件：

```java
// 发送自定义事件
int fromActorId = 0;
byte eventId = 1;
PlayObject eventData = new PlayObject();
eventData.put("winner", 3);
room.sendEventToReceiverGroup(ReceiverGroup.ALL, fromActorId, eventId, eventData, SendEventOptions.emptyOption);
```

在以上代码中，第一个参数是事件接收方，除了示例代码中发给所有人外，还有以下选项：
* `ReceiverGroup.OTHERS` ：发送给除了事件发送者之外的所有人。事件发送者见方法中的第二个参数。
* `ReceiverGroup.MASTER` ：只发送给房间内的 MasterClient。

第二个参数是事件发送者的 ActorId，0 则表示该事件由系统发出。
第三个参数是事件 Id，用来标记该次事件。
第四个参数是发给目标接收者的数据。
第五个参数暂时不需要用到，使用 `emptyOption` 就可以。

除了发送事件给指定的一组玩家外，您还可以指定某几个 ActorId 作为事件接收者：

```java
List<Integer> toActorIds = Arrays.asList(firstPlayer.getActorId(), secondPlayer.getActorId());
int fromActorId = 0;
byte eventId = 1;
PlayObject eventData = new PlayObject();
eventData.put("winner", 3);
room.sendEventToActors(toActorIds, fromActorId, eventId, eventData, SendEventOptions.emptyOption);
```

上述代码中 `getActorId()` 的调用对象是一个 `Actor` 实例对象。



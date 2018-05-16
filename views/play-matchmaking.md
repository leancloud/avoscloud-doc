# Play 常见匹配场景示例

本篇文档针对常见的匹配场景给出建议的实现方式。

## 随机匹配
单人玩游戏时，最常见的场景是随机匹配其他玩家迅速开始。具体实现步骤如下：

1、调用 `JoinRandomRoom` 开始匹配。

```cs
Play.JoinRandomRoom();
```

2、在顺利情况下，会进入某个有空位的房间开始游戏。

```
[PlayEvent]
public override void OnJoinedRoom()
{
  Play.Log("OnJoinedRoom");
}
```


3、如果没有空房间，就会加入失败。此时建立一个房间等待其他人加入，建立房间时：
* 不需要关心房间名称。
* 默认一个房间内最大人数是 10，可以通过设置 MaxPlayerCount 来限制最大人数。

```cs
// 加入失败时，这个回调会被触发
[PlayEvent]
public override void OnJoinRoomFailed(int errorCode, string reason)
{
  var roomConfig = PlayRoom.RoomConfig.Default;
  // 设置最大人数，当房间满员时，服务端不会再匹配新的用户进来。
  roomConfig.MaxPlayerCount = 4;
  // 创建房间
  Play.CreateRoom(roomConfig);
}

```


## 并不很随机的匹配

有的时候我们希望将水平差不多的用户匹配到一起。例如当前玩家 5 级，他只能和 0-10 级的玩家匹配，10 以上的玩家无法被匹配到。这个场景可以通过给房间设置属性来实现，具体实现逻辑如下：

1、确定匹配属性，例如 0-10 级是 level-1, 10 以上是 level-2。

```
int matchLevel = 0;
if (level < 10) {
  matchLevel = 1;
} else
  matchLevel = 2;
}
```

2、根据匹配属性加入房间

```
Hashtable matchProp = new Hashtable();
matchProp.Add("matchLevel", matchLevel);
Play.JoinRandomRoom(matchProp);
```

3、如果随机加入房间失败，则创建具有匹配属性的房间等待其他同水平的人加入。

```
[PlayEvent]
public void OnRandomJoinRoomFailed() {
  PlayRoom.RoomConfig config = new PlayRoom.RoomConfig() {
    CustomRoomProperties = matchProp
    LobbyMatchKeys = new string[] { "matchLevel" }
  };
  Play.CreateRoom(config);
}
```


## 和好友一起玩

假设 PlayerA 希望能和好基友 PlayerB 一起玩游戏，这时又分以下两种情况：

* 只是两个人一起玩，不允许陌生人加入
* 好友和陌生人一起玩

### 不允许陌生人加入
1、PlayerA 创建房间，设置房间不可见，这样其他人就不会被随机匹配到 PlayerA 创建的房间中。

```cs
PlayRoom.RoomConfig config = new PlayRoom.RoomConfig() {
  IsVisible = false,
};
Play.CreateRoom(config, roomName);
```

2、PlayerA 通过某种通信方式（例如 [LeanCloud 实时通信](realtime_v2.html)）将房间名称告诉 PlayerB。


3、PlayerB 根据房间名称加入到房间中。

```
Play.JoinRoom(roomName);
```

### 好友和陌生人一起玩
PlayerA 通过某种通信方式（例如 [LeanCloud 实时通信](realtime_v2.html)）邀请 PlayerB，PlayerB 接受邀请。

1、PlayerA 和 PlayerB 一起组队进入某个房间

```cs
Play.JoinRandomRoom(expectedUsers: new string[] { "playerA", "playerB" });
```

2、如果有足够空位的房间，加入成功。

```
[PlayEvent]
public override void OnJoinedRoom()
{
  Play.Log("OnJoinedRoom");
}
```

3、如果没有合适的房间则创建并加入房间： 

```cs
[PlayEvent]
public void OnRandomJoinRoomFailed() {
  Play.JoinOrCreate(expectedUsers: new string[] { "playerA", "playerB" });
}
```

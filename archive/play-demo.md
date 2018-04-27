# Play Demo - 炸金花

本文是基于 LeanCloud 最新发布的实时对战 Play SDK 制作 Unity 实时对战类游戏「炸金花」的最佳实践。

## Demo

我们发布了基于 Unity 引擎实时对战 SDK「Play」，并实现了这个 Demo。在这个 Demo 中你可以了解：

[工程地址](https://github.com/leancloud/Play-SDK-dotNET)

* 连接游戏大厅
* 创建 / 加入房间
* 获取房间玩家变化（加入，离开）
* 通过「房间属性」控制及存储房间内的共享数据
* 通过「玩家属性」控制和存储房间内玩家的数据和状态
* 通过 RPC 接口完成远程调用操作
* 以及经典棋牌类游戏「炸金花」的基本玩法

开发环境及版本：

* Unity 5.6.3p4
* Visual Studio Community
* Play SDK

## Demo 流程

* 玩家输入 UserID 后连接至 Play 云。
* 选择创建 / 加入房间。
* 普通玩家加入房间之后可以选择「准备状态」。
* 房主在房间人数不少于 2 人，并且其他玩家处于「准备状态」时，可以开始游戏。
* 开始游戏后，房主给每个玩家发 3 张牌，然后由房主开始选择操作。
* 玩家可以选择「跟牌」，「弃牌」，「比牌」操作，依次从房主开始到每个人执行选择。（每次跟牌需要花费 100 金币）
* 循环上步至其他玩家选择「弃牌」或「比牌」之后，得到最后的胜出者。

## 代码分析

### 连接

通过输入用户的 UserID 连接至 Play，此处的 UserID 由开发提供，可以是用户名，昵称等，或任意字段的组合。

**注意：请保证 UserID 唯一**

```cs
Play.UserID = userId;
Play.Connect("0.0.1");
```

在连接成功后会回调至 OnAuthenticated() 接口，在 Demo 中会跳转至「房间场景」。

```cs
[PlayEvent]
public override void OnAuthenticated() 
{
    SceneManager.LoadScene("room");
}
```

注意：所有 Play SDK 回调的方法都要注意命名，并且需要添加 [PlayEvent] 属性。

### 创建 / 加入房间

用户可以通过 Play.CreateRoom(room) 创建房间

```cs
PlayRoom room = new PlayRoom(roomId); // roomId 为房间 Id
room.MaxPlayerCount = 4;
Play.CreateRoom(room);
```

房间创建完后，SDK 会依次回调 OnCreatingRoom() 和 OnCreatedRoom() 或 OnCreateRoomFailed(int errorCode, string reason)。如果房间创建成功，玩家会自动加入到房间，所以还会回调 OnJoinedRoom()。

通过 Play.JoinRoom(roomId) 加入房间。

```cs
Play.JoinRoom(roomId); // roomId 为房间 Id
```

调用加入房间后，SDK 会依次调用 OnJoiningRoom() 和 OnJoinedRoom() 或 OnJoinRoomFailed(int errorCode, string reason)。如果加入失败，会在参数中给出失败原因。

Demo 在加入房间成功后，会设置默认状态为 IDLE，并跳转至「战斗场景」。

```cs
[PlayEvent]
public override void OnJoinedRoom() 
{
    Debug.Log("joined room");
    Hashtable prop = new Hashtable();
    prop.Add(Constants.PROP_STATUS, Constants.PLAYER_STATUS_IDLE);
    Play.Player.CustomProperties = prop;
    SceneManager.LoadScene("Fight");
}
```

### 开始游戏

#### 同步准备状态

Demo 中「房主」和「普通玩家」的操作是不一样的，默认当「所有玩家」都准备完成后，「房主」才可以开始游戏。

这时，需要同步普通玩家的状态，这里需要用到 SDK 的「玩家属性」的功能。通过设置「玩家属性」，SDK 会将「变更的属性」自动同步给房间内的所有玩家（包括自己）。

```cs
Hashtable prop = new Hashtable();
prop.Add(Constants.PROP_STATUS, Constants.PLAYER_STATUS_READY);
Play.Player.CustomProperties = prop;
```

#### 接收属性同步

当玩家变更了属性之后，SDK 会自动同步给房间内的所有玩家，通过**OnPlayerCustomPropertiesChanged(LeanCloud.Player player, Hashtable updatedProperties)**接口。

以「同步准备状态」为例，Demo 会在接收到玩家属性变更回调后，设置变更玩家的 UI 显示。如果是房主，则判断当前「已经准备的玩家数量」，如果所有玩家都已准备完成，则可以「开始游戏」，代码如下：

```cs
void onPlayerStatusPropertiesChanged(LeanCloud.Player player, Hashtable updatedProperties) 
{
    // 刷新玩家 UI
    int status = (int) updatedProperties[Constants.PROP_STATUS];
    ui.setPlayerStatus(player.UserID, status);
    if (Play.Player.IsMasterClient) 
    {
        // 计算「已经准备」玩家的数量
        int readyPlayersCount = Play.Players.Where(p =>
        {
            int s = (int)p.CustomProperties[Constants.PROP_STATUS];
            return s == Constants.PLAYER_STATUS_READY;
        }).Count();
        if (readyPlayersCount > 1 && readyPlayersCount == Play.Players.Count()) 
        {
            ui.enableStartButton();
        }
    }
}
```

#### 发牌

「房主」在所有玩家准备完成后，开始游戏。

其中最重要的是给每个玩家随机发 3 张牌，这里我们需要将 3 张牌的数据存放至「玩家属性」中。而牌的类型是我们自定义的，为了兼容这种模式，需要将牌的对象数据序列化成 json 字符串后设置。当获得后，再反序列化为「牌的对象」。
注：我们这里用到了 JSON .NET 第三方库，这里也可以选用其他的序列化方式，只要符合 CustomProperties 的类型即可。

发牌代码：

```cs
// 初始化牌数据
this.pokerProvider.init();
// 发牌
foreach (LeanCloud.Player player in Play.Room.Players) 
{
    int status = (int)player.CustomProperties[Constants.PROP_STATUS];
    if (status == Constants.PLAYER_STATUS_READY)
    {
        Hashtable prop = new Hashtable();
        Poker[] pokers = this.pokerProvider.draw();
        prop.Add(Constants.PROP_STATUS, Constants.PLAYER_STATUS_PLAY);
        prop.Add(Constants.PROP_GOLD, 10000);
        string pokersJson = JsonConvert.SerializeObject(pokers);
        Debug.Log("pokers json: " + pokersJson);
        prop.Add(Constants.PROP_POKER, pokersJson);
        player.CustomProperties = prop;
        // 添加到玩家列表中
        playerIdList.AddLast(player.ActorID);
    }
}
```

接收代码：

```cs
void onPlayerPokerPropertiesChanged(LeanCloud.Player player, Hashtable updatedProperties) 
{
    string pokersJson = player.CustomProperties[Constants.PROP_POKER] as string;
    Poker[] pokers = JsonConvert.DeserializeObject<Poker[]>(pokersJson);
    if (player.IsLocal) 
    {
        scene.draw(player, pokers);
    } 
    else 
    {
        scene.draw(player, pokers);
    }
}
```

#### 跟牌

从这里开始，我们将使用 Play 中的另一个同步方式：RPC。

在 Demo 中，如果玩家选择「跟牌」，会执行三步逻辑：

* 扣除这个玩家的金币（Demo 中固定是 100金币）
* 将扣除的金币加入到房间的「总的下注金币池」，这里用到了「房间属性」（同理「玩家属性」）
* 通知下一个玩家做出选择

玩家选择跟牌代码：

```cs
Play.RPC("rpcFollow", PlayRPCTargets.MasterClient, Play.Player.ActorID);
```

这里 RPC 的发送对象时 PlayRPCTargets.MasterClient，也就是「房主」。
Play.Player.ActorID 是当前选择跟牌的用户 ID。

接收跟牌 RPC 回调代码：

```cs
// 跟牌
[PlayRPC]
public void rpcFollow(int playerId) 
{
    // 扣除玩家金币
    IEnumerable<LeanCloud.Player> players = Play.Room.Players;
    LeanCloud.Player player = players.FirstOrDefault(p => p.ActorID == playerId);
    int gold = (int)player.CustomProperties[Constants.PROP_GOLD];
    gold -= 100;
    Hashtable goldProp = new Hashtable();
    goldProp.Add(Constants.PROP_GOLD, gold);
    player.CustomProperties = goldProp;

    // 增加房间金币
    int roomGold = (int)Play.Room.CustomProperties[Constants.PROP_ROOM_GOLD];
    roomGold += 100;
    Hashtable prop = new Hashtable();
    prop.Add(Constants.PROP_ROOM_GOLD, roomGold);
    Play.Room.CustomProperties = prop;

    int nextPlayerId = getNextPlayerId(playerId);
    notifyPlayerChoose(nextPlayerId);
}
```

**注意：RPC 回调方法需要添加 [PlayRPC] 属性**

#### 弃牌

弃牌使用的同步方式与跟牌类似。

* 设置弃牌玩家的状态，并从当前参与游戏的玩家列表中移除。
* 判断当前参与游戏的玩家数量：如果只有 1 个玩家时，则胜出；否则，通知下一个玩家做出选择。

玩家选择弃牌代码：

```cs
Play.RPC("rpcDiscard", PlayRPCTargets.MasterClient, Play.Player.ActorID);
```

参数同上面的「跟牌」。

接收弃牌 RPC 回调代码：

```cs
[PlayRPC]
public void rpcDiscard(int playerId) 
{
    IEnumerable<LeanCloud.Player> players = Play.Room.Players;
    // 设置棋牌玩家状态
    LeanCloud.Player player = players.FirstOrDefault(p => p.ActorID == playerId);
    Hashtable prop = new Hashtable();
    prop.Add(Constants.PROP_STATUS, Constants.PLAYER_STATUS_DISCARD);
    player.CustomProperties = prop;
    // 从当前玩家列表中移除
    playerIdList.Remove(player.ActorID);

    if (playerIdList.Count > 1) 
    {
        // 请下一个玩家做出选择
        int nextPlayerId = getNextPlayerId(playerId);
        notifyPlayerChoose(nextPlayerId);
    } 
    else 
    {
        // 剩者为王
        int winnerId = playerIdList.First.Value;
        Play.RPC("rpcResult", PlayRPCTargets.All, winnerId);
    }
}
```

#### 比牌

这里的「比牌」操作做了简化，直接在当前所有参与游戏的玩家列表中，计算手牌的总分，并按分数排序，「第一个玩家」即为胜出者。

并通知房间内所有的玩家：胜出者。所有玩家根据当前胜出者是否为「自己」，做出 UI 展示。

玩家选择比牌代码：

```cs
Play.RPC("rpcCompare", PlayRPCTargets.MasterClient);
```

接收比牌 RPC 回调代码：

```cs
[PlayRPC]
public void rpcCompare() 
{
    var playersByScoreOrder = Play.Players.Where(p =>
    {
        int status = (int)p.CustomProperties[Constants.PROP_STATUS];
        return status == Constants.PLAYER_STATUS_PLAY;
    }).OrderByDescending(p =>
    {
        // 查找
        Player player = scene.GetPlayer(p);
        return player.getScore();
    });
    LeanCloud.Player winPlayer = playersByScoreOrder.FirstOrDefault();
    Play.RPC("rpcResult", PlayRPCTargets.All, winPlayer.ActorID);
}
```

接收比赛结果 RPC 回调代码：

```cs
[PlayRPC]
public void rpcResult(int winnerId) 
{
    Debug.Log("winnerId: " + winnerId);
    if (winnerId == Play.Player.ActorID) 
    {
        ui.showWin();
    } 
    else 
    {
        ui.showLose();
    }
}
```

### 算分逻辑

注：不关心 Demo 玩法的开发者可以忽略此处代码，不会影响对 Play SDK 的理解和认识。

**PokerType** 是炸金花中定义的牌型类，包括 牌型的基本数据及牌型判断。

根据炸金花中出现的所有牌型定义类型（继承于 PokerType），不同的牌型有不同的算分规则及其区间，详情可参考以下目录中的代码：

- Assets
	- Script
		- Fight
			- PokerType

## 「炸金花」玩法介绍

「炸金花」是流传的一种民间扑克牌游戏，具有独特的比牌规则。

游戏参与人数 2-6 人，使用一副去掉到大小王的扑克牌，共 52 张牌。

每人 3 张牌，按牌大小比较获胜。

### 牌型

* 豹子（炸弹）：三张点相同的牌。例：AAA、222
* 顺金（同花顺，色托）：花色相同的顺子。例：黑桃 456，红桃 789。最大的顺金为花色相同的 QKA，最小的顺金为花色相同的 234。
* 金花（色皮）：花色相同，非顺子。例：黑桃 368，方块 245。
* 顺子（拖拉机）：花色不同的顺子。例：黑桃 5 红桃 6 方块 7。最大的顺子为花色不同的 QKA，最小的顺子为花色不同的 234。
* 对子：两张点数相同的牌。例：223，334。
* 单张：三张牌不组成任何类型的牌。

### 比较

豹子 > 顺金 > 金花 > 顺子 > 对子 > 单张

### 主要玩法介绍

* 跟注：和上家加入同样的筹码。
* 弃牌：指玩家自动弃权，本副牌认输且不收回本副牌筹码。
* 比牌：拿自己的牌和其他玩家的牌比大小。

注：Demo 主要展现 Play SDK 功能，所以在原有玩法上做了简化。


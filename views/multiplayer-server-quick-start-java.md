# Multiplayer Server 快速入门 &middot; Java

该文档帮助你快速了解如何创建一个 Multiplayer Server 项目。如何本地启动并调试项目，如何将项目部署项目到云端。

## 本地项目

### 安装命令行工具
请查看命令行工具**[安装部分](leanengine_cli.html#安装)**的文档，安装命令行工具，并执行**[登录](leanengine_cli.html#登录)**命令登录。

### 创建项目

在本地调试中，我们需要获取两部分代码。一部分是核心 Server 代码，这部分代码可以帮助我们在本地启动一个 Server 服务，另一部分是 Plugin 的初始项目，在这个初始项目中可以撰写我们自己的逻辑。

我们将两个工程的文件放到同一个目录 `project` 下面：

```
/project/leangame       // 本地服务器的核心代码。
/project/multiplayer-server-plugin-getting-started      // 撰写自己逻辑的代码，最终要将其打好的包给到 leangame。
```

#### 安装依赖
Server 代码需要先安装依赖，以下依赖根据自己的情况安装，已经安装的无需再安装。

##### Windows

* leiningen，

##### Mac 
```
// 安装 leiningen
brew install leiningen
// 安装 maven
brew install maven
// 安装 python3
brew install python3
// 安装 Java 8 或以上版本
brew cask install java
```

#### Server 代码

[点击此处下载代码](https://github.com/leancloud/leangame/releases)

下载代码后安装依赖

```
cd leangame/carmine-sentinel
lein install
cd ./../testing-tools
pip3 install -r requirement.txt
```

#### Plugin 代码
在上一步下载 Server 端的代码时，我们可以在说明中看到其依赖的 Plugin 的版本，根据说明下载需要的 Plugin 版本：

[点击此处下载代码](https://github.com/leancloud/multiplayer-server-plugin-getting-started/releases)

安装相关依赖：
```
cd multiplayer-server-plugin-getting-started
mvn install
```

### 本地启动服务端

#### 本地启动

Server 和 Plugin 的代码都准备好之后，我们可以本地启动并调试了。

使用下载好的 Server 代码 build 并启动服务端。

```
cd leangame
./build_standalone private-deploy
```

build 完成之后，会在 leangame 目录下面生成 `local/game-standalone`，进入这个目录中启动 Server。

```
cd local/game-standalone
./launch.sh
```

执行 `./launch.sh` 启动后，进入 `leangame/integration-test-scripts` 测试服务是否顺利启动成功。

```
cd ./../../integration-test-scripts
./run-tests.sh private
```

测试通过后说明服务顺利启动。

如果要关闭服务，可以执行 `leangame/local/game-standalone/shutdown.sh`，由于我们接下来还要调试，此时先不关闭服务。

#### 连接本地服务器

Server 启动后，本地的 Server 地址为 `http://localhost:8081/v1`，游戏客户端可以访问这个地址来测试。

在游戏引擎中，使用以下代码指定连接本地服务器//////////////////////////////////////////////////////：

```js
const client = new Client({
    // 设置 APP ID
    appId: YOUR_APP_ID,
    // 设置 APP Key
    appKey: YOUR_APP_KEY,
    // 设置用户 id
    userId: 'leancloud'
    // 指定连接本地的 Server 地址
    playServer: 'http://localhost:8081/v1',
    // 关闭 ssl
    ssl: false
});
```

```c#
// App Id
var APP_ID = YOUR_APP_ID;
// App Key
var APP_KEY = YOUR_APP_KEY;
// App 节点地区
// Region.EastChina：华东节点
// Region.NorthChina：华北节点
// Region.NorthAmerica：美国节点
var APP_REGION = YOUR_APP_REGION;
// 初始化
play.Init(APP_ID, APP_KEY, APP_REGION);
```

连接本地服务器：

```js
client.connect().then(()=> {
  // 连接成功
}).catch((error) => {
  // 连接失败
  console.error(error);
});
```

```c#
play.UserId = "leancloud";
play.Connect();
play.On(LeanCloud.Play.Event.CONNECTED, (evtData) =>
{
    Debug.Log("connected");
});
```

### 自定义服务端逻辑

#### 撰写 Plugin 代码

现在我们将自己简单的逻辑写到 Plugin 中。`multiplayer-server-plugin-getting-started` 这个项目提供了一些示例代码。

* `cn.leancloud.play.plugin.PluginFactory` ，在这个文件中需要实现一个 `create` 方法，在这个方法中可以设置多个 Plugin，客户端可以在请求时指定使用某一个 Plugin。
* `cn.leancloud.play.plugin.MasterIsWatchingYouPlugin` 这个 Plugin 文件中写了一段示例的代码，这段示例代码的作用是拦截用户发来的事件请求，如果发现它没有将消息发送给 MasterClient，则强制让消息发给 MasterClient 一份，并通知房间内所有人有人偷偷发了一条不想让 MasterClient 看到的消息。

下面我们撰写自己的代码：

在 `PluginFactory` 中我们只简单的使用一个 Plugin，所以注释掉示例代码，重新写一个简单的 `create` 方法，即不管什么情况下都使用 `MasterIsWatchingYouPlugin`：

```java
public Plugin create(BoundRoom room, String pluginName, Map<String, String> initConfigs) {
  return new MasterIsWatchingYouPlugin(room);
}
```

然后在 `MasterIsWatchingYouPlugin` 中新增一个 `onCreateRoom` hook 函数，这个函数会在 Client 试图创建房间时被触发。我们先仅仅只打印一行日志出来。

```java
@Override
public void onCreateRoom(CreateRoomContext ctx) {
  Log.info("onCreateRoom 被触发");
  ctx.continueProcess();
}
```

#### 将 Plugin 代码打包到本地服务端中
在 `multiplayer-server-plugin-getting-started` 目录下执行如下命令：

```sh
mvn clean package
```

完成后拷贝刚生成的 `multiplayer-server-plugin-getting-started/target/multiplayer-server-plugin-getting-started-1.0-SNAPSHOT-jar-with-dependencies.jar` 这个 jar 包到 `leangame` 本地服务器启动目录的 `extensions` 文件夹内：

```sh
# 回到 project 目录
cd ../
cp multiplayer-server-plugin-getting-started-1.0/target/multiplayer-server-plugin-getting-started-1.0-jar-with-dependencies.jar leangame-GAME-20190610/local/game-standalone/extensions
```

此时本地服务器已经在启动当中，我们略微等待十几秒到 1 分钟后，代码就会被加载。


#### 触发 Plugin 代码

在游戏引擎中创建房间：

```js
client.connect().then(()=> {
  // 连接成功
  return client.createRoom('room001');
}).then(() => {
  // 创建房间成功
}).catch((error) => {
  // 连接失败
  console.error(error);
});
```

```c#
play.On(LeanCloud.Play.Event.CONNECTED, (evtData) =>
{
  Debug.Log("connected");
  play.CreateRoom();
});

play.On(Event.ROOM_CREATED, (evtData) => {
  // 房间创建成功
});

play.On(Event.ROOM_CREATE_FAILED, (error) => {
  // 房间创建失败
});
```

创建房间成功后，我们再去查看服务端产生的日志，

```
cd leangame-GAME-20190610/local/game-standalone/logs
cat plugin.log
```

在日志文件中我们可以看到自己之前在 plugin 代码中打印出的日志：

```
onCreateRoom 被触发
```

### 日志

在 `leangame/local/game-standalone/logs/` 中可以找到如下日志：

文件 | 说明
---- | ---
plugin.log | game-server hook 输出的日志
gc-XXX.current | GC 日志
server.log | game-server 运行日志
lobby.log | game-lobby 运行日志
router.log | game-router 运行日志
stdout.log | 进程的 STDOUT 输出
perf.log | 内部关键函数运行耗时、速率统计
event.log | 事件日志，如用户登录登出等
stats.log | 关键指令过去 5 分钟内运行次数统计

## 部署到云端

我们仅需要把 plugin 的代码部署到云端，首先在根目录中登录 LeanCloud。
```
cd multiplayer-server-plugin-getting-started/
lean login
```

登录后，选择关联华东节点下的应用。

```
lean switch
```

在第一步选择 App 中，选择您的游戏对应的 LeanCloud 应用。在第二步选择云引擎分组时，必须选择 _multiplayer-server 分组，LeanCloud 仅对该分组提供专门针对 Multiplayer Server 的优化维护及各种支持，如图所示：

//////// 图片，选择应用，选择云引擎分组 xxxxxx

然后将代码部署到云端

```
lean deploy
```

部署到云端后，我们可以在游戏引擎中停止指定连接本地服务器，改为连接线上服务器/////////////////////////////////////：

```js
const client = new Client({
  // 设置 APP ID
  appId: YOUR_APP_ID,
  // 设置 APP Key
  appKey: YOUR_APP_KEY,
  // 设置用户 id
  userId: 'leancloud'
  // 指定连接本地的 Server 地址
  // playServer: 'http://localhost:8081/v1', // 连接线上服务器时，去掉本行代码
  // 关闭 ssl
  // ssl: false  // 连接线上服务器时，去掉本行代码
});
```

```c#
// App Id
var APP_ID = YOUR_APP_ID;
// App Key
var APP_KEY = YOUR_APP_KEY;
// App 节点地区
// Region.EastChina：华东节点
// Region.NorthChina：华北节点
// Region.NorthAmerica：美国节点
var APP_REGION = YOUR_APP_REGION;
// 初始化
play.Init(APP_ID, APP_KEY, APP_REGION);
```

### 日志
部署到云端后，控制台只会显示自行打印的日志，也就是在本地 plugin.log 文件中的日志。


## 开发指南
如何撰写 Plugin 中的代码，请参考 [Multiplayer Server 开发指南 &middot; Java](multiplayer-server-guide-java.html)。

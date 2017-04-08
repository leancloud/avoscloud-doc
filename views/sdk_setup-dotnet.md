# C# SDK 安装指南

## 安装
### .NET Framework
.NET Framework 支持一下运行时：

- Classic Desktop 4.5+
- Windows 8 暂不支持
- Windows Phone 不再支持
- UWP 4.5+

在 Visual Studio 执行安装 nuget 依赖：

```sh
PM> Install-Package LeanCloud
```

### .NET Core
暂不支持

### Xamarin

请确保您的项目至少满足如下版本需求：

- [Xamarin.Android 4.7+](https://developer.xamarin.com/releases/ios/xamarin.ios_6/xamarin.ios_6.3/)

- [Xamarin.iOS 6.3](https://developer.xamarin.com/releases/android/xamarin.android_4/xamarin.android_4.7/)

在 Xamarin Studio 或者 Visual Studio for Mac 上执行如下 nuget 指令：

```sh
PM> Install-Package LeanCloud
```

### Mono for Unity

- Unity 5.3+

不支持 Unity 5.3 以下版本的原因是 Unity 官方在 5.3 之后支持了 (UnityWebRequest)[https://docs.unity3d.com/ScriptReference/Networking.UnityWebRequest.html] 类，并且建议开发者都是用此类来进行 HTTP 请求的发送，因此我们遵照官方设定将原来的 WWW 的摒弃，改用新的 UnityWebRequest 来实现底层的 HTTP Client。

请前往 [Unity Storage](https://releases.leanapp.cn/#/leancloud/unity-sdk/releases) 以及 [Unity Realtime](https://releases.leanapp.cn/#/leancloud/realtime-SDK-dotNET/releases)下载最新版本的 zip 包，解压之后导入到您的 Unity 项目中，注意，[Unity Storage](https://releases.leanapp.cn/#/leancloud/unity-sdk/releases) 和 [Unity Realtime](https://releases.leanapp.cn/#/leancloud/realtime-SDK-dotNET/releases) 本质上只相差一个 DLL 文件：`LeanCloud.Realtime.dll`,因此如果您不需要使用实时通讯的模块，可以只下载 [Unity Storage](https://releases.leanapp.cn/#/leancloud/unity-sdk/releases)

### 依赖详解

安装之后，您的项目会依赖如下内容：


名称|模块描述|是否必须
--|---|---
AssemblyLister.dll|LeanCloud 依赖检测模块，它负责检查相关依赖是否正确加载|是
LeanCloud.Core.dll|核心库，里面包含了 AVObject 和 AVUser 等所有内置类型的定义和序列化相关操作的功能|是
LeanCloud.Storage.dll|存储库，里面包含本地缓存以及 HTTP 请求发送的实现|是
LeanCloud.Realtime.dll|实时通讯库，里面包含了实时通讯协议的实现以及相关接口|否

如果您的项目不需要使用实时通讯，是可以删除对 LeanCloud.Realtime.dll 的依赖的，或者您在引入的时候在 nuget 里面执行如下指令，则 IDE 只会加载核心和存储模块并不会导入实时通讯模块

```sh
PM> Install-Package LeanCloud.Storage
```

另外我们也提供了指定安装实时通讯模块的 nuget 包：

```sh
PM> Install-Package LeanCloud.Realtime
```

## 配置 SDK

### .NET Framework & Xamarin
在应用程序入口函数添加如下代码：

```cs
// 如果只使用存储可以使用如下初始化代码
AVClient.Initialize("此处填写应用的 appId", "此处填写应用的 appKey");
```

假设还需要使用聊天，请使用如下代码：

```cs
var realtime = new AVRealtime("此处填写应用的 appId", "此处填写应用的 appKey");
```

如果使用了实时通讯初始化的代码就不需要再次调用 `AVClient.Initialize`，因为在聊天初始化的时候会调用它。


### Unity

初始化**必须**在 Unity Editor 上将 `AVInitializeBehaviour` 挂载在某一个 GameObject 下，如下图：

![AVInitializeBehaviour](https://dn-lhzo7z96.qbox.me/1490770179090)

![mount](https://dn-lhzo7z96.qbox.me/1490770533536)

假设还需要使用实时通讯请在任意一个 `MonoBehaviour` 启动的时候调用如下代码：

```cs
var realtime = new AVRealtime("此处填写应用的 appId", "此处填写应用的 appKey");
```
请注意，在 Unity 中使用实时通讯初始化也一定先要按照前文初始化存储的方式，首先初始化存储模块，然后初始化实时通讯模块，这两步都**必须**做。


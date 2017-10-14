{% import "views/_helper.njk" as docs %}
# C# SDK 安装指南

## 安装
### .NET Framework

.NET Framework 支持以下运行时：

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

请确保你的项目至少满足如下版本需求：

- [Xamarin.Android 4.7+](https://developer.xamarin.com/releases/ios/xamarin.ios_6/xamarin.ios_6.3/)
- [Xamarin.iOS 6.3](https://developer.xamarin.com/releases/android/xamarin.android_4/xamarin.android_4.7/)

在 Xamarin Studio 或者 Visual Studio for Mac 上执行如下 nuget 指令：

```sh
PM> Install-Package LeanCloud
```

### Mono for Unity

- Unity 5.3+

不支持 Unity 5.3 以下版本的原因是：Unity 官方在 5.3 之后支持了 [UnityWebRequest](https://docs.unity3d.com/ScriptReference/Networking.UnityWebRequest.html) 类，并且建议开发者都使用此类进行 HTTP 请求的发送，因此我们遵照官方设定，摒弃原来的 WWW，改用新的 UnityWebRequest 来实现底层的 HTTP Client。

请前往 [Unity Storage][unity-storage] 以及 [Unity Realtime][unity-im] 下载最新版本的 zip 包，解压之后导入到你的 Unity 项目中。

{{ docs.note("[Unity Storage][unity-storage] 和 [Unity Realtime][unity-im] 本质上只相差一个 DLL 文件：`LeanCloud.Realtime.dll`，因此如果你不需要使用实时通讯模块，可以只下载 [Unity Storage][unity-storage]。") }}

### 依赖详解

安装之后，你的项目会依赖如下内容：

名称|模块描述|必选
--|---|---
`AssemblyLister.dll`|LeanCloud 依赖检测模块，它负责检查相关依赖是否正确加载|是
`LeanCloud.Core.dll`|核心库，里面包含了 AVObject 和 AVUser 等所有内置类型的定义和序列化相关操作的功能|是
`LeanCloud.Storage.dll`|存储库，里面包含本地缓存以及 HTTP 请求发送的实现|是
`LeanCloud.Realtime.dll`|实时通讯库，里面包含了实时通讯协议的实现以及相关接口|否
`LeanCloud.LiveQuery.dll`|LiveQuery 库，里面包含实时数据同步的实现和相关接口|否
`LeanCloud.Analytics.dll`|数据统计库，里面包含了实现数据统计分析的实现和相关接口|否

如果你的项目不需要使用实时通讯，就可以删除对 `LeanCloud.Realtime.dll` 的依赖，或者在引入的时候在 nuget 里面执行如下指令，则 IDE 只会加载核心和存储模块，并不会导入实时通讯模块：

```sh
PM> Install-Package LeanCloud.Storage
```

另外我们也提供了指定安装实时通讯模块的 nuget 包：

```sh
PM> Install-Package LeanCloud.Realtime
```

如果希望使用实时数据同步功能（[LiveQuery](livequery-guide.html)），请执行如下 nuget 命令行来自动安装所有必要的依赖（例如实时通讯模块）：

```sh
Install-Package LeanCloud.LiveQuery
```

安装数据统计分析库需要执行如下命令行：

```sh
Install-Package LeanCloud.Analytics
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

如果使用了实时通讯初始化的代码，就不需要再次调用 `AVClient.Initialize`，因为在聊天初始化的时候会调用它。


### Unity

初始化**必须**在 Unity Editor 上将 `AVInitializeBehaviour` 挂载在某一个 GameObject 下，如下图：

![AVInitializeBehaviour](https://dn-lhzo7z96.qbox.me/1490770179090)

![mount](https://dn-lhzo7z96.qbox.me/1490770533536)

假设还需要使用实时通讯，请在任意一个 `MonoBehaviour` 启动的时候调用如下代码：

```cs
var realtime = new AVRealtime("此处填写应用的 appId", "此处填写应用的 appKey");
```

{{ docs.alert("在 Unity 中使用实时通讯，一定先要先初始化存储模块，然后初始化实时通讯模块，**这两步都必须做。**") }}

[unity-storage]: https://releases.leanapp.cn/#/leancloud/unity-sdk/releases
[unity-im]: https://releases.leanapp.cn/#/leancloud/realtime-SDK-dotNET/releases

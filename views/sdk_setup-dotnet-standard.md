# .NET SDK 配置指南

我们于 2020 年 12 月推出了基于 .Net Standard 2.0 接口标准实现的[新版 .Net SDK](https://github.com/leancloud/csharp-sdk)。旧版 .Net SDK（类名以 `AV` 开头的） 已不再更新，欢迎旧版 SDK 的用户尽快切换到[新版 .Net SDK](https://github.com/leancloud/csharp-sdk)，具体迁移方法详见 [.Net SDK 迁移指南]。

[.NET SDK 迁移指南]: https://github.com/leancloud/csharp-sdk/wiki/.Net-Standard-SDK-%E8%BF%81%E7%A7%BB%E6%8C%87%E5%8D%97

新版 .Net SDK 基于 .Net Standard 2.0 接口标准实现，支持框架如下：

- Unity 2018.1+
- .NET Core 2.0+
- .NET Framework 4.6.1+
- Mono 5.4+

更多支持框架可参考：https://docs.microsoft.com/en-us/dotnet/standard/net-standard

通过 GitHub 仓库 [Releases](https://github.com/leancloud/csharp-sdk/releases) 下载最新版本 SDK。

### 安装

- .NET Core 或其他支持 .NET Standard 2.0 的项目请下载 LeanCloud-SDK-XXX-Standard.zip，解压后设置依赖即可。
（XXX 指云服务，包括存储 Storage，即时通讯（含 LiveQuery） Realtime，云引擎 Engine）

- Unity
  
    - 直接导入：请下载 LeanCloud-SDK-XXX-Unity.zip，解压后为 Plugins 文件夹，拖拽至 Unity 即可。

    - UPM：请在项目的 Packages/manifest.json 中添加依赖项

        ```json
        "dependencies": {
        "com.leancloud.storage": "https://github.com/leancloud/csharp-sdk-upm.git#storage-0.7.5",
        "com.leancloud.realtime": "https://github.com/leancloud/csharp-sdk-upm.git#realtime-0.7.5"
        }
        ```

    注意：仅支持 Unity 2018+，即 Unity Api Compatibility Level 支持 .NET Standard 2.0 的版本。

### 模块及依赖关系

名称|模块描述
--|---
`LeanCloud-SDK-Storage`|存储服务。
`LeanCloud-SDK-Realtime`|即时通信、LiveQuery 服务，依赖于存储服务。
`LeanCloud-SDK-Engine`| 云引擎服务，依赖于存储，适用于云引擎服务端环境。

如只需使用某种服务，可下载最小依赖包，减小程序体积。

## 初始化

首先进入 **云服务控制台 > 设置 > 应用凭证** 来获取 **App ID**，**App Key** 以及**服务器地址**。

### 导入模块

```cs
// 导入基础模块
using LeanCloud;
// 导入存储模块
using LeanCloud.Storage;
// 如有需要，导入即时通讯模块
using LeanCloud.Realtime;
// 如有需要，导入 LiveQuery 模块
using LeanCloud.LiveQuery;
```

### 初始化

在使用服务前，先调用如下代码：

```cs
LCApplication.Initialize("{{appid}}", "{{appkey}}", "https://please-replace-with-your-customized.domain.com");
```

## 开启调试日志

在应用开发阶段，你可以选择开启 SDK 的调试日志（debug log）来方便追踪问题。调试日志开启后，SDK 会把网络请求、错误消息等信息输出到 IDE 的日志窗口，或是浏览器 Console 或是云引擎日志（如果在云引擎下运行 SDK）。

```cs
LCLogger.LogDelegate = (LCLogLevel level, string info) => {
    switch (level) {
        case LCLogLevel.Debug:
            TestContext.Out.WriteLine($"[DEBUG] {DateTime.Now} {info}\n");
            break;
        case LCLogLevel.Warn:
            TestContext.Out.WriteLine($"[WARNING] {DateTime.Now} {info}\n");
            break;
        case LCLogLevel.Error:
            TestContext.Out.WriteLine($"[ERROR] {DateTime.Now} {info}\n");
            break;
        default:
            TestContext.Out.WriteLine(info);
            break;
    }
}
```

Unity 平台可重定向到 Debug.

注意，在应用发布之前，请关闭调试日志，以免暴露敏感数据。

## 验证

首先，确认本地网络环境是可以访问云端服务器的，可以执行以下命令：

```sh
curl "https://{{host}}/1.1/date"
```

`{{host}}` 为绑定的 API 自定义域名。

如果当前网路正常会返回当前时间：

```json
{"__type":"Date","iso":"2020-10-12T06:46:56.000Z"}
```

然后在项目中编写如下测试代码：

```cs
LCObject testObject = new LCObject("TestObject");
testObject["words"] = "Hello world!";
await testObject.Save();
```

保存后运行程序。

然后打开 **云服务控制台 > 数据存储 > 结构化数据 > `TestObject`**，如果看到如下内容，说明 SDK 已经正确地执行了上述代码，安装完毕。

![数据表中出现一行「words」值为「Hello world!」的数据。](images/testobject_saved.png)

如果控制台没有发现对应的数据，请参考 [问题排查](#问题排查)。

## 问题排查

SDK 安装指南基于当前最新版本的 SDK 编写，所以排查问题前，请先检查下安装的 SDK 是不是最新版本。

### `401 Unauthorized`

如果 SDK 抛出 `401` 异常或者查看本地网络访问日志存在：

```json
{
  "code": 401,
  "error": "Unauthorized."
}
```

则可认定为 App ID 或者 App Key 输入有误，或者是不匹配，很多开发者同时注册了多个应用，导致拷贝粘贴的时候，用 A 应用的 App ID 匹配 B 应用的 App Key，这样就会出现服务端鉴权失败的错误。

### 客户端无法访问网络

客户端尤其是手机端，应用在访问网络的时候需要申请一定的权限。
# ChatKit 使用指南 &middot; iOS

[ChatKit](https://github.com/leancloud/ChatKit-OC) 是一个免费且开源的 UI 聊天组件，由 LeanCloud 官方推出，底层聊天服务基于 LeanCloud 的 IM 实时通信服务 LeanMessage 而开发，支持 iOS 7+。它的最大特点是把聊天常用的一些功能配合 UI 一起提供给开发者，帮助开发者快速集成 IM 服务，轻松实现聊天功能。同时它提供完全自由的授权协议，支持二次开发。

## 获取项目 

```
git clone --depth=1 https://github.com/leancloud/ChatKit-OC
```

## 集成效果

<div class="row">
  <div class="col-sm-4">
    <p>最近联系人</p>
    <img src="images/chatkit-ios/chatkit-screenshot-01.png" class="img-responsive img-bordered" />
  </div>
  <div class="col-sm-4">
    <p>语音消息，根据语音长度调整宽度</p>
    <img src="images/chatkit-ios/chatkit-screenshot-02.png" class="img-responsive" />
  </div>
  <div class="col-sm-4">
    <p>图片消息，尺寸自适应</p>
    <img src="images/chatkit-ios/chatkit-screenshot-03.png" class="img-responsive" />
  </div>
</div>
<div class="row" style="margin-top: 5rem;">
  <div class="col-sm-4">
    <p>地理位置消息</p>
    <img src="images/chatkit-ios/chatkit-screenshot-04.png" class="img-responsive" />
  </div>
  <div class="col-sm-4">
    <p>失败消息本地缓存，可重发</p>
    <img src="images/chatkit-ios/chatkit-screenshot-05.png" class="img-responsive" />
  </div>
  <div class="col-sm-4">
    <p>上传图片，进度条提示</p>
    <img src="images/chatkit-ios/chatkit-screenshot-06.png" class="img-responsive" />
  </div>
</div>
<div class="row" style="margin-top: 5rem;">
  <div class="col-sm-4">
    <p>图片消息支持多图联播，支持多种分享</p>
    <img src="images/chatkit-ios/chatkit-screenshot-07.jpg" class="img-responsive" />
  </div>
  <div class="col-sm-4">
    <p>文本消息支持图文混排</p>
    <img src="images/chatkit-ios/chatkit-screenshot-08.png" class="img-responsive" />
  </div>
  <div class="col-sm-4">
    <p>文本消息支持双击全屏展示</p>
    <img src="images/chatkit-ios/chatkit-screenshot-09.png" class="img-responsive img-bordered" />
  </div>
</div>

## 项目结构

```
├── ChatKit  ＃核心库文件夹
│   ├── LCChatKit.h  # 这是整个库的入口，也是中枢，相当于”组件化方案“中的 Mediator。
│   ├── LCChatKit.m
│   └── Class
│       ├── Model
│       ├── Module
│       │   ├── Base
│       │   ├── Conversation
│       │   │   ├── Controller
│       │   │   ├── Model
│       │   │   ├── Tool
│       │   │   │   ├── Categories
│       │   │   │   └── DisableImageMemoryCache
│       │   │   └── View
│       │   │       ├── ChatBar
│       │   │       └── ChatMessageCell
│       │   └── ConversationList
│       │       ├── Controller
│       │       ├── Model
│       │       └── View
│       ├── Resources  # 资源文件，如图片、音频等
│       │   ├── BarButtonIcon.bundle
│       │   ├── ChatKeyboard.bundle
│       │   ├── Common.bundle
│       │   ├── DateTools.bundle
│       │   ├── Emoji.bundle
│       │   ├── MBProgressHUD.bundle
│       │   ├── MessageBubble.bundle
│       │   ├── Placeholder.bundle
│       │   ├── VoiceMessageSource.bundle
│       │   └── localization
│       │       ├── en.lproj
│       │       └── zh-Hans.lproj
│       ├── Tool
│       │   ├── Service
│       │   └── Vendor
│       │       ├── DateTools
│       │       ├── LCCKAlertController
│       │       ├── LCCKDeallocBlockExecutor
│       │       ├── LCCKTableViewRowAction
│       │       └── VoiceLib
│       │           └── lame.framework
│       │               └── Headers
│       └── View
└── ChatKit-OC  # Demo演示
    ├── ChatKit-OC.xcodeproj
    └── Example
        └── LCChatKitExample.h  #这是Demo演示的入口类，这个类中提供了很多胶水函数，可完成初步的集成
        └── LCChatKitExample.m
            ├── Model
            ├── Module
            │   ├── ContactList
            │   │   ├── Controller
            │   │   ├── Tool
            │   │   └── View
            │   ├── Login
            │   │   ├── Controller
            │   │   ├── Model
            │   │   └── View
            │   ├── Main
            │   │   ├── Controller
            │   │   └── View
            │   └── Other
```
 
 从上面可以看出，`ChatKit-OC` 项目包分为两个部分：
 
 * `ChatKit` 是库的核心库文件夹。
 * `ChatKit-OC` 为Demo 演示部分，其中 `LCChatKitExample` 这个类提供了很多胶水函数，可完成初步的集成。
 
 
 ## 使用方法

为了让这个库更易入手，避免引入过多公开的类和概念，我们采用了类似「组件化」的方式进行构建，即将你在使用 ChatKit 库时所需要用到的所有方法都放在了 `LCChatKit` 这一个类中。它是一个 Mediator，是整个库的入口，也是中枢。
 
 使用 ChatKit 大体有几个步骤：

 1. 在 `-[AppDelegate application:didFinishLaunchingWithOptions:]` 中调用 `-[LCChatKit setAppId:appKey:]` 来开启 LeanCloud 服务。
 2. 调用 `-[LCChatKit sharedInstance]` 来初始化一个单例对象。
 3. 调用 `-[[LCChatKit sharedInstance] openWithClientId:callback:]` 开启 LeanCloud 的 IM 服务 LeanMessage，开始聊天。
 4. 调用 `-[[LCChatKit sharedInstance] closeWithCallback:]` 关闭 LeanCloud 的 IM 服务，结束聊天。
 5. 实现 `-[[LCChatKit sharedInstance] setFetchProfilesBlock:]`，设置用户体系，里面要实现如何根据 userId 获取到一个 User 对象的逻辑。ChatKit 会在需要用到 User 信息时调用你设置的这个逻辑。 `LCCKUserSystemService.h` 文件中给出了例子，演示了如何集成 LeanCloud 原生的用户系统 `AVUser`。
 6. 如果你实现了 `-[[LCChatKit sharedInstance] setGenerateSignatureBlock:]` 方法，那么 ChatKit 会自动为以下行为添加签名：`open`（开启会话）、`start`（创建会话）、`kick`（踢人）、`invite`（邀请）。反之不会。

下面按步骤进行详细的介绍。

### CocoaPods 导入

在文件 `Podfile` 中加入以下内容：

```shell
pod 'ChatKit'
```

然后使用 CocoaPods 进行安装。如果尚未安装 CocoaPods，运行以下命令进行安装：

```shell
gem install cocoapods
```

安装成功后就可以安装依赖了。建议使用如下方式：

```shell
 # 禁止升级 CocoaPods 的 spec 仓库，否则会卡在 Analyzing dependencies，非常慢
 pod update --verbose --no-repo-update
```
 
如果提示找不到库，则可去掉 `--no-repo-update`。

如果不想使用 CocoaPods 进行集成，也可以选择使用 [源码集成](#手动集成)。

### 胶水函数快速集成

ChatKit 提供了一个快速集成的演示类 `LCChatKitExample`，路径如下：

```Objective-C
 ├── ChatKit  ＃核心库文件夹
 └──  ChatKit-OC  # Demo演示
    ├── ChatKit-OC.xcodeproj
    └── Example
        └── LCChatKitExample.h  # 这是 Demo 演示的入口类，这个类中提供了很多胶水函数，可完成初步的集成。
        └── LCChatKitExample.m
```
 
使用 `LCChatKitExample` 提供的函数即可完成从程序启动到登录再到登出的完整流程。

- 在 `-[AppDelegate didFinishLaunchingWithOptions:]` 等函数中调用下面这几个基础的入口胶水函数，可完成初步的集成。
- 胶水代码中包含了特地设置的 `#warning`，请仔细阅读这些 warning 的注释，根据实际情况调整代码，以符合你的需求。

```Objective-C
/*!
 *  入口胶水函数：初始化入口函数
 *
 *  程序完成启动，在 appdelegate 中的 `-[AppDelegate didFinishLaunchingWithOptions:]` 一开始的地方调用.
 */
+ (void)invokeThisMethodInDidFinishLaunching;

/*!
 * Invoke this method in `-[AppDelegate appDelegate:didRegisterForRemoteNotificationsWithDeviceToken:]`.
 */
+ (void)invokeThisMethodInDidRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken;

/*!
 * invoke This Method In `-[AppDelegate application:didReceiveRemoteNotification:]`
 */
+ (void)invokeThisMethodInApplication:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo ;

/*!
 *  入口胶水函数：登入入口函数
 *
 *  用户即将退出登录时调用
 */
+ (void)invokeThisMethodAfterLoginSuccessWithClientId:(NSString *)clientId success:(LCCKVoidBlock)success failed:(LCCKErrorBlock)failed;

/*!
 *  入口胶水函数：登出入口函数
 *
 *  用户即将退出登录时调用
 */
+ (void)invokeThisMethodBeforeLogoutSuccess:(LCCKVoidBlock)success failed:(LCCKErrorBlock)failed;
+ (void)invokeThisMethodInApplicationWillResignActive:(UIApplication *)application;
+ (void)invokeThisMethodInApplicationWillTerminate:(UIApplication *)application;
```

### 最近联系人界面

主流的社交聊天软件，例如微信和 QQ 都会把最近联系人界面作为登录后的首页，可见其重要性。因此我们在 ChatKit 也提供了对话列表 `LCIMConversationListController` 页面，初始化方法非常简单：

```Objective-C
LCCKConversationListViewController *firstViewController = [[LCCKConversationListViewController alloc] init];
```
 
最近联系人界面的数据，依赖于本地数据库。这些数据会在聊天过程中自动进行更新，你无需进行繁琐的数据库操作。

### 聊天界面

<div class="callout callout-info">ChatKit 中的对话是一个 `AVIMConversation` 对象， LeanMessage
用它来管理对话成员，发送消息，不区分群聊、单聊。Demo 中采用了判断会话人数的方式来区分群聊、单聊。</div>

聊天界面有两种初始化方式：

```Objective-C
// 用于单聊
LCCKConversationViewController *conversationViewController = [[LCCKConversationViewController alloc] initWithPeerId:peerId];
 ```

```Objective-C
// 单聊或群聊
LCCKConversationViewController *conversationViewController = [[LCCKConversationViewController alloc] initWithConversationId:conversationId];
```

这里注意，通过 `peerId` 初始化，内部实现时，如果不是好友关系，会先建立好友关系、创建会话，所以调用该方法前请自行判断是否具有好友关系。同理，通过 `conversationId` 初始化群聊，内部实现时，如果不是群成员会先把当前用户加入群，并开启群聊。

### 手动集成

如果你不想使用 CocoaPods 进行集成，也可以选择使用源码集成。步骤如下：

第一步：

将 [项目结构](#项目结构) 中提到的 ChatKit 这个「核心库文件夹」拖拽到项目中。

第二步：

添加 ChatKit 依赖的第三方库以及对应版本：

 - [AVOSCloud](sdk_down.html) v3.3.5
 - [AVOSCloudIM](sdk_down.html) v3.3.5
 - [MJRefresh](https://github.com/CoderMJLee/MJRefresh) 3.1.9
 - [Masonry](https://github.com/SnapKit/Masonry) v1.0.1 
 - [SDWebImage](https://github.com/rs/SDWebImage) v3.8.0
 - [FMDB](https://github.com/ccgus/fmdb) 2.6.2 
 - [UITableView+FDTemplateLayoutCell](https://github.com/forkingdog/UITableView-FDTemplateLayoutCell) 1.5.beta


## 常见问题

**ChatKit 组件收费么？**<br/>
ChatKit 是完全开源并且免费给开发者使用，使用聊天所产生的费用以账单为准。

**接入 ChatKit 有什么好处？**<br/>
它可以减轻应用或者新功能研发初期的调研成本，直接引入使用即可。ChatKit 从底层到 UI 提供了一整套的聊天解决方案。

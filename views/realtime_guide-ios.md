{% extends "./realtime_guide.tmpl" %}

{% block language %}iOS{% endblock %}

{% block demo %}
* [LeanMessage](https://github.com/leancloud/LeanMessage-Demo)（推荐）
* [LeanChat](https://github.com/leancloud/leanchat-ios)
{% endblock %}

{% block setup_init %}
### 使用 CocoaPods 安装 SDK

[快速入门](https://leancloud.cn/start.html) 会教你如何在一个项目中安装 SDK。

[CocoaPods](http://www.cocoapods.org/) 是一款很好的依赖管理工具，其安装步骤大致如下：

首先确保开发环境中已经安装了 Ruby。一般安装了 XCode，Ruby 会被自动安装上。我们建议使用淘宝提供的 [Gem 源](http://ruby.taobao.org/)，在终端执行下列命令：

```sh
$ gem sources --remove https://rubygems.org/
$ gem sources -a http://ruby.taobao.org/
# 请确保下列命令的输出只有 ruby.taobao.org
$ gem sources -l
*** CURRENT SOURCES ***
http://ruby.taobao.org
```

通过下列命令，安装或更新 CocoaPods（可能需要输入登录密码）：

```sh
sudo gem install cocoapods
```

在项目根目录下创建一个名为 **Podfile** 的文件（无扩展名），并添加以下内容：

```sh
pod 'AVOSCloudIM'
```

最后执行安装命令：

```sh
pod install
```

相关资料：[《CocoaPods 安装和使用教程》](http://code4app.com/article/cocoapods-install-usage)

### 手动安装 SDK

你也可以从我们官网下载最新版本的 iOS SDK，手动导入项目中。具体步骤详见 [快速入门](https://leancloud.cn/start.html)。

这里要特别注意如下几点：

* 手动添加下列依赖库：

  * SystemConfiguration.framework
  * MobileCoreServices.framework
  * CoreTelephony.framework
  * CoreLocation.framework
  * libicucore.dylib

* 如果使用 [崩溃报告 AVOSCloudCrashReporting](./ios_crashreporting_guide.html)，还需额外添加 **libc++.dylib**。

* 在项目 Targets 的 **Build Settings** 中，为 **Other Linker Flags** 增加 **-all_load** 链接选项。

然后我们需要在 application 的 `applicationDelegate` 函数中对实时通信 SDK 进行初始化：

```objc
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    // 其他处理...
    ...
    // "你的 AppId", "你的 AppKey"
    [AVOSCloud setApplicationId:@"{{appid}}" clientKey:@"{{appkey}}"];
    ...
}
```
{% endblock %}

{% block compatibility %}
### 示例代码约定

在以下示例代码中，若无特殊说明，所有代码均位于下面这个类的实现文件中：

```objc
@interface TomAndJerryEpisode : NSObject

@end

@implementation TomAndJerryEpisode

// 所有示例代码均位于此处

@end
```

对于像 `self.prop` 这样的引用，我们约定 `prop` 属性在 `TomAndJerryEpisode` 类中已经有了正确的实现。例如：

```
self.client = [[AVIMClient alloc] init];
```

若想让它正确执行，需要在当前的 `ViewController.m` 中添加一个 `AVIMClient` 属性：

```
@property (nonatomic, strong) AVIMClient *client;
```

以此类推。

我们也故意省略了错误处理，有时还会省略一些上下文逻辑，目的是让示例代码简明扼要。

示例代码并不是最佳实践，仅为演示 SDK 接口的基础用法。
{% endblock %}

{% block oneOnOneChat_sent %}
```objc
- (void)TomSendMessageToJerry {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 建立了与 Jerry 的会话
        [self.client createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 发了一条消息给 Jerry
            [conversation sendMessage:[AVIMTextMessage messageWithText:@"耗子，起床！" attributes:nil] callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"发送成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block avoidCreatingDuplicateConversation %}{% endblock %}

{% block oneOnOneChat_received %}
```objc
- (void)JerryReceiveMessageFromTom {
    // Jerry 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // 设置 client 的 delegate，并实现 delegate 方法
    self.client.delegate = self;

    // Jerry 用自己的名字作为 ClientId 打开了 client
    [self.client openWithClientId:@"Jerry" callback:^(BOOL succeeded, NSError *error) {
        // ...
    }];
}

#pragma mark - AVIMClientDelegate

// 接收消息的回调函数
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    NSLog(@"%@", message.text); // 耗子，起床！
}
```
{% endblock %}

{% block groupChat_sent %}
```objc
- (void)TomCreateConversationWithFriends {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 建立了与朋友们的会话
        NSArray *friends = @[@"Jerry", @"Bob", @"Harry", @"William"];
        [self.client createConversationWithName:@"Tom and friends" clientIds:friends callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 发了一条消息给朋友们
            [conversation sendMessage:[AVIMTextMessage messageWithText:@"你们在哪儿？" attributes:nil] callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"发送成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block groupChat_received %}
```objc
- (void)BobReceiveMessageFromFriends {
    // Bob 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // 设置 client 的 delegate，并实现 delegate 方法
    self.client.delegate = self;

    // Bob 用自己的名字作为 ClientId 打开了 client
    [self.client openWithClientId:@"Bob" callback:^(BOOL succeeded, NSError *error) {
        // ...
    }];
}

#pragma mark - AVIMClientDelegate

- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    NSLog(@"%@", message.text); // 你们在哪儿？

    AVIMTextMessage *reply = [AVIMTextMessage messageWithText:@"Tom，我在 Jerry 家，你跟 Harry 什么时候过来？还有 William 和你在一起么？" attributes:nil];

    [conversation sendMessage:reply callback:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            NSLog(@"回复成功！");
        }
    }];
}
```
{% endblock %}

{% block imageMessage_local_sent %}
```objc
- (void)TomSendLocalImageToJerry {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 建立了与 Jerry 的会话
        [self.client createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 创建了一个图像消息
            NSString *filePath = [self imagePath];
            NSDictionary *attributes = @{ @"location": @"旧金山" };
            AVIMImageMessage *message = [AVIMImageMessage messageWithText:@"发自我的 iPhone" attachedFilePath:filePath attributes:attributes];

            // Tom 将图像消息发给 Jerry
            [conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"发送成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block imageMessage_url_sent %}
```objc
- (void)TomSendExternalImageToJerry {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 建立了与 Jerry 的会话
        [self.client createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 发了一张图片给 Jerry
            AVFile *file = [AVFile fileWithURL:[self imageURL]];
            AVIMImageMessage *message = [AVIMImageMessage messageWithText:@"萌妹子一枚" file:file attributes:nil];
            [conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"发送成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block imageMessage_received_intro %}
在接收图像消息这种富媒体消息时，需要使用 `conversation:didReceiveTypedMessage:` 方法。实际上接收所有富媒体消息都是如此，因为它们都是从 `AVIMTypedMessage` 派生出来的。相关内容可以在下面的 [消息类详解](#消息类详解) 中找到。
{% endblock %}

{% block imageMessage_received %}
```objc
- (void)JerryReceiveImageMessageFromTom {
    // Jerry 创建了一个 client
    self.clientJerry = [[AVIMClient alloc] init];
    self.clientJerry.delegate = self;

    // Jerry 用自己的名字作为 ClientId 打开 client
    [self.clientJerry openWithClientId:@"Jerry" callback:^(BOOL succeeded, NSError *error) {
        // ...
    }];
}

#pragma mark - AVIMClientDelegate

- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    AVIMImageMessage *imageMessage = (AVIMImageMessage *)message;

    // 消息的 id
    NSString *messageId = imageMessage.messageId;
    // 图像文件的 URL
    NSString *imageUrl = imageMessage.file.url;
    // 发该消息的 ClientId
    NSString *fromClientId = message.clientId;
}
```
{% endblock %}

{% block audioMessage_local_sent %}
```objc
- (void)TomSendAudioToJerry {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 建立了与 Jerry 的会话
        [self.client createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 发了一首歌曲给 Jerry
            NSString *path = [[NSBundle mainBundle] pathForResource:@"忐忑" ofType:@"mp3"];
            AVFile *file = [AVFile fileWithName:@"忐忑.mp3" contentsAtPath:path];
            AVIMImageMessage *message = [AVIMImageMessage messageWithText:@"听听人类的神曲~" file:file attributes:nil];
            [conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"发送成功！");
                }
            }];
        }];
    }];
}
``` 
{% endblock %}

{% block audioMessage_url_sent %}
```objc
- (void)TomSendExternalAudioToJerry {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 建立了与 Jerry 的会话
        [self.client createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 发了一首歌曲给 Jerry
            AVFile *file = [AVFile fileWithURL:@"http://ac-lhzo7z96.clouddn.com/1427444393952"];
            AVIMAudioMessage *message = [AVIMAudioMessage messageWithText:@"听听人类的神曲~" file:file attributes:nil];
            [conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"发送成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block audioMessage_received_intro %}
与接收图像消息类似，需要使用 `conversation:didReceiveTypedMessage:` 方法来响应，实例代码请参照 [图像消息接收](#接收图像消息)。
{% endblock %}

{% block videoMessage_local_sent %}
```objc
- (void)TomSendVedioToJerry {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 建立了与 Jerry 的会话
        [self.client createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 发了一个视频给 Jerry
            NSString *path = [[NSBundle mainBundle] pathForResource:@"BBC_奶酪" ofType:@"mp4"];
            AVFile *file = [AVFile fileWithName:@"BBC_奶酪.mp4" contentsAtPath:path];
            AVIMVideoMessage *message = [AVIMVideoMessage messageWithText:nil file:file attributes:nil];
            [conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"发送成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block videoMessage_url_sent %}
```objc
- (void)TomSendExternalVedioToJerry {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 建立了与 Jerry 的会话
        [self.client createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 发了一段视频给 Jerry
            AVFile *file = [AVFile fileWithURL:@"http://ac-lhzo7z96.clouddn.com/1427267336319"];
            AVIMVideoMessage *message = [AVIMVideoMessage messageWithText:nil file:file attributes:nil];
            [conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"发送成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block videoMessage_received_intro %}
与接收图像消息类似，需要使用 `conversation:didReceiveTypedMessage:` 方法来响应，实例代码请参照 [图像消息接收](#接收图像消息)。
{% endblock %}

{% block fileMessage_sent %}
iOS 暂不支持发送通用文件消息，已在计划中，近期发布。
{% endblock %}

{% block fileMessage_receive_intro %}
iOS 暂不支持发送通用文件消息，已在计划中，近期发布。
{% endblock %}

{% block locationMessage_new %}
```objc
[AVIMLocationMessage messageWithText:nil latitude:45.0 longitude:34.0 attributes:nil];
```
{% endblock %}

{% block locationMessage_sent %}
```objc
- (void)TomSendLocationToJerry {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 建立了与 Jerry 的会话
        [self.client createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 发了一个地理位置给 Jerry
            // NOTE: 开发者更可以通过具体的设备的 API 去获取设备的地理位置
            AVIMLocationMessage *message = [AVIMLocationMessage messageWithText:@"新开的蛋糕店！耗子咱们有福了…" latitude:45.0 longitude:34.0 attributes:nil];
            [conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"发送成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block locationMessage_received_intro %}
与接收图像消息类似，需要使用 `conversation:didReceiveTypedMessage:` 方法来响应，实例代码请参照 [图像消息接收](#接收图像消息)。
{% endblock %}

{% block typedMessage_received %}
```
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message;
```
{% endblock %}

{% block transientMessage_sent %}{% endblock %}

{% block messagePolicy_sent %}{% endblock %}

{% block offlineMessage %}
这样 iOS 平台上的用户就可以收到消息推送了。当然，前提是应用本身申请到了 RemoteNotification 权限，也将正确的推送证书上传到了 LeanCloud 控制台。
{% endblock %}

{% block message_sent_ack %}
监听消息是否已送达实现 `conversation:messageDelivered` 即可。
```objc
- (void)conversation:(AVIMConversation *)conversation messageDelivered:(AVIMMessage *)message{
    NSLog(@"%@", @"消息已送达。"); // 打印消息
}
```
{% endblock %}

{% block message_received_ack %}{% endblock %}

{% block messagePolicy_received_intro %}{% endblock %}

{% block messagePolicy_received %}{% endblock %}

{% block message_Relation_intro %}{% endblock %}

{% block message_Properties_intro %}
所有消息都是 `AVIMMessage` 的实例，每种消息实例都具备如下属性：

属性|描述
---|---
content|消息内容
clientId|指消息发送者的 clientId
conversationId|消息所属对话 id
messageId|消息发送成功之后，由 LeanCloud 云端给每条消息赋予的唯一 id
sendTimestamp|消息发送的时间。消息发送成功之后，由 LeanCloud 云端赋予的全局的时间戳。
deliveredTimestamp| 消息被对方接收到的时间。消息被接收之后，由 LeanCloud 云端赋予的全局的时间戳。
status|消息状态，有五种取值：<br/><br/>`AVIMMessageStatusNone`（未知）<br/>`AVIMMessageStatusSending`（发送中）<br/>`AVIMMessageStatusSent`（发送成功）<br/>`AVIMMessageStatusDelivered`（被接收）<br/>`AVIMMessageStatusFailed`（失败）
ioType|消息传输方向，有两种取值：<br/><br/>`AVIMMessageIOTypeIn`（发给当前用户）<br/>`AVIMMessageIOTypeOut`（由当前用户发出）

我们为每一种富媒体消息定义了一个消息类型，实时通信 SDK 自身使用的类型是负数（如下面列表所示），所有正数留给开发者自定义扩展类型使用，0 作为「没有类型」被保留起来。

消息 | 类型
--- | ---
文本消息|-1
图像消息|-2
音频消息|-3
视频消息|-4
位置消息|-5
文件消息|-6

<!-- >TODO: 举例说明如何使用这样的数字类型 -->
{% endblock %}

{% block attributes %} `AVIMMessage.attributes` {% endblock %}

{% block attributes_property %}attributes{% endblock %}

{% block customAttributesMessage_sent %}
```objc
- (void)TomSendLocalImageToJerry {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 建立了与 Jerry 的会话
        [self.client createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 创建了一个图像消息
            NSString *filePath = [self imagePath];
            NSDictionary *attributes = @{ @"location": @"拉萨布达拉宫" };
            AVIMImageMessage *message = [AVIMImageMessage messageWithText:@"这蓝天……我彻底是醉了" attachedFilePath:filePath attributes:attributes];

            // Tom 将图像消息发给 Jerry
            [conversation sendMessage:message callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"发送成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block customAttributesMessage_received %}

```objc
- (void)JerryReceiveMessageFromTom {
    // Jerry 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // 设置 client 的 delegate，并实现 delegate 方法
    self.client.delegate = self;

    // Jerry 用自己的名字作为 ClientId 打开了 client
    [self.client openWithClientId:@"friend" callback:^(BOOL succeeded, NSError *error) {
        // ...
    }];
}

#pragma mark - AVIMClientDelegate

- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message {
    if ([message isKindOfClass:[AVIMImageMessage class]]) {
        AVIMImageMessage *imageMessage = (AVIMImageMessage *)message;

        // 拉萨布达拉宫
        NSString *location = imageMessage.attributes[@"location"];
    }
}
```
{% endblock %}

{% block customMessage_create %}
继承于 `AVIMTypedMessage`，开发者也可以扩展自己的富媒体消息。其要求和步骤是：

* 实现 `AVIMTypedMessageSubclassing` 协议
* 子类将自身类型进行注册，一般可在 application 的 `applicationDelegate` 方法里面调用 `[YourClass registerSubclass]`;
{% endblock %}

{% block messagePolicy_received_method %} `conversation:didReceiveCommonMessage:` {% endblock %}

{% block messagePolicy_received %}
实时通信 SDK 内部封装了对富媒体消息的支持，所有富媒体消息都是从 AVIMTypedMessage 派生出来的。发送的时候可以直接调用 `[AVIMConversation sendMessage:callback:]` 函数。在接收端，我们也在 `AVIMClientDelegate` 中专门增加了一个回调函数：

```
- (void)conversation:(AVIMConversation *)conversation didReceiveTypedMessage:(AVIMTypedMessage *)message;
```
这样，如果发送端发送的是 AVIMMessage 消息，那么接受端就是 `conversation:didReceiveCommonMessage:` 被调用；如果发送的是 AVIMTypedMessage（及其子类）的消息，那么接受端就是 `conversaion:didReceiveTypedMessage` 被调用。
{% endblock %}

{% block conversation_specialnote %}{% endblock %}

{% block conversation_init %}
```objc
- (void)JerryCreateConversationWithFriends {
    // Jerry 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Jerry 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Jerry" callback:^(BOOL succeeded, NSError *error) {
        // Jerry 建立了与朋友们的会话
        NSArray *friends = @[@"Jerry", @"Bob", @"Harry", @"William"];
        [self.client createConversationWithName:@"Tom and friends" clientIds:friends callback:^(AVIMConversation *conversation, NSError *error) {
            if (!error) {
                NSLog(@"创建成功");
            }
        }];
    }];
}
```
{% endblock %}

{% block event_memberJoin %} `membersAdded` {% endblock %}

{% block event_memberLeft %} `membersRemoved` {% endblock %}

{% block event_kicked %} `kickedByClientId` {% endblock %}

{% block event_invited %} `invitedByClientId` {% endblock %}

{% block conversation_join %}
```objc
- (void)TomJoinConversation {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query getConversationById:@"551260efe4b01608686c3e0f" callback:^(AVIMConversation *conversation, NSError *error) {
            [conversation joinWithCallback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"加入成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block conversation_membersChanged_callBack %}
该群的其他成员（比如 Bob）会收到该操作的事件回调：

```objc
- (void)BobNoticedTomDidJoin {
    // Bob 创建了一个 client
    self.client = [[AVIMClient alloc] init];
    self.client.delegate = self;

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // ...
    }];
}

#pragma mark - AVIMClientDelegate

- (void)conversation:(AVIMConversation *)conversation membersAdded:(NSArray *)clientIds byClientId:(NSString *)clientId {
    NSLog(@"Tom 加入了 conversation");
}

```

{% endblock %}

{% block conversation_membersChanged %}{% endblock %}

{% block conversation_memebersJoined %}{% endblock %}

{% block conversation_invite %}
```objc
- (void)JerryInviteMary {
    // Jerry 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Jerry 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Jerry" callback:^(BOOL succeeded, NSError *error) {
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query getConversationById:@"551260efe4b01608686c3e0f" callback:^(AVIMConversation *conversation, NSError *error) {
            // Jerry 邀请 Mary 到会话中
            [conversation addMembersWithClientIds:@[@"Mary"] callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"邀请成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block conversation_invite_events %}
邀请成功以后，相关方收到通知的时序是这样的：

No.|邀请者|被邀请者|其他人
---|---|---|---
1|发出请求 addMembers| | 
2| |收到 invitedByClientId 通知| 
3|收到 membersAdded 通知|收到 membersAdded 通知 | 收到 membersAdded 通知
{% endblock %}

{% block conversation_left %}
```objc
- (void)TomQuitConversation {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query getConversationById:@"551260efe4b01608686c3e0f" callback:^(AVIMConversation *conversation, NSError *error) {
            [conversation quitWithCallback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"退出成功！");
                }
            }];
        }];
    }];
}
``` 
{% endblock %}

{% block conversation_kick %}
```objc
- (void)WilliamKickHarry {
    // William 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // William 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"William" callback:^(BOOL succeeded, NSError *error) {
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query getConversationById:@"551260efe4b01608686c3e0f" callback:^(AVIMConversation *conversation, NSError *error) {
            [conversation removeMembersWithClientIds:@[@"Harry"] callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"踢出成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block conversation_kick_events %}
踢人时，相关方收到通知的时序如下：

No.|邀请者|被邀请者|其他人
---|---|---|---
1|发出请求 removeMembers| | 
2| |收到 kickedByClientId 通知| 
3|收到 membersRemoved 通知| | 收到 membersRemoved 通知
{% endblock %}

{% block conversation_countMember_method %} `conversation:countMembersWithCallback:` {% endblock %}

{% block conversation_countMember %}
```objc
- (void)TomCountConversationMembers {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query getConversationById:@"551260efe4b01608686c3e0f" callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 查看会话中成员的数量
            NSLog(@"%ld", [conversation.members count]);
        }];
    }];
}
```
{% endblock %}

{% block table_conversation_attributes_intro %}
AVIMConversation 属性名 | _Conversation 字段|含义
--- | ------------ | -------------
`conversationId`| `objectId` |全局唯一的 Id
`name` |  `name` |成员共享的统一的名字
`members`|`m` |成员列表
`creator` | `c` |对话创建者
`attributes`| `attr`|自定义属性
`transient`|`tr`|是否为聊天室（暂态对话）
{% endblock %}

{% block conversation_name %}
```objc
- (void)TomCreateNamedConversation {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 建立了与 Black 的会话，会话名称是 "喵星人"
        [self.client createConversationWithName:@"喵星人" clientIds:@[@"Black"] callback:^(AVIMConversation *conversation, NSError *error) {
            if (succeeded) {
                NSLog(@"创建成功！");
            }
        }];
    }];
}
```
{% endblock %}

{% block conversation_changeName %}
```objc
- (void)BlackChangeConversationName {
    // Black 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Black 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Black" callback:^(BOOL succeeded, NSError *error) {
        // Black 查询 id 为 551260efe4b01608686c3e0f 的会话
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query getConversationById:@"551260efe4b01608686c3e0f" callback:^(AVIMConversation *conversation, NSError *error) {
            // Black 修改 conversation 的名称
            AVIMConversationUpdateBuilder *updateBuilder = [conversation newUpdateBuilder];
            updateBuilder.name = @"聪明的喵星人";
            [conversation update:[updateBuilder dictionary] callback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"修改成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block conversation_mute %}
```objc
- (void)TomMuteConversation {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 查询 id 为 551260efe4b01608686c3e0f 的会话
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query getConversationById:@"551260efe4b01608686c3e0f" callback:^(AVIMConversation *conversation, NSError *error) {
            // Tom 将会话设置为静音
            [conversation muteWithCallback:^(BOOL succeeded, NSError *error) {
                if (succeeded) {
                    NSLog(@"修改成功！");
                }
            }];
        }];
    }];
}
```
{% endblock %}

{% block conversation_tag %}
```objc
- (void)TomCreateConversationWithAttribute {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 创建名称为「猫和老鼠」的会话，并附加会话属性
        NSDictionary *attributes = @{ @"tag": @"private" };
        [self.client createConversationWithName:@"猫和老鼠" clientIds:@[@"Jerry"] attributes:attributes options:AVIMConversationOptionNone callback:^(AVIMConversation *conversation, NSError *error) {
            if (succeeded) {
                NSLog(@"创建成功！");
            }
        }];
    }];
}
```
{% endblock %}

{% block conversation_remove %}
```
- 初始化 ClientId = Tom
- Tom 登录
- 删除多个对话：id = [551260efe4b01608686c3e0f, 523431glfld803290dfsaf05]
```
{% endblock %}

{% block conversation_getSingle %}
```objc
- (void)TomQueryConversation {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 查询 id 为 551260efe4b01608686c3e0f 的会话
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query getConversationById:@"551260efe4b01608686c3e0f" callback:^(AVIMConversation *conversation, NSError *error) {
            if (succeeded) {
                NSLog(@"查询成功！");
            }
        }];
    }];
}
```
{% endblock %}

{% block conversation_getList %}
```objc
- (void)TomQueryConversationList {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 构建一个查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        // 执行查询
        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"找到 %ld 个对话！", [objects count]);
        }];
    }];
}
```
{% endblock %}

{% block conversation_query_limit %}
```objc
- (void)TomQueryConversationWithLimit {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 构建一个查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        // Tom 设置查询最近 20 个活跃对话
        query.limit = 20;

        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"查询成功！");
        }];
    }];
}
```
{% endblock %}

{% block table_conservation_query_than %}
逻辑操作 | AVIMConversationQuery 方法|
---|---
等于 | `equalTo`
不等于 |  `notEqualTo` 
大于 | `greaterThan`
大于等于 | `greaterThanOrEqualTo` 
小于 | `lessThanOrEqualTo`
小于等于 | `lessThanOrEqualTo`
{% endblock %}

{% block conversation_query_equalTo %}
```objc
- (void)TomQueryConversationByEqualTo {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 创建属性中 topic 是 movie 的查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query whereKey:@"attr.topic" equalTo:@"movie"];
        // 执行查询
        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"查询成功！");
        }];
    }];
}
```
{% endblock %}

{% block conversation_query_notEqualTo %}
```objc
- (void)TomQueryConversationByNotEqualTo {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 创建 type 不等于 private 的查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query whereKey:@"type" notEqualTo:@"private"];
        // 执行查询
        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"找到 %ld 个对话！", [objects count]);
        }];
    }];
}
```
{% endblock %}

{% block conversation_query_greaterThan %}
```objc
- (void)TomQueryConversationByGreaterThan {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 创建 attr.age 大于 18 的查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query whereKey:AVIMAttr(@"age") greaterThan:@(18)];
        // 执行查询
        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"找到 %ld 个对话！", [objects count]);
        }];
    }];
}
```
{% endblock %}

{% block conversation_query_regexIntro %}
匹配查询是指在 `AVIMConversationQuery` 的查询条件中使用正则表达式来匹配数据。
{% endblock %}

{% block conversation_query_regex %}
```objc
- (void)TomQueryConversationByRegExp {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 创建 attr.tag 是中文的查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query whereKey:AVIMAttr(@"tag") matchesRegex:@"[\u4e00-\u9fa5]"];
        // 执行查询
        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"找到 %ld 个对话！", [objects count]);
        }];
    }];
}
```
{% endblock %}

{% block conversation_query_contains %}
```objc
- (void)TomQueryConversationByContains {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 创建 attr.keywords 包含 「教育」的查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query whereKey:AVIMAttr(@"keywords") containsString:@"教育"];
        // 执行查询
        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"找到 %ld 个对话！", [objects count]);
        }];
    }];
}
```
{% endblock %}

{% block conversation_query_findJoinedMemebers %}
```objc
- (void)TomQueryConversationByMembers {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 创建会话中有 Bob 和 Jerry 的查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query whereKey:@"m" containedIn:@[@"Bob", @"Jerry"]];
        // 执行查询
        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"找到 %ld 个对话！", [objects count]);
        }];
    }];
}
```
{% endblock %}

{% block conversation_query_combination %}
```objc
- (void)TomQueryConversationByCombination {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 创建 attr.keywords 包含「教育」、attr.age < 18 的查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query whereKey:AVIMAttr(@"keywords") containsString:@"教育"];
        [query whereKey:AVIMAttr(@"age") greaterThan:@(18)];
        // 执行查询
        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"找到 %ld 个对话！", [objects count]);
        }];
    }];
}
```
{% endblock %}

{% block conversation_query_count %}
```objc
- (void)TomQueryConversationByCombination {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 创建 attr.keywords 包含「教育」、attr.age < 18 的查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query whereKey:AVIMAttr(@"keywords") containsString:@"教育"];
        [query whereKey:AVIMAttr(@"age") greaterThan:@(18)];
        // 执行查询
        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"找到 %ld 个对话！", [objects count]);
        }];
    }];
}
```
{% endblock %}

{% block chatroom_intro %}
创建一个聊天室跟创建一个普通对话差不多，只是在 `[imClient createConversationWithName:clientIds:attributes:options:callback:]` 中给 `options:` 传入特定的选项值 `AVIMConversationOptionTransient`。
{% endblock %}

{% block chatroom_new %}
```objc
- (void)TomCreateTransientConversation {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 创建名称为 「HelloKitty PK 加菲猫」的会话
        [self.client createConversationWithName:@"HelloKitty PK 加菲猫" clientIds:@[] attributes:nil options:AVIMConversationOptionTransient callback:^(AVIMConversation *conversation, NSError *error) {
            if (succeeded) {
                NSLog(@"创建成功！");
            }
        }];
    }];
}
```
{% endblock %}

{% block chatroom_count_method %} `[AVIMConversation countMembersWithCallback:]` {% endblock %}

{% block chatroom_count %}
```objc
- (void)TomCountFirstConversationMembers {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 创建一个查询会话列表的查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            // Tom 查看会话列表中成员的数量
            NSLog(@"%ld", [[objects firstObject] count]);
        }];
    }];
}
```
{% endblock %}

{% block chatroom_query_method %} `[AVIMConversationQuery whereKey:]` {% endblock %}


{% block chatroom_query_method2 %} `whereKey:` {% endblock %}

{% block chatroom_query_single %}
```objc
- (void)TomQueryConversationByConditions {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 创建属性中 topic 是 movie 的查询
        AVIMConversationQuery *query = [self.client conversationQuery];
        [query whereKey:@"attr.topic" equalTo:@"movie"];
        [query whereKey:@"tr" equalTo:@(YES)];
        [query findConversationsWithCallback:^(NSArray *objects, NSError *error) {
            NSLog(@"查询成功！");
        }];
    }];
}
```
{% endblock %}

{% block conversation_query_history %}
```objc
- (void)TomQueryMessages {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 创建查询会话的 query
        AVIMConversationQuery *query = [self.client conversationQuery];
        // Tom 获取 id 为 2f08e882f2a11ef07902eeb510d4223b 的会话
        [query getConversationById:@"2f08e882f2a11ef07902eeb510d4223b" callback:^(AVIMConversation *conversation, NSError *error) {
            // 设置查询时间从过去 24 小时开始
            NSTimeInterval timestamp = ([[NSDate date] timeIntervalSince1970] - 24 * 60 * 60) * 1000;
            [conversation queryMessagesBeforeId:nil timestamp:timestamp limit:20 callback:^(NSArray *objects, NSError *error) {
                NSLog(@"查询到 %ld 条消息！", [objects count]);
            }];
        }];
    }];
}
```
{% endblock %}

{% block conversation_messageHistoryByLimit %}
```objc
- (void)TomQueryMessagesWithLimit {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 创建查询会话的 query
        AVIMConversationQuery *query = [self.client conversationQuery];
        // Tom 获取 id 为 2f08e882f2a11ef07902eeb510d4223b 的会话
        [query getConversationById:@"2f08e882f2a11ef07902eeb510d4223b" callback:^(AVIMConversation *conversation, NSError *error) {
            // 设置查询时间从过去 24 小时开始
            [conversation queryMessagesWithLimit:10 callback:^(NSArray *objects, NSError *error) {
                NSLog(@"查询成功！");
            }];
        }];
    }];
}
```
{% endblock %}

{% block conversation_messageHistoryBeforeId %}
```objc
- (void)TomQueryMessagesBeforeMessage {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 创建查询会话的 query
        AVIMConversationQuery *query = [self.client conversationQuery];
        // Tom 获取 id 为 2f08e882f2a11ef07902eeb510d4223b 的会话
        [query getConversationById:@"2f08e882f2a11ef07902eeb510d4223b" callback:^(AVIMConversation *conversation, NSError *error) {
            // 设置查询时间从过去 24 小时开始
            [conversation queryMessagesBeforeId:@"grqEG2OqSL+i8FSX9j3l2g" timestamp:1436137606358 limit:10 callback:^(NSArray *objects, NSError *error) {
                NSLog(@"查询成功！");
            }];
        }];
    }];
}
```
{% endblock %}

{% block conversation_messageHistory_pager %}
```objc
- (void)TomQueryMessagesWithLimit {
    // Tom 创建了一个 client
    self.client = [[AVIMClient alloc] init];

    // Tom 用自己的名字作为 ClientId 打开 client
    [self.client openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error) {
        // Tom 创建查询会话的 query
        AVIMConversationQuery *query = [self.client conversationQuery];
        // Tom 获取 id 为 2f08e882f2a11ef07902eeb510d4223b 的会话
        [query getConversationById:@"2f08e882f2a11ef07902eeb510d4223b" callback:^(AVIMConversation *conversation, NSError *error) {
            // 设置查询时间从过去 24 小时开始
            [conversation queryMessagesWithLimit:10 callback:^(NSArray *objects, NSError *error) {
                [self TomLoadMoreMessage:objects forConversation:conversation];
            }];
        }];
    }];
}

- (void)TomLoadMoreMessage:(NSArray *)messages forConversation:(AVIMConversation *)conversation {
    AVIMMessage *oldestMessage = [messages firstObject];
    [conversation queryMessagesBeforeId:oldestMessage.messageId timestamp:oldestMessage.sendTimestamp limit:10 callback:^(NSArray *objects, NSError *error) {
        NSLog(@"查询成功！");
    }];
}
```
{% endblock %}

{% block networkStatus %}
与网络相关的通知（网络断开、恢复等）要采用 `AVIMClientDelegate` 代理方式来实现，主要接口如下：

* `imClientPaused:(AVIMClient *)imClient` 指网络连接断开事件发生，此时聊天服务不可用。
* `imClientResuming:(AVIMClient *)imClient` 指网络断开后开始重连，此时聊天服务依然不可用。
* `imClientResumed:(AVIMClient *)imClient` 指网络连接恢复正常，此时聊天服务变得可用。

在网络中断的情况下，所有的消息收发和对话操作都会出现问题。
{% endblock %}

{% block logout %}
在 app 退出的时候，或者切换用户的时候，我们需要断开与 LeanCloud 实时通信服务的长连接，这时候需要调用 `[AVIMClient closeWithCallback:]` 函数。一般情况下，这个函数都会关闭连接并立刻返回，这时实时通信服务端就会认为当前用户已经下线。
{% endblock %}

{% block communicate_with_otherSDK %}{% endblock %}

{% block conversation_security %}
客户端这边究竟该如何使用呢？我们只需要实现 AVIMSignatureDataSource 协议接口，然后在用户登录之前，把这个接口赋值给 `AVIMClient.signatureDataSource` 即可。示例代码如下：

```objc
AVIMClient *imClient = [[AVIMClient alloc] init];
imClient.delegate = self;
imClient.signatureDataSource = signatureDelegate;
[imClient openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error){
    if (error) {
        // 出错了，可能是网络问题无法连接 LeanCloud 云端，请检查网络之后重试。
        // 此时聊天服务不可用。
        UIAlertView *view = [[UIAlertView alloc] initWithTitle:@"聊天不可用！" message:[error description] delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil];
        [view show];
    } else {
        // 成功登录，可以开始进行聊天了。
    }
}];
```

设定了 signatureDataSource 之后，对于需要鉴权的操作，实时通信 SDK 与服务器端通讯的时候都会带上应用自己生成的 Signature 信息，LeanCloud 云端会使用 app 的 masterKey 来验证信息的有效性，保证聊天渠道的安全。

对于 AVIMSignatureDataSource 接口，我们只需要实现这一个函数即可：

```objc
/*!
 对一个操作进行签名. 注意:本调用会在后台线程被执行
 @param clientId - 操作发起人的 id
 @param conversationId － 操作所属对话的 id
 @param action － 操作的种类，主要有：
                "join": 表示操作发起人要加入对话
                "invite": 表示邀请其他人加入对话
                "kick": 表示从对话中踢出部分人
 @param clientIds － 操作目标的 id 列表
 @return 一个 AVIMSignature 签名对象.
 */
- (AVIMSignature *)signatureWithClientId:(NSString *)clientId
                          conversationId:(NSString *)conversationId
                                  action:(NSString *)action
                       actionOnClientIds:(NSArray *)clientIds;
```

你需要做的就是按照前文所述的签名算法实现签名，其中 `AVIMSignature` 声明如下：

```objc
@interface AVIMSignature : NSObject

@property (nonatomic, strong) NSString *signature;
@property (nonatomic) int64_t timestamp;
@property (nonatomic, strong) NSString *nonce;
@property (nonatomic, strong) NSError *error;

@end
```

其中四个属性分别是：

* signature 签名
* timestamp 时间戳，单位秒
* nonce 随机字符串 nonce
* error 签名错误信息

在启用签名功能的情况下，实时通信 SDK 在进行一些重要操作前，都会首先请求 `AVIMSignatureDataSource` 接口，获取签名信息 `AVIMSignature`，然后把操作信息和第三方签名一起发给 LeanCloud 云端，由云端根据签名的结果来对操作进行处理。 

用户登录是通过调用 `[AVIMClient openWithClientId:callback:]` 方法实现的，该方法声明如下：

```objc
// 开启某个账户的聊天
- (void)openWithClientId:(NSString *)clientId
                callback:(AVIMBooleanResultBlock)callback;
```

各参数含义如下：

* clientId - 操作发起人的 id，以后使用该账户的所有聊天行为，都由此人发起。
* callback - 聊天开启之后的回调，在操作结束之后调用，通知开发者成功与否

我们现在来实际看一下这个过程如何实现。假定聊天发起方名叫 Tom，为直观起见，我们使用用户名来作为 `clientId` 登录聊天系统（LeanCloud 云端只要求 `clientId` 在应用内唯一即可，具体用什么数据由应用层决定）。示例代码如下：

```objc
AVIMClient *imClient = [[AVIMClient alloc] init];
imClient.delegate = self;
[imClient openWithClientId:@"Tom" callback:^(BOOL succeeded, NSError *error){
    if (error) {
        // 出错了，可能是网络问题无法连接 LeanCloud 云端，请检查网络之后重试。
        // 此时聊天服务不可用。
        UIAlertView *view = [[UIAlertView alloc] initWithTitle:@"聊天不可用！" message:[error description] delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil];
        [view show];
    } else {
        // 成功登录，可以进入聊天主界面了。
        MainViewController *mainView = [[MainViewController alloc] init];
        [self.navigationController pushViewController:mainView animated:YES];
    }
}];
```
{% endblock %}

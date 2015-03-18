# Android 实时通信服务(v2)

## 简介

在阅读本开发指南之前，请先阅读下[《实时通信开发指南(v2)》](./realtime_v2.html)，了解实时通信的基本概念和模型。

一对一的文本聊天
------

我们先从最简单的环节入手，看看怎么用 LeanCloud IM SDK v2 实现一对一文本聊天。

###初始化

和 LeanCloud 其他服务一样，实时聊天服务的初始化也是在 Application 的 onCreate 方法中进行的：

```
public class MyApplication extends Application{

    public void onCreate(){
        AVOSCloud.initialize(this,"{{appId}}","{{appKey}}");
    }
}
```

并且在AndroidManifest.xml中间声明：

```
<manifest>
   ...

   <application
        android:name=".MyApplication"
        ....>
        ...

        <service android:name="com.avos.avoscloud.PushService" />

        <receiver android:name="com.avos.avoscloud.AVBroadcastReceiver">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.USER_PRESENT" />
            </intent-filter>
        </receiver>
        ...
   </application>

</manifest>
```

接下来我们需要完成用户登录。

###登录

假定聊天发起方名叫 Tom，为直观起见，我们使用用户名来作为 `clientId` 登录聊天系统（LeanCloud 云端只要求 `clientId` 在应用内唯一即可，具体用什么数据由应用层决定），代码如下：

```
AVIMClient imClient = AVIMClient.getInstance("Tom");
imClient.open(new IMClientCallback(){
  @Override
  public void done(AVIMClient client, AVException e) {
    if (e) {
        // 出错了，可能是网络问题无法连接 LeanCloud 云端，请检查网络之后重试。
        // 此时聊天服务不可用。
    } else {
        // 成功登录，可以开始进行聊天了。
    };
  }
});
```

### 建立对话

假定我们要跟「Bob」这个用户进行聊天，我们先创建一个对话，代码如下：

```
// 先查询一下是否已经存在与「Bob」的私聊对话
List<String> clientIds = new ArrayList<String>();
clientIds.add("Tom");
clientIds.add("Bob");

AVIMConversationQuery conversationQuery = imClient.getQuery();
conversationQuery.withMembers(clientIds);
// 之前有常量定义：
// int ConversationType_OneOne = 0; // 两个人之间的单聊
// int ConversationType_Group = 1;  // 多人之间的群聊
conversationQuery.whereEqualTo("attr.type", ConversationType_OneOne);

conversationQuery.findInBackground(new AVIMConversationQueryCallback(){
  @Override
  public void done(List<AVIMConversation> conversations, AVException e) {
    if (null != e) {
      // 出错了。。。
    } else if (null != conversations && conversations.size() > 0){
      // 已经有一个和 Bob 的对话存在，继续在这一对话中聊天
      ...
    } else {
      // 不曾和 Bob 聊过，新建一个对话
      Map<String, Object> attr = new HashMap<String, Object>();
      attr.put("type", ConversationType_OneOne);
      imClient.createConversation(clientIds, attr, new AVIMConversationCreatedCallback() {
        @Override
        public void done(AVIMConversation conversation, AVException e) {
          if (null != conversation) {
            // 成功了！
          }
        }
      });
    }
  }
});
```

###发送消息

建立好对话之后，要发送消息是很简单的：

```
AVIMMessage message = new AVIMMessage();
message.setContent("hello");
conversation.sendMessage(message, new AVIMConversationCallback() {
  @Override
  public void done(AVException e) {
    if (null != e) {
       // 出错了。。。
    } else {
    }
  }
});
```

好了，这样一条消息就发送过去了。但是问题来了，对于「Bob」而言，他怎么才能收到别人发给他的消息呢？

### 消息接收

在 Bob 这一端，要能接收到消息，需要如下几步：

1，进行初始化和登录，代码与发送端并无二致；

2，实现自己的 `AVIMMessageHandler`，响应新消息到达通知，主要是如下函数：

`public abstract void onMessage(AVIMMessage message, AVIMConversation conversation,AVIMClient client);`

对于 Tom 发过来的消息，要显示出来，我们只需实现 `onMessage` 即可，示例代码如下：

```
AVIMMessageManager.registerDefaultMessageHandler(new AVIMMessageHandler() {
  @Override
  public void onMessage(AVIMMessage message, AVIMConversation conversation,AVIMClient client) {
    // 新消息到来了。在这里增加你自己的处理代码。
  }

  @Override
  public void onMessageReceipt(AVIMMessage message, AVIMConversation conversation,AVIMClient client) {
    // 消息已经被接收。这个函数什么时候被调用，后面会有说明。
  }
});
```

几个主要的回调接口
------
从上面的例子中可以看到，要接收到别人给你发送的消息，需要实现 AVIMMessageHandler 接口。从 v2 版开始，LeanCloud IM SDK 大量采用回调来反馈操作结果，但是对于一些被动的消息通知，则还是采用接口来实现的，包括：

* 当前网络出现变化
* 对话中有新的消息
* 对话中有新成员加入
* 对话中有成员离开
* 被邀请加入某对话
* 被踢出对话

LeanCloud IM SDK 内部使用了三种接口来响应这些事件。

### AVIMClientEventHandler
主要用来处理网络变化事件，主要函数为：

```
  /**
   * 实现本方法以处理网络断开事件
   *
   * @param client
   * @since 3.0
   */
  public abstract void onConnectionPaused(AVIMClient client);

  /**
   * 实现本方法以处理网络恢复事件
   *
   * @since 3.0
   * @param client
   */

  public abstract void onConnectionResume(AVIMClient client);
```

在网络中断的情况下，所有的消息收发和对话操作都会出现问题。

通过 `AVIMClient.setClientEventHandler(AVIMClientEventHandler handler)` 可以设定全局的 ClientEventHandler。

### AVIMConversationEventHandler
主要用来处理对话中成员变化的事件，主要函数为：

```
  /**
   * 实现本方法以处理聊天对话中的参与者离开事件
   *
   * @param client
   * @param conversation
   * @param members 离开的参与者
   * @param kickedBy 离开事件的发动者，有可能是离开的参与者本身
   * @since 3.0
   */

  public abstract void onMemberLeft(AVIMClient client,
      AVIMConversation conversation, List<String> members, String kickedBy);

  /**
   * 实现本方法以处理聊天对话中的参与者加入事件
   *
   * @param client
   * @param conversation
   * @param members 加入的参与者
   * @param invitedBy 加入事件的邀请人，有可能是加入的参与者本身
   * @since 3.0
   */

  public abstract void onMemberJoined(AVIMClient client,
      AVIMConversation conversation, List<String> members, String invitedBy);

  /**
   * 实现本方法来处理当前用户被踢出某个聊天对话事件
   *
   * @param client
   * @param conversation
   * @param kickedBy 踢出你的人
   * @since 3.0
   */

  public abstract void onKicked(AVIMClient client, AVIMConversation conversation,
      String kickedBy);

  /**
   * 实现本方法来处理当前用户被邀请到某个聊天对话事件
   *
   * @param client
   * @param conversation 被邀请的聊天对话
   * @param operator 邀请你的人
   * @since 3.0
   */
  public abstract void onInvited(AVIMClient client, AVIMConversation conversation,
      String operator);
```

通过 `AVIMMessageManager.setConversationEventHandler(AVIMConversationEventHandler handler)` 可以设置全局的 ConversationEventHandler。

### AVIMMessageHandler
主要用来处理新消息到达事件，主要的函数为：

```
  // 收到新的消息
  @Override
  public abstract void onMessage(AVIMMessage message, AVIMConversation conversation,AVIMClient client);

  // 自己发送的消息已经被对方接收
  @Override
  public abstract void onMessageReceipt(AVIMMessage message, AVIMConversation conversation,AVIMClient client);
```

通过 `AVIMMessageManager.registerDefaultMessageHandler(AVIMMessageHandler handler)` 可以设置全局的 MessageHandler。

我们实现这三类接口，就可以处理所有的通知消息了。


支持富媒体的聊天消息
-------------

上面的代码演示了如何发送简单文本信息，但是现在的交互方式已经越来越多样化，图片、语音、视频已是非常普遍的消息类型。v2 版的 LeanCloud IM SDK 已经可以很好地支持这些富媒体消息，具体说明如下：


### AVIMTypedMessage

所有富媒体消息的基类，其声明为

```
//SDK定义的消息类型，LeanCloud SDK 自身使用的类型是负数，所有正数留给开发者自定义扩展类型使用，0 作为「没有类型」被保留起来。
enum AVIMReservedMessageType {
  UnsupportedMessageType(0),
  TextMessageType(-1),
  ImageMessageType(-2),
  AudioMessageType(-3),
  VideoMessageType(-4),
  LocationMessageType(-5),
  FileMessageType(-6);
};

public abstract class AVIMTypedMessage extends AVIMMessage {
  public AVIMTypedMessage();

  public int getMessageType();

  @Override
  public final String getContent();

  @Override
  public final void setContent(String content);
}
```

### AVIMTextMessage

AVIMTypedMessage 子类，表示一般的文本消息，其声明为

```
@AVIMMessageType(type = -1)
public class AVIMTextMessage extends AVIMTypedMessage {
  public String getText();

  public void setText(String text);

  public Map<String, Object> getAttrs();

  public void setAttrs(Map<String, Object> attr);
}
```

要发送文本消息，示例代码为：

```
AVIMTextMessage message = new AVIMTextMessage();
message.setText("hello");
conversation.sendMessage(message, new AVIMConversationCallback() {
  @Override
  public void done(AVException e) {
    if (null != e) {
       // 出错了。。。
    } else {
    }
  }
});
```

### AVIMImageMessage
AVIMTypedMessage 子类，支持发送图片和附带文本的混合消息，其声明为：

```
public class AVIMImageMessage extends AVIMFileMessage {
  public AVIMImageMessage();
  public AVIMImageMessage(String localPath) throws FileNotFoundException, IOException;
  public AVIMImageMessage(File localFile) throws FileNotFoundException, IOException;
  public AVIMImageMessage(AVFile file);

  /**
   * 获取文件的metaData
   *
   * @return
   */
  @Override
  public Map<String, Object> getFileMetaData();

  /**
   * 获取图片的高
   * 
   * @return
   */
  public int getHeight();

  /**
   * 获取图片的宽度
   * 
   * @return
   */
  public int getWidth();
}
```

发送图片消息的示例代码为：

```
String localImagePath;
try {
  AVIMImageMessage message = new AVIMImageMessage(localImagePath);
  conversation.sendMessage(message, new AVIMConversationCallback() {
    @Override
    public void done(AVException e) {
      if (null != e) {
        // 出错了。。。
      } else {
      }
    }
  });
} catch (Exception ex) {
}
```

接收到这样消息之后，开发者可以获取到若干图片元数据（width，height，图片 size，图片 format）和一个包含图片数据的 AVFile 相关信息（url，metaData）。

### AVIMAudioMessage
AVIMTypedMessage 子类，支持发送语音和附带文本的混合消息，其声明为：

```
public class AVIMAudioMessage extends AVIMFileMessage {
    public AVIMAudioMessage();
    public AVIMAudioMessage(String localPath) throws FileNotFoundException, IOException;
    public AVIMAudioMessage(File localFile) throws FileNotFoundException, IOException;   
    public AVIMAudioMessage(AVFile file);
    /**
     * 获取文件的metaData
     *
     * @return
     */
    @Override
    public Map<String, Object> getFileMetaData();

    /**
     * 获取音频的时长
     *
     * @return
     */
    public double getDuration();
}
```

发送音频消息的示例代码为：

```
String localAudioPath;
try {
  AVIMAudioMessage message = new AVIMAudioMessage(localAudioPath);
  conversation.sendMessage(message, new AVIMConversationCallback() {
    @Override
    public void done(AVException e) {
      if (null != e) {
        // 出错了。。。
      } else {
      }
    }
  });
} catch (Exception ex) {
}
```

接收到这样消息之后，开发者可以获取到若干音频元数据（时长 duration、音频 size，音频 format）和一个包含图片数据的 AVFile 相关信息（url，metaData）。

### AVIMVideoMessage
AVIMTypedMessage 子类，支持发送视频和附带文本的混合消息，其声明为：

```
public class AVIMVideoMessage extends AVIMFileMessage {
  public AVIMVideoMessage();

  public AVIMVideoMessage(String localPath) throws FileNotFoundException, IOException;
  public AVIMVideoMessage(File localFile) throws FileNotFoundException, IOException;
  public AVIMVideoMessage(AVFile file);

  /**
   * 获取文件的metaData
   *
   * @return
   */
  @Override
  public Map<String, Object> getFileMetaData();
  
  /**
   * 获取时长
   *
   * @return
   */
  public double getDuration();
}
```

发送视频消息的示例代码为：

```
String localVideoPath;
try {
  AVIMVideoMessage message = new AVIMVideoMessage(localVideoPath);
  conversation.sendMessage(message, new AVIMConversationCallback() {
    @Override
    public void done(AVException e) {
      if (null != e) {
        // 出错了。。。
      } else {
      }
    }
  });
} catch (Exception ex) {
}
```

接收到这样消息之后，开发者可以获取到若干视频元数据（时长 duration、视频 size，视频 format）和一个包含图片数据的 AVFile 相关信息（url，metaData）。

### AVIMLocationMessage
AVIMTypedMessage 子类，支持发送地理位置信息和附带文本的混合消息，其声明为：

```
public class AVIMLocationMessage extends AVIMTypedMessage {
  public String getText();
  public void setText(String text);

  public Map<String, Object> getAttrs();
  public void setAttrs(Map<String, Object> attr);
  
  public AVGeoPoint getLocation();
  public void setLocation(AVGeoPoint location);
}
```

要发送位置消息的示例代码为：
```
AVIMLocationMessage message = new AVIMLocationMessage();
message.setText("快点过来！");
message.setLocation(new AVGeoPoint(15.9, 56.4));
conversation.sendMessage(message, new AVIMConversationCallback() {
  @Override
  public void done(AVException e) {
    if (null != e) {
       // 出错了。。。
    } else {
    }
  }
});
```

接收到这样的消息之后，开发者可以获取到具体的地理位置数据。

### 如何接收富媒体消息

新版 LeanCloud IM SDK 内部封装了对富媒体消息的支持，所有富媒体消息都是从 AVIMTypedMessage 派生出来的。发送的时候可以直接调用 `conversation.sendMessage` 函数。在接收端，我们也专门增加了一类回调接口：

```
public abstract class AVIMTypedMessageHandler<T extends AVIMTypedMessage> extends MessageHandler<T> {

  @Override
  public abstract void onMessage(T message, AVIMConversation conversation,AVIMClient client);

  @Override
  public abstract void onMessageReceipt(T message, AVIMConversation conversation,AVIMClient client);
}
```

开发者可以编写自己的消息处理 handler，然后调用 `AVIMMessageManager.registerMessageHandler(Class<? extends AVIMMessage> clazz,
      MessageHandler<?> handler)` 函数来注册目标 handler。
      
LeanCloud IM SDK 内部消息分发的逻辑是这样的：对于收到的任一新消息，SDK 内部都会先解析消息的类型，然后找到开发者为这一类型注册的处理 handler，然后逐一调用这些 handler 的 onMessage 函数。如果没有找到专门处理这一类型消息的 handler，就会转交给 defaultHandler 处理。

这样一来，在开发者为 TypedMessage（及其子类） 指定了专门的 handler，也指定了全局的 defaultHandler 了的时候，如果发送端发送的是通用的 AVIMMessage 消息，那么接受端就是 **AVIMMessageManager.registerDefaultMessageHandler()中指定的 handler** 被调用；如果发送的是 AVIMTypedMessage（及其子类）的消息，那么接受端就是 **AVIMMessageManager.registerMessageHandler()中指定的 handler** 被调用。

接收端对于富媒体消息的通知处理代码片段如下：

```
class MsgHandler extends MessageHandler<AVIMTypedMessage> {

    @Override
    public void onMessage(AVIMTypedMessage message, AVIMConversation conversation,AVIMClient client) {
      getInstance().onMessage(conversation, message);
    }

    @Override
    public void onMessageReceipt(AVIMTypedMessage message, AVIMConversation conversation,AVIMClient client) {
      getInstance().onMessageDelivered(message);
    }
}
MsgHandler msgHandler = new MsgHandler();
AVIMMessageManager.registerMessageHandler(AVIMTextMessage.class, msgHandler);
AVIMMessageManager.registerMessageHandler(AVIMAudioMessage.class, msgHandler);
AVIMMessageManager.registerMessageHandler(AVIMImageMessage.class, msgHandler);
AVIMMessageManager.registerMessageHandler(AVIMLocationMessage.class, msgHandler);
```

### 如何扩展自己的富媒体消息

继承于 AVIMTypedMessage，开发者也可以扩展自己的富媒体消息。其要求和步骤是：

* 实现新的消息类型，继承自 AVIMTypedMessage。可以参考我们已有类的实现：

```
// 从 AVIMTypedMessage 继承，实现自己的消息类的时候要注意两点
// 1, 在class上增加一个@AVIMMessageType(type=123)
// 2, 在消息内部属性上要增加@AVIMMessageField(name="")name为可选字段在声明字段属性，同时自定义的字段要有对应的getter/setter方法
//
@AVIMMessageType(type = -1)
public class AVIMTextMessage extends AVIMTypedMessage {

  @AVIMMessageField(name = "_lctext")
  String text;
  @AVIMMessageField(name = "_lcattrs")
  Map<String, Object> attrs;

  public String getText() {
    return this.text;
  }

  public void setText(String text) {
    this.text = text;
  }

  public Map<String, Object> getAttrs() {
    return this.attrs;
  }

  public void setAttrs(Map<String, Object> attr) {
    this.attrs = attr;
  }
}
```

* 调用 `AVIMMessageManager.registerAVIMMessageType(Class<? extends AVIMTypedMessage> messageType)` 函数进行注册
* 调用 `AVIMMessageManager.registerMessageHandler(Class<? extends AVIMMessage> clazz,
      MessageHandler<?> handler)` 注册消息处理 handler


群组聊天
-------------

与前面的单聊类似，群组聊天也需要先建立一个对话（AVIMConversation），然后发送、接收新的消息。

### 创建群组 ###

和单聊类似，建立一个多人聊天的群组也是很简单的。例如：

```
Map<String, Object> attr = new HashMap<String, Object>();
attr.put("type", ConversationType_Group);
imClient.createConversation(clientIds, attr, new AVIMConversationCreatedCallback() {
  @Override
  public void done(AVIMConversation conversation, AVException e) {
    if (null != conversation) {
       // 成功了！
    }
  }
});
```

成功之后，我们就可以进入聊天界面了。

### 往群组发送消息 ###

发送消息非常简单，与前面单聊的场景一样。

我们会注意到，AVIMConversation 还有一个发送消息的方法：

```
public void sendMessage(final AVIMMessage message, final int messageFlag,
      final AVIMConversationCallback callback)
```

而这里 flag 的定义有如下三种类型：

* 暂态消息（AVIMConversation.TRANSIENT_MESSAGE_FLAG）。这种消息不会被自动保存（以后在历史消息中无法找到它），也不支持延迟接收，离线用户更不会收到推送通知，所以适合用来做控制协议。譬如聊天过程中「某某正在输入中...」这样的状态信息，就适合通过暂态消息来发送。
* 普通消息（AVIMConversation.NONTRANSIENT_MESSAGE_FLAG）。这种消息就是我们最常用的消息类型，在 LeanCloud 云端会自动保存起来，支持延迟接收和离线推送，以后在历史消息中可以找到它。
* 待回执消息（AVIMConversation.RECEIPT_MESSAGE_FLAG）。这也是一种普通消息，只是消息被对方收到之后 LeanCloud 服务端会发送一个回执通知给发送方（这就是 AVIMMessageHandler 中 `public void onMessageReceipt(AVIMMessage message, AVIMConversation conversation,AVIMClient client)` 函数被调用的时机）。

### 接收群组消息 ###

接收一个群组的消息，与接收单聊的消息也是一样的。

### 成员管理 ###

在查询到聊天室成员之后，可以让用户邀请一些自己的朋友加入，作为管理员也可以剔除一些「可怕」的成员。
加入新成员的 API 如下：

    List<String> userIds = new ArrayList<String>();
    userIds.add("A");
    userIds.add("B");
    userIds.add("C");
    conversation.addMembers(userIds, new AVIMConversationCallback() {
      @Override
      public void done(AVException error) {
        if (null != error) {
          // 加入失败，报错.
        } else {
          // 发出邀请，此后新成员就可以看到这个对话中的所有消息了。
        }
      }
    });

邀请成功以后，通知的流程是这样的：
     
        操作者（管理员）                    被邀请者                        其他人
    1, 发出请求 addMembers
    2, 收到 onInvited 通知            收到 onInvited 通知
    3, 收到 onMemberJoined 通知      收到 onMemberJoined 通知      收到 onMemberJoined 通知
   
相应地，踢人时的调用 API 是：

    List<String> userIds = new ArrayList<String>();
    userIds.add("A");
    conversation.kickMembers(userIds, new AVIMConversationCallback() {
      @Override
      public void done(AVException error) {
        if (null != error) {
          // 失败，报错.
        } else {
          // 成功。
        }
      }
    });

踢人的通知流程如下：

        操作者（管理员）                被踢者                       其他人
    1, 发出请求 kickMembers
    2,                        收到 onKicked 通知
    3, 收到 onMemberLeft 通知                             收到 onMemberLeft 通知

> 注意！
> 如果邀请、踢人操作发生的时候，被邀请者/被踢者当前不在线，那么通知消息并不会被离线缓存，所以他们再上线的时候将不会收到通知。

### 获取历史消息 ###

LeanMessage 会将非暂态消息自动保存在云端，之后开发者可以通过 AVIMConversation 来获取该对话的所有历史消息。获取历史消息的 API 如下：

    String oldestMsgId;
    long oldestMsgTimestamp;
    conversation.queryMessages(oldestMsgId,oldestMsgTimestamp, limit, new AVIMHistoryMessageCallback(){
      @Override
      public void done(List<AVIMMessage> messages, AVException e) {
        if (null != e) {
          // 出错了:(
        } else {
          // 成功
        }
      }
    });

> 注意：
> 获取历史消息的时候，LeanCloud 云端是从某条消息开始，往前查找开发者指定的 N 条消息，返回给客户端。为此，获取历史消息需要传入三个参数：起始消息的 msgId，起始消息的发送时间戳，需要获取的消息条数。

通过这一 API 拿到的消息就是 AVIMMessage 或者 AVIMTypedMessage 实例数组，开发者可以像之前收到新消息通知一样处理。

### 启用离线消息推送（仅对 iOS 平台用户有效）

不管是单聊还是群聊，当用户 A 发出消息后，如果目标对话中有部分用户当前不在线，LeanCloud 云端可以提供离线推送的方式来提醒用户。这一功能默认是关闭的，你可以在 LeanCloud 应用控制台中开启它。开启方法如下：

* 登录 LeanCloud 应用控制台，选择正确的应用进入；
* 选择最顶端的「消息」服务，依次点击左侧菜单「实时消息」->「设置」；
* 在右侧「iOS 用户离线时的推送内容」下填好你要推送出去的消息内容，保存；

这样 iOS 平台上的用户就可以收到 Push Notification 了（当然，前提是应用本身申请到了 RemoteNotification 权限，也将正确的推送证书上传到了 LeanCloud 控制台）。

### 群组消息免打扰（仅对 iOS 平台用户有效）

不管是单聊还是群聊，对于发往普通的 Conversation 的普通消息，如果接收方当前不在线，LeanCloud 云端支持通过 Push Notification 的方式进行提醒。一般情况下这都是很好的，但是如果某个群组特别活跃，那离线用户就会收到过多的推送，会形成不小的干扰。
对此 LeanCloud IM 服务也允许单个用户来关闭/打开某个对话的离线推送功能。调用 API 如下：

```
    if (open) {
        [_conversation muteWithCallback:^(BOOL succeeded, NSError *error) {
            ...
        }];
    } else {
        [_conversation unmuteWithCallback:^(BOOL succeeded, NSError *error) {
            ...
        }];
    }
```

### 搜索群组 ###

不管是单聊，还是群聊，在 LeanCloud IM SDK 里面都是对话（Conversation）。我们给对话设置了如下几种属性：

* conversationId，字符串，对话 id，只读，对话创建之后由 LeanCloud 云端赋予一个全局唯一的 id。
* creator，字符串，对话创建者 id，只读，标识对话创建者信息
* members，数组，对话参与者，这里记录了所有的参与者
* name，字符串，对话的名字，optional，可用来对于群组命名
* attributes，Map/Dict，自定义属性，optional，供开发者自己扩展用。

我们提供了专门的类，来搜索特定的群组。例如要搜索当前登录用户参与的所有群聊对话，其代码为

```
AVIMConversationQuery conversationQuery = imClient.getQuery();
conversationQuery.whereContains(“m”, "Tom");
// 之前有常量定义：
// const int ConversationType_OneOne = 0;
// const int ConversationType_Group = 1;
conversationQuery.whereEqualTo("type", ConversationType_Group);
conversationQuery.findInBackground(new AVIMConversationQueryCallback(){
  @Override
  public void done(List<AVIMConversation> conversations, AVException e) {
    if (null != e) {
      // 出错了。。。
    } else {
      // done!
    }
  }
});
```

`AVIMConversationQuery` 中设置条件的方法与 `AVQuery` 类似，具体可以参看其头文件。

签名和安全
-------------
为了满足开发者对权限和认证的要求，LeanCloud 还设计了操作签名的机制。我们可以在 LeanCloud 应用控制台中的「设置」->「应用选项」->「聊天推送」下面勾选「聊天服务签名认证」来启用签名（强烈推荐这样做）。启用后，所有的用户登录、对话创建/加入、邀请成员、踢出成员等操作都需要验证签名，这样开发者就可以对消息进行充分的控制。

客户端这边究竟该如何使用呢？我们只需要实现 SignatureFactory 接口，然后在用户登录之前，把这个接口的实例赋值给 AVIMClient 即可（`AVIMClient.setSignatureFactory(factory)`）。

设定了 signatureFactory 之后，对于需要鉴权的操作，LeanCloud IM SDK 与服务器端通讯的时候都会带上应用自己生成的 Signature 信息，LeanCloud 云端会使用 app 的 masterKey 来验证信息的有效性，保证聊天渠道的安全。

对于 SignatureFactory 接口，我们只需要实现这两个函数即可：

```
  /**
   * 实现一个基础签名方法 其中的签名算法会在SessionManager和AVIMClient(V2)中被使用
   * 
   * @param peerId
   * @param watchIds
   * @return
   * @throws SignatureException 如果签名计算中间发生任何问题请抛出本异常
   */
  public Signature createSignature(String peerId, List<String> watchIds) throws SignatureException;

  /**
   * 实现AVIMConversation相关的签名计算
   * 
   * @param conversationId
   * @param clientId
   * @param targetIds 操作所对应的数据
   * @param action 操作
   * @return
   * @throws SignatureException 如果签名计算中间发生任何问题请抛出本异常
   */
  public Signature createConversationSignature(String conversationId, String clientId,
      List<String> targetIds, String action) throws SignatureException;
```

`createSignature` 函数会在用户登录的时候被调用，`createConversationSignature` 会在对话创建/加入、邀请成员、踢出成员等操作时被调用。

你需要做的就是按照前文所述的签名算法实现签名，其中 `Signature` 声明如下：

```
public class Signature {
  public List<String> getSignedPeerIds();
  public void setSignedPeerIds(List<String> signedPeerIds);

  public String getSignature();
  public void setSignature(String signature);

  public long getTimestamp();
  public void setTimestamp(long timestamp);

  public String getNonce();
  public void setNonce(String nonce);
}
```

其中四个属性分别是:

* signature 签名
* timestamp 时间戳，单位秒
* nonce 随机字符串 nonce
* signedPeerIds 放行的 clientId 列表，v2 中已经**废弃不用**

下面的代码展示了基于 LeanCloud 云代码进行签名时，客户端的实现片段：

```
public class KeepAliveSignatureFactory implements SignatureFactory {
 @Override
 public Signature createSignature(String peerId, List<String> watchIds) {
   Map<String,Object> params = new HashMap<String,Object>();
   params.put("self_id",peerId);
   params.put("watch_ids",watchIds);

   try{
     Object result =  AVCloud.callFunction("sign",params);
     if(result instanceof Map){
       Map<String,Object> serverSignature = (Map<String,Object>) result;
       Signature signature = new Signature();
       signature.setSignature((String)serverSignature.get("signature"));
       signature.setTimestamp((Long)serverSignature.get("timestamp"));
       signature.setNonce((String)serverSignature.get("nonce"));
       return signature;
     }
   }catch(AVException e){
     throw (SignatureFactory.SignatureException) e;
   }
   return null;
 }

  @Override
  public Signature createConversationSignature(String convId, String peerId, List<String> targetPeerIds,String action){
   Map<String,Object> params = new HashMap<String,Object>();
   params.put("self_id",peerId);
   params.put("group_id",convId);
   params.put("group_peer_ids",targetPeerIds);
   params.put("action",action);

   try{
     Object result = AVCloud.callFunction("group_sign",params);
     if(result instanceof Map){
        Map<String,Object> serverSignature = (Map<String,Object>) result;
        Signature signature = new Signature();
        signature.setSignature((String)serverSignature.get("signature"));
        signature.setTimestamp((Long)serverSignature.get("timestamp"));
        signature.setNonce((String)serverSignature.get("nonce"));
        return signature;
     }
   }catch(AVException e){
     throw (SignatureFactory.SignatureException) e;
   }
   return null;
  }
}
```

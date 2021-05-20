# 用户反馈组件开发指南

## 维护状态

**用户反馈组件 API 已弃用。**

由于设计和实现上的一些不足，用户反馈组件在查询方面不够灵活（例如，难以查询某一个用户的所有反馈），权限不够严密，且应用导出数据并不包含用户反馈数据。
因此，我们建议基于数据存储功能自行实现用户反馈功能，例如：

- 使用 `UserFeedback` Class 存储用户反馈主帖。其中，`content` 字段存储反馈内容，`status` 字段存储反馈状态（处理中、关闭等等），`author` （作者）字段则可以设计为指向 `_User` 用户的 Pointer。根据业务需求，可以添加更多字段，比如设备型号、客服评分等。

- 使用 `UserReply` 和 `StaffReply`  Class 分别存储用户和客服的回复。同样，`content` 字段存储反馈内容，`author` （作者）字段可以设计为指向 `_User` 用户的 Pointer，`feedback` 字段可以设计为指向 `UserFeedback` 的 Pointer 以关联反馈和回复。

- 根据业务需要设置合理的权限。例如：[Class 权限](data_security.html#Class_权限)中，`create`、`update`、`find`、`get` 可以设定为仅限登录用户，同时对所有用户关闭 `add_fields` 和 `delete` 权限。`UserFeedback` 和 `UserReply` 默认 ACL 设置为数据创建者可写，客服[角色](acl-guide.html#基于角色的权限管理)可读，`StaffReply` 的 ACL 需要就每条数据分别设置（这也是 `UserReply` 和 `StaffReply` 不并为一个 Class 的原因），数据创建者或客服角色可写，提交反馈的用户（`feedback` 字段指向的 `UserFeedback` 的 `author`）可读。


由于导出应用数据中不含用户反馈数据，为方便开发者迁移数据，以下用户反馈相关的 REST API 接口仍可调用：

{% if node == 'qcloud' %}
{% set feedback_host = "tab.leancloud.cn" %}
{% elif node == 'us' %}
{% set feedback_host = "us.leancloud.cn" %}
{% else %}
{% set feedback_host = "api.leancloud.cn" %}
{% endif %}

提交一条新的用户反馈：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{
         "status"  : "open",
         "content" : "反馈的文字内容",
         "contact" : "联系方式、QQ 或者邮箱手机等"
       }' \
  https://{{feedback_host}}/1.1/feedback
```

获取所有的反馈：

```
curl -X GET \
-H "X-LC-Id:{{appid}}" \
-H "X-LC-Key:{{appkey}}" \
-H "Content-Type: application/json" \
https://{{feedback_host}}/1.1/feedback
```

返回的结果是反馈主帖数组：

```json
{
  "results": [
    {
      "updatedAt": "2019-07-19T08:53:10.972Z",
      "content": "经常闪退",
      "uid": "fd99b400eaa357006ce54238",
      "iid": "5wChmGL9G6qRoeBwt4J89ceGhp9nMOWe",
      "objectId": "5dec3eba8a84ab00581e61f1",
      "createdAt": "2019-07-17T07:41:43.027Z",
      "status": "open",
      "deviceType": "android",
      "contact": "email@example.com"
    },
    // 更多结果……
  ]
}
```

其中，`uid` 是反馈用户（`_User`）的 objectId，`iid` 是反馈设备（`_Installation`） 的 objectId，`status` 表示反馈意见的状态（`open` 为打开，`close` 为关闭），`contact` 是反馈用户的联系方式，可以是邮箱、手机等。

获取一条反馈里面的信息：

```
curl -X GET \
-H "X-LC-Id:{{appid}}" \
-H "X-LC-Key:{{appkey}}" \
-H "Content-Type: application/json" \
https://{{feedback_host}}/1.1/feedback/<:feedback_objectId>/threads
```

将 `<:feedback_objectId>` 替换为 feedback 的 objectId（可以从上述的「获取所有的反馈」这个查询中得到 objectId）。
和其他查询类 API 一样，你可以用 `skip` 和 `limit` 分页。
不过 `limit` 的默认值是 1000，这是针对用户反馈这一使用场景做的调整，确保绝大多数情况下一次请求即可获取整个会话。

返回的结果是一个包含反馈回复的数组：

```json
{
  "results": [
    {
      "type": "user",
      "content": "有一次出现了如下图所示的报错信息",
      "attachment": "https://file.example.com/just-an-example.png",
      "feedback": {
        "__type": "Pointer",
        "className": "UserFeedback",
        "objectId": "deb777b111460d0068b90f16"
      },
      "createdAt": "2019-07-07T09:58:11.057Z",
      "updatedAt": "2019-07-07T09:58:11.057Z",
      "objectId": "deb777b343c25700783cd635"
    },
    {
      "type": "dev",
      "content": "感谢反馈问题，我会转给研发小伙伴，有进展会回复您。",
      "feedback": {
        "__type": "Pointer",
        "className": "UserFeedback",
        "objectId": "deb777b111460d0068b90f16"
      },
      "createdAt": "2019-07-07T09:58:29.921Z",
      "updatedAt": "2019-07-07T09:58:29.921Z",
      "objectId": "deb777c543c25700683cd717"
    }
  ]
}
```

其中，`feedback` 是一个指向反馈主帖（`UserFeedback`）的 Pointer，`type` 的值为 `user` （用户回复）或 `dev` （客服回复）。 

客服为一条已经存在的反馈增加一条回复：

```
curl -X POST \
-H "X-LC-Id:{{appid}}" \
-H "X-LC-Key:{{appkey}}"\
 -H "Content-Type: application/json" \
-d '{"type":"dev","content":"感谢您的反馈！我们正在修复您所述的问题，修复后再通知您。", "attachment":"{{url}}"}' \
https://{{feedback_host}}/1.1/feedback/<:feedback_objectId>/threads
```

用户为一条已经存在的反馈增加一条回复：

```
curl -X POST \
-H "X-LC-Id:{{appid}}" \
-H "X-LC-Key:{{appkey}}"\
 -H "Content-Type: application/json" \
-d '{"type":"user","content":"我刚才又试了下，现在没问题了！耶~", "attachment":"{{url}}"}' \
https://{{feedback_host}}/1.1/feedback/<:feedback_objectId>/threads
```

## 简介

LeanCloud Feedback 是一个非常轻量的模块，可以用最少两行的代码来实现一个支持文字和图片的用户反馈系统，并且能够方便地在 LeanCloud 控制台查看用户的反馈。

**你可以在应用的组件菜单里看到所有的用户反馈并回复。**

## iOS 反馈组件
		
![image](images/avoscloud-ios-feedback.png)

### 开源项目地址

目前反馈组件从 SDK 中独立出来，开放了源码和 Demo 。项目地址是：[leancloud-feedback-ios](https://github.com/leancloud/leancloud-feedback-ios)。从 v3.1.3 开始，SDK 中的 feedback 组件不再维护。欢迎大家使用开源组件，相信在大家的共同维护下，开源组件会变得越来越好。

### 安装
推荐使用 Cocoapods 安装，在项目的 Podfile 中加入以下声明，随后执行 `pod install` 即可，如果太慢了，请参考 [这篇博客](http://www.cnblogs.com/yiqiedejuanlian/p/3698788.html) 加快速度。	
```
	pod 'LeanCloudFeedback'
```

该开源组件和 SDK 中的 feedback 组件接口稍有不同，类名的前缀由`AV`改成了`LC`，其它无变化。

### 基本使用
导入头文件：

```objc
	#import <LeanCloudFeedback/LeanCloudFeedback.h>
```

然后粘贴下列代码到 application:didFinishLaunchingWithOptions: 方法中：

```objc
[AVOSCloud setApplicationId:@"{{appid}}" clientKey:@"{{appkey}}"];
```

开发者可以使用当前的 UIViewController 打开默认的反馈界面，代码如下：

```objc
    LCUserFeedbackAgent *agent = [LCUserFeedbackAgent sharedInstance];
    /* title 传 nil 表示将第一条消息作为反馈的标题。 contact 也可以传入 nil，由用户来填写联系方式。*/
    [agent showConversations:self title:nil contact:@"goodman@leancloud.cn"];
```

### 界面定制

默认的反馈界面的导航栏样式和你应用的样式不一样，这时你希望能统一样式，或者想更改反馈界面的字体等，可以通过下面的接口进行界面定制：

```objc
typedef enum : NSUInteger {
    LCUserFeedbackNavigationBarStyleBlue = 0,
    LCUserFeedbackNavigationBarStyleNone,
} LCUserFeedbackNavigationBarStyle;

@interface LCUserFeedbackViewController : UIViewController

/**
 *  导航栏主题，默认是蓝色主题
 */
@property(nonatomic, assign) LCUserFeedbackNavigationBarStyle navigationBarStyle;

/**
 *  是否隐藏联系方式表头, 默认不隐藏。假如不需要用户提供联系方式则可以隐藏。
 */
@property(nonatomic, assign) BOOL contactHeaderHidden;

/**
 *  设置字体。默认是大小为 16 的系统字体。
 */
@property(nonatomic, strong) UIFont *feedbackCellFont;
```

### 新回复通知
往往用户反馈放在设置页面，于是可以在用户反馈一栏增加红点提醒，代码如下：

```objc
    [[LCUserFeedbackAgent sharedInstance] countUnreadFeedbackThreadsWithBlock:^(NSInteger number, NSError *error) {
        if (error) {
        	// 网络出错了，不设置红点
        } else {
        	// 根据未读数 number，设置红点，提醒用户
        }
    }];
```

### 高级定制指南

如果我们的反馈组件 UI 无法满足你的需求，你可以通过 Feedback SDK 提供的数据模型结合自定义 UI 来满足你的需求。

#### Feedback 数据模型

* **LCUserFeedbackReply**    
  代表了反馈系统中，用户或者开发者的每一次回复。不同的类型可以通过 LCReplyType 属性来指定，`LCReplyTypeUser` 表示客户端用户的回复，`LCReplyTypeDev` 表示开发人员在控制台的回复。

```objc
LCUserFeedbackReply *feedbackReply = [LCUserFeedbackReply feedbackReplyWithContent:@"一条新的回复" type:LCReplyTypeUser];
```

* **LCUserFeedbackThread**  
  代表了用户与开发者的整个交流过程。LCUserFeedbackThread 在控制台 > 组件 >用户反馈中显示为一条反馈数据。也可以将新建 LCUserFeedbackThread 想象为新建一个会话窗口。

#### 第一次提交反馈

第一次提交反馈的时候需要新建一个会话，即创建一个 LCUserFeedbackThread：

```objc
[LCUserFeedbackThread feedbackWithContent:@"我是控制台显示的内容标题" contact:@"test@leancloud.cn" withBlock:^(id  _Nullable object, NSError * _Nullable error) {
    if (object) {
        NSLog(@"成功");
    }

}];

```

#### 发送一条文字反馈

LCUserFeedbackThread 创建完成以后，可以向 LCUserFeedbackThread 发送消息。发送一条文字反馈代码如下：

```objc
[LCUserFeedbackThread fetchFeedbackWithBlock:^(LCUserFeedbackThread *feedback, NSError *error) {
    LCUserFeedbackReply *feedbackReply = [LCUserFeedbackReply feedbackReplyWithContent:@"新建一条消息2" type:LCReplyTypeUser];
    [feedback saveFeedbackReplyInBackground:feedbackReply withBlock:^(id object, NSError *error) {
        if (object) {
           NSLog(@"成功");
        }
    }];
}];
```

#### 发送一条图片反馈
发送图片消息，只需传入图片的 URL 地址即可。如果需要从移动端本地相册获取图片，可以先把图片存储到 LeanCloud 云端（使用 AVFile），然后传入 AVFile 的 url 即可。

```objc
[LCUserFeedbackThread fetchFeedbackWithBlock:^(LCUserFeedbackThread *feedback, NSError *error) {
    LCUserFeedbackReply *feedbackReply = [LCUserFeedbackReply feedbackReplyWithAttachment:@"https://www.baidu.com/img/bd_logo1.png" type:LCReplyTypeUser];
    [feedback saveFeedbackReplyInBackground:feedbackReply withBlock:^(id object, NSError *error) {
        if (object) {
            NSLog(@"成功");
        }
    }];
}];
```


更加自由的界面定制和业务逻辑修改，可能需要你阅读代码了，请前往 [feedback](https://github.com/leancloud/leancloud-feedback-ios) 项目。

## Android 反馈组件

### 安装 SDK

推荐使用包依赖管理工具 Gradle 安装。打开 app 目录下的 build.gradle 进行如下配置：

```java
// LeanCloud 用户反馈包
compile ('cn.leancloud.android:avoscloud-feedback:4.7.10@aar')
```
其他模块的 SDK 安装细节可以在 [Android SDK 安装指南](sdk_setup-android.html) 中查看。
### 添加代码，使用基础功能

#### 配置 AndroidManifest.xml

打开 AndroidManifest.xml文件，在里面添加需要用到的 activity 和需要的权限:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
    <application...>
       <activity
         android:name="com.avos.avoscloud.feedback.ThreadActivity" >
       </activity>
    </application>
```

**由于一些 UI 的原因，Feedback SDK 的最低 API level 要求是 12，如你需要更低的版本支持，请参照文档中的高级定制部分进行开发。**

**如果依然遇到 Actionbar 相关的 NPE 问题，请检查 Application Theme，确保 ThreadActivity 中的 Actionbar。**

>注：在 2.5.7 以后，用户反馈中添加了图片上传功能，所以在 Permission 中需要添加 WRITE_EXTERNAL_STORAGE 权限，如果你在使用过程中遇到文件类似情况，请先检查权限设置是否有相应的更新。


#### 添加代码实现基础的反馈功能

1.在代码中启用用户反馈模块

```java
FeedbackAgent agent = new FeedbackAgent(context);
agent.startDefaultThreadActivity();
```
![image](images/avoscloud-feedback.png)


2.新回复通知

如果你需要在用户打开 App 时，通知用户新的反馈回复，只需要在你的入口 Activity 的 `OnCreate` 方法中添加:

```java
agent.sync();
```

>注意：此功能使用了 Android Support Library, 所以请添加最新版本 android-support-v4.jar 到工程的libs目录下。

当用户收到开发者的新回复时，就会产生一个新的消息通知。如果你需要改变通知的图标，请替换 res 下的 **avoscloud_feedback_notification.png** 文件即可。

如果你不需要通知栏通知，又迫切需要在用户在打开 App 时同步反馈信息，你可以调用

```java
agent.getDefaultThread().sync(SyncCallback);
```

这里的 SyncCallback 是一个异步回调，其中的方法会在同步请求成功以后被调用。

#### Android 7.0 以上版本的兼容

因为反馈模块中有图片展示的功能，此功能依赖于系统的图片查看页面，而 7.0 及以上的系统做了修改，如果想在应用间共享数据，需要支持 FileProvider。具体详见 [7.0 Behavior Changes](https://developer.android.com/about/versions/nougat/android-7.0-changes.html#sharing-files) 。关于 FileProvider 可以参见 [FileProvider](https://developer.android.com/reference/android/support/v4/content/FileProvider.html)。如果要使用反馈模块，需要做如下修改：

1. 在 AndroidManifest.xml 添加 provider 声明：
```java
<application ...>
  <provider
      android:name="android.support.v4.content.FileProvider"
      android:authorities="<package-name>.fileprovider"
      android:exported="false"
      android:grantUriPermissions="true">
      <meta-data
          android:name="android.support.FILE_PROVIDER_PATHS"
          android:resource="@xml/lc_fileprovider_path" />
  </provider>
</application>
```
注意: <package-name> 需要修改为自己 app 的 package name。

2. 在 res 文件夹下，新建文件夹 xml（与 drawable、layout 等并列），在 xml 文件夹中新建文件 lc_fileprovider_path.xml。并修改其中内容为：
```xml
<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <cache-path name="cache_path" path=""/>
    <external-cache-path name="external-cache-path" path=""/>
    <files-path name="files_path" path=""/>
    <external-files-path name="external-files-path" path=""/>
</paths>
```

### 高级定制指南

如果我们的反馈组件 UI 无法满足你的需求，你可以通过 Feedback SDK 提供的数据模型结合自定义 UI 来满足你的需求。


#### Feedback 数据模型

* **Comment**    
  代表了反馈系统中间，用户或者开发者的每一次回复。不同的类型可以通过 CommentType 属性来指定：

```java
Comment userComment = new Comment("这是一个用户反馈");//不指定CommentType类型，即为CommentType.USER
Comment anotherUserComment = new Comment("再来说一句",CommentType.USER);
Comment devComment = new Comment("开发者回复",CommentType.DEV);
```

* **FeedbackThread**  
  代表了用户与开发者的整个交流过程。其中有两个个属性可供设置：`contact` 和 `commentList`：

```java
FeedbackThread thread = agent.getDefaultThread();
thread.setContact("你的邮箱或者QQ账号");
thread.add(newComment);
//或者也可以使用thread.getCommentsList().add(newComment);
thread.sync(syncCallback);
```

更多的信息你可以参考我们的实现的 Activity：<https://github.com/leancloud/avoscloud-sdk/blob/master/android/avoscloudfeedback/src/com/avos/avoscloud/feedback/ThreadActivity.java>

>注：ThreadActivity 使用了 ActionBar(API 11)、EditText 的 textCursorDrawable 属性 (API 12)。


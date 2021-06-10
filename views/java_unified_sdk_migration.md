# Java Unified SDK 迁移指南

我们于 2018 年 9 月推出了新的 [Java Unified SDK](https://leancloudblog.com/java-unified-sdk-kai-fang-ce-shi-tong-zhi/)，兼容纯 Java、云引擎和 Android 等多个平台，老的 Android SDK（版本号低于 `5.0.0`，`groupId` 为 `cn.leancloud.android` 的 libraries）已于 2019 年 9 月底停止维护。

Java Unified SDK 根据底层依赖的 JSON 解析库的不同，有两个不同分支：

- 6.x 分支依赖 [fastjson](https://github.com/alibaba/fastjson) 来进行 JSON 解析；
- 7.0 以后版本使用 [Gson](https://github.com/google/gson) 来进行 JSON 解析（最新版本）；

两个版本的对外接口完全一致，开发者可以根据自己的需求选择合适的版本。但是考虑到平台兼容性和稳定性，我们推荐大家使用带 Gson 库的版本来进行开发。

从 2021 年 6 月开始，我们推出了 8.0 版本，与 7.x 版本相比，主要的变化是改变了公开类的前缀（`AV` -> `LC`），同时也删除了一些长期处于 `deprecated` 状态的接口，它将是我们今后会长期维护的版本。


## Java Unified SDK（新版）与老版本 SDK 的差异

与老版本 SDK 相比，Java Unified SDK 的主要改进有两点：

- 一份代码，支持多个平台

老版本 SDK 因为历史原因，Android 平台和纯 Java 平台（在云引擎中使用）是两套完全分开的代码，接口不统一，维护也比较困难。新的 SDK 则对此进行了修改，使用一套代码来适配多个平台。 

- Reactive API

老版本 SDK 所有的网络请求都是通过 Callback 方式实现的，在有多次前后依赖的请求时会导致代码嵌套层级过多，影响阅读，同时在 Java 开发环境下这种异步的方式也不友好。故而新版本 SDK 完全基于 RxJava 来构建，满足函数式编程要求，可以非常方便地支持这种扩展。

### 新版本 SDK 的结构说明
新版本 Java SDK 主要包含以下几个 library，其层次结构以及平台对应关系如下：

#### 基础包（可以在纯 Java 环境下调用）
- storage-core：包含所有数据存储的功能，如
  - 结构化数据（LCObject）
  - 内建账户系统（LCUser）
  - 查询（LCQuery）
  - 文件存储（LCFile）
  - 朋友圈（LCStatus）
  - 短信（LCSMS）
  - 社交关系（用户 follow 关系）
  - 等等
- realtime-core：部分依赖 storage-core library，实现了 LiveQuery 以及即时通讯功能，如：
  - LiveQuery
  - LCIMClient
  - LCIMConversation 以及多种场景对话
  - LCIMMessage 以及多种子类化的多媒体消息
  - 等等

#### Android 特有的包
- storage-android：是 storage-core 在 Android 平台的定制化实现，接口与 storage-core 完全相同。
- realtime-android：是 realtime-core 在 Android 平台的定制化实现，并且增加 Android 推送相关接口。
- mixpush-android：是 LeanCloud 混合推送的 library，支持华为、小米（包括国际版）、魅族、vivo 以及 oppo 的官方推送。
- leancloud-fcm：是 Firebase Cloud Messaging 的封装 library，供国际版 app 使用推送服务。


#### 模块依赖关系
Java SDK 一共包含如下几个模块：

目录 | 模块名 | 适用平台 | 依赖关系
---|---|---|---
./core | storage-core，存储核心 library | java | 无，它是 LeanCloud 最核心的 library
./realtime | realtime-core，LiveQuery 与实时通讯核心 library | java | storage-core
./android-sdk/storage-android | storage-android，Android 存储 library | Android | storage-core
./android-sdk/realtime-android | realtime-android，Android 推送、LiveQuery、即时通讯 library | Android | storage-android, realtime-core
./android-sdk/mixpush-android | Android 混合推送 library | Android | realtime-android
./android-sdk/leancloud-fcm | Firebase Cloud Messaging library | Android | realtime-android


## 从老版本 SDK 迁移到 6.x 版本的操作要点

新版 SDK 的函数接口尽可能沿用了老版 SDK 的命名方式，所以要做的改动主要是 `Callback` 回调机制的修改。

### 切换到 Observable 接口

例如老的方式保存一个 AVObject 的代码如下(Callback 方式)：

```java
final AVObject todo = new AVObject("Todo");
todo.put("title", "工程师周会");
todo.put("content", "每周工程师会议，周一下午2点");
todo.put("location", "会议室");// 只要添加这一行代码，服务端就会自动添加这个字段
todo.saveInBackground(new SaveCallback() {
  @Override
  public void done(AVException e) {
    if (e == null) {
      // 存储成功
      Log.d(TAG, todo.getObjectId());// 保存成功之后，objectId 会自动从服务端加载到本地
    } else {
      // 失败的话，请检查网络环境以及 SDK 配置是否正确
    }
  }
});
```

而新版本 SDK 里 `AVObject#saveInBackground` 方法，返回的是一个 `Observable<? extends AVObject>` 实例，我们需要 subscribe 才能得到结果通知，新版本的实现方式如下：

```java
final AVObject todo = new AVObject("Todo");
todo.put("title", "工程师周会");
todo.put("content", "每周工程师会议，周一下午2点");
todo.put("location", "会议室");// 只要添加这一行代码，服务端就会自动添加这个字段
todo.saveInBackground().subscribe(new Observer<AVObject>() {
  public void onSubscribe(Disposable disposable) {
  }
  public void onNext(AVObject avObject) {
    System.out.println("remove field finished.");
  }
  public void onError(Throwable throwable) {
  }
  public void onComplete() {
  }
});
```

### 使用 ObserverBuilder 工具类

将所有的 Callback 改为 Observer 形式的改动会比较大，考虑到尽量降低迁移成本，我们准备了一个工具类 `cn.leancloud.convertor.ObserverBuilder`，该类有一系列的 `buildSingleObserver` 方法，来帮我们由原来的 Callback 回调函数生成 `Observable` 实例，上面的例子按照这种方法可以变为：

```java
final AVObject todo = new AVObject("Todo");
todo.put("title", "工程师周会");
todo.put("content", "每周工程师会议，周一下午2点");
todo.put("location", "会议室");// 只要添加这一行代码，服务端就会自动添加这个字段
todo.saveInBackground().subscribe(ObserverBuilder.buildSingleObserver(new SaveCallback() {
  @Override
  public void done(AVException e) {
    if (e == null) {
      // 存储成功
      Log.d(TAG, todo.getObjectId());// 保存成功之后，objectId 会自动从服务端加载到本地
    } else {
      // 失败的话，请检查网络环境以及 SDK 配置是否正确
    }
  }
}));
```

处理异步调用结果的两种方式，可供大家自由选择。

### 包名的变化

在新版 SDK 中我们统一将包名的 root 目录由 `com.avos.avoscloud` 改成了 `cn.leancloud`，也需要大家做一个全局替换。

## 从 6.x 迁移到 7.x 版本的操作要点

7.x 分支当前最新的版本是 `7.2.7`，它与 6.x 版本的对外接口完全一致，差异仅仅在于底层依赖的 JSON 解析库不同，所以从 6.x 到 7.x 的迁移是比较简单的。

### 三种不同的迁移场景

开发者在业务层使用 Java Unified SDK 与 JSON 解析库，主要有如下三种情形：

1. 业务层并没有特别使用 JSON 解析库，JSON 解析属于 Java Unified SDK 的内部实现细节，一般情况下开发者感知不到这一改变，所以这时候应用层可以无缝切换。
2. 业务代码中因 Java Unified SDK 的原因顺带使用了部分 fastjson 核心类型（例如 JSONObject 和 JSONArray），要切换到最新版就需要去掉这些 fastjson 核心类的使用。出于兼容目的 Java Unified SDK 也提供了完全相同的 API 接口，所以开发者在升级的时候只需要将引用的包名由 `com.alibaba.fastjson` 替换成 `cn.leancloud.json` 即可，例如：

```java
//import com.alibaba.fastjson.JSON
//import com.alibaba.fastjson.JSONObject
//import com.alibaba.fastjson.JSONArray

import cn.leancloud.json.JSON
import cn.leancloud.json.JSONObject
import cn.leancloud.json.JSONArray
```
3. 业务层自主使用了 fastjson 解析库，例如访问了 LeanCloud 之外的 REST API Server，强依赖 fastjson 进行了数据解析，此时最好不要升级到 7.x 版本（除非能容忍同时引入 fastjson 和 Gson 两套解析框架）。

### 参考 demo：
开发者可以参考如下的 demo 来完成版本升级：

- 使用存储服务的用户，可以参考 [storage sample app(branch: feat/gson)](https://github.com/leancloud/java-unified-sdk/tree/feat/gson/android-sdk/storage-sample-app);
- 使用即时通讯/推送服务的用户，可以参考 [chatkit-android(branch: feat/gson)](https://github.com/leancloud/LeanCloudChatKit-Android/tree/feat/gson);


### 其他问题：

1. 升级到 `7.x` 之后，Android Studio 打包时出现 RuntimeException，出错信息如下：

```
java.lang.RuntimeException
        at org.objectweb.asm.ClassVisitor.visitModule(ClassVisitor.java:148)
        at org.objectweb.asm.ClassReader.readModule(ClassReader.java:731)
        at org.objectweb.asm.ClassReader.accept(ClassReader.java:632)
        at com.google.firebase.perf.plugin.instrumentation.Instrument.instrument(Instrument.java:151)
        at com.google.firebase.perf.plugin.instrumentation.Instrument.instrumentClassesInJar(Instrument.java:100)
```

按照[这里](https://github.com/google/gson/issues/1641)的解释，可以通过升级 `Android Gradle plugin -> 3.5.3, Gradle -> v5.5` 解决。

## 从 7.x 迁移到 8.x 版本的操作要点

从 8.x 版本开始，我们把公开类名字前缀由 `AV` 改为了 `LC`，同时也删除了一些长期处于 `deprecated` 状态的接口，这将是我们今后会长期维护的版本。开发者升级要做的具体修改点，可以参考 SDK 源码工程文档：[](https://github.com/leancloud/java-unified-sdk#migration-to-8x)。

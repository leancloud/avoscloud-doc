# Android 开发指南

如果你还没有安装 LeanCloud SDK ，请前往[快速入门指南](/start.html)。

如果你希望从项目里学习，请前往 [Android SDK Demos](https://github.com/leancloud/leancloud-demos#android) 。

## 快速入门

建议您在阅读本文档之前，阅读我们提供的[快速入门](https://leancloud.cn/start.html)文档，获取 LeanCloud 使用的配置和第一印象。

## 版本变迁

从 2.4.0 开始, 我们重新设计了 SDK 结构，优化了模块间的依赖关系，实现了分模块下载 SDK 的功能。新的 SDK 不再需要你一下导入所有包 --- 除了最基本的 avoscloud.jar 以外，其余的包括 avospush.jar, avosstatistics.jar 等都可以在用到该组件时才导入。

## 模块与 SDK 包

我们已经提供了官方的 maven 仓库：[http://mvn.leancloud.cn/nexus/](http://mvn.leancloud.cn/nexus/)，推荐大家使用。

### Android Studio 用户

从 2.6.10.3 开始, LeanCloud Android SDK可以使用gradle来进行包依赖管理，从而避免了因为包下载错误而带来的一些问题。

在Android Studio的配置中间，您首先需要在项目下的build.gradle中配置成类似：

```
buildscript {
    repositories {
        jcenter()
	//这里是 LeanCloud 的包仓库
        maven {
            url "http://mvn.leancloud.cn/nexus/content/repositories/releases"
        }

    }
    dependencies {
        classpath 'com.android.tools.build:gradle:1.0.0'
    }
}

allprojects {
    repositories {
        jcenter()
	//这里是 LeanCloud 的包仓库
        maven {
            url "http://mvn.leancloud.cn/nexus/content/repositories/releases"
        }
    }
}
```

之后需要在app目录下的build.gradle中根据需要进行相应的配置：

```
android {
    //为了解决部分第三方库重复打包了META-INF的问题
    packagingOptions{
        exclude 'META-INF/LICENSE.txt'
        exclude 'META-INF/NOTICE.txt'
    }
    lintOptions {
        abortOnError false
    }
}

dependencies {
    compile 'com.android.support:support-v4:21.0.3'

    //avoscloud-sdk 为 LeanCloud基础包
    compile 'cn.leancloud.android:avoscloud-sdk:v3.3+'

    //avoscloud-push 与 Java-WebSocket 为推送与IM需要的包
    compile 'cn.leancloud.android:avoscloud-push:v3.3+@aar'
    compile 'cn.leancloud.android:Java-WebSocket:1.2.0-leancloud'
    
    //avoscloud-statistics 为 LeanCloud 统计包
    compile 'cn.leancloud.android:avoscloud-statistics:v3.3+@aar'

    //avoscloud-feedback 为 LeanCloud 用户反馈包
    compile 'cn.leancloud.android:avoscloud-feedback:v3.3+@aar'

    //avoscloud-sns 为 LeanCloud 第三方登陆包
    compile 'cn.leancloud.android:avoscloud-sns:v3.3+@aar'
    compile 'cn.leancloud.android:qq-sdk:1.6.1-leancloud'

    //avoscloud-search 为 LeanCloud 应用内搜索包
    compile 'cn.leancloud.android:avoscloud-search:v3.3+@aar'    
}
```

### Eclipse 用户

Eclipse 用户依然可以在[SDK下载](https://leancloud.cn/docs/sdk_down.html)进行下载

#### LeanCloud 基本存储模块

* avoscloud-<版本号>.jar
* android-async-http-1.4.6.jar
* fastjson.jar (请一定要使用我们提供的 jar，针对原版有 bug 修正。)
* httpmime-4.2.4.jar

#### LeanCloud 推送模块和实时聊天模块

* LeanCloud 基础存储模块
* avospush-版本号.jar

#### LeanCloud 统计模块

* LeanCloud 基础存储模块
* avosstatistics-版本号.jar
* Java-WebSocket-1.2.0-leancloud.jar

#### LeanCloud SNS 模块

* LeanCloud 基础存储模块
* weibo.sdk.android.sso.jar
* qq.sdk.1.6.1.jar

我们提供的下载包里包含了必须的依赖库，请务必使用我们提供的 jar 包，才能保证 SDK 的正常运行。特别是 fastjson 和 android-async-http 必须使用我们提供的版本，否则无法运行。

**注：如果您需要使用美国站点，如果版本是 3.3 及以上，则不需要引入 SSL 证书。其他低版本的用户，请下载 [SSL 证书](https://download.leancloud.cn/sdk/android/current/avoscloud_us_ssl.bks)并拷贝到您的项目 `res/raw/` 目录下**


## 简介

LeanCloud 平台为移动应用提供了一个完整的后端解决方案，目标是让开发者不需要再编写和维护传统的服务器代码。我们提供的 SDK 开发包也非常轻量，让开发者用最简单的方式使用 LeanCloud 平台的服务。

## 应用程序初始化

以下为 LeanCloud Android SDK 需要的所有的权限，请检查你的 `AndroidManifest.xml`。此外千万不要忘记在 `AndroidManifest.xml` 中注明 application name。过去用户反馈的很多问题都是因为这一步没有正确配置导致的。

```xml
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
```

在 LeanCloud 平台注册后，你创建的每个应用都有自己的 ID 和 Key，在你的代码中将凭此 ID 和 Key 来访问 LeanCloud 的服务。你可以在一个帐号中创建多个应用。

在你的应用访问 LeanCloud 之前，你需要使用上述的 ID 和 Key 在代码中对 LeanCloud SDK 进行初始化。你需要继承 [`Application`](http://developer.android.com/reference/android/app/Application.html) 类，并且在 `onCreate()` 方法中调用 `AVOSCloud.initialize(AppId,AppKey)` 来进行初始化。

## 数据的存储

LeanCloud 的数据存储服务是建立在对象 --- `AVObject` 基础上的，每个 `AVObject` 包含若干属性，属性的值是与 JSON 格式兼容的数据。你不需要预先指定每个 `AVObject` 包含哪些属性，可以随时增加新的属性。

例如要记录一个游戏的分数，可以建立一个类名为 `GameScore` 的 `AVObject` 对象，包含下面三个属性：

```
score: 9876, playerName: "Charlie", level: 12
```

属性名称必须是由字母、数字组成的字符串，属性的值可以是字符串、数字、布尔值、JSON 数组，甚至可以嵌套其他 `AVObject`。每个 `AVObject` 有一个类名，也是 Dashboard 里的数据表名。

### 保存对象

要保存 `GameScore` 数据到云端，添加数据的方法与 Java 中的 `Map` 类似：

```
AVObject gameScore = new AVObject("GameScore");
gameScore.put("score", 1200);
gameScore.put("playerName", "steve");
gameScore.put("level", 10);
try {
    gameScore.save();
} catch (AVException e) {
    // e.getMessage() 捕获的异常信息
}
```

成功运行以上代码后，数据就已经保存到 LeanCloud。为确认这一点，你可以用 LeanCloud 控制台的数据浏览器查看[该应用的数据](/data.html?appid={{appid}})，找到这个对象：

```java
objectId: "542b6b9ee4b06664dd893da1", score: 9876, playerName: "Charlie", level: 12,
createdAt:"2013-10-29 11:24:28", updatedAt:"2013-10-29 11:24:28"
```

因为 `AVObject` 是无模式的，后续你可以向 `GameScore` 里面增加新的属性，例如玩家 Robin 的成绩记录里面还包含一些游戏存档信息

```java
AVObject gameScore = new AVObject("GameScore");
gameScore.put("score", 1400);
gameScore.put("playerName", "Robin");
gameScore.put("level", 20);
gameScore.put("gold", 32000);
gameScore.put("coin", 500);
gameScore.put("chapter", 15);
gameScore.put("stage", 8);
try {
    gameScore.save();
} catch (AVException e) {
    // e.getMessage() 捕获的异常信息
}
```

这里需要注意几点：

* 在运行以上代码时，如果云端（LeanCloud 的服务器，以下简称云端）不存在 `GameScore` 数据表，那么 LeanCloud 将根据你第一次（也就是运行的以上代码）保存的 `GameScore` 对象来创建数据表，并且插入相应数据。
* 如果云端的这个应用中已经存在名为 `GameScore` 的数据表，而且也包括 `score`、`playerName`、`level` 等属性，新加入属性的值的数据类型要和创建该属性时一致，否则保存数据将失败。
* 每个 `AVObject` 对象有几个保存元数据的属性是不需要开发者指定的，包括 `objectId` 是每个成功保存的对象的唯一标识符。`createdAt` 和 `updatedAt` 是每个对象在服务器上创建和最后修改的时间。这些属性的创建和更新是由系统自动完成的，请不要在代码里使用这些属性来保存数据。
* 在 Android 平台上，大部分的代码是在主线程上运行的，如果在主线程上进行耗时的阻塞性操作，如访问网络等，你的代码可能会无法正常运行，避免这个问题的方法是把会导致阻塞的同步操作改为异步，在一个后台线程运行，例如 `save()` 还有一个异步的版本 `saveInBackground()`，需要传入一个在异步操作完成后运行的回调函数。查询、更新、删除操作也都有对应的异步版本。

### 数据检索

使用 LeanCloud 查询数据比保存更容易。如果你已经知道某条数据的 `objectId`，可以使用 `AVQuery` 直接检索到一个完整的 `AVObject`：

```java
AVQuery<AVObject> query = new AVQuery<AVObject>("GameScore");
AVObject gameScore;
try {
    gameScore = query.get("542b6b9ee4b06664dd893da1");
} catch (AVException e) {
    // e.getMessage()
}
```

要从检索到的 `AVObject` 对象中获取值，可以使用相应的数据类型的 `getType` 方法：

```
int score = gameScore.getInt("score");
String playerName = gameScore.getString("playerName");
int level = gameScore.getInt("level");
```

### 在后台工作

在 Android 平台上，大部分代码是在主线程上运行的，如果在主线程上进行耗时的阻塞性操作，例如查询大量数据，你的代码可能无法正常运行。避免这个风险的办法是变同步为异步，LeanCloud SDK 提供了现成的异步解决方案。例如，我们使用 `saveInBackground` 方法来在一个后台线程中保存之前的 `AVObject` 对象：

```java
gameScore.saveInBackground();
```

开发者不需要自己动手实现多线程，`saveInBackground()` 的操作将在后台线程中进行，不会影响应用程序的响应。

通常情况下，我们希望知道后台线程任务的结果，比如保存数据是否成功？LeanCloud 也为此提供了回调类。对于 `saveInBackground()` 方法，有一个 `saveCallback` 回调方式。最简单的使用方法是写一个匿名内部类来接收回调结果。例如你想知道保存数据是否成功：

```java
gameScore.saveInBackground(new SaveCallback() {
    public void done(AVException e) {
        if (e == null) {
            // 保存成功
        } else {
            // 保存失败，输出错误信息
        }
    }
});
```

`SaveCallback()` 中的代码将在获取数据完成后在主线程上运行，可以在其中进行更新用户界面等操作。

`AVQuery` 的 `getInBackground` 方法是从云端获取数据的异步方法，也提供类似的回调类。以获取 `GameScore` 对象为例：

```java
AVQuery<AVObject> query = new AVQuery<AVObject>("GameScore");
query.getInBackground("51c912bee4b012f89e344ae9", new GetCallback<AVObject>() {
    public void done(AVObject gameScore, AVException e) {
        if (e == null) {
            Log.d("获取分数", "比分是：" + gameScore.getInt("score"));
        } else {
            Log.e("获取分数", "错误: " + e.getMessage());
        }
    }
});
```

### 更新对象

更新保存在云端的对象也是非常简单的。首先获取到要更新的 `AVObject` 对象，进行修改后再保存即可。例如：

```java
String tableName = "GameScore";
AVObject gameScore = new AVObject(tableName);
AVQuery<AVObject> query = new AVQuery<AVObject>(tableName);


gameScore = query.get("51c912bee4b012f89e344ae9");
gameScore.put("score",1766);
gameScore.saveInBackground(new SaveCallback() {
   @Override
   public void done(AVException e) {
        if (e == null) {
            Log.i("LeanCloud", "Save successfully.");
        } else {
            Log.e("LeanCloud", "Save failed.");
        }
    }
});
```

### 计数器

许多应用都需要实现计数器功能 -- 比如跟踪游戏的分数、金币甚至道具数目等等。LeanCloud 提供了便捷的原子操作来实现计数器：

```java
AVObject player = new AVObject("Player");
player.put("goldCoins", 1);
player.saveInBackground();
```

然后，你可以递增或者递减 `goldCoins`，没错就这么简单：

```java
player.increment("goldCoins");
player.saveInBackground();
```

通过使用 `increment(key, amount)` 方法，你可以自行定义增减的幅度。

### 更新后获取最新值

为了减少网络传输，在更新对象操作后，对象本地的 `updatedAt` 字段（最后更新时间）会被刷新，但其他字段不会从云端重新获取。通过设置 `fetchWhenSave` 属性为 `true` 来获取更新字段在服务器上的最新值，例如：

```java
player.setFetchWhenSave(true);
player.increment("goldCoins");
player.saveInBackground(new SaveCallback() {
            @Override
            public void done(AVException e) {
                //从这时候开始，player的修改的属性全部更新到最新状态，这里就是goldCoins
            }
 });
```

这个特性在实现减库存等操作时特别有用，每次递减库存后，可以检查最新的值是否小于 0，来判断是否售空。


### 删除对象

从云端删除对象，请调用该对象的 `deleteInBackground()` 方法。如果你不在乎会阻塞主线程，也可以使用 `delete()` 方法。确认删除是否成功，你可以使用 `DeleteCallback` 回调来处理删除操作的结果。

```java
myObject.deleteInBackground();
```

除了完整删除一个对象外，你还可以只删除对象中的某些指定的值。请注意只有调用 `saveInBackground()` 之后，修改才会同步到云端。

```java
// 删除myObject对象中PlayerName字段的值
myObject.remove("playerName");
// 保存删除数据后的myObject对象到服务器
myObject.saveInBackground();
```

批量删除对象可以通过 `deleteAll()` 方法，删除操作马上生效。

```java
List<AVObject> objects = ...
AVObject.deleteAll(objects);
```

### 关联数据

对象可以与其他对象相联系。就像数据库中的主外键关系一样，数据表 A 的某一个字段是数据表 B 的外键，只有表 B 中存在的数据才可插入进表 A 中的字段。
注：如果此处需要预先建立表，请在 A 表中间为 B 表建立一个 Pointer 属性的列。如果没有进行预先建表，我们会在第一条数据产生时，自动生成一张符合数据类型的表。
例如：一条微博信息可能会对应多条评论。创建一条微博信息并对应一条评论信息，你可以这样写：


```java
// 创建微博信息
AVObject myWeibo = new AVObject("Post");
myWeibo.put("content", "吃了吗。");

// 创建评论信息
AVObject myComment = new AVObject("Comment");
myComment.put("content", "吃了，你吃了吗？");

// 添加一个关联的微博对象
//如果需要预先建表，可以在Comment表中建立一个Pointer属性的post列
myComment.put("post", myWeibo);

// 这将保存两条数据，分别为微博信息和评论信息
myComment.saveInBackground();
```

你也可以通过 objectId 来关联已有的对象：

```java
// Add a relation between the Post with objectId "1zEcyElZ80" and the comment
myComment.put("post", AVObject.createWithoutData("Post", "1zEcyElZ80"));
```

默认情况下，当你获取一个对象的时候，关联的 `AVObject` 不会被获取。这些对象的值无法获取，直到他们调用 `fetch`:

```java
fetchedComment.getAVObject("post")
    .fetchIfNeededInBackground(new GetCallback<AVObject>() {
        public void done(AVObject object, AVException e) {
          String title = post.getString("title");
        }
    });
```

同样，你可以使用 `AVRelation` 来建模多对多关系。这有点像 List 链表，但是你不需要一次性下载关系中的所有的 `AVObject`。这使得 `AVRelation` 比链表的方式可以更好地扩展到更多的对象。例如，一个 `User` 喜欢很多 `Post`。这种情况下，你可以用 `getRelation` 方法保存一个用户喜欢的所有 `Post` 集合。为了添加一个喜欢的 `Post` 到链表，你可以这样做：

```java
AVUser user = AVUser.getCurrentUser();
AVRelation<AVObject> relation = user.getRelation("likes");
relation.add(post);
user.saveInBackground();
```

你可以从AVRelation中移除一个Post:

```java
relation.remove(post);
```

默认情况下，处于关系中的对象集合不会被下载。你可以通过 `getQuery` 方法返回的 `AVQuery` 对象，使用它的 `findInBackground` 方法来获取Post链表，像这样：

```java
relation.getQuery().findInBackground(new FindCallback<AVObject>() {
    void done(List<AVObject> results, AVException e) {
      if (e != null) {
        // There was an error
      } else {
        // results have all the Posts the current user liked.
      }
    }
});
```


如果你只想获取链表的一个子集合，你可以添加更多的约束条件到 `getQuery` 返回 `AVQuery` 对象上，例如：

```java
AVQuery<AVObject> query = relation.getQuery();
// 在query对象上可以添加更多查询约束
```

如果你已经持有一个 post 对象，想知道它被哪些 User 所喜欢，你可以反向查询，像这样：

```java
// 假设 myPost 是已知的 Post 对象
AVQuery<AVObject> userQuery = AVRelation.reverseQuery("_User","likes",myPost);
userQuery.findInBackground(new FindCallback<AVObject>() {
            @Override
            public void done(List<AVObject> users, AVException avException) {
                //查询出来的喜欢myPost的User列表。
            }
        });
```

`AVRelation.reverseQuery`返回的 `AVQuery` 对象还可以添加更多的查询约束条件。

更多关于 `AVQuery` 的信息，请看本指南的查询部分。查询的时候，一个 `AVRelation` 对象运作起来像一个对象链表，因此任何你作用在链表上的查询（除了 include），都可以作用在 `AVRelation`上。


### 数据类型

目前为止，我们支持的数据类型有 `String`、`Int`、`Boolean` 以及 `AVObject` 对象类型。同时 LeanCloud 也支持 `java.util.Date`、`byte[]`数组、`JSONObject`、`JSONArray` 数据类型。
你可以在 `JSONArray` 对象中嵌套 `JSONObject` 对象存储在一个 `AVObject` 中。
以下是一些例子：


```java
int myNumber = 42;
String myString = "the number is " + myNumber;
Date myDate = new Date();

JSONArray myArray = new JSONArray();
myArray.put(myString);
myArray.put(myNumber);

JSONObject myObject = new JSONObject();
myObject.put("number", myNumber);
myObject.put("string", myString);

byte[] myData = { 4, 8, 16, 32 };

AVObject myObject = new AVObject("DataTypeTest");
myObject.put("myNumber", myNumber);
myObject.put("myString", myString);
myObject.put("myDate", myDate);
myObject.put("myData", myData);
myObject.put("myArray", myArray);
myObject.put("myObject", myObject);
myObject.put("myNull", JSONObject.NULL);
myObject.saveInBackground();
```


我们不建议存储较大的二进制数据，如图像或文件不应使用 `AVObject` 的 byte[]字段类型。`AVObject` 的大小不应超过 128 KB。如果需要存储较大的文件类型如图像、文件、音乐，可以使用 `AVFile` 对象来存储，具体使用方法可见 [AVFile指南部分](#%E6%96%87%E4%BB%B6)。
关于处理数据的更多信息，可查看开发指南的数据安全部分。

## 查询

### 基本查询
在许多情况下，`getInBackground` 是不能检索到符合你的要求的数据对象的。`AVQuery` 提供了不同的方法来查询不同条件的数据。
使用 `AVQuery` 时，先创建一个 `AVQuery` 对象，然后添加不同的条件，使用 `findInBackground` 方法结合`FindCallback` 回调类来查询与条件匹配的 `AVObject` 数据。例如，查询指定人员的信息，使用 `whereEqualTo` 方法来添加条件值：

```java
AVQuery<AVObject> query = new AVQuery<AVObject>("GameScore");
query.whereEqualTo("playerName", "steve");
query.findInBackground(new FindCallback<AVObject>() {
    public void done(List<AVObject> avObjects, AVException e) {
        if (e == null) {
            Log.d("成功", "查询到" + avObjects.size() + " 条符合条件的数据");
        } else {
            Log.d("失败", "查询错误: " + e.getMessage());
        }
    }
});
```

`findInBackground` 方法是在后台线程中执行查询数据操作，它和 `getInBackground` 的运行方式是一样的。如果你已经运行在一个后台上，那么你可以在你的后台线程中直接使用 `query.find()` 方法来获取数据：

```java
// 如果你的代码已经运行在一个后台线程，或只是用于测试的目的，可以使用如下方式。
AVQuery<AVObject> query = new AVQuery<AVObject>("GameScore");
query.whereEqualTo("playerName", "steve");
try {
    List<AVObject> avObjects = query.find();
} catch (AVException e) {
    Log.d("失败", "查询错误: " + e.getMessage());
}
```

### 查询条件
如果要过滤掉特定键的值时可以使用 `whereNotEqualTo` 方法。比如需要查询 `playerName` 不等于“steve”的数据时可以这样写：

```java
query.whereNotEqualTo("playerName", "steve");
```

当然，你可以在你的查询操作中添加多个约束条件（这些条件是 and 关系），来查询符合你要求的数据。

```java
query.whereNotEqualTo("playerName", "steve");
query.whereGreaterThan("age", 18);
```

有些时候，在数据比较多的情况下，你希望只查询符合要求的多少条数据即可，这时可以使用 `setLimit` 方法来限制查询结果的数据条数。默认情况下 Limit 的值为 100，最大 1000，在 0 到 1000 范围之外的都强制转成默认的 100。

```java
query.setLimit(10); // 限制最多10个结果
```

在数据较多的情况下，分页显示数据是比较合理的解决办法，setKip方法可以做到跳过首次查询的多少条数据来实现分页的功能。

```java
query.setSkip(10); // 忽略前10个
```

对应数据的排序，如数字或字符串，你可以使用升序或降序的方式来控制查询数据的结果顺序：

```java
// 根据score字段升序显示数据
query.orderByAscending("score");

// 根据score字段降序显示数据
query.orderByDescending("score");
//各种不同的比较查询：
// 分数 < 50
query.whereLessThan("score", 50);

//分数 <= 50
query.whereLessThanOrEqualTo("score", 50);

//分数 > 50
query.whereGreaterThan("score", 50);

//分数 >= 50
query.whereGreaterThanOrEqualTo("score", 50);
```

如果你想查询匹配几个不同值的数据，如：要查询“steve”，“chard”，“vj”三个人的成绩时，你可以使用whereContainedIn（类似SQL中的in查询）方法来实现。
```java
String[] names = {"steve", "chard", "vj"};
query.whereContainedIn("playerName", Arrays.asList(names));
```

相反，你想查询排除“steve”，“chard”，“vj”这三个人的其他同学的信息（类似 SQL 中的 `not in` 查询），你可以使用
`whereNotContainedIn` 方法来实现。

```java
String[] names = {“steve”，“chard”，“vj”};
query.whereNotContainedIn("playerName", Arrays.asList(names));
```

对字符串值的查询
查询包含字符串的值，有几种方法。你可以使用任何正确的正则表达式来检索相匹配的值，使用 `whereMatches` 方法：

```java
// 比较name字段的值是以大写字母和数字开头
AVQuery<AVObject> query = new AVQuery<AVObject>("GameScore");
query.whereMatches("name", "^[A-Z]\\d");

query.findInBackground(new FindCallback<AVObject>() {
    public void done(List<AVObject> sauceList, AVException e) {

    }
});
```

查询字符串中包含“XX“内容，可用如下方法：

```java
// 查询playerName字段的值中包含“ste“字的数据
AVQuery query = new AVQuery("GameSauce");
query.whereContains("playerName", "ste");

// 查询playerName字段的值是以“cha“字开头的数据
AVQuery query = new AVQuery("GameSauce");
query.whereStartsWith("playerName", "cha");

// 查询playerName字段的值是以“vj“字结尾的数据
AVQuery query = new AVQuery("GameSauce");
query.whereEndsWith("playerName", "vj");
```
### 数组值的查询

如果一个 Key 对应的值是一个数组，你可以查询 Key 的数组包含了数字 2 的所有对象，通过：

```java
// 查找出所有arrayKey对应的数组同时包含了数字2的所有对象
query.whereEqualTo("arrayKey", 2);
```

同样，你可以查询出 Key 的数组同时包含了 2，3 和 4 的所有对象：

```java
//查找出所有arrayKey对应的数组同时包含了数字2,3,4的所有对象。
ArrayList<Integer> numbers = new ArrayList<Integer>();
numbers.add(2);
numbers.add(3);
numbers.add(4);
query.whereContainsAll("arrayKey", numbers);
```

### 字符串的查询

使用 `whereStartsWith` 方法来限制字符串的值以另一个字符串开头。非常类似 MySQL 的 `LIKE` 查询，这样的查询会走索引，因此对于大数据集也一样高效：

```java
//查找出所有username以avos开头的用户
AVQuery<AVObject> query = AVQuery.getQuery("_User");
query.whereStartsWith("username", "avos");
```

### 查询对象个数

如果你只是想统计有多少个对象满足查询，你并不需要获取所有匹配的对象，可以直接使用 `count` 替代 `find`。例如，查询一个特定玩家玩了多少场游戏：

```java
AVQuery<AVObject> query = AVQuery.getQuery("GameScore");
query.whereEqualTo("playerName", "Sean Plott");
query.countInBackground(new CountCallback() {
  public void done(int count, AVException e) {
    if (e == null) {
      // The count request succeeded. Log the count
      Log.d("score", "Sean has played " + count + " games");
    } else {
      // The request failed
    }
  }
});
```
如果你想阻塞当前的调用线程，你可以使用同步版本的 `count()` 方法。

对于超过 1000 个对象的查询，这种计数请求可能被超时限制。他们可能遇到超时错误或者返回一个近似的值。因此，请仔细设计你的应用架构来避免依赖这种计数查询。


### 关系查询
有好几种方式可以发起关系数据的查询。如果你想获取某个字段匹配特定 `AVObject` 的对象列表，你可以像查询其他数据类型那样使用 `whereEqualTo` 来查询。例如，如果每个 `Comment` 对象都包含一个 `Post` 对象在它的 `post` 字段上，你可以获取特定 `Post` 的 `Comment` 列表：

```java
// 假设AVObject myPost已经在前面创建
AVQuery<AVObject> query = AVQuery.getQuery("Comment");
query.whereEqualTo("post", myPost);
query.findInBackground(new FindCallback<AVObject>() {
  public void done(List<AVObject> commentList, AVException e) {
    // commentList now has the comments for myPost
  }
});
```

如果你想查询对象列表，它们的某个字段包含了一个 `AVObject`，并且这个 `AVObject` 匹配一个不同的查询，你可以使用 `whereMatchesQuery` 方法。请注意，默认的 limit 限制 100 也同样作用在内部查询上。因此如果是大规模的数据查询，你可能需要仔细构造你的查询对象来获取想要的行为。例如，为了查询 post 有图片的评论列表：

```java
AVQuery<AVObject> innerQuery = AVQuery.getQuery("Post");
innerQuery.whereExists("image");
AVQuery<AVObject> query = AVQuery.getQuery("Comment");
query.whereMatchesQuery("post", innerQuery);
query.findInBackground(new FindCallback<AVObject>() {
  public void done(List<AVObject> commentList, AVException e) {
    // comments now contains the comments for posts with images.
  }
});
```

反之，不想匹配某个子查询，你可以使用 `whereDoesNotMatchQuery` 方法。 比如为了查询没有图片的 post 的评论列表：

```java
AVQuery<AVObject> innerQuery = AVQuery.getQuery("Post");
innerQuery.whereExists("image");
AVQuery<AVObject> query = AVQuery.getQuery("Comment");
query.whereDoesNotMatchQuery("post", innerQuery);
query.findInBackground(new FindCallback<AVObject>() {
  public void done(List<AVObject> commentList, AVException e) {
    // comments now contains the comments for posts without images.
  }
});
```

在某些情况下，你想在一个查询内返回多种类型的关联对象。你可以使用 `include` 方法。例如。你想获取最近的 10 条评论，同时包括它们关联的 post：


```java
AVQuery<AVObject> query = AVQuery.getQuery("Comment");
// 获取最新的评论
query.orderByDescending("createdAt");
// 限制在10条。
query.setLimit(10);
// 同时获取包含的post
query.include("post");

query.findInBackground(new FindCallback<AVObject>() {
  public void done(List<AVObject> commentList, AVException e) {
    for (AVObject comment : commentList) {
      //这里将不需要再来一次网络访问就可以访问到post的属性
      AVObject post = comment.getAVObject("post");
      Log.d("post", "retrieved a related post");
    }
  }
});
```

你可以使用 `dot`（英语句号）操作符来多层 include 内嵌的对象。比如，你同时想 include 一个 `Comment` 的 `post` 里的 `author`（作者）对象，你可以这样做：
```java
query.include("post.author");
```

`AVQuery` 的 `include` 方法可以被多次调用，每次调用的字段可以不一样。同样，上面所述的这些方法也可以作用在`AVQuery` 的其他方法，例如 `getFirst` 和 `getInBackground` 上。


### 缓存查询

经常需要缓存一些查询的结果到磁盘上，这可以让你在离线的时候，或者应用刚启动，网络请求还没有足够时间完成的时候可以展现一些数据给用户。LeanCloud 会自动清空缓存，当缓存占用了太多空间的时候。

默认情况下的查询不会使用缓存，除非你使用 `setCachePolicy` 方法明确设置启用。例如，尝试从网络请求，如果网络不可用则从缓存数据中获取，可以这样设置：

```java
query.setCachePolicy(AVQuery.CachePolicy.NETWORK_ELSE_CACHE);
query.findInBackground(new FindCallback<AVObject>() {
public void done(List<AVObject> scoreList, AVException e) {
  if (e == null) {
    // Results were successfully found, looking first on the
    // network and then on disk.
  } else {
    // The network was inaccessible and we have no cached data
    // for this query.
  }
});
```

LeanCloud 提供了几种不同的缓存策略：

* IGNORE_CACHE ： 默认的缓存策略，查询不走缓存，查询结果也不存储在缓存。
* CACHE_ONLY ： 查询只从缓存获取，不走网络。如果缓存中没有结果，引发一个 `AVException`。
* NETWORK_ONLY ： 查询不走缓存，从网路中获取，但是查询结果会写入缓存。
* CACHE_ELSE_NETWORK ： 查询首先尝试从缓存中获取，如果失败，则从网络获取，如果两者都失败，则引发一个 `AVException`。
* NETWORK_ELSE_CACHE ： 查询首先尝试从网络获取，如果失败，则从缓存中查找；如果两者都失败，则应发一个 `AVException`。
* CACHE_THEN_NETWORK ： 查询首先尝试从缓存中获取，然后再从网络获取。在这种情况下，`FindCallback` 会被实际调用两次 -- 首先是缓存的结果，其次是网络查询的结果。这个缓存策略只能用在异步的 `findInBackground` 方法中。

如果你想控制缓存的行为。你可以使用 `AVQuery` 提供的方法来操作缓存。你可以在缓存上做如下这些操作：

* 检查查询是否有缓存结果：

```java
boolean isInCache = query.hasCachedResult();
```

* 删除查询的任何缓存结果：

```java
query.clearCachedResult();
```

* 清空所有查询的缓存结果：

```java
AVQuery.clearAllCachedResults();
```
* 控制缓存结果的最大存活时间（毫秒为单位）：

```java
query.setMaxCacheAge(TimeUnit.DAYS.toMillis(1));
```

查询缓存也同时可以用在 `AVQuery` 的 `getFirst()`和 `getInBackground()`方法上。

#### Last-Modified 选项
在网络请求中间 `Last-Modified` 一般是标注在 http 响应中，用来表示该资源在服务器端的最后修改时间。在 LeanCloud 中间，我们也提供了这个选项来提升缓存的准确性、提高网络效率。
当你通过 `AVOSCloud.setLastModifyEnabled(boolean enable)`来激活这个选项时，所有的对象和它们所对应的 `Last-Modified` 时间都会被缓存起来。
当某个 `AVObject` 对象再次被发起一个 get 请求时，请求中就会带着 `Last-Modified` 信息，服务器端则会校验双方的 `Last-Modified` 信息。如果双方的 `Last-Modified` 时间一致，则说明自上次 get 请求之后，服务器端的数据并没有被修改，所以服务器不再需要将对象重新返回，客户端直接取缓存内对象返回即可，从而节省了网络资源。反之，则与平时一样，服务器返回该对象数据和对应的 `Last-Modified` 信息，由客户端更新缓存内容并返回，从而保证了缓存的正确性。
** 注：该功能现在正处于 beta 阶段，请谨慎使用 **

### 复合查询

如果你想查找对象匹配所有查询条件中的一个，你可以使用 `AVQuery.or` 方法来构建一个复合的"或"查询。例如，你想查询出获胜场次很多或者很少的玩家，可以这样:

```java
AVQuery<AVObject> lotsOfWins = AVQuery.getQuery("Player");
lotsOfWins.whereGreaterThan("score", 150);

AVQuery<AVObject> fewWins = AVQuery.getQuery("Player");
fewWins.whereLessThan("score", 5);

List<AVQuery<AVObject>> queries = new ArrayList<AVQuery<AVObject>>();
queries.add(lotsOfWins);
queries.add(fewWins);

AVQuery<AVObject> mainQuery = AVQuery.or(queries);
mainQuery.findInBackground(new FindCallback<AVObject>() {
  public void done(List<AVObject> results, AVException e) {
    // results has the list of players that win a lot or haven't won much.
  }
});
```


你还可以添加更多的约束条件到新创建的 `AVQuery` 对象上，表示一个 `and` 查询操作。

请注意，我们在复合查询的子查询里不支持非过滤性的查询，例如 `setLimit`，`skip`，`orderBy`...，`include` 等。

### 删除查询结果

如果你想根据查询条件来删除对象，或者删除查询出来的所有对象，可以调用 `AVQuery.deleteAll()` 方法：

```java
query.deleteAll();
```

### CQL 查询
Cloud Query Language（简称 CQL） 是 LeanCloud 为查询 API 定制的一套类似 SQL 查询语法的子集和变种，主要目的是降低大家学习 LeanCloud 查询的 API 的成本，可以使用传统的 SQL 语法来查询 LeanCloud 应用内的数据。
这里只是示范在 Android 中的调用方法，具体的 CQL 语法，请参考 [Cloud Query Language 详细指南](https://leancloud.cn/docs/cql_guide.html)。
你可以通过一下方法来进行调用

```java
AVQuery.doCloudQueryInBackground("select * from ObjectTest",new CloudQueryCallback<AVCloudQueryResult>(){

          @Override
          public void done(AVCloudQueryResult result, AVException cqlException) {
             if(cqlException==null){
             result.getResults();//这里是你查询到的结果
             }
          }

});

AVQuery.doCloudQueryInBackground("select count(*) from ObjectTest",new CloudQueryCallback<AVCloudQueryResult>(){


          @Override
          public void done(AVCloudQueryResult result, AVException cqlException) {
                 if(cqlException==null){
                 result.getCount();//这里你就可以得到符合条件的count
                 }
          }

});

```

在更多的时候，一个查询语句中间会有很多的值是可变值，为此，我们也提供了类似 Java JDBC 里的 `PreparedStatement` 使用占位符查询的语法结构。


```java

    AVQuery.doCloudQueryInBackground("select * from ObjectUnitTestArmor where durability = ? and name = ?",
        new CloudQueryCallback<AVCloudQueryResult>() {

          @Override
          public void done(AVCloudQueryResult result, AVException parseException) {

          }
        }, Armor.class, 100,"祈福");

```

最后的可变参数 `100` 和 `"祈福"` 会自动替换查询语句中的问号位置（按照问号的先后出现顺序）。我们更推荐使用占位符语法，理论上会降低 CQL 转换的性能开销。

## 应用内搜索

我们虽然提供了基于正则的模糊查询，但是正则查询有两个缺点：

* 当数据量逐步增大后，查询效率将越来越低
* 没有文本相关性排序

因此，我们还提供了[应用内搜索功能](./app_search_guide.html)，基于搜索引擎构建，提供更强大的搜索功能。


## 子类化

LeanCloud 希望设计成能让人尽快上手并使用。你可以通过 `AVObject.get` 方法访问所有的数据。但是在很多现有成熟的代码中，子类化能带来更多优点，诸如简洁、可扩展性以及 IDE 提供的代码自动完成的支持等等。子类化不是必须的，你可以将下列代码转化：

```java
AVObject shield = new AVObject("Armor");
shield.put("displayName", "Wooden Shield");
shield.put("fireproof", false);
shield.put("rupees", 50);
```

成这样：

```java
Armor shield = new Armor();
shield.setDisplayName("Wooden Shield");
shield.setFireproof(false);
shield.setRupees(50);
```

### 子类化 AVObject

创建一个 `AVObject` 的子类很简单：

* 首先声明一个子类继承自 `AVobject`。
* 添加`@AVClassName`注解。它的值必须是一个字符串，也就是你过去传入 `AVObject` 构造函数的类名。这样以来，后续就不需要再在代码中出现这个字符串类名。
* 确保你的子类有一个 public 的默认（参数个数为 0）的构造函数。切记不要在构造函数里修改任何 `AVObject` 的字段。
* 在你的应用初始化的地方，在调用 `AVOSCloud.initialize()` 之前注册子类 `AVObject.registerSubclass(YourClass.class)`。

下列代码成功实现并注册了 `AVObject` 的子类 `Armor`:

```java
// Armor.java
import com.avos.avoscloud.AVClassName;
import com.avos.avoscloud.AVObject;

@AVClassName("Armor")
public class Armor extends AVObject {
}

// App.java
import com.avos.avoscloud.AVOSCloud;
import android.app.Application;

public class App extends Application {
  @Override
  public void onCreate() {
    super.onCreate();

    AVObject.registerSubclass(Armor.class);
    AVOSCloud.initialize(this, "{{appid}}", "{{appkey}}");
  }
}
```

### 访问器，修改器和方法

添加方法到 `AVObject` 的子类有助于封装类的逻辑。你可以将所有跟子类有关的逻辑放到一个地方，而不是分成多个类来分别处理商业逻辑和存储/转换逻辑。

你可以很容易地添加访问器和修改器到你的 `AVObject` 子类。像平常那样声明字段的 `getter` 和 `setter` 方法，但是通过 `AVobject` 的 `get` 和 `put` 方法来实现它们。下面是这个例子为 `Armor` 类创建了一个 `displayName` 的字段：

```java
// Armor.java
@AVClassName("Armor")
public class Armor extends AVObject {
  public String getDisplayName() {
    return getString("displayName");
  }
  public void setDisplayName(String value) {
    put("displayName", value);
  }
}
```

现在你就可以使用 `armor.getDisplayName()`方法来访问 `displayName` 字段，并通过 `armor.setDisplayName("Wooden Sword")`来修改它。这样就允许你的 IDE 提供代码自动完成功能，并且可以在编译时发现到类型错误。

各种数据类型的访问器和修改器都可以这样被定义，使用各种 `get()`方法的变种，例如 `getInt()`，`getAVFile()`或者 `getMap()`。

如果你不仅需要一个简单的访问器，而是有更复杂的逻辑，你可以实现自己的方法，例如：

```java
public void takeDamage(int amount) {
  // 递减armor的durability字段，并判断是否应该设置broken状态
  increment("durability", -amount);
  if (getDurability() < 0) {
    setBroken(true);
  }
}
```

### 初始化子类

你可以使用你自定义的构造函数来创建你的子类对象。你的子类必须定义一个公开的默认构造函数，并且不修改任何父类 `AVObject` 中的字段，这个默认构造函数将会被SDK使用来创建子类的强类型的对象。

要创建一个到现有对象的引用，可以使用 `AVObject.createWithoutData()`:

```java
Armor armorReference = AVObject.createWithoutData(Armor.class, armor.getObjectId());
```

### 查询子类

你可以通过 `AVObject.getQuery()` 或者 `AVQuery.getQuery` 的静态方法获取特定的子类的查询对象。下面的例子就查询了用户能够购买的盔甲(Armor)列表：

```java
AVQuery<Armor> query = AVObject.getQuery(Armor.class);
//rupees是游戏货币
query.whereLessThanOrEqualTo("rupees", AVUser.getCurrentUser().get("rupees"));
query.findInBackground(new FindCallback<Armor>() {
  @Override
  public void done(List<Armor> results, AVException e) {
    for (Armor a : results) {
      // ...
    }
  }
});
```

### AVUser 的子类化

`AVUser` 作为 `AVObject` 的子类，同样允许子类化，你可以定义自己的 `User` 对象，不过比起 `AVObject` 子类化会更简单一些，只要继承 `AVUser` 就可以了：

```java
import com.avos.avoscloud.AVObject;
import com.avos.avoscloud.AVUser;

public class MyUser extends AVUser {
    public void setNickName(String name) {
  this.put("nickName", name);
    }

    public String getNickName() {
  return this.getString("nickName");
    }
}
```

不需要添加 `@AVClassname` 注解，所有 `AVUser` 的子类的类名都是内建的`_User`。同样也不需要注册 `MyUser`。

注册跟普通的 `AVUser` 对象没有什么不同，但是登陆如果希望返回自定义的子类，必须这样：

```java
MyUser cloudUser = AVUser.logIn(username, password,
        MyUser.class);
```
**注：由于 fastjson 内部的 bug，请在定义 AVUser 时不要定义跟 AVRelation 相关的 get 方法，如果一定要定义的话，请通过在 Class 上添加`@JSONType(ignores = {"属性名"})`的方式，将其注释为非序列化字段。**

## ACL 权限控制
ACL(Access Control List)是最灵活和简单的应用数据安全管理方法。通俗的解释就是为每一个数据创建一个访问的白名单列表，只有在名单上的用户(AVUser)或者具有某种角色(AVRole)的用户才能被允许访问。为了更好地保证用户数据安全性， LeanCloud 表中每一张都有一个 ACL 列。当然，LeanCloud 还提供了进一步的读写权限控制。一个 User 必须拥有读权限（或者属于一个拥有读权限的 Role）才可以获取一个对象的数据，同时，一个 User 需要写权限（或者属于一个拥有写权限的 Role）才可以更改或者删除一个对象。
以下列举了几种在 LeanCloud 常见的 ACL 使用范例：

### 默认访问权限
在没有显式指定的情况下，LeanCloud 中的每一个对象都会有一个默认的 ACL 值。这个值代表了，所有的用户，对这个对象都是可读可写的。此时你可以在数据管理的表中 ACL 属性中看到这样的值:
```java
        {"*":{"read":true,"write":true}}
```

而在安卓代码中，这样的值对应的代码是：
```java
        AVACL  acl = new AVACL();
        acl.setPublicReadAccess(true);
        acl.setPublicWriteAccess(true);
```
当然正如上文提到的，默认的 ACL 并不需要显式的指定。

### 指定用户访问权限
当一个用户在实现一个网盘类应用时，针对不同文件的私密性，用户就需要不同的文件访问权限。
譬如公开的文件，每一个其他用户都有读的权限，然后仅仅只有创建者才拥有更改和删除的权限。

```java
      AVObject record = new AVObject("霍乱时期的爱情");
      record.put("file", thisIsAnAVFile);

      AVACL acl = new AVACL();
      acl.setPublicReadAccess(true);//此处设置的是所有人的可读权限
      acl.setWriteAccess(AVUser.getCurrentUser(), true);//而这里设置了文件创建者的写权限

      record.setACL(acl);
      record.save();
```


当然用户也会上传一些隐私文件,只有这些文件的创建者才对这些文件拥有读写权限


```java
      AVObject record = new AVObject("AtlantisCold");
      record.put("file", thisIsAnotherAVFile);

      AVACL acl = new AVACL();
      acl.setReadAccess(AVUser.getCurrentUser(),true);
      acl.setWriteAccess(AVUser.getCurrentUser(), true);

      record.setACL(acl);
      record.save();
```
**注：一旦显式设置 ACL，默认的 ACL 就会被覆盖**

### 指定角色访问权限

#### AVUser 与 AVRole 的从属关系
指定用户访问权限虽然很方便，但是依然会有局限性。
以工资系统为例，一家公司的工资系统，工资最终的归属者和公司的出纳们只拥有工资的读权限，而公司的人事和老板才拥有全部的读写权限。当然你可以通过多次设置指定用户的访问权限来实现这一功能（多个用户的 ACL 设置是追加的而非覆盖）。
```java
        AVObect salary = new AVObject("工资");
        salary.put("value",200000000000);

        AVUser boss;//假设此处为老板
        AVUser hrWang;  //人事小王
        AVUser me; //我们就在文档里爽一爽吧
        AVUser cashierZhou; //出纳老周

        AVACL acl = new AVACL();
        acl.setReadAccess(boos,true);
        acl.setReadAccess(hrWang,true);
        acl.setReadAccess(me,true);
        acl.setReadAccess(cashierZhou,true);

        acl.setWriteAccess(boss,true);
        acl.setWriteAccess(hrWang,true);

        salary.setACL(acl);
        salary.save();

```
但是这些涉及其中的人可能不止一个，也有离职换岗新员工的问题存在。这样的代码既不优雅，也太啰嗦,同样会很难维护。
这个时候我们就引入了 `AVRole` 来解决这个问题。
公司的员工可以成百上千，然而一个公司组织里的角色却能够在很长一段时间时间内相对稳定。
```java
        AVObect salary = new AVObject("工资");
        salary.put("value",200000000000);

        AVUser boss;//假设此处为老板
        AVUser hrWang;  //人事小王
        AVUser me;
        AVUser cashierZhou; //出纳老周
        AVUser cashierGe;//出纳小葛

        //这段代码可能放在员工管理界面更恰当，但是为了示意，我们就放在这里
        AVRole hr = new AVRole("hr");
        AVRole cashier = new AVRole("cashier");

        hr.getUsers().add(hrWang);
        hr.save();
        cashier.getUsers().add(cashierZhou);//此处对应的是AVRole里面有一个叫做users的Relation字段
        cashier.getUsers().add(cashierGe);
        cashier.save();

        AVACL acl = new AVACL();
        acl.setReadAccess(boos,true);//老板假设只有一个
        acl.setReadAccess(me,true);
        acl.setRoleReadAccess(hr,true);
        acl.setRoleReadAccess(cashier,true);

        acl.setWriteAccess(boss,true);
        acl.setRoleWriteAccess(hr,true);

        salary.setACL(acl);
        salary.save();
```

当然如果考虑到一个角色(`AVRole`)里面有多少员工(`AVUser`)，编辑这些员工可需要做权限控制，`AVRole`同样也有`setACL`方法可以使用。

#### AVRole 之间的从属关系

在讲清楚了用户与角色的关系后，我们还有一层角色与角色之间的关系。用下面的例子来理解可能会对我们有所帮助：

一家创业公司有移动部门，部门下面有不同的小组，Android 和 iOS。而每个小组只拥有自己组的代码的读写权限。但是他们同时拥有核心库代码的读取权限。
```java
        AVRole androidTeam = new AVRole("androidTeam");
        AVRole iOSTeam = new AVRole("iOSTeam");
        AVRole mobileDep = new AVRole("mobileDep");

        androidTeam.save();
        iOSTeam.save();

        mobileDep.getRoles().add(androidTeam);
        mobileDep.getRoles().add(iOSTeam);
        mobileDep.save();

        AVObject androidCode = new AVObject("code");
        AVObject iOSCode = new AVObject("code");
        AVObject coreCode = new AVObject("code");
        //.....此处省略一些具体的值设定
        androidCode.save();
        iOSCode.save();
        coreCode.save();

        androidCode.setRoleReadAccess(androidTeam,true);
        androidCode.setRoleWriteAccess(androidTeam,true);

        iOSCode.setRoleReadAccess(iOSTeam,true);
        iOSCode.setRoleWriteAccess(iOSTeam,true);

        coreCode.setRoleReadAccess(mobileDep);
```

## 文件
### 文件对象

`AVFile` 可以让你的应用程序将文件存储到服务器中，比如常见的文件类型图像文件、影像文件、音乐文件和任何其他二进制数据都可以使用。
在这个例子中，我们将一段文本保存到服务器端：

```java
AVFile avFile;
try{
       AVObject avObject = new AVObject("JobApplication");
       avFile = new AVFile("JobApplication", "hello world".getBytes());
       avFile.save();
       avObject.put("applicatName","steve");
       avObject.put("applicatFile", avFile);
       avObject.saveInBackground();
}catch(AVException  e){
}
```
`AVFile` 构造函数的第一个参数指定文件名称，第二个构造函数接收一个 byte 数组，也就是将要上传文件的二进制。

可以将 `AVFile` 直接存储到其他对象的某个属性里，后续可以取出来继续使用。

**如果将文件存储到对象的一个数组类型的属性内，那么必须在查询该对象的时候加上 include 该属性，否则查询出来的数组将是 AVObject 数组。**

### 上传文件

除了可以上传一段二进制数据，你可以上传一个本地磁盘上（SD 卡等）的文件，例如：

```java
AVFile file = AVFile.withAbsoluteLocalPath("test.jpg", Environment.getExternalStorageDirectory() + "/test.jpg");
file.saveInBackground();
```

此外还有 `withFile` 方法可接收一个 `java.io.File` 对象用于上传。

### 上传进度

AVFile的 `saveInBackground` 方法除了可以传入一个 `SaveCallback` 回调来通知上传成功或者失败之外，还可以传入第二个参数 `ProgressCallback` 回调对象，通知上传进度：

```java
file.saveInBackground(new SaveCallback() {
      @Override
      public void done(AVException e) {
        if(e!=null){
            //上传失败
        }else{
            //上传成功
        }
      }
  }, new ProgressCallback() {
      @Override
      public void done(Integer percentDone) {
          //打印进度
        System.out.println("uploading: " + percentDone);
      }
       });
```


### 下载文件

下载文件调用 `AVFile.getDataInBackground` 方法就可以：

```java
AVFile avFile = avObject.getAVFile("applicatFile");
AVFile.getDataInBackground(new GetDataCallback(){
  public void done(byte[] data, AVException e){
    //process data or exception.
  }
});
```

或者得到文件的 url 自行处理下载：

```java
  String url=avFile.getUrl();
```

### 文件元信息

`AVFile` 默认会存储文件大小和文件上传者 `objectId` 作为元信息：

```java
int size = avFile.getSize();
String ownerObjectId = avFile.getOwnerObjectId();
```

你还可以在上传前自动一些元信息保存起来，以便后续获取，例如我们还保存图片的高度和宽度：

```java
avFile.addMetaData("width", 100);
avFile.addMetaData("height", 200);
```

以后就可以通过 `getMetaData` 方法获取元信息。

### 删除文件

默认情况下，文件的删除权限是不开放的，如果你想在客户端 SDK 中删除文件，你需要在数据管理平台找到 _File 表，进入 其他 -> 权限设置 菜单，勾选 delete 为所有用户都有此权限。

删除文件通过一系列 `delete` 方法来实现，跟 `AVObject` 的删除类似：

```java
avFile.deleteInBackground();
```

### 图片缩略图

如果你上传的文件是一张图片，可以通过 `AVFile` 的 `getThumbnailUrl` 方法获取一张缩略图的 url，可以设置缩率图的高度、宽度、质量等信息：

```java
//宽度200，高度100的缩略图
String url = file.getThumbnailUrl(false, 200, 100);
```

`getThumbnailUrl` 方法还有一个重载方法接收更多选项，包括质量、格式、保真等等，具体见 javadoc。

### 获取文件名

有用户反映从服务器拿到的 `AVFile` 在获取文件名时调用 `getName()`方法的返回值跟 `getObjectId()`一致，而不是实际的文件名。实际上这个是我们早期版本为了兼容 `Parse` 有意为之的。为了保持兼容性考虑，我们不准备改变这个 API 的行为。
如果你有取文件名的需求，你可以使用 `AVFile.getOriginalName()`;

### 文件列表

不少用户在实际使用中可能会用到文件列表，来展示用户发送的一组图片或者文件等。这个时候你可以使用这样的代码来完成这个功能：
```java
    List<AVFile> fileList = new LinkedList<AVFile>();
    fileList.add(parseFile1);
    fileList.add(parseFile2);

    AVObject parseObject = new AVObject("FileUnitTest");
    parseObject.addAll("file_array", fileList);//请不要直接使用put方法
    parseObject.save();
```

## 用户
用户是一个应用程序的核心。对于个人开发者来说，能够让自己的应用程序积累到多的用户，就能给自己带来更多的创作动力。因此 LeanCloud 提供了一个专门的用户类，`AVUser` 来自动处理用户账户管理所需的功能。
有了这个类，你就可以在你的应用程序中添加用户帐户功能。

`AVUser` 是一个 `AVObject` 的子类，它继承了 `AVObject` 所有的方法，具有 `AVObject` 相同的功能。不同的是，`AVUser` 增加了一些特定的关于用户账户相关的功能。

### 属性

`AVUser` 除了从 `AVObject` 继承的属性外，还有几个特定的属性：

* username: 用户的用户名（必需）。
* password: 用户的密码（必需）。
* email: 用户的电子邮件地址（可选）。

和其他 `AVObject` 对象不同的是，在设置 `AVUser` 这些属性的时候不是使用的 `put` 方法，而是专门的 `setXXX` 方法。

### 注册

你的应用程序会做的第一件事可能是要求用户注册。下面的代码是一个典型的注册过程：

```java
AVUser user = new AVUser();
user.setUsername("steve");
user.setPassword("f32@ds*@&dsa");
user.setEmail("steve@company.com");

// 其他属性可以像其他AVObject对象一样使用put方法添加
user.put("phone", "213-253-0000");

user.signUpInBackground(new SignUpCallback() {
    public void done(AVException e) {
        if (e == null) {
            // successfully
        } else {
            // failed
        }
    }
});
```

在注册过程中，服务器会进行注册用户信息的检查，以确保注册的用户名和电子邮件地址是独一无二的。此外，**服务端还会对用户密码进行不可逆的加密处理，不会明文保存任何密码，应用切勿再次在客户端加密密码，这会导致重置密码等功能不可用**。

请注意，我们使用的是 `signUpInBackground` 方法，而不是 `saveInBackground` 方法。另外还有各种不同的 `signUp` 方法。像往常一样，我们建议在可能的情况下尽量使用异步版本的 `signUp` 方法，这样就不会影响到应用程序主 UI 线程的响应。你可以阅读 API 中更多的有关这些具体方法的使用。

如果注册不成功，你可以查看返回的错误对象。最有可能的情况是，用户名或电子邮件已经被另一个用户注册。这种情况你可以提示用户，要求他们尝试使用不同的用户名进行注册。

你也可以要求用户使用 Email 做为用户名注册，这样做的好处是，你在提交信息的时候可以将输入的“用户名“默认设置为用户的 Email 地址，以后在用户忘记密码的情况下可以使用 LeanCloud 提供的重置密码功能。

关于自定义邮件模板和验证链接请看这篇[博客](http://blog.leancloud.cn/blog/2014/01/09/zi-ding-yi-ying-yong-nei-yong-hu-zhong-she-mi-ma-he-you-xiang-yan-zheng-ye-mian/)。

用户邮箱验证后，会调用 `AV.Cloud.onVerified('email',function)` 的云代码回调函数，方便你做一些后处理。

### 登录

当用户注册成功后，你需要让他们以后能够登录到他们的账户后使用应用。要做到这样一点，你可以使用
`AVUser` 类的 `loginInBackground` 方法。

```java
AVUser.logInInBackground("username", "password", new LogInCallback() {
    public void done(AVUser user, AVException e) {
        if (user != null) {
            // 登录成功
        } else {
            // 登录失败
        }
    }
});
```

### 当前用户

如果用户在每次打开你的应用程序时都要登录，这将会直接影响到你应用的用户体验。为了避免这种情况，你可以使用缓存的 `currentUser` 对象。

每当你注册成功或是第一次登录成功，都会在本地磁盘中有一个缓存的用户对象，你可以这样来获取这个缓存的用户对象来进行登录：

```java
AVUser currentUser = AVUser.getCurrentUser();
if (currentUser != null) {
    // 允许用户使用应用
} else {
    //缓存用户对象为空时， 可打开用户注册界面…
}
```

当然，你也可以使用如下方法清除缓存用户对象：

```java
AVUser.logOut();             //清除缓存用户对象
AVUser currentUser = AVUser.getCurrentUser(); // 现在的currentUser是null了
```

### 重置密码

这是一个事实，一旦你引入了一个密码系统，那么肯定会有用户忘记密码的情况。对于这种情况，我们提供了一种方法，让用户安全地重置起密码。
重置密码的流程很简单，开发者只要求用户输入注册的电子邮件地址即可：

```java
AVUser.requestPasswordResetInBackground("myemail@example.com", new RequestPasswordResetCallback() {
    public void done(AVException e) {
        if (e == null) {
            // 已发送一份重置密码的指令到用户的邮箱
        } else {
            // 重置密码出错。
        }
    }
});
```

密码重置流程如下：

 * 用户输入他们的电子邮件，请求重置自己的密码。
 * LeanCloud 向他们的邮箱发送一封包含特殊的密码重置连接的电子邮件。
 * 用户根据向导点击重置密码连接，打开一个特殊的页面，让他们输入一个新的密码。
 * 用户的密码已被重置为新输入的密码。

关于自定义邮件模板和验证链接请看这篇[博客](http://blog.leancloud.cn/blog/2014/01/09/zi-ding-yi-ying-yong-nei-yong-hu-zhong-she-mi-ma-he-you-xiang-yan-zheng-ye-mian/)。

用户邮箱验证后，会调用 `AV.Cloud.onVerified('email',function)` 的云代码回调函数，方便你做一些后处理。

### 修改密码

当用户系统中存在密码的时候，就会存在用户更改密码的需求，对于这种情况，我们提供了一种方法，能够同时验证老密码和修改新密码:

```java
    AVUser userA = AVUser.logIn("yourusername", "yourpassword");//请确保用户当前的有效登录状态
    userA.updatePasswordInBackground("old_password", "new_password",new UpdatePasswordCallback() {

      @Override
      public void done(AVException e) {
        Log.d("TAG","something wrong");
      }
    });
```
如果要求更改密码的用户不再登录状态、原密码错误和用户不存在等情况都会通过 callback 返回。

### 发送验证邮件

验证邮件对于很多应用来说并非是必须的，然而一旦遭遇到恶劣的强注事件时，通过验证邮件来阻拦 spam 用户的攻击就成为最直接和简便的方法。LeanCloud 同样也提供了这样的方法，让用户免去这方面的担忧。
发送验证邮件的流程也很简单，在开发者获得用户的邮箱之后就可以发送验证邮件：

```java
        AVUser.requestEmailVerfiyInBackground(email, new RequestEmailVerifyCallback() {

          @Override
          public void done(AVException e) {

          }
        });
```

关于自定义邮件模板和验证链接请看这篇[博客](http://blog.leancloud.cn/blog/2014/01/09/zi-ding-yi-ying-yong-nei-yong-hu-zhong-she-mi-ma-he-you-xiang-yan-zheng-ye-mian/)。

###  手机号码验证

在应用设置中打开`注册手机号码验证`选项后，当你在注册用户时，填写用户手机字段后，LeanCloud 会自动向该手机号码发送一个验证短信，用户在输入验证码以后，该用户就被表示为已经验证过手机。

以下代码就可发送注册验证码到用户手机:
```java
        AVUser user = new AVUser();
        user.setUsername("whateverusername");
        user.setPassword("whateverpassword");
        user.setMobilePhoneNumber("13613613613");//本号码随机生成如有雷同纯属巧合
        user.signUp();

        //如果你的账号需要重新发送短信请参考下面的代码
        AVUser.requestMobilePhoneVerifyInBackground("13613613613",new RequestMobileCodeCallback() {

      @Override
      public void done(AVException e) {
        //发送了验证码以后做点什么呢
      }
    })
```
调用以下代码即可验证验证码:
```java
      AVUser.verifyMobilePhoneInBackground(smsCode, new AVMobilePhoneVerifyCallback() {

      @Override
      public void done(AVException e) {
        // TODO Auto-generated method stub

      }
    });
```

验证成功后，用户的 `mobilePhoneVerified` 属性变为 true，并且调用云代码的 `AV.Cloud.onVerifed('sms', function)`方法。

### 手机号码登录

在手机号码被验证后，用户可以使用手机号码进行登录。手机号码包括两种方式：手机号码＋密码方式，手机号码＋短信验证码方式。

以下为手机号码＋密码来登录的方式：
```java
    AVUser.loginByMobilePhoneNumber("13613613613","whateverpassword");//本号码随机生成如有雷同纯属巧合
```

以下为发送登录短信验证码：

```java
    AVUser.requestLoginSmsCodeInBackground("13613613613", new RequestMobileCodeCallback() {

      @Override
      public void done(AVException e) {
        // 登录短信验证码发送以后你要做点什么呢

      }
    });
```
最后使用短信验证码＋手机号码进行登录:
```java
    AVUser.loginBySMSCodeInBackground("13613613613", smsCode, new LogInCallback<AVUser>() {

      @Override
      public void done(AVUser user, AVException e) {

      }
    });
```

### 手机号码重置密码

如果用户使用手机号码注册或者验证过手机号码，你也可以通过手机短信来实现`忘记密码`功能：
```java
   AVUser.requestPasswordResetBySmsCodeInBackground("12312312312", new RequestMobileCodeCallback() {
          @Override
          public void done(AVException e) {
           if(e==null){
             //发送成功了
           }
          }
        });
```

之后在用户受到重置密码的验证码之后，你可以调用这个方法来实现密码重置:
```java
  AVUser.resetPasswordBySmsCodeInBackground(smsCode,newPassword,new UpdatePasswordCallback() {
      @Override
      public void done(AVException e) {
        if(e == null){
        //密码更改成功了！
        }
      }
    });
```
修改成功以后，用户就可以使用新密码登陆了


### 查询

查询用户，你需要使用特殊的用户查询对象来完成：

```java
AVQuery<AVUser> query = AVUser.getQuery();
query.whereEqualTo("gender", "female");
query.findInBackground(new FindCallback<AVObject>() {
    public void done(List<AVObject> objects, AVException e) {
        if (e == null) {
            // 查询成功
        } else {
            // 查询出错
        }
    }
})
```

### 匿名用户

如果你的应用需要使用一个相对弱化的用户系统时，你可以考虑 LeanCloud 提供的匿名用户系统来实现你的功能。

你只需要一行代码就可以获取以后一个匿名的用户账号：
```java
    AVAnonymousUtils.logIn(new LogInCallback<AVUser>() {
      @Override
      public void done(AVUser user, AVException e) {
          ...
      }
    });
```

当你的用户系统兼有匿名和“实名”的账号时，你可以通过 `AVUser.isAnonymous()`来判断是否是一个匿名用户。

### 浏览器中查看用户表

User 表是一个特殊的表，专门存储 `AVUser` 对象。在浏览器端，你会看到一个 _User 表。

## 地理位置
LeanCloud 允许用户根据地球的经度和纬度坐标进行基于地理位置的信息查询。你可以在 `AVObject` 的查询中添加一个 `AVGeoPoint` 的对象查询。你可以实现轻松查找出离当前用户最接近的信息或地点的功能。

### 地理位置对象

首先需要创建一个 `AVGeoPoint` 对象。例如，创建一个北纬 40.0 度-东经 30.0 度的 `AVGeoPoint` 对象：
```java
AVGeoPoint point = new AVGeoPoint(40.0, -30.0);
```

添加地理位置信息
```java
placeObject.put("location", point);
```

### 地理查询

现在，你的数据表中有了一定的地理坐标对象的数据，这样可以测试找出最接近某个点的信息了。你可以使用 `AVQuery` 对象的 `whereNear` 方法来这样做：
```java
AVGeoPoint userLocation = (AVGeoPoint) userObject.get("location");
AVQuery<AVObject> query = new AVQuery<AVObject>("PlaceObject");
query.whereNear("location", userLocation);
query.setLimit(10);            //获取最接近用户地点的10条数据
ArrayList<AVObject> nearPlaces = query.find();
```

在以上代码中，nearPlaces 是一个返回的距离 userLocation 点（最近到最远）的对象数组。
要限制查询指定距离范围的数据可以使用 `whereWithinKilometers`、`whereWithinMiles` 或 `whereWithinRadians` 方法。
要查询一个矩形范围内的信息可以使用 `whereWithinGeoBox` 来实现：

```java
AVGeoPoint southwestOfSF = new AVGeoPoint(37.708813, -122.526398);
AVGeoPoint northeastOfSF = new AVGeoPoint(37.822802, -122.373962);
AVQuery<AVObject> query = new AVQuery<AVObject>("PizzaPlaceObject");
query.whereWithinGeoBox("location", southwestOfSF, northeastOfSF);
ArrayList<AVObject> pizzaPlacesInSF = query.find();
```

### 注意事项

目前有几个需要注意的地方：

 * 每个 `AVObject` 数据对象中只能有一个 `AVGeoPoint` 对象。
 * 地理位置的点不能超过规定的范围。纬度的范围应该是在 -90.0 到 90.0 之间。经度的范围应该是在 -180.0 到 180.0 之间。如果你添加的经纬度超出了以上范围，将导致程序错误。

## 短信验证API
除了上文提到的短信登录与短信密码重置的功能外，我们也同时提供了与账号无关的短信服务。

```java
AVOSCloud.requestSMSCodeInBackground("12312312312",null,"短信验证",10,
				    new RequestMobileCodeCallback(){
				      @Override
				      public void done(AVException e){
				      	if(e==null){
					  //发送成功
					}
				      }
				    })
```

除了这种最简单的调用方法以外，我们也支持短信模板的调用。

```java
  Map<String,Object> env = new HashMap<String,Object>();
  env.put("name","LeanCloud Test");//这里放的都是你在短信模板中间定义的变量名和对应想要替换的值

  AVOSCloud.requestSMSCodeInBackground("12312312312","模板名称",env,new RequestMobileCodeCallback(){
				      @Override
				      public void done(AVException e){
				      	if(e==null){
					  //发送成功
					}
				      }
				    });
```

### 语音验证码
语音验证码，是通过电话直接呼叫用户的电话号码来播报验证码。它可以作为一种备选方案，来解决因各种原因导致短信无法及时到达的问题

```java
  AVOSCloud.requestVoiceCodeInBackground("12312312312",
				   new RequestMobileCodeCallback callback(){
  				      @Override
				      public void done(AVException e){
				      	if(e==null){
					  //发送成功
					}
				      }});
```

### 验证码校验

不管是短信验证码还是语音验证码，用户收到验证码以后都可以通过统一的方法来进行验证：

```java
  AVOSCloud.verifyCodeInBackground("123456","12312312312",
				  new AVMobilePhoneVerifyCallback(){
  		          	    @Override
				    public void done(AVException e){
				    if(e==null){
				      //发送成功
				     }
				    }
  })
```

## 调用云代码

### 调用函数

使用 `AVCloud` 类的静态方法来调用云代码中定义的函数：

```java
 Map<String,Object> parameters = ......
 AVCloud.callFunctionInBackground("validateGame", parameters, new FunctionCallback() {
      public void done(Object object, AVException e) {
          if (e == null) {
              processResponse(object);
          } else {
              handleError();
          }
      }
  }
```

`validateGame` 是函数的名称，`parameters` 是传入的函数参数，`FunctionCallback` 对象作为调用结果的回调传入。

### 生产环境和测试环境

云代码区分测试环境和生产环境，在SDK里指定调用的云代码环境，可以通过 `setProductionMode` 方法：

```java
AVCloud.setProductionMode(false); //调用测试环境云代码
```

默认为 true，也就是调用生产环境云代码函数。

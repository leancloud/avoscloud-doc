# iOS / OS X 指南

如果还没有安装 LeanCloud iOS SDK，请阅读 [快速入门](/start.html) 来获得该 SDK，并在 Xcode 中运行和熟悉示例代码。我们的 SDK 支持 iOS 4.3 及更高版本。

如果想从项目中学习，请到我们的 GitHub 资源库中获取 [iOS SDK 演示代码](https://github.com/leancloud/iOS-SDK-demos) 。

## 介绍

LeanCloud 是一个完整的平台解决方案，它为应用开发提供了全方位的后端服务。我们的目标是让开发者不需要进行后端开发及服务器运维等工作就可以开发和发布成熟的应用。

如果熟悉像 Ruby on Rails 这样的 Web 框架，你会发现 LeanCloud 很容易上手。我们在设计 LeanCloud 时应用了许多与之相同的原则。如果你之前使用过 Parse 或类似的后端服务，那么还会发现我们的 API 尽可能与其保持兼容。我们这样设计，是为了让开发者可以轻而易举地将应用从其他服务迁移至 LeanCloud，让他们在使用我们的 SDK 时也会得心应手。

## 快速入门

建议在阅读本文档之前，先阅读 [快速入门](/start.html)，了解如何配置和使用 LeanCloud。

## 使用 CocoaPods 安装 SDK

[快速入门](https://leancloud.cn/start.html) 会教你如何在一个项目中安装 SDK。

[CocoaPods](http://www.cocoapods.org/) 是一款很好的依赖管理工具，其安装步骤大致如下：

* 首先确保开发环境中已经安装了 Ruby（一般安装了 XCode，Ruby 会被自动安装上）
* 我们建议使用淘宝提供的 [Gem源](http://ruby.taobao.org/)，在终端执行下列命令：

  ```sh
  $ gem sources --remove https://rubygems.org/
  $ gem sources -a http://ruby.taobao.org/
  $ gem sources -l
  *** CURRENT SOURCES ***
  http://ruby.taobao.org
  #请确保下列命令的输出只有ruby.taobao.org
  $ gem install rails
  ```

* 通过下列命令，安装（或更新）CocoaPods（可能需要输入登录密码）：

  ```sh
  sudo gem install cocoapods
  ```

* 在项目根目录下创建一个名为 `Podfile` 的文件（没有扩展名），并添加下列内容：

  ```sh
  pod 'AVOSCloud'
  ```
* 如果使用 SNS 组件（社交平台用户登录）的相关功能，则添加：

  ```sh
  pod 'AVOSCloudSNS'
  ```

* 执行命令 `pod install` 安装 SDK。

相关资料：《[CocoaPods安装和使用教程](http://code4app.com/article/cocoapods-install-usage)》
## 应用

部署在 LeanCloud 上的每个应用都有自己的 ID 和客户端密钥，客户端代码应该使用它们来初始化 SDK。

LeanCloud 的每一个帐户都可以创建多个应用。同一个应用可分别在测试环境和生产环境部署不同的版本。

## 对象

### AVObject

在 LeanCloud 上，数据存储是围绕 `AVObject` 进行的。每个 `AVObject` 都包含与 JSON 兼容的「键值对」`(key:value)` 数据。该数据不需要定义 schema，因此不用提前指定 `AVObject` 都有哪些「键」，只要直接设定「键值对」即可。

例如，记录游戏玩家的分数，直接创建一个独立的 `AVObject` 即可 ：

```objc
score: 1337, playerName: "Steve", cheatMode: false
```

键，必须是由字母、数字或下划线组成的字符串，自定义的键，不能以 `__`（双下划线）开头。值，可以是字符串、数字、布尔值，或是数组和字典。

**注意：在 iOS SDK 中，`code`、 `uuid`、 `className`、  `keyValues`、 `fetchWhenSave`、 `running`、 `acl`、 `ACL`、 `isDataReady`、 `pendingKeys`、 `createdAt`、 `updatedAt`、 `objectId`、 `description` 都是保留字段，不能作为「键」来使用。**

每个 `AVObject` 都必须有一个类（Class）名称，以便区分不同类型的数据。例如，游戏分数这个对象可取名为 `GameScore`。

我们建议将「类」和「键」分别按照 `NameYourClassesLikeThis` 和 `nameYourKeysLikeThis` 这样的惯例来命名，即区分第一个字母的大小写，这样可以提高代码的可读性和可维护性。

### 保存对象

接下来，需要将上文中的 `GameScore` 存储到 LeanCloud 上。LeanCloud 的相关接口和 `NSMutableDictionary` 类似，但只有在调用 `save` 方法时，数据才会被真正保存下来。

```objc
AVObject *gameScore = [AVObject objectWithClassName:@"GameScore"];
[gameScore setObject:[NSNumber numberWithInt:1337] forKey:@"score"];
[gameScore setObject:@"Steve" forKey:@"playerName"];
[gameScore setObject:[NSNumber numberWithBool:NO] forKey:@"cheatMode"];
[gameScore save];
```

运行此代码后，要想确认保存动作是否已经生效，可以到 LeanCloud 应用管理平台的 **[数据管理](/data.html?appid={{appid}})** 页面来查看数据的存储情况。

如果保存成功，`GameScore` 的数据列表应该显示出以下记录：

```objc
objectId: "51a90302e4b0d034f61623b5", score: 1337, playerName: "Steve", cheatMode: false,
createdAt:"2013-06-01T04:07:30.32Z", updatedAt:"2013-06-01T04:07:30.32Z"
```

在此要特别说明两点：

1. 运行此代码前，不用配置或设置 `GameScore` 类，LeanCloud 会自动创建这个类。
2. 为更方便地使用 LeanCloud，以下字段不需要提前指定：
  * `objectId` 是为每个对象自动生成的唯一的标识符
  * `createdAt` 和 `updatedAt` 分别代表每个对象在 LeanCloud 中创建和最后修改的时间，它们会被自动赋值。

  在执行保存操作之前，这些字段不会被自动保存到 `AVObject` 中。

### 检索对象

如果你觉得将数据保存到 LeanCloud 上实现起来简单而直观，那获取数据更是如此。如果已知 `objectId`，用 `AVQuery` 就可以得到对应的 `AVObject` ：

```objc
AVQuery *query = [AVQuery queryWithClassName:@"GameScore"];
AVObject *gameScore = [query getObjectWithId:@"51a90302e4b0d034f61623b5"];
```

用 `objectForKey` 获取属性值：

```objc
int score = [[gameScore objectForKey:@"score"] intValue];
NSString *playerName = [gameScore objectForKey:@"playerName"];
BOOL cheatMode = [[gameScore objectForKey:@"cheatMode"] boolValue];
```

获取三个特殊属性：

```objc
NSString *objectId = gameScore.objectId;
NSDate *updatedAt = gameScore.updatedAt;
NSDate *createdAt = gameScore.createdAt;
```

如果需要刷新特定对象的最新数据，可调用 `refresh` 方法 ：

```objc
[myObject refresh];
```

### 后台运行

在 iOS 或 OS X 中，大部分代码是在主线程中运行的。不过，当应用在主线程中访问网络时，可能常会发生卡顿或崩溃现象。

由于 `save` 和 `getObjectWithId` 这两个方法会访问网络，所以不应当在主线程上运行。这种情况一般处理起来比较麻烦，因此，LeanCloud 提供了辅助功能，可应对绝大多数情况。

例如，方法 `saveInBackground` 可在后台线程中保存之前的 `AVObject`：

```objc
[gameScore saveInBackground];
```

这样，`saveInBackground` 的调用会立即返回，而主线程不会被阻塞，应用会保持在响应状态。

通常情况下，要在某操作完成后立即运行后面的代码，可以使用「块」（`...WithBlock` ：仅支持 iOS 4.0+ 或 OS X 10.6+）或「回调」（`...CallBack`）方法。

例如，在保存完成后运行一些代码：

```objc
[gameScore saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
  if (!error) {
    // gameScore 已成功保存
  } else {
    // 保存 gameScore 时出错
  }
}];
```

或者写成回调方式：

```objc
// 先创建一个回调
- (void)saveCallback:(NSNumber *)result error:(NSError *)error {
  if (!error) {
    // gameScore 已成功保存
  } else {
    // 保存 gameScore 时出错
  }
}

// 然后在后续代码中执行其他操作
[gameScore saveInBackgroundWithTarget:self
                             selector:@selector(saveCallback:error:)];
```

LeanCloud 在网络接入时不会阻塞调用线程，同时在主线程上「块」或「回调」仍会正常执行。也就是说，网络访问不会对 UI 产生不良影响，你仍然可以在回调中对 UI 进行操作。

`AVQuery` 也遵循相同的模式。如果需要从对象 `GameScore` 获取并保存得分，同时又确保主线程不会被阻塞，则可以：

```objc
AVQuery *query = [AVQuery queryWithClassName:@"GameScore"];
[query getObjectInBackgroundWithId:@"51a90302e4b0d034f61623b5"
                             block:^(AVObject *gameScore, NSError *error) {
  if (!error) {
    // get 请求成功完成，输出分数
    NSLog(@"The score was: %d", [[gameScore objectForKey:@"score"] intValue]);
  } else {
    // 请求失败，输出错误信息
    NSLog(@"Error: %@ %@", error, [error userInfo]);
  }
}];
```

或用回调方式：

```objc
// 先创建一个回调
- (void)getCallback:(AVObject *)gameScore error:(NSError *)error {
  if (!error) {
    // get 请求成功完成，输出分数
    NSLog(@"The score was: %d", [[gameScore objectForKey:@"score"] intValue]);
  } else {
    // 请求失败，输出错误信息
    NSLog(@"Error: %@ %@", error, [error userInfo]);
  }
}

// 然后在后续代码中执行其他操作
AVQuery *query = [AVQuery queryWithClassName:@"GameScore"];
[query getObjectInBackgroundWithId:@"51a90302e4b0d034f61623b5"
                            target:self
                          selector:@selector(getCallback:error:)];
```

###离线存储对象

大多数保存功能可以立刻执行，并通知应用「保存完毕」。不过若不需要知道保存完成的时间，则可使用 `saveEventually` 来替代。

它的优点在于：如果用户目前尚未接入网络，`saveEventually` 会保存设备中的数据，并在网络连接恢复后上传。如果应用在网络恢复之前就被关闭了，那么当它下一次打开时，LeanCloud 会再次尝试连接。

所有 `saveEventually`（`deleteEventually`）的相关调用，将按照调用的顺序依次执行。因此，多次对某一对象使用 `saveEventually` 是安全的。

```objc
// 创建对象
AVObject *gameScore = [AVObject objectWithClassName:@"GameScore"];
[gameScore setObject:[NSNumber numberWithInt:1337] forKey:@"score"];
[gameScore setObject:@"Sean Plott" forKey:@"playerName"];
[gameScore setObject:[NSNumber numberWithBool:NO] forKey:@"cheatMode"];
[gameScore setObject:[NSArray arrayWithObjects:@"pwnage", @"flying", nil] forKey:@"skills"];
[gameScore saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {

    [gameScore setObject:[NSNumber numberWithBool:YES] forKey:@"cheatMode"];
    [gameScore setObject:[NSNumber numberWithInt:1338] forKey:@"score"];
    [gameScore saveEventually];
}];
```

### 更新对象

更新对象非常简单，仅需要更新其属性，再调用「保存」方法即可。例如：

```objc
// 创建对象
AVObject *gameScore = [AVObject objectWithClassName:@"GameScore"];
[gameScore setObject:[NSNumber numberWithInt:1337] forKey:@"score"];
[gameScore setObject:@"Steve" forKey:@"playerName"];
[gameScore setObject:[NSNumber numberWithBool:NO] forKey:@"cheatMode"];
[gameScore setObject:[NSArray arrayWithObjects:@"pwnage", @"flying", nil] forKey:@"skills"];
[gameScore saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {

    // 增加些新数据，这次只更新 cheatMode 和 score
    // playerName 不变，然后保存到云端
    [gameScore setObject:[NSNumber numberWithBool:YES] forKey:@"cheatMode"];
    [gameScore setObject:[NSNumber numberWithInt:1338] forKey:@"score"];
    [gameScore saveInBackground];
}];
```

客户端会自动计算出哪些数据已经改变，并将修改过的的字段发送给 LeanCloud。未更新的数据不会产生变动，这一点请不用担心。

### 计数器

上面是一个常见的使用案例。在下面例子中，`score` 字段是一个计数器，我们需要不断更新玩家的最新得分。使用上述方法后，这个计数器运行良好，但如果有多个客户端试图更新同一个计数器，上面的方法就十分繁琐并且容易出现问题。

为了优化计数器类的数据存储，LeanCloud 为所有的数字型字段都提供了「原子递增」（或递减）方法，故相同的更新可以改写为：

```objc
[gameScore incrementKey:@"score"];
[gameScore saveInBackground];
```

也可以使用 `incrementKey: byAmount:` 来累加字段的数值。

那有没有方法，可以不用特意去做 `fetch`，就能马上得到计数器当前在后端的最新数据呢？LeanCloud 提供了 
`fetchWhenSave` 属性，当设置为 `true` 时，LeanCloud 会在保存操作发生时，自动返回当前计数器的最新数值。


### 数组

为了更好地存储数组数据，LeanCloud 提供了三种不同的操作来自动更新数组字段：

* `addObject: forKey:` 和 `addObjectsFromArray: forKey:`
  将指定对象附加到数组末尾。
* `addUniqueObject: forKey:` 和 `addUniqueObjectsFromArray: forKey:`
  如果不确定某个对象是否已包含在数组字段中，可以使用此操作来添加。对象的插入位置是随机的。
* `removeObject: forKey:` 和 `removeObjectsInArray: forKey:`
  从数组字段中删除指定对象的所有实例。

例如，将对象添加到 `skills` 字段：

```objc
[gameScore addUniqueObjectsFromArray:[NSArray arrayWithObjects:@"flying", @"kungfu", nil] forKey:@"skills"];
[gameScore saveInBackground];
```

###删除对象

从 LeanCloud 中删除一个对象：

```objc
[myObject deleteInBackground];
```

如果想通过「回调」来确认删除操作，可以使用方法 `deleteInBackgroundWithBlock:` 或 `deleteInBackgroundWithTarget: selector:`。如果想强制在当前线程执行，使用 `delete`。

`removeObjectForKey:` 方法删除对象的单个属性。

```objc
// After this, playerName field will be empty
[myObject removeObjectForKey:@"playerName"];

// 字段删除后结果保存到云端
[myObject saveInBackground];
```

### 关系型数据

一个对象可以与其他对象建立「关系」。为了模拟这种行为，任何 `AVObject` 均可作为另一个 `AVObject` 的属性，在其他 `AVObjects` 中使用。在内部，LeanCloud 框架会将引用到的对象储存到同一个地方，以保持一致性。

「关系」最主要的特性在于它能很容易地进行动态扩展（相对于数组而言），同时又具备很好的查询能力。数组在查询上的功能比较有限，而且使用起来并不容易。数组和「关系」都可以用来存储「一对多」的映射。

例如，在一个博客应用中，一条评论（Comment）对应一篇文章（Post）。下面的代码将创建一篇有一条评论的文章：

```objc
// 创建文章、标题和内容
AVObject *myPost = [AVObject objectWithClassName:@"Post"];
[myPost setObject:@"I'm Smith" forKey:@"title"];
[myPost setObject:@"Where should we go for lunch?" forKey:@"content"];

// 创建评论和内容
AVObject *myComment = [AVObject objectWithClassName:@"Comment"];
[myComment setObject:@"Let's do Sushirrito." forKey:@"content"];

// 为文章和评论建立一对一关系
[myComment setObject:myPost forKey:@"parent"];

// 同时保存 myPost、myComment
[myComment saveInBackground];
```

还可以只用 `objectID` 来关联对象：

```objc
// 把评论跟 objectId 为 "51a902d3e4b0d034f6162367" 的文章关联起来
[myComment setObject:[AVObject objectWithoutDataWithClassName:@"Post" objectId:@"51a902d3e4b0d034f6162367"]
              forKey:@"parent"];
```

默认情况下，在获取对象时，与其相关联的 `AVObject` 不会被一同获取。因此，这些关联对象的属性，要获取后才可以使用。例如：

```objc
AVObject *post = [fetchedComment objectForKey:@"parent"];
[post fetchIfNeededInBackgroundWithBlock:^(AVObject *object, NSError *error) {
  NSString *title = [post objectForKey:@"title"];
}];
```

`AVRelation` 对象可以用来模拟「多对多」的关系，它的工作原理类似于 `AVObject` 中的 `Array`。二者的不同之处在于，你不需要即时下载关系中的所有对象。这意味着，使用 `AVRelation` 可以扩展出比 `AVObject` 中的 `Array` 更多的对象。

例如，一个用户可能有很多喜欢的文章，这样可以使用 `relationforKey:` 来保存这个用户喜欢的一组文章。要将一篇文章按顺序添加到列表中，可这样写：

```objc
AVUser *user = [AVUser currentUser];
AVRelation *relation = [user relationforKey:@"likes"];
[relation addObject:post];
[user saveInBackground];
```

从 `AVRelation` 中移除一篇喜欢的「文章」：

```objc
[relation removeObject:post];
```

默认情况下，这个关系中的对象列表不会被下载，需要在 `query` 查询返回的 `AVQuery` 上调用 `findObjectsInBackgroundWithBlock:` 方法来获得文章列表，代码如下：

```objc
[[relation query] findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (error) {
     // 有错误发生
  } else {
    // objects 包含了当前用户所喜欢的所有文章
  }
}];
```

如果只想要「文章」对象的子集，则要对 `AVQuery` 添加额外的限制，如：

```objc
AVQuery *query = [relation query];
// 增加其他查询限制条件
```

如果想反向查询，比如，你的文章被哪些用户喜欢过，要用 `revereseQuery:`：

```objc
AVUser *user = [AVUser currentUser];
AVRelation *relation = [user relationforKey:@"myLikes"];
AVObject *post = [AVObject objectWithClassName:@"post"];
[post setObject:@"article content" forKey:@"content"];
[post save];
[relation addObject:post];
[user save];


AVQuery * query = [AVRelation revereseQuery:user.className relationKey:@"myLikes" childObject:post];
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
   // 得到用户列表
}];

```

要了解 `AVQuery` 更多的用法，请阅读本文的 [查询](#查询) 部分。`AVRelation` 的行为接近于 `AVObject` 中的 `Array`，所以在对象数组上的任何操作也同样适用于 `AVRelation`。

**请阅读《[关系建模指南](./relation_guide.html)》来进一步了解关系类型。**

### 数据类型

到目前为止，我们已经用过的数据类型有 `NSString`、 `NSNumber`、 `AVObject`。LeanCloud 还支持 `NSDate` 和 `NSData`。

此外，`NSDictionary` 和 `NSArray` 支持嵌套，这样在一个 `AVObject` 中就可以使用它们来储存更多结构化的数据。例如：

```objc
NSNumber *number = [NSNumber numberWithInt:42];
NSString *string = [NSString stringWithFormat:@"the number is %i", number];
NSDate *date = [NSDate date];
NSData *data = [@"foo" dataUsingEncoding:NSUTF8StringEncoding];
NSArray *array = [NSArray arrayWithObjects:string, number, nil];
NSDictionary *dictionary = [NSDictionary dictionaryWithObjectsAndKeys:number, @"number",
                                                                      string, @"string",
                                                                      nil];

AVObject *bigObject = [AVObject objectWithClassName:@"BigObject"];
[bigObject setObject:number     forKey:@"myNumber"];
[bigObject setObject:string     forKey:@"myString"];
[bigObject setObject:date       forKey:@"myDate"];
[bigObject setObject:data       forKey:@"myData"];
[bigObject setObject:array      forKey:@"myArray"];
[bigObject setObject:dictionary forKey:@"myDictionary"];
[bigObject saveInBackground];
```

我们**不推荐**在 `AVObject` 中使用 `NSData` 类型来储存大块的二进制数据，比如图片或整个文件。每个 `AVObject` 的大小都不应超过 128 KB。如果需要储存更多的数据，我们建议使用 `AVFile`。更多细节可以阅读本文的 [文件](#文件) 部分。

如果想了解更多有关 LeanCloud 如何解析处理数据的信息，请查看我们的文档《[数据与安全](../data_security.html)》。

## 查询

我们已经看到 `AVQuery` 是如何通过 `getObjectWithId:` 从 LeanCloud 中来检索单个 `AVObject`。 此外，还有许多种检索 `AVQuery` 数据的方法 —— 你可以一次检索许多对象，在要检索的对象上设定条件，自动缓存查询结果来避免亲自编写这部分的代码。当然除此之外，还有更多方法。

### 基本查询

在许多情况下，`getObjectInBackgroundWithId: block:` 并不足以找到目标对象。`AVQuery` 不仅可以检索单一对象，还允许以不同的检索方式来得到包含多个对象的列表。

一般的方式是创建一个 `AVQuery` 并设定相应的条件，然后用 `findObjectsInBackgroundWithBlock:` 来检索得到一个与 `AVObject` 匹配的 `NSArray`。

例如，要按特定的 `playerName` 来检索分数，那么使用方法 `whereKey: equalTo:`，通过设置一对键值来设定检索条件。

```objc
AVQuery *query = [AVQuery queryWithClassName:@"GameScore"];
[query whereKey:@"playerName" equalTo:@"Smith"];
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (!error) {
    // 检索成功
    NSLog(@"Successfully retrieved %d scores.", objects.count);
  } else {
    // 输出错误信息
    NSLog(@"Error: %@ %@", error, [error userInfo]);
  }
}];
```

`findObjectsInBackgroundWithBlock:` 可以保证在完成网络请求的同时不阻塞主线程中的「块」和「回调」。

如果已运行在后台线程之中，使用 `findObjects` 方法可阻塞调用进程：

```objc
// 下面的代码仅可用于测试目的，或已在后台线程之中运行
AVQuery *query = [AVQuery queryWithClassName:@"GameScore"];
[query whereKey:@"playerName" equalTo:@"Smith"];
NSArray* scoreArray = [query findObjects];
```

### 查询约束

给 `AVQuery` 的检索添加约束条件有多种方法。

用 `whereKey: notEqualTo:` 和键值来设定约束条件：

```objc
[query whereKey:@"playerName" notEqualTo:@"Smith"];
```

一次查询可以设置多个约束条件，只有满足所有条件的对象才被返回，这相当于使用 AND 类型的查询条件。

```objc
[query whereKey:@"playerName" notEqualTo:@"Smith"];
[query whereKey:@"playerAge" greaterThan:[NSNumber numberWithInt:18]];
```

用 `limit` 属性来控制返回结果的数量，默认为 100，允许数值范围从 1 到 1000。

```objc
query.limit = 10; // 最多返回 10 条结果
```

如果只需获取一个结果，直接使用 `getFirstObject` 或 `getFirstObjectInBackground`。

```objc
AVQuery *query = [AVQuery queryWithClassName:@"GameScore"];
[query whereKey:@"playerEmail" equalTo:@"dstemkoski@example.com"];
[query getFirstObjectInBackgroundWithBlock:^(AVObject *object, NSError *error) {
  if (!object) {
    NSLog(@"getFirstObject 请求失败。");
  } else {
    // 查询成功
    NSLog(@"对象成功返回。");
  }
}];
```

用 `skip` 来跳过初始结果，这对于分页十分有用：

```objc
query.skip = 10; // 跳过前 10 条结果
```
对于合适的数据类型，如数字和字符串，可对返回结果进行排序:

```objc
// 升序排列分数 score 字段
[query orderByAscending:@"score"];

// 降序排列分数 score 字段
[query orderByDescending:@"score"];
```
一个查询可添加多个排序键：

```objc
// 如果上一个排序键相等，则升序排列分数 score 字段
[query addAscendingOrder:@"score"];

// 如果上一个排序键相等，则降序排列分数 score 字段
[query addDescendingOrder:@"score"];
```
对于合适的数据类型，可在查询中使用「比较」：

```objc
// wins < 50
[query whereKey:@"wins" lessThan:[NSNumber numberWithInt:50]];

// wins <= 50
[query whereKey:@"wins" lessThanOrEqualTo:[NSNumber numberWithInt:50]];

// wins > 50
[query whereKey:@"wins" greaterThan:[NSNumber numberWithInt:50]];

// wins >= 50
[query whereKey:@"wins" greaterThanOrEqualTo:[NSNumber numberWithInt:50]];
```

`whereKey:containedIn:` 可查询包含不同值的对象。它接受数组，可实现用单一查询来代替多个查询。

```objc
// 找出球员 Jonathan、Dario、或 Shawn的成绩 
NSArray *names = [NSArray arrayWithObjects:@"Jonathan Walsh",
                                           @"Dario Wunsch",
                                           @"Shawn Simon",
                                           nil];
[query whereKey:@"playerName" containedIn:names];
```

相反， 要查询不包含某些值的对象，则使用 `whereKey:notContainedIn:` 。

```objc
// 找出除了 Jonathan、Dario 和 Shawn 以外，其他球员的成绩 
NSArray *names = [NSArray arrayWithObjects:@"Jonathan Walsh",
                                           @"Dario Wunsch",
                                           @"Shawn Simon",
                                           nil];
[query whereKey:@"playerName" notContainedIn:names];
```

`whereKeyExists` 用来查询具备某一键集条件的对象，`whereKeyDoesNotExist` 正好相反。

```objc
// 找到有成绩 score 的对象
[query whereKeyExists:@"score"];

// 找到没有成绩 score 的对象
[query whereKeyDoesNotExist:@"score"];
```

如果要用一个对象中的键值，去匹配另一个查询所得到的对象中的一个键值，来得到最终结果，可以使用 `whereKey:matchesKey:inQuery:` 。

例如，一个类 `Team` 有球队的信息，另一个类有用户的信息，要找出自己家乡球队总赢球的那些用户，代码如下：

```objc
AVQuery *teamQuery = [AVQuery queryWithClassName:@"Team"];
[teamQuery whereKey:@"winPct" greaterThan:[NSNumber withDouble:0.5]];
AVQuery *userQuery = [AVQuery queryForUser];
[userQuery whereKey:@"hometown" matchesKey:@"city" inQuery:teamQuery];
[userQuery findObjectsInBackgroundWithBlock:^(NSArray *results, NSError *error) {
    // results will contain users with a hometown team with a winning record
}];
```
相反，要从一个查询中获取一组对象，该对象的一个键值，与另一个对象的键值并不匹配，可以使用 `whereKey:doesNotMatchKey:inQuery:` 。例如，找出家乡球队表现不佳的那些用户记录：

```objc
AVQuery *losingUserQuery = [AVQuery queryForUser];
[losingUserQuery whereKey:@"hometown" doesNotMatchKey:@"city" inQuery:teamQuery];
[losingUserQuery findObjectsInBackgroundWithBlock:^(NSArray *results, NSError *error) {
    // results will contain users with a hometown team with a losing record
}];
```
将 `selectKeys:` 搭配 `NSArray` 类型的键值来使用可以限定查询返回的字段。

例如，让查询结果只包含 `playerName` 和 `score` 字段（也可以是内置字段，如 `objectId`、 `createdAt`， 或 `updatedAt`）：

```objc
AVQuery *query = [AVQuery queryWithClassName:@"GameScore"];
[query selectKeys:@[@"playerName", @"score"]];
NSArray *results = [query findObjects];
```
其余字段可以稍后对返回的对象调用 `fetchIfNeeded` 的变体来获取：

```objc
AVObject *object = (AVObject*)[results objectAtIndex:0];
[object fetchIfNeededInBackgroundWithBlock:^(AVObject *object, NSError *error) {
  // 返回该对象的所有字段
}];
```
### 查询数组值

当键值为数组类型时，用 `equalTo:` 来从数组中找出包含单个值的对象：

```objc
// 找出 arrayKey 中包含 2 的对象
[query whereKey:@"arrayKey" equalTo:[NSNumber numberWithInt:2]];
```

用 `containsAllObjectsInArray:` 来找出含有多个值的对象:

```objc
// 找出 arrayKey 中包含 2、3、4 的对象
[query whereKey:@"arrayKey" containsAllObjectsInArray:@[@2, @3, @4]];
```

### 查询字符串值

使用 `whereKey: hasPrefix:` 来找到以特定字符串开头的结果，这有点像 MySQL 的 `LIKE` 条件。因为支持索引，所以该操作对于大数据集也很高效。

```objc
// 找出名字以 "Big Daddy's" 开头的烤肉调料
AVQuery *query = [AVQuery queryWithClassName:@"BarbecueSauce"];
[query whereKey:@"name" hasPrefix:@"Big Daddy's"];
```

### 关系查询
查询关系数据有几种方法。

如果用某个属性去匹配一个已知的 `AVObject` 对象，仍然可以使用 `whereKey: equalTo:` ，就像使用其他数据类型一样。

例如，如果每个 `Comment` 的 `post` 字段都有一个 `Post` 对象，那么找出指定 Post 下的评论:

```objc
// 假设前面已经创建好了 myPost 这个 AVObject 对象
AVQuery *query = [AVQuery queryWithClassName:@"Comment"];
[query whereKey:@"post" equalTo:myPost];

[query findObjectsInBackgroundWithBlock:^(NSArray *comments, NSError *error) {
    // comments 包含了 myPost 下的所有评论
}];
```

也可以通过 `ObjectId` 做关系查询:

```objc
[query whereKey:@"post"
        equalTo:[AVObject objectWithoutDataWithClassName:@"Post" objectId:@"51c912bee4b012f89e344ae9"];
```
如果要匹配的是一个查询类型的对象，要使用 `whereKey: matchesQuery`。例如，找出所有带图片的文章的评论：

```objc
AVQuery *innerQuery = [AVQuery queryWithClassName:@"Post"];
[innerQuery whereKeyExists:@"image"];
AVQuery *query = [AVQuery queryWithClassName:@"Comment"];
[query whereKey:@"post" matchesQuery:innerQuery];
[query findObjectsInBackgroundWithBlock:^(NSArray *comments, NSError *error) {
    // comments now contains the comments for posts with images
}];
```
注意：默认返回记录数 100 和最多返回记录数 1000 也适用于内嵌查询，所以在处理大型数据集时，你可能需要仔细设置查询条件才能得到想要的结果。

相反，`whereKey: doesNotMatchQuery:` 是查找一个对象的某个属性不匹配另一个查询对象的结果。例如，找出所有 不带图片的文章的评论：

```objc
AVQuery *innerQuery = [AVQuery queryWithClassName:@"Post"];
[innerQuery whereKeyExists:@"image"];
AVQuery *query = [AVQuery queryWithClassName:@"Comment"];
[query whereKey:@"post" doesNotMatchQuery:innerQuery];
[query findObjectsInBackgroundWithBlock:^(NSArray *comments, NSError *error) {
    // comments 包含了所有没有图片的文章上的评论
}];
```

有时你可能需要在一个查询中返回多个类型的相关对象，这时可使用方法 `includeKey:`。

例如，搜索最近的十条评论，并同时获得与之对应的文章：

```objc
AVQuery *query = [AVQuery queryWithClassName:@"Comment"];

// 取回最新创建的记录
[query orderByDescending:@"createdAt"];

// 只取回前十条记录
query.limit = [NSNumber numberWithInt:10];

// 查询每条评论所对应的文章
[query includeKey:@"post"];

[query findObjectsInBackgroundWithBlock:^(NSArray *comments, NSError *error) {
    // comments 包含了最近十条评论, post 字段也已有数据
    for (AVObject *comment in comments) {
         // 并不需要网络访问
         AVObject *post = [comment objectForKey:@"post"];
         NSLog(@"retrieved related post: %@", post);
    }
}];
```

**你还可以用点（`.`）来查询多层级的数据**。

例如，在结果中加入评论所对应的文章的作者：

```objc
[query includeKey:@"post.author"];
```
`includeKey:` 可在一个查询中多次使用，它也跟 `AVQuery` 的 `getFirstObject` 和 `getObjectInBackground` 等辅助方法配合使用。

还有这样一种情况，当某些对象包括多个键，而某些键对应的值的数据量又比较大，此时你并不需要返回全部数据，而只返回特定键所对应的数据时，可以用 `selectKeys:`：

```objc
AVQuery * query = [AVQuery queryWithClassName:@"someClass"];
[query selectKeys:@[@"key"]];
AVObject * result = [query getFirstObject];
```

只返回指定键对应的有限数据，而非所有数据，有助于节省网络带宽和计算资源。

### 缓存查询
在磁盘上缓存请求结果通常是很有用的，这样就算设备离线，应用刚刚打开，网络请求尚未完成时，数据也能显示出来。当缓存占用太多空间时，LeanCloud 会自动对其清理。

默认的查询行为不使用缓存，可设置 `query.cachePolicy` 来启用缓存。例如，当网络不可用时，尝试网络连接并同时取回缓存的数据:

```objc
AVQuery *query = [AVQuery queryWithClassName:@"GameScore"];
query.cachePolicy = kPFCachePolicyNetworkElseCache;

//设置缓存有效期
query.maxCacheAge = 24*3600;

[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  if (!error) {
    // Results were successfully found, looking first on the
    // network and then on disk.
  } else {
    // The network was inaccessible and we have no cached data for
    // this query.
  }
}];

```
LeanCloud 提供了几个不同的缓存策略：

* `kPFCachePolicyIgnoreCache`
  查询行为不从缓存中加载，也不会将结果保存到缓存中。`kPFCachePolicyIgnoreCache` 是默认的缓存策略。

* `kPFCachePolicyCacheOnly`
  查询行为会忽略网络状况，只从缓存中加载。如果没有缓存的结果，这个策略会导致 `AVError`。

* `kPFCachePolicyCacheElseNetwork`
  查询行为首先尝试从缓存中加载，如果加载失败，它会通过网络加载结果。如果缓存和网络中获取的行为都失败了，会产生 `AVError`。

* `kPFCachePolicyNetworkElseCache`
  查询行为首先尝试从网络中加载，如果加载失败，它会从缓存中加载结果。如果缓存和网络中获取的行为都失败了，会产生 `AVError`。

* `kPFCachePolicyCacheThenNetwork`
  查询首先从缓存中加载，然后从网络加载。在这种情况下,回调函数会被调用两次，第一次是缓存中的结果，然后是从网络获取的结果。因为它在不同的时间返回两个结果，这个缓存策略不能和 `findObjects` 同时使用。

如果需要控制缓存的行为，可以使用 `AVQuery` 提供的相应的方法：

* 检查是否存在缓存查询结果:

  ```objc
  BOOL isInCache = [query hasCachedResult];
  ```

* 删除任何缓存查询结果:

  ```objc
  [query clearCachedResult];
  ```

* 删除缓存查询结果:

  ```objc
  [AVQuery clearAllCachedResults];
  ```

* 设定缓存结果最长时限:

  ```objc
  query.maxCacheAge = 60 * 60 * 24; // 一天的秒数
  ```

查询缓存也适用于 `AVQuery` 的辅助方法，包括 `getFirstObject` 和 `getObjectInBackground`。

### 对象计数

如果只需要得到查询出来的对象数量，不需要检索匹配的对象，这时，可以用 `countObjects` 来代替 `findObjects`。

例如，计算一下某位球员参加了多少场比赛：

```objc
AVQuery *query = [AVQuery queryWithClassName:@"GameScore"];
[query whereKey:@"playername" equalTo:@"Sean Plott"];
[query countObjectsInBackgroundWithBlock:^(int count, NSError *error) {
  if (!error) {
    // 查询成功，输出计数
    NSLog(@"Sean has played %d games", count);
  } else {
    // 查询失败
  }
}];
```

`countObjects` 是一种同步式的方法，因此使用它可以阻止调用线程。

对于类，以及数量超过 1000 个的对象，计数操作很可能会导致响应超时，或者返回近似精确的数值，所以在构建程序时，应该尽量避免这样的操作。

### 复合查询
如果想从多个查询中找出相匹配的对象，可以使用方法 `orQueryWithSubqueries:`。

例如，找出赢了很多场比赛或者只赢了几场比赛的球员：

```objc
AVQuery *lotsOfWins = [AVQuery queryWithClassName:@"Player"];
[lotsOfWins whereKey:@"wins" greaterThan:[NSNumber numberWithInt:150]];

AVQuery *fewWins = [AVQuery queryWithClassName:@"Player"];
[fewWins whereKey:@"wins" lessThan:[NSNumber numberWithInt:5]];
AVQuery *query = [AVQuery orQueryWithSubqueries:[NSArray arrayWithObjects:fewWins,lotsOfWins,nil]];
[query findObjectsInBackgroundWithBlock:^(NSArray *results, NSError *error) {
  // 返回赢球次数大于 150 场或小于 5 场的球员
  }];
```

你可以对新创建的 `AVQuery` 添加额外的约束，多个约束将以 AND 操作符来联接。

注意：在复合查询的子查询中，不能使用非过滤性的约束（如 `limit`、 `skip`、`orderBy...:`、 `includeKey:`）。

### Cloud Query Language（CQL）查询
我们也提供了类似于 SQL 语言的查询语言 CQL，使用方法如下：

```objc
    NSString *cql = [NSString stringWithFormat:@"select * from %@", @"ATestClass"];
    AVCloudQueryResult *result = [AVQuery doCloudQueryWithCQL:cql];
    NSLog(@"results:%@", result.results);

    cql = [NSString stringWithFormat:@"select count(*) from %@", @"ATestClass"];
    result = [AVQuery doCloudQueryWithCQL:cql];
    NSLog(@"count:%lu", (unsigned long)result.count);
```
通常，查询语句会使用变量参数。为此，我们提供了与 Java JDBC 所使用的     `PreparedStatement` 占位符查询相类似的语法结构。

```objc
    NSString *cql = [NSString stringWithFormat:@"select * from %@ where durability = ? and name = ?", @"ATestClass"];
    NSArray *pvalues =  @[@100,@"祈福"];
    [AVQuery doCloudQueryInBackgroundWithCQL:cql pvalues:pvalues callback:^(AVCloudQueryResult *result, NSError *error) {
        if (!error) {
            //do something
        } else {
            NSLog(@"%@", error);
        }
    }];
```
可变参数 `100` 和 `"祈福"` 会自动替换查询语句中的问号位置（按问号出现的先后顺序）。我们更推荐使用占位符语法，理论上这样会降低 CQL 转换的性能开销。

关于 CQL 的详细介绍，请参考 [Cloud Query Language 详细指南](cql_guide.html)。

## 子类化

LeanCloud 设计的目标是让你的应用尽快运行起来。 你可以用 `AVObject` 访问到所有的数据，用 `objectForKey:` 获取任意字段。 在成熟的代码中，子类化有很多优势，包括降低代码量，具有更好的扩展性，和支持自动补全。子类化是可选的，请参照下面的例子：

    AVObject *student=[AVObject objectWithClassName:@"Student"];
    [student setObject:@"小明" forKey:@"name"];
    [student saveInBackground];

可改写成:

    Student *student=[Student object];
    student.name=@"小明";
    [student saveInBackground];

这样代码看起来是不是更简洁呢？

### 子类化的实现

要实现子类化，需要下面几个步骤：

1. 导入 `AVObject+Subclass.h`；
2. 继承 `AVObject` 并实现 `AVSubclassing` 协议；
3. 实现类方法 `parseClassName`（返回的字符串是原本要传给 `initWithClassName:` 的, 并且以后就不需要再进行跟对象名称有关的配置了。如果不实现，默认返回的是类的名字。**请注意： `AVUser` 子类化后必须返回 `_User`**）；
4. 在实例化子类之前调用 `[YourClass registerSubclass]`（**在应用当前生命周期中，只需要调用一次**，所以建议放在 `ApplicationDelegate` 中，在 `[AVOSCloud setApplicationId:clientKey:]` 前后调用即可）。

下面是实现 `Student` 子类化的例子:

```objc
  //Student.h
  #import <AVOSCloud/AVOSCloud.h>

  @interface Student : AVObject <AVSubclassing>

  @property(nonatomic,copy) NSString *name;

  @end


  //Student.m
  #import "Student.h"

  @implementation Student

  @dynamic name;

  + (NSString *)parseClassName {
      return @"Student";
  }

  @end


  // AppDelegate.m
  #import <AVOSCloud/AVOSCloud.h>
  #import "Student.h"

  - (BOOL)application:(UIApplication *)application
  didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [Student registerSubclass];
    [AVOSCloud setApplicationId:appid clientKey:appkey];
  }
```


### 属性

为 `AVObject` 的子类添加自定义的属性和方法，可以更好地将这个类的逻辑封装起来。用 `AVSubclassing` 可以把所有的相关逻辑放在一起，这样不必再使用不同的类来区分业务逻辑和存储转换逻辑了。

`AVObject` 支持动态 `synthesizer`，就像 `NSManagedObject` 一样。先正常声明一个属性，只是在 `.m` 文件中把 `@synthesize` 变成 `@dynamic`。

请看下面的例子是怎么添加一个年龄的属性：

```objc
  //Student.h
  #import <AVOSCloud/AVOSCloud.h>

  @interface Student : AVObject <AVSubclassing>

  @property int age;

  @end


  //Student.m
  #import "Student.h"

  @implementation Student

  @dynamic age;

  ......
```

这样就可以通过 `student.age=19` 这样的方式来读写 `age` 字段了，当然也可以写成： 
```objc
[student setAge:19]
```

**注意：属性名称保持首字母小写！**（错误：`student.Age` 正确：`student.age`）。

`NSNumber` 类型的属性可以被实现为 `NSNumber` 或者是它的原始数据类型（`int`、 `BOOL` 等），在这个例子中， `[student objectForKey:@"age"]` 返回的是一个 `NSNumber` 类型，而直接取属性是 `int` 类型。下面的这个属性同样适用：

```objc
@property BOOL isTeamMember;
```

你可以根据自己的需求来选择使用哪种类型。原始类型更易用，而 `NSNumber` 支持 `nil` 值，这样可以让结果更清晰易懂。

注意：`AVRelation` 同样可以作为子类化的一个属性来使用，比如：

```objc
@interface Student : AVUser <AVSubclassing>
@property(retain) AVRelation *friends
  ......
```

如果要使用更复杂的逻辑而不是简单的属性访问，可以这样实现:

```objc
  @dynamic iconFile;

  - (UIImageView *)iconView {
    UIImageView *view = [[UIImageView alloc] initWithImage:kPlaceholderImage];
    view.image = [UIImage imageNamed:self.iconFile];
    return [view autorelease];
  }

```

### 针对 AVUser 子类化的特别说明

假如现在已经有一个基于 `AVUser` 的子类，如上面提到的 `Student`:

```objc
@interface Student : AVUser<AVSubclassing>
@property (retain) NSString *displayName;
@end


@implementation Student
@dynamic displayName;
+ (NSString *)parseClassName {
    return @"_User";
}
@end
```

登录时需要调用 `Student` 的登录方法才能通过 `currentUser` 得到这个子类:

```objc
[Student logInWithUsernameInBackground:@"USER_NAME" password:@"PASSWORD" block:^(AVUser *user, NSError *error) {
        Student *student = [AVUser currentUser];
        studen.displayName = @"YOUR_DISPLAY_NAME";
    }];
```

### 初始化子类

创建一个子类实例，要使用 `object` 类方法。要创建并关联到已有的对象，请使用 `objectWithoutDataWithObjectId:` 类方法。

### 子类查询

使用类方法 `query` 可以得到这个子类的查询对象。

例如，查询年龄小于 21 岁的学生：

```objc
  AVQuery *query = [Student query];
  [query whereKey:@"age" lessThanOrEqualTo:@"21"];
  [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    if (!error) {
      Student *stu1 = [objects objectAtIndex:0];
      // ...
    }
  }];
```

## ACL权限控制

ACL（Access Control List）是一种最灵活而且简单的应用数据安全管理方法。通俗的解释就是为每一个数据创建一个访问的白名单列表，只有在名单上的用户（ `AVUser`）或者具有某种角色（`AVRole`）的用户才能被允许访问。为了更好地保证用户数据安全性，LeanCloud 每一张表中都有一个 ACL 列。

当然，LeanCloud 还提供了进一步的读写权限控制。一个  User 必须拥有读权限（或者属于一个拥有读权限的 Role）才可以获取一个对象的数据；同时，一个 User 需要写权限（或者属于一个拥有写权限的 Role）才可以更改或者删除一个对象。

以下列举了几种在 LeanCloud 常见的 ACL 使用范例。

### 默认访问权限
在没有显式指定的情况下，LeanCloud 中的每一个对象都会有一个默认的 ACL 值。这个值代表了所有的用户，对这个对象都是可读可写的。此时在 LeanCloud 帐户的「数据管理」列表中的 ACL 属性列，会看到这样的值:

```json
    {"*":{"read":true,"write":true}}
```

对应的 Objective-C 代码是：

```objc
    AVACL *acl = [AVACL ACL];
    [acl setPublicReadAccess:YES];
    [acl setPublicWriteAccess:YES];
```
当然正如上文提到的，默认的 ACL 并不需要进行显式指定。

### 指定用户访问权限
当一个用户在实现一个网盘类应用时，针对不同文件的私密性，用户就需要不同的文件访问权限。譬如公开的文件，每一个其他用户都有读的权限，然后仅仅只有创建者才拥有更改和删除的权限。

```objc

    AVACL *acl = [AVACL ACL];
    
    //此处设置的是所有人的可读权限
    [acl setPublicReadAccess:YES]; 
    
    //而这里设置了文件创建者的写权限
    [acl setWriteAccess:YES forUser:[AVUser currentUser]]; 

    AVObject * object = [AVObject objectWithClassName:@"iOSAclTest"];

    object.ACL=acl;
    [object save];

```

当然用户也会上传一些隐私文件，只有这些文件的创建者才对这些文件拥有读写权限：

```objc
    [acl setWriteAccess:YES forUser:[AVUser currentUser]];
```
注：一旦显式设置 ACL，默认的 ACL 就会被覆盖。

### 指定角色访问权限

#### AVUser 与 AVRole 的从属关系
指定用户访问权限虽然很方便，但是依然会有局限性。

以工资系统为例，一家公司的工资系统，工资最终的归属者和公司的出纳们只对工资有读的权限，而公司的人事和老板才拥有全部的读写权限。当然你可以通过多次设置指定用户的访问权限来实现这一功能（多个用户的 ACL 设置是追加的而非覆盖）。

```objc
    AVObect *salary = [AVObject objectWithClassName:@"Salary"];
    [salary setObject:@(2000000) forKey:@"value"];

    //这里为了方便说明, 直接声明了变量, 但没有实现
    AVUser *boss;//假设此处为老板
    AVUser *hrWang;  //人事小王
    AVUser *me; //我们就在文档里爽一爽吧
    AVUser *cashierZhou; //出纳老周


    AVACL *acl = [AVACL ACL];

    //4 个人都有可读权限
    [acl setReadAccess:YES forUser:boss];
    [acl setReadAccess:YES forUser:hrWang];
    [acl setReadAccess:YES forUser:cashierZhou];
    [acl setReadAccess:YES forUser:me];

    //只有 2 个人可写
    [acl setWriteAccess:YES forUser:boss];
    [acl setWriteAccess:YES forUser:hrWang];

    [salary setACL:acl];
    [salary save];


```

但是要涉及其中的人可能不止一个，也有离职换岗新员工的问题存在。这样的代码既不优雅，也太啰嗦，同样会很难维护。这个时候我们就引入了 `AVRole` 来解决这个问题。

公司的员工可以成百上千，然而一个公司组织里的角色却能够在很长一段时间内保持相对稳定。

```objc
    AVObect *salary = [AVObject objectWithClassName:@"Salary"];
    [salary setObject:@(2000000) forKey:@"value"];

    //这里为了方便说明, 直接声明了变量, 但没有实现
    AVUser *boss;//假设此处为老板
    AVUser *hrWang;  //人事小王
    AVUser *me; //我们就在文档里爽一爽吧
    AVUser *cashierZhou; //出纳老周
    AVUser *cashierGe;//出纳小葛

    //这段代码可能放在员工管理界面更恰当，但是为了示意，我们就放在这里
    AVRole *hr =[AVRole roleWithName:@"hr"];
    AVRole *cashier = [AVRole roleWithName:@"cashier"];

    [[hr users] addObject:hrWang];
    [hr save];
    //此处对应的是 AVRole 里面有一个叫做 users 的 Relation 字段
    [[cashier users] addObject:cashierZhou];
    [[cashier users] addObject:cashierGe];
    [cashier save];

    AVACL *acl = [AVACL ACL];
    //老板假设只有一个
    [acl setReadAccess:YES forUser:boss];
    [acl setReadAccess:YES forUser:me];

    [acl setReadAccess:YES forRole:hr];
    [acl setReadAccess:YES forRole:cashier];

    [acl setWriteAccess:YES forUser:boss];
    [acl setWriteAccess:YES forRole:hr];

    [salary setACL:acl];
    [salary save];
```

当然如果考虑到一个角色（`AVRole`）里面有多少员工（`AVUser`），编辑这些员工可需要做权限控制，`AVRole` 同样也有 `setACL` 方法可以使用。

#### AVRole 之间的从属关系

在讲清楚了用户与角色的关系后，我们还有一层角色与角色之间的关系，下面的例子或许可以帮助你理解这个概念。

一家创业公司有移动部门，部门下面有不同的小组（Android 和 iOS），每个小组只对自己组的代码拥有「读写」权限，但他们同时对核心库代码拥有「读取」权限。

```objc
    AVRole *androidTeam = [AVRole roleWithName:@"AndroidTeam"];
    AVRole *iOSTeam = [AVRole roleWithName:@"IOSTeam"];
    AVRole *mobileDep = [AVRole roleWithName:@"MobileDep"];

    [androidTeam save];
    [iOSTeam save];

    [[mobileDep roles] addObject:androidTeam];
    [[mobileDep roles] addObject:iOSTeam];

    [mobileDep save];

    AVObject *androidCode = [AVObject objectWithClassName:@"Code"];
    AVObject *iOSCode = [AVObject objectWithClassName:@"Code"];
    AVObject *coreCode = [AVObject objectWithClassName:@"Code"];
    //.....此处省略一些具体的值设定

    AVACL *acl1=[AVACL ACL];
    [acl1 setReadAccess:YES forRole:androidTeam];
    [acl1 setWriteAccess:YES forRole:androidTeam];
    [androidCode setACL:acl1];

    AVACL *acl2=[AVACL ACL];
    [acl2 setReadAccess:YES forRole:iOSTeam];
    [acl2 setWriteAccess:YES forRole:iOSTeam];
    [iOSCode setACL:acl2];

    AVACL *acl3=[AVACL ACL];
    [acl3 setReadAccess:YES forRole:mobileDep];
    [coreCode setACL:acl3];

    [androidCode save];
    [iOSTeam save];
    [coreCode save];
```

## 文件

### AVFile

`AVFile` 可以允许应用将文件存储到服务器上，支持的文件类型包括：图像文件、影像文件、音乐文件等常见的文件类型，以及任何其他二进制数据。

使用 `AVFile` 非常容易，首先把文件数据存在 `NSData` 中，然后由 `NSData` 创建一个 `AVFile` 对象。下面以存储一个字符串为例：

```objc
NSData *data = [@"Working with LeanCloud is great!" dataUsingEncoding:NSUTF8StringEncoding];
AVFile *file = [AVFile fileWithName:@"resume.txt" data:data];
```

请注意，在上例中，我们将文件名定为 `resume.txt`。这里需要注意两点：

* 你不需要担心文件名的冲突。每一个上传的文件有惟一的 ID，所以即使上传多个文件名为 `resume.txt` 的文件也不会有问题。
* 给文件添加扩展名非常重要，通过扩展名，LeanCloud 可以获取文件类型以便能正确处理文件。所以如果你将一个 PNG 图象存在 `AVFile` 中，要确保使用 `.png` 扩展名。

然后根据需要，调用不同版本的 `save` 方法，将文件存到 LeanCloud 上：

```objc
[file saveInBackground];
```

最终当文件存储完成后，你可以象操作其他对象那样，将 `AVFile` 关联到 `AVObject`。

```objc
AVObject *jobApplication = [AVObject objectWithClassName:@"JobApplication"]
[jobApplication setObject:@"Joe Smith" forKey:@"applicantName"];
[jobApplication setObject:file         forKey:@"applicantResumeFile"];
[jobApplication saveInBackground];
```

重新获取只需要调用 `AVFile` 的 `getData`。

```objc
AVFile *applicantResume = [anotherApplication objectForKey:@"applicantResumeFile"];
NSData *resumeData = [applicantResume getData];
```

也可以象 `AVObject` 那样，使用 `getData` 的异步版本。

**注意：如果将文件存储到对象的一个数组类型的属性内，那么必须在查询该对象的时候加上 `include` 该属性，否则查询出来的数组将是 `AVObject` 数组。**

### 图像

将图像转成 `NSData` 再使用 `AVFile` 就能很容易地将数据保存到 LeanCloud 上。

例如，把名为 `image` 的 `UIImage` 对象保存到 `AVFile` 中：

```objc
NSData *imageData = UIImagePNGRepresentation(image);
AVFile *imageFile = [AVFile fileWithName:@"image.png" data:imageData];
[imageFile save];

AVObject *userPhoto = [AVObject objectWithClassName:@"UserPhoto"];
[userPhoto setObject:@"My trip to Hawaii!" forKey:@"imageName"];
[userPhoto setObject:imageFile             forKey:@"imageFile"];
[userPhoto save];
```

### 进度提示

使用 `saveInBackgroundWithBlock: progressBlock:` 和 `getDataInBackgroundWithBlock: progressBlock:` 可以轻松得到 `AVFile` 的上传或者下载的进度。比如：

```objc
NSData *data = [@"Working at AVOS is great!" dataUsingEncoding:NSUTF8StringEncoding];
AVFile *file = [AVFile fileWithName:@"resume.txt" data:data];
[file saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
  // Handle success or failure here ...
} progressBlock:^(int percentDone) {
  // Update your progress spinner here. percentDone will be between 0 and 100.
}];
```

### 得到图像的缩略图

在保存图像时，如果想在下载原图之前先得到缩略图，用我们的 API 实现起来很轻松：

```objc
AVFile *file = [AVFile fileWithURL:@"the-file-remote-url"];
[file getThumbnail:YES width:100 height:100 withBlock:^(UIImage *image, NSError *error) {
    }];
```

### 文件元数据

若想把一些元数据保存在文件对象中，可以通过 `metadata` 属性来保存和获取这些数据：

```objc
AVFile *file = [AVFile fileWithName:@"test.jpg" contentsAtPath:@"file-local-path"];
[file.metadata setObject:@(100) forKey:@"width"];
[file.metadata setObject:@(100) forKey:@"height"];
[file.metadata setObject:@”LeanCloud" forKey:@"author"];
NSError *error = nil;
[file save:&error];
```

### 删除

当文件较多时，要把一些不需要的文件从 LeanCloud 上删除：

```objc
[file deleteInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
}];
```

### 清除缓存

`AVFile` 也提供了清除缓存的方法：

```objc
//清除当前文件缓存
- (void)clearCachedFile;

//类方法, 清除所有缓存
+ (BOOL)clearAllCachedFiles;

//类方法, 清除多久以前的缓存
+ (BOOL)clearCacheMoreThanDays:(NSInteger)numberOfDays;

```

## 用户

用户是一个应用程序的核心。对于个人开发者来说，能够让自己的应用程序积累更多的用户，就能给自己带来更多的创作动力。因此 LeanCloud 提供了一个专门的用户类，`AVUser` 来自动处理用户帐户管理所需的功能。

有了这个类，你就可以在应用程序中添加用户帐户功能。
`AVUser` 是一个 `AVObject` 的子类，它继承了 `AVObject` 所有的方法，具有 `AVObject` 相同的功能。不同的是，`AVUser` 增加了一些特定的与用户帐户相关的功能。

### 属性

`AVUser` 除了继承 `AVObject` 的属性外，还有几个特有的属性：

* `username` : 用户的用户名（必需）
* `password` : 用户的密码（必需）
* `email` : 用户的电子邮件地址（可选）

和其他 `AVObject` 对象不同的是，在设置 `AVUser` 这些属性时，不能用 `put` 方法，而用专门的 `set...` 方法。

### 注册

要求用户注册可能是应用程序要做第一件事。下面的代码是一个典型的注册过程：

```objc
AVUser *user = [AVUser user];
user.username = @"steve";
user.password =  @"f32@ds*@&dsa";
user.email = @"steve@company.com";
[user setObject:@"213-253-0000" forKey:@"phone"];

[user signUpInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
    if (succeeded) {

    } else {

    }
}];
```

在注册过程中，服务器会进行注册用户信息的检查，以确保注册的用户名和电子邮件地址是惟一的。

**服务端还会对用户密码进行不可逆的加密处理，不会明文保存任何密码，应用切勿再次在客户端加密密码，这会导致重置密码等功能不可用**。

请注意，我们使用的是 `signUpInBackgroundWithBlock` 方法，而不是 `saveInBackground` 方法。另外还有各种不同的 `signUp` 方法。

像往常一样，我们建议在可能的情况下尽量使用异步版本的 `signUp` 方法，这样就不会影响到应用程序主 UI 线程的响应。具体方法请参考 [API 文档](api/iOS/index.html) 。

如果注册不成功，要查看一下返回的错误对象。最有可能的情况是，用户名或电子邮件已经被另一个用户注册。这种情况你可以提示用户，要求他们尝试使用不同的用户名进行注册。
你也可以要求用户使用 Email 做为用户名注册。

这样做的好处是，在用户提交信息的时候可以将输入的「用户名」默认设置为用户的 Email 地址，以后在用户忘记密码的情况下可以使用 LeanCloud 提供「重置密码」功能。

关于自定义邮件模板和验证链接，请看这篇 [博客](http://blog.leancloud.cn/blog/2014/01/09/zi-ding-yi-ying-yong-nei-yong-hu-zhong-she-mi-ma-he-you-xiang-yan-zheng-ye-mian/) 。

### 登录

用户注册成功后，要让他们登录后才能开始使用应用，可以用 `AVUser` 类的 `loginInBackground` 方法。

```objc
[AVUser logInWithUsernameInBackground:@"username" password:@"password" block:^(AVUser *user, NSError *error) {
    if (user != nil) {

    } else {

    }
}];
```

### 当前用户

如果用户在每次打开应用程序时都要登录，这会直接影响用户体验。为了避免这种情况，可以将 `currentUser` 对象缓存起来。

每当用户成功注册或第一次成功登录后，就在本地磁盘中缓存下这 个用户对象，供下次调用：

```objc
AVUser *currentUser = [AVUser currentUser];
if (currentUser != nil) {
    // 允许用户使用应用
} else {
    //缓存用户对象为空时， 可打开用户注册界面…
}
```

要清除缓存用户对象：

```objc
//清除缓存用户对象
[AVUser logOut];  
// 现在的currentUser是nil了
AVUser *currentUser = [AVUser currentUser]; 
```

### 重置密码
我们都知道，应用一旦加入了用户登录功能，那么肯定会有用户忘记密码的情况发生。对于这种情况，我们为用户提供了一种安全重置密码的方法。

重置密码的过程很简单，用户只需要输入注册的电子邮件地址即可：

```objc
[AVUser requestPasswordResetForEmailInBackground:@"myemail@example.com" block:^(BOOL succeeded, NSError *error) {
    if (succeeded) {

    } else {

    }
}];
```

密码重置流程如下：

 * 用户输入注册的电子邮件，请求重置密码。
 * LeanCloud 向该邮箱发送一封包含重置密码的特殊链接的电子邮件。
 * 用户点击重置密码链接后，一个特殊的页面会打开，让他们输入新密码。
 * 用户的密码已被重置为新输入的密码。

关于自定义邮件模板和验证链接，请看这篇 [博客](http://blog.leancloud.cn/blog/2014/01/09/zi-ding-yi-ying-yong-nei-yong-hu-zhong-she-mi-ma-he-you-xiang-yan-zheng-ye-mian/) 。

### 修改密码

当用户系统中存在密码时，就会有更改密码的需求。我们所提供的方法能够同时验证老密码和修改新密码:

```objc
[AVUser logInWithUsername:@"username" password:@"111111"]; //请确保用户当前的有效登录状态
[[AVUser currentUser] updatePassword:@"111111" newPassword:@"123456" block:^(id object, NSError *error) {
    //doSomething
}];
```
如果要求更改密码的用户不在登录状态、原密码错误和用户不存在等情况都会通过 `callback` 返回。

###  手机号码验证

如果在应用设置中打开了 **注册手机号码验证** 选项，那么当用户在注册时填写完手机字段后，LeanCloud 会自动向该手机号码发送一条个验证短信，用户输入验证码后，该用户即被标识为已经验证过手机。

以下代码就可发送注册验证码到用户手机:

```objc
	AVUser *user = [AVUser user];
	user.username = @"steve";
	user.password =  @"f32@ds*@&dsa";
	user.email = @"steve@company.com";
	user.mobilePhoneNumber = @"13613613613";
	NSError *error = nil;
	[user signUp:&error];
```

调用以下代码即可验证验证码:

```objc
	[AVUser verifyMobilePhone:@"13613613613" withBlock:^(BOOL succeeded, NSError *error) {
        //验证结果
    }];
```

验证成功后，用户的 `mobilePhoneVerified` 属性变为     `true`，并会触发调用云代码的 `AV.Cloud.onVerifed('sms', function)` 方法。

### 手机号码登录

在手机号码被验证后，用户可以使用手机号码进行登录。手机号码包括两种方式：

* 手机号码＋密码方式
* 手机号码＋短信验证码

用「手机号码＋密码」来登录的方法：

```objc
    [AVUser logInWithMobilePhoneNumberInBackground:@"13613613613" password:@"yourpassword" block:^(AVUser *user, NSError *error) {

    }];
```

发送登录短信验证码：

```objc
    [AVUser requestLoginSmsCode:@"123456" withBlock:^(BOOL succeeded, NSError *error) {

    }];
```

最后使用「短信验证码＋手机号码」进行登录:

```objc
    [AVUser logInWithMobilePhoneNumberInBackground:@"13613613613" smsCode:smsCode block:^(AVUser *user, NSError *error) {

    }];
```

### 手机号码重置密码

和使用「电子邮件地址重置密码」类似，「手机号码重置密码」使用下面的方法获取短信验证码：

```objc
[AVUser requestPasswordResetWithPhoneNumber:@"18812345678" block:^(BOOL succeeded, NSError *error) {
    if (succeeded) {

    } else {

    }
}];
```

注意用户需要先绑定手机号码，然后使用短信验证码来重置密码：

```objc
[AVUser resetPasswordWithSmsCode:@"123456" newPassword:@"password" block:^(BOOL succeeded, NSError *error) {
    if (succeeded) {

    } else {

    }
}];
```

### 查询

需要使用特殊的用户查询对象来查询用户属性：

```objc
AVQuery *query = [AVUser query];
[query whereKey:@"gender" equalTo:@"female"];
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    if (error == nil) {

    } else {

    }
}];

```

###浏览器中查看用户表
用户表是一个特殊的表，专门存储 `AVUser` 对象。在浏览器端，打开  LeanCloud 帐户页面顶端的 **存储** 菜单，从左侧找到名为 `_User`的表来查看。

### 匿名用户

要创建匿名用户，可以使用 `AVAnonymousUtils` 来完成。通过如下代码，服务端会自动创建一个 `AVUser` 对象，其用户名为随机字符串。完成之后，`currentUser` 会被置为此用户对象。之后的修改、保存、登出等操作都可以使用 `currentUser` 来完成。

```objc
    [AVAnonymousUtils logInWithBlock:^(AVUser *user, NSError *error) {
        if (user) {

        } else {

        }
    }];
```

## 地理位置
LeanCloud 允许用户根据地球的经度和纬度坐标进行基于地理位置的信息查询。只要在 `AVObject` 的查询中添加一个 `AVGeoPoint` 的对象查询，即可轻松实现查找出离当前用户最接近的信息或地点的功能。

### 地理位置对象
首先要创建一个 `AVGeoPoint` 对象。例如，创建一个北纬 `40.0` 度、东经 `-30.0` 度的 `AVGeoPoint` 对象：

```objc
AVGeoPoint * point = [AVGeoPoint geoPointWithLatitude:40.0 longitude:-30.0];new AVGeoPoint(40.0, -30.0);
```

添加地理位置信息：

```objc
[placeObject setObject:point forKey:@"location"];
```

### 地理查询

假设现在数据表中已保存了一部分的地理坐标对象的数据，接下来使用 `AVQuery` 对象的 `whereNear` 方法来试着找出最接近某个点的信息：

```objc
AVObject *userObject = nil;
AVGeoPoint *userLocation =  (AVGeoPoint *) [userObject objectForKey:@"location"];
AVQuery *query = [AVQuery queryWithClassName:@"PlaceObject"];
[query whereKey:@"locaton" nearGeoPoint:userLocation];
//获取最接近用户地点的10条数据
query.limit = 10;      
NSArray<AVObject *> nearPlaces = [query findObjects];
```

在上面的代码中， `nearPlaces` 返回的是一个距离 `userLocation` 点（最近到最远）的对象数组。

要限制查询指定「距离范围」的数据，可以用 `whereWithinKilometers` 、 `whereWithinMiles` 或 `whereWithinRadians` 方法。

要查询一个矩形范围内的信息，可使用 `whereWithinGeoBox` 来实现：

```objc
AVGeoPoint *northeastOfSF = [AVGeoPoint geoPointWithLatitude:37.9 longitude:40.1];
AVGeoPoint *southwestOfSF = [AVGeoPoint geoPointWithLatitude:37.8 longitude:40.04];
AVQuery *query = [AVQuery queryWithClassName:@"PizzaPlaceObject"];
[query whereKey:@"location" withinGeoBoxFromSouthwest:southwestOfSF toNortheast:northeastOfSF];
NSArray<AVObject *> *pizzaPlacesInSF = [query findObjects];
```

###注意事项
目前需要注意以下方面：

 * 每个 `AVObject` 数据对象中只能有一个 `AVGeoPoint` 对象。
 * 地理位置的点不能超过规定的范围。纬度的范围应该是在 `-90.0` 到 `90.0` 之间，经度的范围应该是在 `-180.0` 到 `180.0` 之间。如果添加的经纬度超出了以上范围，将导致程序错误。
 * iOS 8.0 之后使用定位服务前需要调用 `[locationManager requestWhenInUseAuthorization]` 或 `[locationManager requestAlwaysAuthorization]` 获取用户使用期授权或永久授权，而这两个请求授权需要在 `info.plist` 里面对应添加 `NSLocationWhenInUseUsageDescription` 或 `NSLocationWhenInUseUsageDescription` 的 键值对，值为开启定位服务原因的描述，SDK 内部默认使用的是使用期授权。

## 调用云代码

### 调用云代码函数

使用 `AVCloud` 类的静态方法来调用云代码中定义的函数：

```objc
  NSDictionary *parameters=@{...};

    [AVCloud callFunctionInBackground:@"aFunctionName" withParameters:parameters block:^(id object, NSError *error) {
        // 执行结果
    }];
```

`aFunctionName` 是函数的名称，`parameters` 是传入的函数参数，`block` 对象作为调用结果的回调传入。

### 区分生产环境调用

云代码区分「测试」和「生产」环境, 所以可以通过设置 `AVCloud` 来调用不同的环境：

```objc
[AVCloud setProductionMode:NO];
```
其中 `NO` 表示测试环境，默认是调用生产环境云代码。

## 短信验证码服务

除了与用户相关的注册、登录等操作以外，LeanCloud 还支持额外的短信验证码服务。

在实际的应用中，有一些类型的操作对安全性比较敏感，比如付费、删除重要资源等等。若想通过短信验证的方式来与用户进行确认，就可以在以下前提下，使用 LeanCloud 提供的短信验证码服务：

* 用户已验证过手机号码
* 应用管理平台打开了 **启用帐号无关短信验证服务（针对 `requestSmsCode` 和 `verifySmsCode` 接口）** 选项

### 请求短信验证码

为某个操作发送验证短信：

```objc
    [AVOSCloud requestSmsCodeWithPhoneNumber:@"13613613613"
                                     appName:@"某应用"
                                   operation:@"具体操作名称"
                                  timeToLive:10
                                    callback:^(BOOL succeeded, NSError *error) {
        // 执行结果
    }];
   //短信格式类似于：
   //你正在{某应用}中进行{具体操作名称}，你的验证码是:{123456}，请输入完整验证，有效期为:{10}分钟

```

### 自定义短信模板

若想完全自定义短信的内容，可在应用管理平台设置中的 **短信模板** 来创建自定义的短信模板，但是需要**审核**。

短信模板提交并审核后，即可使用 SDK 来向用户发送符合短信模板定义的短信内容。

比如，提交如下短信模板，模板名称为 `Register_Template`：
```html
<pre ng-non-bindable ><code>
Hi {{username}},
欢迎注册{{name}}应用，你可以通过验证码:{{code}}，进行注册。本条短信将在{{ttl}}分钟后自行销毁。请尽快使用。
以上。
{{appname}}
</code></pre>
```
**注：`name`、 `code`、 `ttl`  是预留的字段，分别代表应用名、验证码、过期时间。不需要填充内容，会自动填充。**

发送短信：

```objc
    NSMutableDictionary *dict = [[NSMutableDictionary alloc] init];
    [dict setObject:@"MyName" forKey:@"username"];
    [dict setObject:@"MyApplication" forKey:@"appname"];
    [AVOSCloud requestSmsCodeWithPhoneNumber:@"12312312312" templateName:@"Register_Template" variables:dict callback:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            //do something
        } else {
            NSLog(@"%@", error);
        }
    }];
```

### 验证短信验证码

验证短信验证码：

```objc
    [AVOSCloud verifySmsCode:@"123456" callback:^(BOOL succeeded, NSError *error) {
        //code
    }];
```

## FAQ 常见问题和解答

### 怎么使用 LeanCloud iOS SDK
最简单的方式，使用CocoaPods，在 PodFile 加入以下内容：

```sh
pod 'AVOSCloud'
```

AVOSCloudSNS SDK：

```sh
pod 'AVOSCloudSNS'
```

### 如何使用「用户登录」功能

```objc
    [AVUser logInWithUsernameInBackground:@"zeng" password:@"123456" block:^(AVUser *user, NSError *error) {
        if (user != null) {
            NSLog(@"login success");
        } else {
            NSLog(@"signin failed");
        }
    }];

```

### 如何登出

```objc
[AVUser logOut];

```

### 如何使用「新浪微博」登录


```objc
[AVOSCloudSNS loginWithCallback:^(id object, NSError *error) {

  //callback code here

} toPlatform:AVOSCloudSNSSinaWeibo];

```

### 使用 AVOSCloudSNS，运行时报错：+[AVUser loginWithAuthData:block:]: unrecognized selector sent to class

请将 `Build Settings -> Linking -> Other Linker Flags` 设置为 `-ObjC`。具体原因可以参考苹果官方的 Technical Q&A QA1490 [Building Objective-C static libraries with categories](https://developer.apple.com/library/mac/qa/qa1490/_index.html)。此外，stackoverfow 也有一个比较详细的答案 [Objective-C categories in static library](http://stackoverflow.com/questions/2567498/objective-c-categories-in-static-library)。










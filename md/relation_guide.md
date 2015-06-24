# 关系建模指南

数据对象之间存在 3 种类型的关系。一对一关系可以将一个对象与另一个对象关联。一对多关系可以使一个对象关联多个对象。多对多关系可以实现大量对象之间的复杂关系。

## LeanCloud中的关系
LeanCloud中有 4 种方式构建对象之间的关系：

1. Pointers （适合一对一和一对多关系）
2. Arrays （适合一对多和多对多关系）
3. AVRelation （适合多对多关系）
4. 关联表 （适合多对多关系）

## 一对多关系
当你需要一个一对多关系的时候，该使用 Pointers 还是 Arrays 实现，需要考虑几个因素。首先，需要考虑关系中包含的对象数量。如果关系「多」方包含的对象数量可能非常大（大于 100 左右），那么你就必须使用 Pointers。反之，如果对象数量很小（低于 100 或更少），那么 Arrays 可能会更方便，特别是如果你经常需要获取父对象同时得到所有相关的对象（一对多关系中的「多」）。

### 使用 Pointers 实现一对多关系
假如我们有一个游戏程序，需要记录玩家每次游戏的分数和成就。我们可以构造一个`Game`对象来存储这些数据。如果这个游戏运营得非常成功，每个玩家将拥有成千上万的`Game`对象。类似这样的情况，关系中的对象数量可能无限制地增长，Pointer 是最好的选择。
假设在这个游戏应用中，我们确定每个`Game`对象都会与一个 AVUser 关联。我们可以像这样实现：

```objc
AVObject *game= [AVObject objectWithClassName:@"Game"];
[game setObject:[AVUser currentUser] forKey:@"createdBy"];
```

我们可以使用下面的代码来查询某个 AVUser 创建的`Game`对象：

```objc
AVQuery *gameQuery = [AVQuery queryWithClassName:@"Game"];
[gameQuery whereKey:@"createdBy" equalTo:[AVUser currentUser]];
```

如果我们需要查询某个`Game`对象的创建者，也就是获取 `createdBy` 属性：

```objc
// say we have a Game object
AVObject *game = ...
 
// getting the user who created the Game
AVUser *createdBy = [game objectForKey@"createdBy"];
```

大多数场景下，Pointers 是实现一对多关系的最好选择。

### 使用 Arrays 实现一对多关系
当我们知道一对多关系中包含的对象数量很小时，使用 Arrays 实现是比较理想的。Arrays 可以通过 `includeKey` 简化查询。传递对应的 key 可以在获取「一」方对象数据的同时获取到所有「多」方对象的数据。但是，如果关系中包含的对象数量巨大，查询将响应缓慢。

假设在我们的游戏中，玩家需要保存角色游戏过程中积累的所有武器，且总共有几十种武器。在这个实例中我们知道武器的数量不会变得很大。同时，我们还想允许玩家设定武器的顺序。这种情况正好适合用 Arrays 实现，因为数组的大小不会很大，而且还需要保存玩家每次游戏后数组内元素的顺序：

我们可以在 AVUser 上创建添加一列`weaponsList`。

现在我们存入一些`Weapon`对象到`weaponsList`中：

```objc
// let's say we have four weapons
AVObject *scimitar = ...
AVObject *plasmaRifle = ...
AVObject *grenade = ...
AVObject *bunnyRabbit = ...
 
// stick the objects in an array
NSArray *weapons = @[scimitar, plasmaRifle, grenade, bunnyRabbit];
 
// store the weapons for the user
[[AVUser currentUser] setObject:weapons forKey:@"weaponsList"];
```

然后，如果我们需要获取这些`Weapon`对象，仅仅需要一行代码：

```objc
NSArray *weapons = [[AVUser currentUser] objectForKey:@"weaponsList"];
```

有时候，我们会想获取我们一对多中「一」的对象的同时获取「多」的对象。我们可以在使用 AVQuery 查询 AVUser 的时候，使用`includeKey`（或 Android 中的`include`）来同时获取`weaponsList`列中存放的`Weapon`对象：

```objc
// set up our query for a User object
AVQuery *userQuery = [AVUser query];
 
// configure any constraints on your query...
// for example, you may want users who are also playing with or against you
 
// tell the query to fetch all of the Weapon objects along with the user
// get the "many" at the same time that you're getting the "one"
[userQuery includeKey:@"weaponsList"];
 
// execute the query
[userQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    // objects contains all of the User objects, and their associated Weapon objects, too
}];
```

你也可以在一对多关系中通过「多」方对象获取到「一」方对象。例如，我们想找出所有拥有某个特定`Weapon`的 AVUser，可以像这样来查询：

```objc
// add a constraint to query for whenever a specific Weapon is in an array
[userQuery whereKey:@"weaponsList" equalTo:scimitar];
 
// or query using an array of Weapon objects...
[userQuery whereKey:@"weaponsList" containedIn:arrayOfWeapons];
```

## 多对多关系
现在让我们来处理多对多关系。假设我们有一个读书应用，我们需要对`Book`对象和`Author`对象建模。如我们所知，一个作者可以写多本书，一本书也可以有多个作者。这是一个典型的多对多关系，你必须选择使用 Arrays， AVRelation 或创建自己的关联表来实现这种关系。

决策的关键在于是否需要为这个关系附加一些属性。如果不需要，使用 AVRelation 或 Arrays 是最简单的。通常情况下，使用 Arrays 会有更好的性能和更少的查询。如果多对多关系中任何一方对象数量可能达到或超过 100，像一对多关系中描述的原因一样，使用 AVRelation 或关联表是更好的选择。

另一方面，如果你想为关系附加一些属性，则需要创建一个独立的表（关联表）来存储两端的关系。记住，附加的属性是描述这个关系的，不是描述关系中的任何一方。你可能会感兴趣的需要使用关联表附加一些属性的示例有：

* 关系创建的时间
* 关系创建者
* 某人查看此关系的次数

### 使用 AVRelation
我们可以使用 AVRelation 构建一个`Book`和`Author`之间的关系。在后台的数据查看界面，你可以给 Book 对象添加一个名称为`authors`，类型为 relation 的列。

然后，我们可以关联一些作者到这本书：

```objc
// let’s say we have a few objects representing Author objects
AVObject *authorOne = …
AVObject *authorTwo = …
AVObject *authorThree = …

// now we create a book object
AVObject *book= [AVObject objectWithClassName:@"Book"];
 
// now let’s associate the authors with the book
// remember, we created a "authors" relation on Book
AVRelation *relation = [book relationforKey:@"authors"];
// make sure these objects should be saved to server before adding to relation
[relation addObject:authorOne];
[relation addObject:authorTwo];
[relation addObject:authorThree];
 
// now save the book object
[book saveInBackground];
```

** 注意： ** 这里 authorOne, authorTwo, authorThree 必需已经保存到云端之后才能添加到 relation，否则 [book saveInBackground] 会报错。

要获取某本书的所有作者，使用如下查询：

```objc
// suppose we have a book object
AVObject *book = ...
 
// create a relation based on the authors key
AVRelation *relation = [book relationforKey:@"authors"];
 
// generate a query based on that relation
AVQuery *query = [relation query];
 
// now execute the query
```

也许你更需要获取某个作者的所有书。你可以构造一个稍微不同的查询来获取这种反向关系的结果：

```objc
// suppose we have a author object, for which we want to get all books
AVObject *author = ...
 
// first we will create a query on the Book object
AVQuery *query = [AVQuery queryWithClassName:@"Book"];
 
// now we will query the authors relation to see if the author object 
// we have is contained therein
[query whereKey:@"authors" equalTo:author];
```

### 使用关联表
也许某些情况下，我们需要知道更多关系的附加信息。例如，假设我们为用户之间关注/被关注的关系建模：就像流行的社交网络那样，一个用户可以关注别的用户。在我们的应用里，我们不仅想知道用户 A 是否关注了用户 B，我们还想知道什么时候用户 A 开始关注的用户 B。这样的信息不能使用 AVRelation 实现。为了保存这些数据，你必须创建一个独立的表保存这些关系。这个表我们叫做`Follow`，它有一例叫`from`和一例叫`to`，都是 AVUser 的指针类型。除此之外，你还要添加一列名称为`date`，类型为`Date`的列。

现在，当你要保存两个用户之间的关注关系时，在`Follow`表添加一行，给`from`，`to`和`date`填充恰当的数据：

```objc
// suppose we have a user we want to follow
AVUser *otherUser = ...
 
// create an entry in the Follow table
AVObject *follow = [AVObject objectWithClassName:@"Follow"];
[follow setObject:[AVUser currentUser]  forKey:@"from"];
[follow setObject:otherUser forKey:@"to"];
[follow setObject:[NSDate date] forKey:@"date"];
[follow saveInBackground];
```

如果我们想查询所有当前用户关注的用户，我们可以对`Follow`表使用这样的查询：

```objc
// set up the query on the Follow table
AVQuery *query = [AVQuery queryWithClassName:@"Follow"];
[query whereKey:@"from" equalTo:[AVUser currentUser]];
 
// execute the query
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  for(AVObject *o in objects) {
    // o is an entry in the Follow table
    // to get the user, we get the object with the to key
    AVUser *otherUser = [o objectForKey:@"to"];
 
    // to get the time when we followed this user, get the date key
    NSDate *when = [o objectForKey:@"date"];
  }
}];
```

同样，我们也可以很简单地查询所有关注当前用户的用户，我们可以对`Follow`表使用这样的查询：

```objc
// set up the query on the Follow table
AVQuery *query = [AVQuery queryWithClassName:@"Follow"];
[query whereKey:@"to" equalTo:[AVUser currentUser]];
 
// execute the query
[query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
  for(AVObject *o in objects) {
    // o is an entry in the Follow table
    // to get the user, we get the object with the from key
    AVUser *otherUser = [o objectForKey:@"from"];
 
    // to get the time the user was followed, get the date key
    NSDate *when = [o objectForKey:@"date"];
  }
}];
```

### 使用 Arrays 实现多对多关系
使用 Arrays 实现多对多关系跟实现一对多关系大致相同。关系中一方的所有对象拥有一个数组列包含一些关系另一方的对象。

假设我们一个读书应用拥有`Book`和`Author`对象。`Book`对象包含一个`Author`对象的数组（使用列名`authors`）。使用 Arrays 实现非常适合这样的场景，因为一本书几乎不可能达到或超过 100 个作者。这是我们在`Book`对象中使用数组的原因。毕竟，一个作者可能写 100 本以上的书。

这是我们怎么保存`Book`对象和`Author`对象之间的关系：

```objc
// let's say we have an author
AVObject *author = ...
 
// and let's also say we have an book
AVObject *book = ...
 
// add the author to the authors list for the book
[book addObject:author forKey:@"authors"];
```

因为作者列表使用的数组，当你获取一个`Book`对象的时候想要同时得到所有作者的信息，则要使用`includeKey`（Android上是`include`）：

```objc
// set up our query for the Book object
AVQuery *bookQuery = [AVQuery queryWithClassName:@"Book"];
 
// configure any constraints on your query...
// tell the query to fetch all of the Author objects along with the Book
[bookQuery includeKey:@"authors"];
 
// execute the query
[bookQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    // objects is all of the Book objects, and their associated 
    // Author objects, too
}];
```

这样之后，获取某个`Book`对象的所有`Author`对象很简单：

```objc
NSArray *authorList = [book objectForKey@"authors"];
```

最后，假设你有一个`Author`对象，你需要找出所有他出现过的`Book`对象，这也很简单，只需要添加一个条件：

```objc
// suppose we have an Author object
AVObject *author = ...
 
// set up our query for the Book object
AVQuery *bookQuery = [AVQuery queryWithClassName:@"Book"];
 
// configure any constraints on your query...
[bookQuery whereKey:@"authors" equalTo:author];
 
// tell the query to fetch all of the Author objects along with the Book
[bookQuery includeKey:@"authors"];
 
// execute the query
[bookQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
    // objects is all of the Book objects, and their associated Author objects, too
}];
```

## 一对一关系
当你需要将一个对象拆分成两个对象时，一对一关系是一种重要的需求。这种需求应该很少见，但是在下面的实例中体现了这样的需求：

* **限制部分用户数据的权限** 在这个场景中，你可以将此对象拆分成两部分，一部分包含所有用户可见的数据，另一部分包含所有仅自己可见的数据（通过ACL控制）。同样，你也可以实现一部分包含所有用户可修改的数据，另一部分包含所有仅自己可修改的数据。
* **避免大对象** 在这个场景中，你的原始对象大小大于了对象的上限值（128K），你可以创建另一个对象来存储额外的数据。当然，这通常需要更好地设计你的数据模型来避免出现大对象。如果确实无法避免，你也可以考虑使用AVFile存储大数据。
* **更灵活的文件对象** AVFile 可以方便的存取文件，但是作为对象查询修改等不是很方便，可以使用 AVObject 构造一个自己的文件对象并与 AVFile 一对一关联，将文件属性存于AVObject 中，这样既可以方便查询修改文件属性，也可以方便存取文件。

我们也提供了一个应用来展示 LeanCloud 上的关系建模，可以用公共账号 `leancloud@163.com/Public123` 来登录[控制台](https://leancloud.cn/) ，选择 `LZAlbum` 应用来查看它的表结构。这是一个仿朋友圈的项目，开源在了 [Github](https://github.com/lzwjava/LZAlbum) 上。

感谢您阅读此文档。对于使用的复杂性我们深感抱歉。通常，数据的关系建模是一个难题。但是我们可以看到光明的一面：它仍然比人际关系简单。
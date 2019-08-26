{% import "views/_helper.njk" as docs %}

# 好友及社交
这篇文档主要讲解如何使用 [AVUser](storage_overview.html#用户对象 AVUser) 开发好友相关的功能，包括添加删除好友、好友聊天。如果要实现类似于微博的陌生人关注及动态，请参考[应用内社交](status_system.html)。

## 好友关系

好友关系的实现逻辑如下：单向添加好友，即 A 添加 B 为好友后，B 进入到 A 的好友列表中，但此时 A 不在 B 的好友列表中，除非 B 也添加了 A 为自己的好友。

我们将好友关系存储在 `_Follower` 和 `_Followee` 表中。`_Followee` 表内存储着 user 的好友列表，`_Follower` 表内存储着添加 user 为好友的用户。`user` 和好友都是 Pointer 类型指向 `_User` 表。

### 添加好友

您可以直接调用以下接口为当前用户添加好友，接口中的参数为好友 `AVUser` 的 `objectId`。

```js
AV.User.current().follow('52f9be45e4b035debf88b6e2').then(function(){
  //添加好友成功
}, function(err){
  //添加好友失败
  console.dir(err);
});

```

```objc
NSString *userObjectId = @"XXXXXX";
[[AVUser currentUser] follow:userObjectId andCallback:^(BOOL succeeded, NSError *error) {
}];
```

```java
AVUser.getCurrentUser().followInBackground(userObjectId).subscribe(new Observer<JSONObject>() {
  @Override
  public void onSubscribe(Disposable disposable) {}

  @Override
  public void onNext(JSONObject jsonObject) {
    Log.i(TAG, "follow succeeded.");
  }

  @Override
  public void onError(Throwable throwable) {
    if (throwable.getCode() == AVException.DUPLICATE_VALUE) {
      Log.w(TAG, "Already followed.");
    } else {
      throwable.printStackTrace();
    }
  }

  @Override
  public void onComplete() {}
});
```

#### 自动互为好友
如果在 [控制台 > 存储 > 设置 > 其他](/dashboard/storage.html?appid={{appid}}#/storage/conf) 勾选了 **应用内社交模块，关注用户时自动反向关注**，那么在当前用户添加某个人为好友时，那个人会自动添加当前用户为好友。自动互为好友的功能可以结合[申请添加好友](#申请添加好友)来实现。


### 删除好友
调用以下接口即可删除一个好友：

```js
AV.User.current().unfollow('52f9be45e4b035debf88b6e2').then(function(){
  //删除好友成功
}, function(err){
  //删除好友失败
  console.dir(err);
});
```

```objc
NSString *userObjectId = @"XXXXXX";
[[AVUser currentUser] unfollow:userObjectId andCallback:^(BOOL succeeded, NSError *error) {
}];
```

```java
AVUser.getCurrentUser().unfollowInBackground("userObjectId").subscribe(new Observer<JSONObject>() {
  @Override
  public void onSubscribe(Disposable disposable) {}

  @Override
  public void onNext(JSONObject jsonObject) {
    Log.i(TAG, "succeeded.");
  }

  @Override
  public void onError(Throwable throwable) {
    Log.w(TAG, "failed.");
  }

  @Override
  public void onComplete() {}
});
```

### 查询我的好友

通过下面的接口可以查询我的好友列表。由于好友是一个 Pointer 对象，所以在查询的时候我们可以通过 `include` 方法拿到好友在 `_User` 表的信息。

```js
var query = AV.User.current().followeeQuery();
query.include('followee');
query.find().then(function(followees){
  //我的好友列表
});
```

```objc
AVUser *currentUser = [AVUser currentUser];
AVQuery *query= [AVUser followeeQuery:currentUser.objectId];
[query includeKey:@"followee"];
[query findObjectsInBackgroundWithBlock:^(NSArray *followees, NSError *error) {
}];
```

```java
AVUser currentUser = AVUser.getCurrentUser();
AVQuery<AVUser> followeeQuery = currentUser.followeeQuery(AVUser.class);
followeeQuery.findInBackground().subscribe(new Observer<List<AVUser>>() {
  @Override
  public void onSubscribe(Disposable disposable) {}

  @Override
  public void onNext(List<AVUser> avUsers) {
    // avUsers 就是用户的好友列表
  }

  @Override
  public void onError(Throwable throwable) {}

  @Override
  public void onComplete() {}
});
```

### 查询谁添加了我为好友

除了查询我的好友列表之外，还可以查询谁添加了我为好友：

```js
var query = AV.User.current().followerQuery();
query.include('follower');
query.find().then(function(followers){
  // followers 是添加我为好友的人
});
```

```objc
AVUser *currentUser = [AVUser currentUser];
AVQuery *query= [AVUser followerQuery:currentUser.objectId];
[query includeKey:@"follower"];
[query findObjectsInBackgroundWithBlock:^(NSArray *followees, NSError *error) {
}];
```

```java
AVUser currentUser = AVUser.getCurrentUser();
AVQuery<AVUser> followerQuery = currentUser.followerQuery(AVUser.class);
followerQuery.findInBackground().subscribe(new Observer<List<AVUser>>() {
  @Override
  public void onSubscribe(Disposable disposable) {}

  @Override
  public void onNext(List<AVUser> avUsers) {
    // avUsers 就是添加当前用户为好友的人
  }

  @Override
  public void onError(Throwable throwable) {}

  @Override
  public void onComplete() {}
});
```

## 申请添加好友
在一些场景中，添加好友时会向对方发送好友申请，对方同意后双方互为好友。申请添加好友的功能可以用[即时通讯服务](realtime_v2.html)来实现。

例如 Tom 申请添加 Jerry 为好友，Tom 可以创建一个和 Jerry 的[一对一单聊](realtime-guide-beginner.html#一对一单聊)，发送一条申请好友的消息给 Jerry，Jerry 收到消息时在 UI 做出相应的展示，Jerry 如果同意好友申请，再发一条同意的消息给 Tom，Tom 收到消息后使用[添加好友](#添加好友)这个接口添加 Jerry 为好友。

此时如果开启了[自动互为好友](#自动互为好友)，在 Tom 添加 Jerry 为好友的同时，LeanCloud 会自动添加 Tom 到 Jerry 的好友列表中。

## 好友聊天
使用 [即时通讯服务](realtime_v2.html)只需要和好友之间建立对话就可以聊天了，上文中的[申请添加好友](#申请添加好友)就是通过即时通讯服务来实现的。关于聊天的所有功能请参考[即时通讯开发指南](realtime-guide-beginner.html)。

## REST API

### 添加好友

通过操作 `/users/:user_id/friendship/:target_id` 可以添加好友或删除好友，其中：

* `:user_id` 表示发起好友行为的用户的 objectId。如果设置了 `X-LC-Session` 头，则 `self` 表示当前登录用户。
* `:target_id` 表示目标用户的 objectId。

例如，让当前用户 `51fa6886e4b0cc0b5a3792e9` 添加目标用户 `51e3a334e4b0b3eb44adbe1a` 为好友：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  https://{{host}}/1.1/users/51fa6886e4b0cc0b5a3792e9/friendship/51e3a334e4b0b3eb44adbe1a
```

添加好友后，`_Follower` 和 `_Followee` 都会多出一条记录，如果设置了[自动互为好友](#自动互为好友)，会各多出两条记录。

### 删除好友

如果当前用户 `51fa6886e4b0cc0b5a3792e9` 要删除好友 `51e3a334e4b0b3eb44adbe1a`：

```sh
curl -X DELETE \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  https://{{host}}/1.1/users/51fa6886e4b0cc0b5a3792e9/friendship/51e3a334e4b0b3eb44adbe1a
```

### 查询我的好友

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
  --data-urlencode 'include=followee' \
  https://{{host}}/1.1/users/:user_id/followees
```

### 查询谁添加了我为好友

```sh
curl -X GET \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -G \
  --data-urlencode 'include=follower' \
  https://{{host}}/1.1/users/:user_id/followers
```


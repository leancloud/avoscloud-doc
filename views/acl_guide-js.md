{% extends "./acl_guide.tmpl" %}

{% set runAtServer = "true" %}
{% set language = "JavaScript SDK" %}
{% set platform = "JavaScript" %}
{% block for_front_js %}
### 云引擎使用 ACL
文档中使用的 `AV.User.current()` 这个方法仅仅针对浏览器端有效，在**云引擎中该接口无法使用**。云引擎中获取用户信息，请参考云引擎文档[处理用户登录和登出](leanengine_webhosting_guide-node.html#处理用户登录和登出)
{% endblock %}
{% block link_to_acl_quickStart %}[权限管理以及 ACL 快速指南](acl_quick_start-js.html){% endblock %}
{% block create_post_set_acl_for_single_user %}

```js
  // 新建一个帖子对象
  var Post = AV.Object.extend('Post');
  var post = new Post();
  post.set('title', '大家好，我是新人');

  // 新建一个 ACL 实例
  var acl = new AV.ACL();
  acl.setPublicReadAccess(true);
  acl.setWriteAccess(AV.User.current(),true);

  // 将 ACL 实例赋予 Post 对象
  post.setACL(acl);
  post.save().then(function() {
    // 保存成功
  }).catch(function(error) {
    console.log(error);
  });
```

{% endblock %}

{% block create_post_set_acl_for_othter_user %}

```js
  // 创建一个针对 User 的查询
  var query = new AV.Query(AV.User);
  query.get('55098d49e4b02ad5826831f6').then(function(otherUser) {
    var post = new AV.Object('Post');
    post.set('title', '大家好，我是新人');

    // 新建一个 ACL 实例
    var acl = new AV.ACL();
    acl.setPublicReadAccess(true);
    acl.setWriteAccess(AV.User.current(), true);
    acl.setWriteAccess(otherUser, true);

    // 将 ACL 实例赋予 Post 对象
    post.setACL(acl);

    // 保存到云端
    return post.save();
  }).then(function() {
    // 保存成功
  }).catch(function(error) {
    // 错误信息
    console.log(error);
  });
```
{% endblock %}

{% block create_role_administrator %}

```js
  // 新建一个角色，并把为当前用户赋予该角色
  var roleAcl = new AV.ACL();
  roleAcl.setPublicReadAccess(true);
  roleAcl.setPublicWriteAccess(false);

  // 当前用户是该角色的创建者，因此具备对该角色的写权限
  roleAcl.setWriteAccess(AV.User.current(), true);

  //新建角色
  var administratorRole = new AV.Role('Administrator', roleAcl);
  administratorRole.save().then(function(role) {
    // 创建成功
  }).catch(function(error) {
    console.log(error);
  });
```
{% endblock %}

{% block query_role_administrator %}

```js
  // 新建针对 Role 的查询
  var roleQuery = new AV.Query(AV.Role);

  // 查询 name 等于 Administrator 的角色
  roleQuery.equalTo('name', 'Administrator');

  // 执行查询
  roleQuery.first().then(function(adminRole) {
    var userRelation = adminRole.relation('users');
    return userRelation.query().find();
  }).then(function (userList) {

    // userList 就是拥有该角色权限的所有用户了。
    var firstAdmin = userList[0];
  }).catch(function(error) {
    console.log(error);
  });
```
{% endblock %}

{% block query_role_of_user %}

```js
  // 新建角色查询
  var roleQuery = new AV.Query(AV.Role);
  // 查询当前用户拥有的角色
  roleQuery.equalTo('users', AV.User.current());
  roleQuery.find().then(function(roles) {
    // roles 是一个 AV.Role 数组，这些 AV.Role 表示当前用户所拥有的角色
  }, function (error) {
  });
```
{% endblock %}

{% block query_user_of_role %}

```js
  var roleQuery = new AV.Query(AV.Role);
  roleQuery.get('55f1572460b2ce30e8b7afde').then(function(role) {

    //获取 Relation 实例
    var userRelation= role.getUsers();

    // 获取查询实例
    var query = relation.query();
    return query.find();
  }).then(function(results) {
    // results 就是拥有 role 角色的所有用户了
  }).catch(function(error) {
    console.log(error);
  });
```
{% endblock %}

{% block set_acl_for_role %}

```js
  // 新建一个帖子对象
  var Post = AV.Object.extend('Post');
  var post = new Post();
  post.set('title', '大家好，我是新人');

  // 新建一个角色，并把为当前用户赋予该角色
  var administratorRole = new AV.Role('Administrator');

  var relation = administratorRole.getUsers();

  //为当前用户赋予该角色
  administratorRole.getUsers().add(AV.User.current());

  //角色保存成功
  administratorRole.save().then(function(administratorRole) {

    // 新建一个 ACL 实例
    var acl = new AV.ACL();
    acl.setPublicReadAccess(true);
    acl.setRoleWriteAccess(administratorRole, true);

    // 将 ACL 实例赋予 Post 对象
    post.setACL(acl);
    return post.save();
  }).then(function(post) {
    // 保存成功
  }).catch(function(error) {
    // 保存失败
    console.log(error);
  });

```
{% endblock %}


{% block add_role_for_user %}

```js
  // 构建 AV.Role 的查询
  var roleQuery = new AV.Query(AV.Role);
  roleQuery.equalTo('name', 'Administrator');
  roleQuery.find().then(function(results) {
    if (results.length > 0) {

      // 如果角色存在
      var administratorRole = results[0];
      roleQuery.equalTo('users', AV.User.current());
      return roleQuery.find();
    } else {

      // 如果角色不存在新建角色，并把为当前用户赋予该角色
      var administratorRole = new AV.Role('Administrator');
      var relation = administratorRole.getUsers();

      //为当前用户赋予该角色
      relation.add(AV.User.current());
      administratorRole.save();
    }
  }).then(function(userForRole) {
    //该角色存在，但是当前用户未被赋予该角色
    if (userForRole.length === 0) {
      // 为当前用户赋予该角色
      var relation = administratorRole.getUsers();
      relation.add(AV.User.current());
      administratorRole.save();
    }
  }).catch(function(error) {
    // 输出错误
    console.log(error);
  });
```

{% endblock %}

{% block remove_role_from_user %}

```js
  // 构建 AV.Role 的查询
  var roleQuery = new AV.Query(AV.Role);
  roleQuery.equalTo('name', 'Moderator');
  roleQuery.find().then(function(results) {

    // 如果角色存在
    if (results.length > 0) {
      var moderatorRole = results[0];
      roleQuery.equalTo('users', AV.User.current());
      return roleQuery.find();
    }
  }).then(function(userForRole) {

    //该角色存在，并且也拥有该角色
    if (userForRole.length > 0) {

      // 剥夺角色
      var relation= moderatorRole.getUsers();
      relation.remove(AV.User.current());
      return moderatorRole.save();
    }
  }).then(function() {
    // 保存成功
  }).catch(function(error) {
    // 输出错误
    console.log(error);
  });
```

{% endblock %}

{% block asign_role_to_parent %}

```js
  // 建立版主和论坛管理员之间的从属关系
  var administratorRole = new AV.Role('Administrator');
  var administratorRole.save().then(function(administratorRole) {

    //新建版主角色
    var moderatorRole = new AV.Role('Moderator');

    // 将 Administrator 作为 moderatorRole 子角色
    moderatorRole.getRoles().add(administratorRole);
    return moderatorRole.save();
  }).then(function (role) {
    chai.assert.isNotNull(role.id);
    done();
  }).catch(function(error) {
    console.log(error);
  });
```

{% endblock %}

{% block share_role %}

```js
  //新建摄影器材版主角色
  var photographicRole = new AV.Role('Photographic');

  //新建手机平板版主角色
  var mobileRole=new AV.Role('Mobile');

  //新建电子数码版主角色
  var digitalRole=new AV.Role('Digital');

   AV.Promise.all([
    // 先行保存 photographicRole 和 mobileRole
    photographicRole.save(),
    mobileRole.save(),
  ]).then(function([r1, r2]) {
    // 将 photographicRole 和 mobileRole 设为 digitalRole 一个子角色
    digitalRole.getRoles().add(photographicRole);
    digitalRole.getRoles().add(mobileRole);
    digitalRole.save();

    // 新建一个帖子对象
    var Post = AV.Object.extend('Post');

    // 新建摄影器材板块的帖子
    var photographicPost = new Post();
    photographicPost.set('title', '我是摄影器材板块的帖子！');

    // 新建手机平板板块的帖子
    var mobilePost = new Post();
    mobilePost.set('title', '我是手机平板板块的帖子！');

    // 新建电子数码板块的帖子
    var digitalPost = new Post();
    digitalPost.set('title', '我是电子数码板块的帖子！');


    // 新建一个摄影器材版主可写的 ACL 实例
    var photographicACL = new AV.ACL();
    photographicACL.setPublicReadAccess(true);
    photographicACL.setRoleWriteAccess(photographicRole,true);

    // 新建一个手机平板版主可写的 ACL 实例
    var mobileACL = new AV.ACL();
    mobileACL.setPublicReadAccess(true);
    mobileACL.setRoleWriteAccess(mobileRole,true);

    // 新建一个手机平板版主可写的 ACL 实例
    var digitalACL = new AV.ACL();
    digitalACL.setPublicReadAccess(true);
    digitalACL.setRoleWriteAccess(digitalRole,true);

    // photographicPost 只有 photographicRole 可以读写
    // mobilePost 只有 mobileRole 可以读写
    // 而 photographicRole，mobileRole，digitalRole 均可以对 digitalPost 进行读写
    photographicPost.setACL(photographicACL);
    mobilePost.setACL(mobileACL);
    digitalPost.setACL(digitalACL);

    return AV.Promise.all([
      photographicPost.save(),
      mobilePost.save(),
      digitalPost.save(),
    ]);
   }).then(function([r1, r2, r3]) {
     // 保存成功
     }, function(errors) {
     // 保存失败
   });;
```
{% endblock %}

{% block sdk_init_user_masterKey %}
在 Node.js 运行时中可以使用如下代码初始化 SDK：

```js
  AV.init({
    appId: APP_ID,
    appKey: APP_KEY,
    masterKey: MASTER_KEY,
  })
  AV.Cloud.useMasterKey();
```
{% endblock %}

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
  var Post = AV.Object.extend("Post");
  var post = new Post();
  post.set("title", "大家好，我是新人");

  // 新建一个 ACL 实例
  var acl = new AV.ACL();
  acl.setPublicReadAccess(true);
  acl.setWriteAccess(AV.User.current(),true);

  // 将 ACL 实例赋予 Post 对象
  post.setACL(acl);
  post.save();
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
    post.save();
  }, function(error) {
    // 编写处理 error 的逻辑
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

  var administratorRole = new AV.Role('Administrator', roleAcl);//新建角色
  administratorRole.save().then(function (role) {
      // 创建成功
  }, function (error) {
      if (error)
          throw error;
      done();
  });//保存
```
```ts
  // 新建一个角色，并把为当前用户赋予该角色
  let roleAcl = new AV.ACL();
  roleAcl.setPublicReadAccess(true);
  roleAcl.setPublicWriteAccess(false);

  // 当前用户是该角色的创建者，因此具备对该角色的写权限
  roleAcl.setWriteAccess(AV.User.current(),true);

  let administratorRole = new AV.Role('Administrator',roleAcl);//新建角色
  administratorRole.save<AV.Role>().then((role)=>{
      // 创建成功
  },error=>{
  });//保存
```
{% endblock %}

{% block query_role_administrator %}

```js
  // 新建针对 Role 的查询
  var roleQuery = new AV.Query(AV.Role);
  // 查询 name 等于 Administrator 的角色
  roleQuery.equalTo('name', 'Administrator');
  // 执行查询
  roleQuery.first().then(function (adminRole) {
      var userRelation = adminRole.relation('users');
      userRelation.query().find().then(function (userList) {
          // userList 就是拥有该角色权限的所有用户了。
          var firstAdmin = userList[0];
      }, function (error) {
      });
  }, function (error) {
  });
```
```ts
  // 新建针对 Role 的查询
  let roleQuery = new AV.Query(AV.Role);
  // 查询 name 等于 Administrator 的角色
  roleQuery.equalTo('name', 'Administrator');
  // 执行查询
  roleQuery.first<AV.Role>().then(adminRole=>{
    let userRelation = adminRole.relation('users');
    userRelation.query().find<AV.Object []>().then(userList =>{
      // userList 就是拥有该角色权限的所有用户了。
      let firstAdmin = userList[0];
    },error=>{
    });
  },error =>{
  });
```
{% endblock %}

{% block query_role_of_user %}

```js
  // 新建角色查询
  var roleQuery = new AV.Query(AV.Role);
  // 查询当前用户拥有的角色
  roleQuery.equalTo('users', AV.User.current());
  roleQuery.find().then(function (roles) {
    // roles 是一个 AV.Role 数组，这些 AV.Role 表示当前用户所拥有的角色
  }, function (error) {
  });
```
```ts
  // 新建角色查询
  let roleQuery = new AV.Query(AV.Role);
  // 查询当前用户拥有的角色
  roleQuery.equalTo('users',AV.User.current());
  roleQuery.find<AV.Role []>().then(roles =>{
    // roles 是一个 AV.Role 数组，这些 AV.Role 表示当前用户所拥有的角色
  },error =>{

  });
```
{% endblock %}

{% block query_user_of_role %}

```js
  var roleQuery = new AV.Query(AV.Role);
  roleQuery.get('55f1572460b2ce30e8b7afde',{
    success:function(role){
       var userRelation= role.getUsers();//获取 Relation 实例
       var query = relation.query();// 获取查询实例
       query.find({
         success: function(results) {
        // results 就是拥有 role 角色的所有用户了
        },
        error: function(error) {
          // error is an instance of AV.Error.
          }
       });
    },
    error:function(object,error){
       // error is an instance of AV.Error.
    }
  });
```
```ts
    // 构建 AV.Role 的查询
    let roleQuery = new AV.Query(AV.Role);
    roleQuery.get<AV.Role>('55f1572460b2ce30e8b7afde').then(role => {
        let relation = role.getUsers();// 获取关系
        let query = relation.query();// 获取查询
        query.find<AV.User[]>().then(users => {
            // users 就是拥有被查询角色的所有用户
        }, error => {

        });
    }, error => {

    });
```
{% endblock %}

{% block set_acl_for_role %}

```js
  // 新建一个帖子对象
  var Post = AV.Object.extend("Post");
  var post = new Post();
  post.set("title", "大家好，我是新人");

  // 新建一个角色，并把为当前用户赋予该角色
  var administratorRole = new AV.Role("Administrator");//新建角色

  var relation= administratorRole.getUsers();
  administratorRole.getUsers().add(AV.User.current());//为当前用户赋予该角色
  administratorRole.save().then(function(administratorRole) {//角色保存成功

    // 新建一个 ACL 实例
    var acl = new AV.ACL();
    acl.setPublicReadAccess(true);
    acl.setRoleWriteAccess(administratorRole,true);

    // 将 ACL 实例赋予 Post 对象
    post.setACL(acl);

    post.save(null, {
      success: function(post) {
  },
  error: function(post, error) {
    console.log(error);
    }
  });
  }, function(error) {
      //角色保存失败，处理 error
  });
```
```ts
    // 新建一个帖子对象
    let post = new AV.Object('Post');
    post.set("title", "大家好，我是新人");

    // 新建一个角色，并把为当前用户赋予该角色
    administratorRole = new AV.Role(randomRolename);//新建角色

    let relation = administratorRole.getUsers();
    administratorRole.getUsers().add(AV.User.current());//为当前用户赋予该角色
    administratorRole.save<AV.Role>().then(administratorRole => {//角色保存成功

        // 新建一个 ACL 实例
        let objectACL = new AV.ACL();
        objectACL.setPublicReadAccess(true);
        objectACL.setRoleWriteAccess(administratorRole, true);

        // 将 ACL 实例赋予 Post 对象
        post.setACL(objectACL);

        post.save<AV.Object>().then(post=>{
            chai.assert.isNotNull(post.id);
            done();
        },error=>{
            if(error) throw error;
        });
    }, error=>{
        //角色保存失败，处理 error
    });

//https://github.com/leancloud/TypeScript-Sample-Code/blob/master/sample/Object/AVObject%23setACL.ts
```
{% endblock %}


{% block add_role_for_user %}

```js
  // 构建 AV.Role 的查询
  var roleQuery = new AV.Query(AV.Role);
  roleQuery.equalTo('name','Administrator');
  roleQuery.find({
    success:function(results){
      // 如果角色存在
      if(results.length > 0){
        var administratorRole = results[0];
        roleQuery.equalTo('users',AV.User.current());
        roleQuery.find({
          success:function(userForRole){
            if(userForRole.length == 0){//该角色存在，但是当前用户未被赋予该角色
              // 为当前用户赋予该角色
               var relation= administratorRole.getUsers();
               relation.add(AV.User.current());
               administratorRole.save();
            }
          },error:function(errorForUserQuery){

          }
        });
      } else{
        // 如果角色不就新建角色，并把为当前用户赋予该角色
        var administratorRole = new AV.Role("Administrator");//新建角色
        var relation= administratorRole.getUsers();
        relation.add(AV.User.current());//为当前用户赋予该角色
        administratorRole.save();//保存
      }
    },error:function(error){

    }
  });
```
```ts
    // 构建 AV.Role 的查询
    let roleQuery = new AV.Query(AV.Role);
    roleQuery.equalTo('name', 'Administrator')
    roleQuery.find<AV.Role[]>().then(roles => {
        // 如果角色存在
        if (roles.length > 0) {
            let administratorRole = roles[0];
            roleQuery.equalTo('users', AV.User.current());
            roleQuery.find<AV.Object[]>().then(userForRole => {
                if (userForRole.length == 0) {//该角色存在，但是当前用户未被赋予该角色
                    let userRoleRelation = administratorRole.getUsers();
                    userRoleRelation.add(AV.User.current());//为当前用户赋予该角色
                    administratorRole.save<AV.Role>().then(result => {
                        // 创建成功
                    }, error => {
                        if (error) throw 'error on add user';
                    });
                }
            }, error => {
                if (error) throw 'error on find role';
            });
        } else {
            // 该角色不存在，接下来创建该角色，并未当前用户赋予该角色
            let administratorRole = new AV.Role('Administrator');//新建角色
            let userRoleRelation = administratorRole.getUsers();
            userRoleRelation.add(AV.User.current());//为当前用户赋予该角色
            administratorRole.save<AV.Role>().then(role => {
                // 创建成功
            }, error => {
                if (error) throw 'error save role and add user';
            });
        }
    }, error => {
        if (error) throw error;
    });
```
{% endblock %}

{% block remove_role_from_user %}

```js
  // 构建 AV.Role 的查询
  var roleQuery = new AV.Query(AV.Role);
  roleQuery.equalTo('name','Moderator');
  roleQuery.find({
    success:function(results){
      // 如果角色存在
      if(results.length > 0){
        var moderatorRole = results[0];
        roleQuery.equalTo('users',AV.User.current());
        roleQuery.find({
          success:function(userForRole){
            if(userForRole.length > 0){//该角色存在，并且也拥有该角色
              // 剥夺角色
               var relation= moderatorRole.getUsers();
               relation.remove(AV.User.current());
               moderatorRole.save();
            }
          },error:function(errorForUserQuery){

          }
        });
      }
    },error:function(error){

    }
  });
```
```ts
    // 构建 AV.Role 的查询
    let roleQuery = new AV.Query(AV.Role);
    roleQuery.equalTo('name', 'Moderator')
    roleQuery.find<AV.Role[]>().then(roles => {
        // 如果角色存在
        if (roles.length > 0) {
            let administratorRole = roles[0];
            roleQuery.equalTo('users', AV.User.current());
            roleQuery.find<AV.Object[]>().then(userForRole => {
                if (userForRole.length > 0) {//该角色存在，并且当前用户已被赋予该角色
                    let userRoleRelation = administratorRole.getUsers();
                    // 为当前用户剥夺该角色
                    userRoleRelation.remove(AV.User.current());
                    administratorRole.save<AV.Role>().then(result => {
                       // 该用户已不具备该角色
                    }, error => {
                        if (error) throw 'error on add user';
                    });
                } else {
                    // 该用户并未被赋予该角色
                }
            }, error => {
                if (error) throw 'error on find role';
            });
        }
    }, error => {
        if (error) throw error;
    });
```
{% endblock %}

{% block asign_role_to_parent %}

```js
    // 建立版主和论坛管理员之间的从属关系
    var administratorRole = new AV.Role('Administrator'); //新建管理员角色
    var administratorRole.save().then(function (administratorRole) {
        var moderatorRole = new AV.Role('Moderator'); //新建版主角色
        // 将 Administrator 作为 moderatorRole 子角色
        moderatorRole.getRoles().add(administratorRole);
        moderatorRole.save().then(function (role) {
            chai.assert.isNotNull(role.id);
            done();
        }, function (error) {
            if (error)
                throw 'error on add role.';
        });
    }, function (error) {
    });
```
```ts
    // 建立版主和论坛管理员之间的从属关系
    let administratorRole = new AV.Role('Administrator');//新建管理员角色
    let administratorRole.save<AV.Role>().then(administratorRole => {
        let moderatorRole = new AV.Role('Moderator');//新建版主角色
        // 将 Administrator 作为 moderatorRole 子角色
        moderatorRole.getRoles().add(administratorRole);
        moderatorRole.save<AV.Role>().then(role => {
            chai.assert.isNotNull(role.id);
            done();
        }, error => {
            if (error) throw 'error on add role.';
        });
    }, error => {

    });
```
{% endblock %}

{% block share_role %}

```js
  var photographicRole=new AV.Role("Photographic");//新建摄影器材版主角色
  var mobileRole=new AV.Role("Mobile");//新建手机平板版主角色
  var digitalRole=new AV.Role("Digital");//新建电子数码版主角色

   AV.Promise.when(
     // 先行保存 photographicRole 和 mobileRole
     photographicRole.save(),
     mobileRole.save()
   ).then(function (r1, r2) {
     // 将 photographicRole 和 mobileRole 设为 digitalRole 一个子角色
     digitalRole.getRoles().add(photographicRole);
     digitalRole.getRoles().add(mobileRole);
     digitalRole.save();//保存

      // 新建一个帖子对象
      var Post = AV.Object.extend("Post");

      // 新建摄影器材板块的帖子
      var photographicPost = new Post();
      photographicPost.set("title", "我是摄影器材板块的帖子！");

      // 新建手机平板板块的帖子
      var mobilePost = new Post();
      mobilePost.set("title", "我是手机平板板块的帖子！");

      // 新建电子数码板块的帖子
      var digitalPost = new Post();
      digitalPost.set("title", "我是电子数码板块的帖子！");


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

      AV.Promise.when(
        photographicPost.save(),
        mobilePost.save(),
        digitalPost.save()
        ).then(function (r1,r2,r3) {
          // 保存成功
          }, function(errors){
            // 保存失败
      });
   });
```
{% endblock %}

{% block sdk_init_user_masterKey %}
在 Node.js 运行时中可以使用如下代码初始化 SDK：

```js
  AV.initialize(APP_ID, APP_KEY, MASTER_KEY);
  AV.Cloud.useMasterKey();
```
{% endblock %}




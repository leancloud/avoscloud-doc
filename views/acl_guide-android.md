{% extends "./acl_guide.tmpl" %}

{% set runAtClient = "true" %}
{% set language = "Android SDK" %}
{% set platform_name = "Android" %}
{% set acl_quickstart_guide_url = "[权限管理以及 ACL 快速指南](acl_quick_start-android.html)" %}

{% block create_post_set_acl_for_single_user %}

```java
  AVObject post=new AVObject("Post");
  post.put("title","大家好，我是新人");
  
  //新建一个 ACL 实例
  AVACL acl = new AVACL();
  acl.setPublicReadAccess(true);// 设置公开的「读」权限，任何人都可阅读
  acl.setWriteAccess(AVUser.getCurrentUser(), true);// 为当前用户赋予「写」权限，有且仅有当前用户可以修改这条 Post
  
  
  post.setACL(acl);// 将 ACL 实例赋予 Post对象
  post.saveInBackground();// 保存
```

{% endblock %}

{% block create_post_set_acl_for_othter_user %}

```java
  AVQuery<AVUser> query = AVUser.getQuery();
  query.whereEqualTo("objectId","55f1572460b2ce30e8b7afde");
  query.findInBackground(new FindCallback<AVUser>() {
    @Override
    public void done(List<AVUser> list, AVException e) {
      if(e == null){
        // 新建一个帖子对象
        AVObject post= new AVObject("Post");
        post.put("title","这是我的第二条发言，谢谢大家！");
        post.put("content","我最近喜欢看足球和篮球了。");

        //新建一个 ACL 实例
        AVACL acl = new AVACL();
        acl.setPublicReadAccess(true);// 设置公开的「读」权限，任何人都可阅读
        acl.setWriteAccess(AVUser.getCurrentUser(), true);//为当前用户赋予「写」权限

        //注：此处为了简化展现代码，未做 list 为空的判断。
        AVUser anotherUser= list.get(0);
        acl.setWriteAccess(anotherUser,true);

        //保存到云端
        post.saveInBackground();
      } else {
        // handle exception
      }
    }
  });
```
{% endblock %}

{% block create_role_administrator %}

```
  // 新建一个针对角色本身的 ACL
  AVACL roleACL=new AVACL();
  roleACL.setPublicReadAccess(true);
  roleACL.setWriteAccess(AVUser.getCurrentUser(),true);

  // 新建一个角色，并把为当前用户赋予该角色
  AVRole administrator= new AVRole("Administrator",roleACL);//新建角色
  administrator.getUsers().add(AVUser.getCurrentUser());//为当前用户赋予该角色
  administrator.saveInBackground();//保存到云端
```
{% endblock %}

{% block query_role_administrator %}

```
  AVQuery<AVRole> roleQuery=new AVQuery<AVRole>("_Role");
  roleQuery.whereEqualTo("name","Administrator");
  roleQuery.findInBackground(new FindCallback<AVRole>() {
    @Override
    public void done(List<AVRole> list, AVException e) {
      AVRole administrator = list.get(0);
      AVRelation userRelation= administrator.getUsers();
      AVQuery<AVUser> query=userRelation.getQuery();
      query.findInBackground(new FindCallback<AVUser>() {
        @Override
        public void done(List<AVUser> list, AVException e) {
          // list 就是拥有该角色权限的所有用户了。
        }
      });
    }
  });
```
{% endblock %}

{% block query_role_of_user %}

```
  AVQuery<AVRole> roleQuery = new AVQuery<AVRole>("_Role");
  roleQuery.whereEqualTo("users",AVUser.getCurrentUser());
  roleQuery.findInBackground(new FindCallback<AVRole>() {
    @Override
    public void done(List<AVRole> list, AVException e) {
      // list 就是一个 AVRole 的 List，这些 AVRole 就是当前用户所在拥有的角色
    }
  });
```
{% endblock %}

{% block query_user_of_role %}

```
  AVRole moderatorRole= new AVRole("Moderator"); //根据 id 查询或者根据 name 查询出一个实例
  AVRelation<AVUser> userRelation= moderatorRole.getUsers();
  AVQuery<AVUser> userQuery = userRelation.getQuery();
  userQuery.findInBackground(new FindCallback<AVUser>() {
    @Override
    public void done(List<AVUser> list, AVException e) {
      // list 就是拥有该角色权限的所有用户了。
    }
  });
```
{% endblock %}

{% block set_acl_for_role %}

```
  // 新建一个帖子对象
  final AVObject post = new AVObject("Post");
  post.put("title", "夏天吃什么夜宵比较爽？");
  post.put("content", "求推荐啊！");

  AVQuery<AVRole> roleQuery=new AVQuery<AVRole>("_Role");
  // 假设上一步创建的 Administrator 角色的 objectId 为 55fc0eb700b039e44440016c
  roleQuery.getInBackground("55fc0eb700b039e44440016c", new GetCallback<AVRole>() {
    @Override
    public void done(AVRole avRole, AVException e) {
      //新建一个 ACL 实例
      AVACL acl = new AVACL();
      acl.setPublicReadAccess(true);// 设置公开的「读」权限，任何人都可阅读
      acl.setRoleWriteAccess(avRole, true);// 为 Administrator 「写」权限
      acl.setWriteAccess(AVUser.getCurrentUser(), true);// 为当前用户赋予「写」权限

      // 以上代码的效果就是：只有 Post 作者（当前用户）和拥有 Administrator 角色的用户可以修改这条 Post，而所有人都可以读取这条 Post
      post.setACL(acl);
      post.saveInBackground();
    }
  });
```
{% endblock %}


{% block add_role_for_user %}

```
  final AVQuery<AVRole> roleQuery =new AVQuery<AVRole>("_Role");
  roleQuery.whereEqualTo("name","Administrator");
  roleQuery.findInBackground(new FindCallback<AVRole>() {
    @Override
    public void done(List<AVRole> list, AVException e) {
      // 如果角色存在
      if (list.size() > 0){
        final AVRole administratorRole = list.get(0);
        roleQuery.whereEqualTo("users",AVUser.getCurrentUser());
        roleQuery.findInBackground(new FindCallback<AVRole>() {
          @Override
          public void done(List<AVRole> list, AVException e) {
            if (list.size()  == 0){
              administratorRole.getUsers().add(AVUser.getCurrentUser());// 赋予角色
              administratorRole.saveInBackground();
            }
          }
        });
      }else {
        // 角色不存在，就新建角色
        AVRole administratorRole=new AVRole("Administrator");
        administratorRole.getUsers().add(AVUser.getCurrentUser());// 赋予角色
        administratorRole.saveInBackground();
      }
    }
  });
```
{% endblock %}

{% block remove_role_from_user %}

```
  final AVQuery<AVRole> roleQuery=new AVQuery<AVRole>("_Role");
  roleQuery.whereEqualTo("name","Moderator");
  roleQuery.findInBackground(new FindCallback<AVRole>() {
    @Override
    public void done(List<AVRole> list, AVException e) {
      if(list.size() > 0){
        final AVRole moderatorRole= list.get(0);
        roleQuery.whereEqualTo("users",AVUser.getCurrentUser());
        roleQuery.findInBackground(new FindCallback<AVRole>() {
          @Override
          public void done(List<AVRole> list, AVException e) {
            // 如果该用户确实拥有该角色，那么就剥夺
            if(list.size() > 0) {
              moderatorRole.getUsers().remove(AVUser.getCurrentUser());
              moderatorRole.saveInBackground();
            }
          }
        });
      } else {
      }
    }
  });
```
{% endblock %}

{% block asign_role_to_parent %}

```
  AVRole administratorRole = // 从服务端查询 Administrator 实例
  AVRole moderatorRole = // 从服务端查询 Moderator 实例

  // 向 moderatorRole 的 roles（AVRelation） 中添加 administratorRole
  moderatorRole.getRoles().add(administratorRole);
  moderatorRole.saveInBackground();
```
{% endblock %}

{% block share_role %}

```
    // 新建 3个角色实例
  AVRole photographicRole = // 创建或者创建 Photographic 角色
  AVRole mobileRole = // 创建或者创建 Mobile 角色
  AVRole digitalRole = // 创建或者创建 Digital 角色

  // photographicRole 和 mobileRole 继承了 digitalRole
  digitalRole.getRoles().add(photographicRole);
  digitalRole.getRoles().add(mobileRole);

  digitalRole.saveInBackground(new SaveCallback() {
    @Override
    public void done(AVException e) {

      //新建 3 篇贴子，分别发在不同的板块上
      AVObject photographicPost= new AVObject ("Post");
      AVObject mobilePost = new AVObject("Post");
      AVObject digitalPost = new AVObject("Post");
      //.....此处省略一些具体的值设定

      AVACL photographicACL = new AVACL();
      photographicACL.setPublicReadAccess(true);
      photographicACL.setRoleWriteAccess(photographicRole, true);
      photographicPost.setACL(photographicACL);

      AVACL mobileACL = new AVACL();
      mobileACL.setPublicReadAccess(true);
      mobileACL.setRoleWriteAccess(mobileRole, true);
      mobilePost.setACL(mobileACL);

      AVACL digitalACL = new AVACL();
      digitalACL.setPublicReadAccess(true);
      digitalACL.setRoleWriteAccess(digitalRole, true);
      digitalPost.setACL(digitalACL);

      // photographicPost 只有 photographicRole 可以读写
      // mobilePost 只有 mobileRole 可以读写
      // 而 photographicRole，mobileRole，digitalRole 均可以对 digitalPost 进行读写
      photographicPost.saveInBackground();
      mobilePost.saveInBackground();
      digitalPost.saveInBackground();
    }
  });
```

{% endblock %}

{% extends "./acl_guide.tmpl" %}

{% set language = "Objective-C SDK" %}
{% set runAtClient = "true" %}
{% set platform = "iOS / OS X" %}
{% block link_to_acl_quickStart %}[权限管理以及 ACL 快速指南](acl_quick_start-ios.html){% endblock %}
{% block create_post_set_acl_for_single_user %}

```objc
    // 新建一个帖子对象
    AVObject *post = [AVObject objectWithClassName:@"Post"];
    [post setObject:@"大家好，我是新人" forKey:@"title"];
    
    //新建一个 ACL 实例
    AVACL *acl = [AVACL ACL];
    [acl setPublicReadAccess:YES];// 设置公开的「读」权限，任何人都可阅读
    [acl setWriteAccess:YES forUser:[AVUser currentUser]];// 为当前用户赋予「写」权限，有且仅有当前用户可以修改这条 Post
    post.ACL = acl;// 将 ACL 实例赋予 Post对象
    
    [post saveInBackground];
```

{% endblock %}

{% block create_post_set_acl_for_othter_user %}

```objc
    AVQuery *query = [AVUser query];
    [query whereKey:@"objectId" equalTo:@"55f1572460b2ce30e8b7afde"];
    [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        if (error == nil) {
            // 新建一个帖子对象
            AVObject *post = [AVObject objectWithClassName:@"Post"];
            [post setObject:@"这是我的第二条发言，谢谢大家！" forKey:@"title"];
            [post setObject:@"我最近喜欢看足球和篮球了。" forKey:@"content"];
            
            //新建一个 ACL 实例
            AVACL *acl = [AVACL ACL];
            [acl setPublicReadAccess:YES];// 设置公开的「读」权限，任何人都可阅读
            [acl setWriteAccess:YES forUser:[AVUser currentUser]];// 为当前用户赋予「写」权限
            
            AVUser *othterUser = [objects objectAtIndex:0];// 读取 admin
            [acl setWriteAccess:YES forUser:othterUser];
            
            post.ACL = acl;// 将 ACL 实例赋予 Post 对象
            
            [post saveInBackground];
            
        } else {
            NSLog(@"error");
        }
    }];
```
{% endblock %}

{% block create_role_administrator %}

```objc
    // 设定角色本身的 ACL 
    AVACL *roleACL = [AVACL ACL];
    [roleACL setPublicReadAccess:YES];
    [roleACL setWriteAccess:YES forUser:[AVUser currentUser]];
    
    // 创建角色，并且保存
    AVRole *administratorRole= [AVRole roleWithName:@"Administrator"];
    [[administratorRole users] addObject: [AVUser currentUser]];
    [administratorRole saveInBackground];
```
{% endblock %}

{% block query_role_administrator %}

```objc
    // 构建角色的查询，并且查看该角色所对应的用户
    AVQuery *roleQuery= [AVRole query];
    [roleQuery whereKey:@"name" equalTo:@"Administrator"];
    [roleQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        AVRole *administrator=[objects objectAtIndex:0];
        AVRelation *userRelation =[administrator users];
        AVQuery *userQuery= [userRelation query];
        [userQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
            // objects 就是拥有该角色权限的所有用户了。
        }];
    }];
```
{% endblock %}

{% block query_role_of_user %}

```objc
    AVQuery *roleQuery= [AVRole query];
    [roleQuery whereKey:@"users" equalTo: [AVUser currentUser]];
    [roleQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        // objects 就是一个 AVRole 的数组，这些 AVRole 就是当前用户所在拥有的角色
    }];
```
{% endblock %}

{% block query_user_of_role %}

```objc
    AVRole *moderatorRole=//根据 id 查询或者根据 name 查询出一个实例
    AVRelation *userRelation =[moderatorRole users];
    AVQuery *userQuery= [userRelation query];
    [userQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        // objects 就是拥有 moderatorRole 角色的所有用户了。
    }];
```
{% endblock %}

{% block set_acl_for_role %}

```objc
    // 新建一个帖子对象
    AVObject *post = [AVObject objectWithClassName:@"Post"];
    [post setObject:@"夏天吃什么夜宵比较爽？" forKey:@"title"];
    [post setObject:@"求推荐啊！" forKey:@"content"];
    
    
     // 假设之前创建的 Administrator 角色 objectId 为 55fc0eb700b039e44440016c，我们使用
    AVQuery *roleQuery= [AVRole query];
    [roleQuery getObjectInBackgroundWithId:@"55fc0eb700b039e44440016c" block:^(AVObject *object, NSError *error) {
        AVRole *administratorRole = (AVRole*) object;
        [administratorRole saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
            //新建一个 ACL 实例
            AVACL *acl = [AVACL ACL];
            [acl setPublicReadAccess:YES];// 设置公开的「读」权限，任何人都可阅读
            [acl setWriteAccess:YES  forRole:administratorRole];// 为 Administrator 「写」权限
            [acl setWriteAccess:YES  forUser:[AVUser currentUser]];// 为当前用户赋予「写」权限
            post.ACL = acl;// 将 ACL 实例赋予 Post对象
            
            // 以上代码的效果就是：只有 Post 作者（当前用户）和拥有 Administrator 角色的用户可以修改这条 Post，而所有人都可以读取这条 Post
            [post saveInBackground];
        }];
    }];
```
{% endblock %}


{% block add_role_for_user %}

```objc
    AVQuery *roleQuery= [AVRole query];
    [roleQuery whereKey:@"name" equalTo:@"Administrator"];
    [roleQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        // 如果角色存在
        if ([objects count] > 0) {
            AVRole *administratorRole= [objects objectAtIndex:0];
            [roleQuery whereKey:@"users" equalTo:[AVUser currentUser]];
            [roleQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error){
                if ([objects count] == 0) {
                    //为用户赋予角色
                    [[administrator users ] addObject:[AVUser currentUser]];
                    [administrator saveInBackground];
                } else {
                    NSLog(@"已经拥有 Moderator 角色了。");
                }
            }];
            
        } else {
            // 角色不存在，就新建角色
            AVRole *administrator =[AVRole roleWithName:@"Administrator"];
            [[administrator users ] addObject:[AVUser currentUser]];// 赋予角色
            [administrator saveInBackground];
        }
    }];
```
{% endblock %}

{% block remove_role_from_user %}

```objc
    AVQuery *roleQuery= [AVRole query];
    [roleQuery whereKey:@"name" equalTo:@"Moderator"];
    [roleQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        // 如果角色存在
        if ([objects count] > 0) {
            AVRole *moderatorRole= [objects objectAtIndex:0];
            [roleQuery whereKey:@"users" equalTo:[AVUser currentUser]];
            [roleQuery findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error){
                // 如果用户确实拥有该角色，那么就剥夺
                if ([objects count] > 0) {
                    [[moderatorRole users ]  removeObject:[AVUser currentUser]];
                    [moderatorRole saveInBackground];
                }
            }];
        }
    }];
```
{% endblock %}

{% block asign_role_to_parent %}

```objc
    AVRole *administratorRole = //从服务端查询出 Administrator 角色实例
    AVRole *moderatorRole = //从服务端查询出 Moderator 角色实例
    
    // 向 moderatorRole 的 roles（AVRelation）中添加 administratorRole
    [[moderatorRole roles] addObject:administratorRole];
    
    [moderatorRole saveInBackground];
    /**
     * 以上用同步方法是为了保证在调用 [[moderator roles] addObject:administratorRole] 之前 administratorRole 和 moderator 都已保存在服务端
     **/
```
{% endblock %}

{% block share_role %}

```objc
    // 新建 3个角色实例
    AVRole *photographicRole = //创建或者从服务端查询出 Photographic 角色实例
    AVRole *mobileRole = //创建或从服务端查询出 Mobile 角色实例
    AVRole *digitalRole = //创建或从服务端查询出 Digital 角色实例
    
    // photographicRole 和 mobileRole 继承了 digitalRole
    [[digitalRole roles] addObject:photographicRole];
    [[digitalRole roles] addObject:mobileRole];

    [digitalRole saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
       
        AVObject *photographicPost= [AVObject objectWithClassName:@"Post"];
        AVObject *mobilePost = [AVObject objectWithClassName:@"Post"];
        AVObject *digitalPost = [AVObject objectWithClassName:@"Post"];
        //.....此处省略一些具体的值设定
        
        AVACL *photographicACL = [AVACL ACL];
        [photographicACL setReadAccess:YES forRole:photographicRole];
        [photographicACL setPublicReadAccess:YES];
        [photographicACL setWriteAccess:YES forRole:photographicRole];
        [photographicPost setACL:photographicACL];
        
        AVACL *mobileACL = [AVACL ACL];
        [mobileACL setReadAccess:YES forRole:mobileRole];
        [mobileACL setWriteAccess:YES forRole:mobileRole];
        [mobilePost setACL:mobileACL];
        
        AVACL *digitalACL = [AVACL ACL];
        [digitalACL setReadAccess:YES forRole:digitalRole];
        [digitalPost setACL:digitalACL];
        
        // photographicPost 只有 photographicRole 可以读写
        // mobilePost 只有 mobileRole 可以读写
        // 而 photographicRole，mobileRole，digitalRole 均可以对 digitalPost 进行读写
        [photographicPost saveInBackground];
        [mobilePost saveInBackground];
        [digitalPost saveInBackground];
    }];
```

{% endblock %}




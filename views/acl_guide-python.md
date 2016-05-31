{% extends "./acl_guide.tmpl" %}

{% block language_version %}Python{% endblock %}
{% block link_to_acl_quickStart %}[权限管理以及 ACL 快速指南](acl_quick_start-js.html){% endblock %}
{% block create_post_set_acl_for_single_user %}

```python
import leancloud
from leancloud import Object
from leancloud import ACL

#新建一个帖子对象
Post = Object.extend('Post')
post = Post()
post.set('title','大家好，我是新人')

#新建一个ACL实例
acl = ACL()
acl.set_public_read_access(True)
acl.set_write_access('user_objectId', True) #这里设置某个 user 的写权限

#将 ACL 实例赋予 Post 对象
post.set_acl(acl)
post.save()
```

{% endblock %}

{% block create_post_set_acl_for_othter_user %}

```python
import leancloud
from leancloud import Object
from leancloud import ACL
from leancloud import User

#登陆一个用户
user = User()
user.login('my_user_name','my_password')

#新建一个 Post 对象
Post = Object.extend('Post')
post = Post()
post.set('title','大家好，我是新人')

#新建一个 ACL 实例
acl = ACL()
acl.set_public_read_access(True)
acl.set_write_access(User.get_current().id, True) #设置当前登陆用户的的可写权限
acl.set_write_access('55f1572460b2ce30e8b7afde', True) #设定指定用户的可写权限
post.set_acl(acl)
post.save()
```
{% endblock %}

{% block create_role_administrator %}

```python
import leancloud
from leancloud import User
from leancloud import Role

user = User()
user.login('username','password') #登陆一个用户

#新建一个角色，并把为当前用户赋予该角色
administratorRole = Role('Administrator')
relation = administratorRole.get_users()
relation.add(User.get_current())  #为当前用户赋予该角色
administratorRole.save() #保存
```
{% endblock %}

{% block query_role_of_user %}
```python
import leancloud
from leancloud import User
from leancloud import Role
from leancloud import Query

user = User()
user.login('username','password')

role_query = Query(Role)
role_query.equal_to('users', User.get_current())
role_query_list = role_query.find() #返回当前用户的角色列表
```
{% endblock %}

{% block query_role_administrator %}

```python

import leancloud
from leancloud import User
from leancloud import Role
from leancloud import Query

user = User()
user.login('username','password')

role_query = Query(Role)
role_query.equal_to('name', 'Administrator')
role_query_list = role_query.find()

if len(role_query_list) > 0:  #该角色存在
    administrator_role = role_query_list[0]  #获取该角色对象
    userRelation = administrator_role.relation('users')
    users_with_administrator = userRelation.query.find()  #查找该角色下的所有用户列表。如果这里有权限问题，请到控制台设置 User 对象的权限
    print users_with_administrator
else:
    #该角色不存在，可以新建该角色，并把当前用户设置成该角色
    pass
```
{% endblock %}

{% block query_user_of_role %}

```python
import leancloud
from leancloud import Role
from leancloud import Query

role_query = Query(Role)
role = role_query.get('573d5fdc2e958a0069f5d6fe') #根据 objectId 获取 role 对象
user_relation = role.get_users() #获取 user 的 relation

user_list = user_relation.query.find() #根据 relation 查找所包含的用户列表
```
{% endblock %}

{% block set_acl_for_role %}

```python
import leancloud
from leancloud import User
from leancloud import Role
from leancloud import Object
from leancloud import ACL

#登陆一个用户
user = User()
user.login('username','password')
#创建一个 Post 的帖子对象
Post = Object.extend('Post')
post = Post()
post.set('title','大家好，我是新人')

#新建一个角色，并把当前用户赋予该角色
administratorRole = Role('Administrator')
relation = administratorRole.get_users()
relation.add(User.get_current())
administratorRole.save()

#新建一个 ACL 对象，并赋予角色可写权限
acl = ACL()
acl.set_public_read_access(True)
acl.set_role_write_access(administratorRole, True)

#将 ACL 实例赋予 Post 对象
post.set_acl(acl)
post.save()
```
{% endblock %}


{% block add_role_for_user %}

```python
import leancloud
from leancloud import User
from leancloud import Role
from leancloud import Object
from leancloud import ACL
from leancloud import Query

user = User()
user.login('username','password')

role_query = Query(Role)
role_query.equal_to('name', 'Administrator')
role_query_list = role_query.find()

if len(role_query_list) > 0:  #该角色存在
    administrator_role = role_query_list[0]
    role_query.equal_to('users', User.get_current())
    role_query_with_current_user = role_query.find()
    if len(role_query_with_current_user) == 0: #该角色存在，但是当前用户尚未被赋予该角色
        relation = administrator_role.get_users()
        relation.add(User.get_current())  #为当前用户赋予该角色
        administrator_role.save()
    else:
        #该角色存在，当前用户已被被赋予该角色
        pass
else:
    #该角色不存在，可以新建该角色，并把当前用户设置成该角色
    administrator_role = Role('Administrator')
    relation = administrator_role.get_users()
    relation.add(User.get_current())
    administrator_role.save()
```
{% endblock %}

{% block remove_role_from_user %}

```python
import leancloud
from leancloud import User
from leancloud import Role
from leancloud import Query

user = User()
user.login('username','password')

role_query = Query(Role)
role_query.equal_to('name', 'Administrator')
role_query_list = role_query.find()

if len(role_query_list) > 0:  #该角色存在
    administrator_role = role_query_list[0]
    role_query.equal_to('users', User.get_current())
    role_query_with_current_user = role_query.find()
    if len(role_query_with_current_user) > 0: #该角色存在，且当前用户拥有该角色
        relation = administrator_role.get_users()
        relation.remove(User.get_current())  #为当前用户剥夺该角色
        administrator_role.save()
    else:
        #该角色存在，当前用户并不拥有该角色
        pass
else:
    #该角色不存在，可以新建该角色，并把当前用户设置成该角色
    pass
```
{% endblock %}

{% block asign_role_to_parent %}

```python
import leancloud
from leancloud import Role
from leancloud import Query
from leancloud import ACL

#建立版主和论坛管理员之间的角色从属关系
administratorRole = Role("Administrator") #新建角色
moderatorRole = Role("Moderator") #新建角色

moderator_acl = ACL()
moderator_acl.set_public_write_access(True) #这里为了在后面可以添加 moderatorRole 可以添加 role， 设置一个可写权限
moderatorRole.set_acl(moderator_acl)

administratorRole.save()
moderatorRole.save()

moderatorRole.get_roles().add(administratorRole) #将 Administrator 设为 moderatorRole 一个子角色
moderatorRole.save()
```
{% endblock %}

{% block share_role %}

```python
rt leancloud
from leancloud import Role
from leancloud import Query
from leancloud import ACL
from leancloud import Object

photographicRole = Role("Photographic") #新建摄影器材版主角色
mobileRole = Role("Mobile") #新建手机平板版主角色
digitalRole = Role("Digital") #新建电子数码版主角色

#先行保存 photographicRole 和 mobileRole
photographicRole.save()
mobileRole.save()

#将 photographicRole 和 mobileRole 设为 digitalRole 一个子角色
digitalRole.get_roles().add(photographicRole)
digitalRole.get_roles().add(mobileRole)
digitalRole.save() #保存


#新建一个帖子对象
Post = Object.extend("Post")

#新建摄影器材板块的帖子
photographicPost = Post()
photographicPost.set("title", "我是摄影器材板块的帖子！")

#新建手机平板板块的帖子
mobilePost = Post()
mobilePost.set("title", "我是手机平板板块的帖子！")

#新建电子数码板块的帖子
digitalPost = Post()
digitalPost.set("title", "我是电子数码板块的帖子！")


#新建一个摄影器材版主可写的 ACL 实例
photographicACL = ACL()
photographicACL.set_public_read_access(True)
photographicACL.set_role_write_access(photographicRole,True)

#新建一个手机平板版主可写的 ACL 实例
mobileACL = ACL();
mobileACL.set_public_read_access(True)
mobileACL.set_role_write_access(mobileRole,True)

#新建一个手机平板版主可写的 ACL 实例
digitalACL = ACL()
digitalACL.set_public_read_access(True)
digitalACL.set_role_write_access(digitalRole,True)

#photographicPost 只有 photographicRole 可以读写
#mobilePost 只有 mobileRole 可以读写
#而 photographicRole，mobileRole，digitalRole 均可以对 digitalPost 进行读写
photographicPost.set_acl(photographicACL)
mobilePost.set_acl(mobileACL)
digitalPost.set_acl(digitalACL)

photographicPost.save()
mobilePost.save()
digitalPost.save()
```

{% endblock %}

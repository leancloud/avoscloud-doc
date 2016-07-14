{% extends "./acl_guide.tmpl" %}

{% set language = "Python" %}
{% set runAtServer = "true" %}
{% set platform = "Python SDK" %}
{% block link_to_acl_quickStart %}[权限管理以及 ACL 快速指南](acl_quick_start-python.html){% endblock %}
{% block create_post_set_acl_for_single_user %}

```python
import leancloud

# 新建一个帖子对象
Post = leancloud.Object.extend('Post')
post = Post()
post.set('title', '大家好，我是新人')

# 新建一个leancloud.ACL实例
acl = leancloud.ACL()
acl.set_public_read_access(True)
# 这里设置某个 user 的写权限
acl.set_write_access('user_objectId', True)

# 将 leancloud.ACL 实例赋予 Post 对象
post.set_acl(acl)
post.save()
```

{% endblock %}

{% block create_post_set_acl_for_othter_user %}

```python
import leancloud

# 登录一个用户
user = leancloud.User()
user.login('my_user_name', 'my_password')

# 新建一个 Post 对象
Post = leancloud.Object.extend('Post')
post = Post()
post.set('title', '大家好，我是新人')

# 新建一个 leancloud.ACL 实例
acl = leancloud.ACL()
acl.set_public_read_access(True)
# 设置当前登录用户的的可写权限
acl.set_write_access(leancloud.User.get_current().id, True)
# 设定指定 objectId 用户的可写权限
acl.set_write_access('55f1572460b2ce30e8b7afde', True)
post.set_acl(acl)
post.save()
```
{% endblock %}

{% block create_role_administrator %}

```python
import leancloud

user = leancloud.User()
user.login('username', 'password')  # 登录一个用户

# 新建一个角色，并把为当前用户赋予该角色
administrator_role = leancloud.Role('Administrator')
relation = administrator_role.get_users()
relation.add(leancloud.User.get_current())  # 为当前用户赋予该角色
administrator_role.save()  # 保存
```
{% endblock %}

{% block query_role_of_user %}
```python
import leancloud

user = leancloud.User()
user.login('username','password')

role_query = leancloud.Query(leancloud.Role)
role_query.equal_to('users', leancloud.User.get_current())
role_query_list = role_query.find()  # 返回当前用户的角色列表
```
{% endblock %}

{% block query_role_administrator %}

```python

import leancloud

user = leancloud.User()
user.login('username', 'password')

role_query = leancloud.Query(leancloud.Role)
role_query.equal_to('name', 'Administrator')
role_query_list = role_query.find()

if len(role_query_list) > 0:  # 该角色存在
    administrator_role = role_query_list[0]  # 获取该角色对象
    user_relation = administrator_role.relation('users')
    # 查找该角色下的所有用户列表。如果这里有权限问题，请到控制台设置 leancloud.User 对象的权限
    users_with_administrator = user_relation.query.find()
    print users_with_administrator
else:
    # 该角色不存在，可以新建该角色，并把当前用户设置成该角色
    pass
```
{% endblock %}

{% block query_user_of_role %}

```python
import leancloud

role_query = leancloud.Query(leancloud.Role)
role = role_query.get('573d5fdc2e958a0069f5d6fe')  # 根据 objectId 获取 role 对象
user_relation = role.get_users()  # 获取 user 的 relation

user_list = user_relation.query.find()  # 根据 relation 查找所包含的用户列表
```
{% endblock %}

{% block set_acl_for_role %}

```python
import leancloud

# 登录一个用户
user = leancloud.User()
user.login('username', 'password')
# 创建一个 Post 的帖子对象
Post = leancloud.Object.extend('Post')
post = Post()
post.set('title', '大家好，我是新人')

# 新建一个角色，并把当前用户赋予该角色
administrator_role = leancloud.Role('Administrator')
relation = administrator_role.get_users()
relation.add(leancloud.User.get_current())
administrator_role.save()

# 新建一个 leancloud.ACL 对象，并赋予角色可写权限
acl = leancloud.ACL()
acl.set_public_read_access(True)
acl.set_role_write_access(administrator_role, True)

# 将 leancloud.ACL 实例赋予 Post 对象
post.set_acl(acl)
post.save()
```
{% endblock %}


{% block add_role_for_user %}

```python
import leancloud

user = leancloud.User()
user.login('username', 'password')

role_query = leancloud.Query(leancloud.Role)
role_query.equal_to('name', 'Administrator')
role_query_list = role_query.find()

if len(role_query_list) > 0:  # 该角色存在
    administrator_role = role_query_list[0]
    role_query.equal_to('users', leancloud.User.get_current())
    role_query_with_current_user = role_query.find()
    if len(role_query_with_current_user) == 0:
      # 该角色存在，但是当前用户尚未被赋予该角色
        relation = administrator_role.get_users()
        relation.add(leancloud.User.get_current())  # 为当前用户赋予该角色
        administrator_role.save()
    else:
        # 该角色存在，当前用户已被被赋予该角色
        pass
else:
    # 该角色不存在，可以新建该角色，并把当前用户设置成该角色
    administrator_role = leancloud.Role('Administrator')
    relation = administrator_role.get_users()
    relation.add(leancloud.User.get_current())
    administrator_role.save()
```
{% endblock %}

{% block remove_role_from_user %}

```python
import leancloud

user = leancloud.User()
user.login('username', 'password')

role_query = leancloud.Query(leancloud.Role)
role_query.equal_to('name', 'Administrator')
role_query_list = role_query.find()

if len(role_query_list) > 0:  # 该角色存在
    administrator_role = role_query_list[0]
    role_query.equal_to('users', leancloud.User.get_current())
    role_query_with_current_user = role_query.find()
    if len(role_query_with_current_user) > 0:
      # 该角色存在，且当前用户拥有该角色
        relation = administrator_role.get_users()
        relation.remove(leancloud.User.get_current())
        # 为当前用户剥夺该角色
        administrator_role.save()
    else:
        # 该角色存在，当前用户并不拥有该角色
        pass
else:
    # 该角色不存在，可以新建该角色，并把当前用户设置成该角色
    pass
```
{% endblock %}

{% block asign_role_to_parent %}

```python
import leancloud

# 建立版主和论坛管理员之间的角色从属关系
administrator_role = leancloud.Role("Administrator")  # 新建角色
moderator_role = leancloud.Role("Moderator")  # 新建角色

moderator_acl = leancloud.ACL()
# 这里为了在后面可以添加 moderator_role 可以添加 role， 设置一个可写权限
moderator_acl.set_public_write_access(True)
moderator_role.set_acl(moderator_acl)

administrator_role.save()
moderator_role.save()

# 将 Administrator 设为 moderator_role 一个子角色
moderator_role.get_roles().add(administrator_role)
moderator_role.save()
```
{% endblock %}

{% block share_role %}

```python
import leancloud

photographic_role = leancloud.Role("Photographic") # 新建摄影器材版主角色
mobile_role = leancloud.Role("Mobile")  # 新建手机平板版主角色
digital_role = leancloud.Role("Digital")  # 新建电子数码版主角色

# 先行保存 photographic_role 和 mobile_role
photographic_role.save()
mobile_role.save()

# 将 photographic_role 和 mobile_role 设为 digital_role 一个子角色
digital_role.get_roles().add(photographic_role)
digital_role.get_roles().add(mobile_role)
digital_role.save() # 保存


# 新建一个帖子对象
Post = leancloud.Object.extend("Post")

# 新建摄影器材板块的帖子
photographic_post = Post()
photographic_post.set("title", "我是摄影器材板块的帖子！")

# 新建手机平板板块的帖子
mobile_post = Post()
mobile_post.set("title", "我是手机平板板块的帖子！")

# 新建电子数码板块的帖子
digital_post = Post()
digital_post.set("title", "我是电子数码板块的帖子！")


# 新建一个摄影器材版主可写的 leancloud.ACL 实例
photographic_acl = leancloud.ACL()
photographic_acl.set_public_read_access(True)
photographic_acl.set_role_write_access(photographic_role, True)

# 新建一个手机平板版主可写的 leancloud.ACL 实例
mobile_acl = leancloud.ACL();
mobile_acl.set_public_read_access(True)
mobile_acl.set_role_write_access(mobile_role, True)

# 新建一个手机平板版主可写的 leancloud.ACL 实例
digital_acl = leancloud.ACL()
digital_acl.set_public_read_access(True)
digital_acl.set_role_write_access(digital_role, True)

# photographic_post 只有 photographic_role 可以读写
# mobile_post 只有 mobile_role 可以读写
# 而 photographic_role，mobile_role，digital_role 均可以对 digital_post 进行读写
photographic_post.set_acl(photographic_acl)
mobile_post.set_acl(mobile_acl)
digital_post.set_acl(digital_acl)

photographic_post.save()
mobile_post.save()
digital_post.save()
```

{% endblock %}

{% block sdk_init_user_masterKey %}
在 Python 中可以使用如下代码初始化 SDK：

```py
  # 第一个参数是 AppId，第二个是 Master Key。 
  leancloud.init("appId", master_key="masterKey")
```
{% endblock %}
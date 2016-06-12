{% extends "./acl_quick_start.tmpl" %}

{% block language_version %}Python{% endblock %}
{% block code_not_use_acl %}
<pre lang="python">
import leancloud
from leancloud import Object

# 新建一个帖子对象
Post = Object.extend('Post')
post = Post()
post.set('title', '大家好，我是新人')
post.set('content', '我喜欢看新闻和阅读报纸。')
post.save()
</pre>
{% endblock %}

{% block code_use_acl %}

<pre lang="python">
import leancloud
from leancloud import Object
from leancloud import ACL

# 新建一个帖子对象
Post = Object.extend('Post')
post = Post()
post.set('title', '大家好，我是新人')
post.set('content', '我喜欢看新闻和阅读报纸。')


# 新建一个ACL实例
acl = ACL()
acl.set_public_read_access(True)
acl.set_write_access('{{userObjectId}}', True) # 这里设置某个 user 的写权限

# 将 ACL 实例赋予 Post 对象
post.set_acl(acl)
post.save()
</pre>

{% endblock %}
{% block link_to_acl_guide %}[LeanCloud 权限管理使用规范](./acl_guide-python.html){% endblock %}

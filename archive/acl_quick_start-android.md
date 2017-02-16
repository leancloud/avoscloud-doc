{% extends "./acl_quick_start.tmpl" %}

{% set platform_name = "Android" %}
{% set acl_guide_url = "[LeanCloud 权限管理使用规范](./acl_guide-android.html)" %}

{% block code_not_use_acl %}
<pre lang="java">
AVObject post = new AVObject("Post");
post.put("title", "大家好，我是新人");
post.put("content", "我喜欢看新闻和阅读报纸。");

post.saveInBackground();
</pre>
{% endblock %}

{% block code_use_acl %}
<pre lang="java">
AVObject post = new AVObject("Post");
post.put("title", "大家好，我是新人");
post.put("content", "我喜欢看新闻和阅读报纸。");

AVACL acl = new AVACL();
acl.setPublicReadAccess(true);   //此处设置的是所有人的可读权限
acl.setWriteAccess(AVUser.getCurrentUser(), true);   //而这里设置了 Post 创建者的写权限

post.setACL(acl);//设置 ACL

post.saveInBackground();
</pre>

{% endblock %}

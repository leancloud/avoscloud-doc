{% extends "./acl_quick_start.tmpl" %}

{% block language_version %}iOS{% endblock %}
{% block code_not_use_acl %}
<pre lang="objc">
AVObject *post = [AVObject objectWithClassName:@"Post"];
[post setObject:@"大家好，我是新人" forKey:@"title"];
[post setObject:@"我喜欢看新闻和阅读报纸。" forKey:@"content"];
[post saveInBackground];
</pre>
{% endblock %}

{% block code_use_acl %}

<pre lang="objc">
AVObject &ast;post = [AVObject objectWithClassName:@"Post"];
[post setObject:@"大家好，我是新人" forKey:@"title"];
[post setObject:@"我喜欢看新闻和阅读报纸。" forKey:@"content"];
    
//新建一个 ACL 实例
AVACL &ast;acl = [AVACL ACL];
[acl setPublicReadAccess:YES];// 设置公开的「读」权限，任何人都可阅读
[acl setWriteAccess:YES forUser:[AVUser currentUser]];// 为当前用户赋予「写」权限
post.ACL = acl;// 将 ACL 实例赋予 Post对象
    
[post saveInBackground];
</pre>

{% endblock %}

{% block link_to_acl_guide %}[LeanCloud 权限管理使用规范](./acl_guide-ios.html){% endblock %}

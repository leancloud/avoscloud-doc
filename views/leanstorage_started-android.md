{# 指定继承模板 #}
{% extends "./leanstorage_started.tmpl" %}

{# --Start--变量定义，主模板使用的单词和短语在所有子模板都必须赋值 #}
{% set platform = 'Android' %}
{% set avUserName = 'AVUser' %}
{% set avQueryName = 'AVQuery' %}
{% set avObjectName = 'AVObject' %}
{% set link_to_storage_guide_doc ="[Android 数据存储开发指南](leanstorage_guide-android.html)"%}
{# --End--变量定义，主模板使用的单词和短语在所有子模板都必须赋值 #}
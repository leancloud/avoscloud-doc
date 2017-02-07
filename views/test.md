{% extends "./test.tmpl" %}
{% import "views/_helper.njk" as docs %}
{% import "views/_sms.njk" as sms %}
{% import "views/_parts.html" as include %}
{% set content = "## 子文档的标题" %}
{% set span = "<strong>hi</strong>" | safe %}

{% macro child() %}
```
from macro child()
```
{% endmacro%}

{% block content %}


{{content}}

{{ docs.alert("line 1 (use linebreak)
line 2") }}

{{ docs.alert("") }}

{{ docs.note("line 1 ||line 2 (using <code>&verbar;&verbar;</code> as line  seperator) ") }}

{{ docs.mustache("safe") | safe }}

{{ docs.mustache("nosafe-span","span") }}

{{ docs.mustache("专业的","a", {style:"color:red;", "width": ""}) }}

{{ docs.objectStringify({width:"200",href:"http://leancloud.cn/lemon/"}) }}

```
{% set items = [1,2,3,4,5,6] %}
{% for item in items | batch(2) -%}
    -{% for items in item -%}
       {{ items }}
    {%- endfor %}
{%- endfor %}


{% set name=["pre","code"] %}
{% for item in name %}
- {{item}}
{% endfor %}
{% set name="pre,code" %}
{% for item in name %}
- {{item}}
{% endfor %}

{% set name="pre" %}
{% set attrs={"style":"color:red; background-color:#ccc;","width":"","nowrap":null} %}
{% set slot="hello" %}

{% set obj={"width":"","height":null,"name":"hello"} %}
{{ obj | dump | safe }}
{% for key, value in obj %}
- {{key}}({{value}}): (isNull?{{ value == null | dump }})
{% endfor %}


```




{% endblock %}



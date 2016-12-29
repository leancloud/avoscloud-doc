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


{% endblock %}



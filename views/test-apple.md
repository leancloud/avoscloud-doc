{% extends "./test.tmpl" %}

{% set foo = "bar" %}
{% set key1 = "value1" %}

{% block test_block %}

apple test
{% endblock %}

{% block test_block2 %}

apple test 2
{% endblock %}

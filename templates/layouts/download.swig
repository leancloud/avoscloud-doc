<!doctype html>

<html>

<head>

{% include 'templates/include/head.html' %}
</head>

<body  class="dashboard-init" ng-cloak>

{% include 'templates/include/header.html' %}

<div class="doc-content container-fluid" id="content" style="padding-bottom: 0;">
{{body}}
</div>
<!-- .container-fluid -->

{% include 'templates/include/footer.html' %}





</body>

</html>
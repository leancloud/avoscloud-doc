<!doctype html>

<html>

<head>

{% include 'templates/include/head.html' %}
</head>

<body  class="dashboard-init" ng-cloak ng-controller="AppCtrl">

{% if node=='qcloud' %}
  {% include 'templates/include/qcloudheader.html' %}
{% endif %}

{% if node!='qcloud' %}
  {% include 'templates/include/header.html' %}
{% endif %}

{% include 'templates/include/doc-nav.html' %}

<div class="container-fluid <%= node %>" id="content" style="padding-bottom: 0;">
  <div class="row">
    <div class="col-sm-12">
      <div class="doc-content">
        {{body}}
      </div>
      <!-- .doc-content -->
    </div>
    <!-- .col-sm-12 -->
  </div>
  <!-- .row -->
</div>
<!-- .container-fluid -->
{% include 'templates/include/common-footer.html' %}

{% if node=='qcloud' %}
  {% include 'templates/include/qcloudfooter.html' %}
{% endif %}

{% if node!='qcloud' %}
  {% include 'templates/include/footer.html' %}
{% endif %}


</body>

</html>
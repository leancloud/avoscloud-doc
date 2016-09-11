<!doctype html>

<html>

<head>

{% include 'templates/include/head.html' %}
</head>

<body id="home" class="dashboard-init" ng-cloak ng-controller="AppCtrl" data-spy="scroll" data-target=".scrollspy">

{% if node=='qcloud' %}
  {% include 'templates/include/qcloudheader.html' %}
{% endif %}

{% if node!='qcloud' %}
  {% include 'templates/include/header.html' %}
{% endif %}

<div class="container-fluid doc-content <%= node %> platform-as-tab" id="content">
  {{body}}
</div>
<!-- .container-fluid, .doc-content -->
{% include 'templates/include/common-footer.html' %}

{% if node=='qcloud' %}
  {% include 'templates/include/qcloudfooter.html' %}
{% endif %}

{% if node!='qcloud' %}
  {% include 'templates/include/footer.html' %}
{% endif %}

<script type="text/javascript"> 
// get nav items ready for scrollspy 
$(function() {
  var $sectionNav = $('#section-nav').find('ul');
  $('.section-title').each(function(index, el) {
    var $el = $(el);
    var id = $el.text().replace(/ /g,'-').replace(/[^a-zA-Z_0-9\u4e00-\u9fa5]/g,'-');
    $el.parent().attr('id',id);
    $sectionNav.append('<li><a href="#' + id + '">' + $el.html() + '</a></li>');
  });
});
$(window).load(function() { 
  $('#section-nav').affix({
      offset: {
        top: $('nav').outerHeight(true) + $('.doc-home-title').outerHeight(true)
      }
  }).addClass('loaded');
});
</script>
</body>
</html>

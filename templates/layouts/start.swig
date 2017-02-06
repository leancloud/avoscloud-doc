<!doctype html>

<html>

<head>

{% include 'templates/include/head.html' %}
<style type="text/css">
@media (min-width: 992px){
  #content {
      padding: 0 20%;
  }
}
.doc-home-title {
  background-color: white;
  z-index: 1000;
  display: block;
  width: 100%;
  top: 0;
  padding: 0;
  border-bottom: 1px solid #eee;
}  
.start-page .step h3 {
    padding: 0;
    margin: 20px 0;
    color: #aaa;
    font-size: 16px;
}
.step1 .custom-form-inline .custom-control {
    margin-top: 5px;
    margin-bottom: 5px;
    min-width: 108px;
}
#start-main {
  border-top: 1px solid #eee;
  margin-bottom: 24px;
  padding-top: 24px; 
}
/* loader */

.spinner {
  position: absolute;
  top: 30%;
  left: 50%;
  width: 24px;
  height: 24px;
  margin: 0px auto;
  background-color: #2c97e8;
  border-radius: 100%;
  -webkit-animation: sk-scaleout 1.0s infinite ease-in-out;
  animation: sk-scaleout 1.0s infinite ease-in-out;
}
@-webkit-keyframes sk-scaleout {
  0% {
      -webkit-transform: scale(0)
  }
  100% {
      -webkit-transform: scale(1.0);
      opacity: 0;
  }
}
@keyframes sk-scaleout {
  0% {
      -webkit-transform: scale(0);
      transform: scale(0);
  }
  100% {
      -webkit-transform: scale(1.0);
      transform: scale(1.0);
      opacity: 0;
  }
}
.loaded .spinner {
  display: none;
}
.spinner-wrap {
  height: 48px;
  position: relative;
}
</style>
</head>

<body  class="dashboard-init" ng-cloak ng-controller="AppCtrl">

{% if node=='qcloud' %}
  {% include 'templates/include/qcloudheader.html' %}
{% endif %}

{% if node!='qcloud' %}
  {% include 'templates/include/header.html' %}
{% endif %}

{% include 'templates/include/doc-nav.html' %}

<div class="container-fluid <%= node %>" id="content" style="padding-bottom: 2em;">
  {{body}}
</div>
<!-- .container-fluid -->
{% include 'templates/include/common-footer.html' %}

{% if node=='qcloud' %}
  {% include 'templates/include/qcloudfooter.html' %}
{% endif %}

{% if node!='qcloud' %}
  {% include 'templates/include/footer.html' %}
{% endif %}

<!-- <script type="text/javascript">
// get nav items ready for scrollspy
$(window).load(function() {
  $('.doc-home-title').affix({
      offset: {
        top: $('nav').outerHeight(true) + $('header').outerHeight(true)
      }
  });
});
</script> -->
</body>

</html>

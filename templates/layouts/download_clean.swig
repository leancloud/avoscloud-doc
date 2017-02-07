<!doctype html>

<html>

<head>

{% include 'templates/include/head.html' %}
<style>
* {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, "PingFang SC", "Microsoft Yahei", "WenQuanYi Micro Hei", ui-icon, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}
.doc-content {
  margin-bottom: 56px;
}
.doc-content .section-title {
  margin: 36px 0;
  font-size: 32px;
  color: #666;
  position: relative;
  overflow: hidden;
  padding: 0;
  text-align: center;
  z-index: 1;
}
.doc-content .section-title::before,
.doc-content .section-title::after {
  position: absolute;
  top: 51%;
  overflow: hidden;
  width: 50%;
  height: 1px;
  content: '\a0'!important;
  background-color: #ddd;
}
.doc-content .section-title:after {
  margin-left: 2%;
}
.doc-content .section-title:before {
  margin-left: -52%;
  text-align: right;
}
.doc-content h3 {
  margin: 6px 0;
  font-size: 1em;
  padding: 0;
  color: #999;
  line-height: 1.8;
}
.form-group {
  position: relative;
}
#site-search {
  border-width: 0 0 1px 0;
  border-style: solid;
  border-color: #666;
  border-radius: 0;
  text-align: center;
  background: none;
  font-size: 16px;
}
#site-search:focus {
  box-shadow: none;
}
.scrollspy {
  /*margin-bottom: 40px;*/
  font-size: 16px;
  background-color: #fff;
  position: relative;
}
.scrollspy ul {
  border: none;
  display: inline-block;
}
.scrollspy li {
  display: inline-block;
}
.scrollspy li>a {
  display: inline-block;
  padding: 20px 10px 19px;
  margin-bottom: -1px;
  line-height: 20px;
  border-bottom: 1px solid transparent;
  background: 0;
  white-space: nowrap;
}
.scrollspy ul>li>a:hover,
.scrollspy ul>li>a:active,
.scrollspy ul>li>a:focus,
.scrollspy .active a {
  background-color: transparent;
  border-bottom-color: #2c97e8;
}
.scrollspy li::after,
.list-platform>li::after {
  content: "·";
  color: #ccc;
}
.list-platform>li::after {
  margin-left: 6px;
}
.scrollspy li:last-child::after,
.list-platform>li:last-child::after {
  content: "";
}
.affix {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  box-shadow: 0 1px 1px rgba(0, 0, 0, .15);
}
.list-platform {
  margin: 8px 0;
}
.list-platform>li,.list-keyword>li {
  display: inline-block;
}
.platform-as-tab .list-platform>li>a {
  min-width: 90px;
}
.list-keyword {
  padding-left: 0;
}
.hero-search .list-keyword>li>a {
  padding: 2px 6px;
  border-radius: 2px;
}
.platform-as-tab .list-platform>li>a, .list-keyword>li>a {
  padding: 3px;
  font-size: 13px;
  background-color: #f4f4f4;
  margin: 2px 0;
  display: block;
  text-align: center;
  color: #888;
  line-height: 1.8;
  text-decoration: none;
  /* border: 1px solid #eee; */
}
.list-platform>li>a {
  line-height: 1.8;
  white-space: nowrap;
}
.platform-as-tab .list-platform>li>a:hover,.list-keyword>li>a:hover {
  background-color: #2c97e8;
  color: #fff;
}
.platform-as-tab .list-platform>li::after,
.platform-as-tab .list-platform>li:last-child::after {
  content: none!important;
}
.doc-home-title {
  padding-bottom: 40px;
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
.scrollspy .nav {
  visibility: hidden;
}
.scrollspy.loaded .nav {
  visibility: visible
}
</style>
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

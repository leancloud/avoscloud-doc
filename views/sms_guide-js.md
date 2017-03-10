{% extends "./sms_guide.tmpl" %}
{% set platform_name = "JavaScript" %}

{% block avuser_signup_send_sms %}
```javascript
  var user = new AV.User();
  user.set("username", "hjiang");
  user.set("password", "123456");
  user.setMobilePhoneNumber('186xxxxxxxx');
  user.signUp(null, ……)
```
{% endblock %}

{% block builtin_account_url %}
leanstorage_guide-js.html#用户
{% endblock %}

{% block avuser_signup_sms_verify %}
```javascript
  AV.User.verifyMobilePhone('6位数字验证码').then(function(){
    //验证成功
  }, function(err){
    //验证失败
  });
```
{% endblock %}

{% block avuser_request_sms_code %}
```javascript
  AV.User.requestMobilePhoneVerify('186xxxxxxxx').then(function(){
      //发送成功
  }, function(err){
      //发送失败
    });
```
{% endblock %}

{% block avuser_verify_sms_code %}
```javascript
  AV.User.verifyMobilePhone('6位数字验证码').then(function(){
      //验证成功
  }, function(err){
      //验证失败
  });
```
{% endblock %}

{% block operation_request_sms_code %}
```javascript
  AV.Cloud.requestSmsCode({
      mobilePhoneNumber: '186xxxxxxxx',
      name: '应用名称',
      op: '某种操作',
      ttl: 10
  }).then(function(){
      //发送成功
  }, function(err){
      //发送失败
  });
```
  * **name**：应用名称，默认是你的应用在 LeanCloud 显示的名称。
  * **op**：进行的操作字符串，例如付费。
  * **ttl**：以分钟为单位的过期时间。
{% endblock %}

{% block operation_verify_sms_code %}
```javascript
  AV.Cloud.verifySmsCode('6位数字验证码', '11 位手机号码').then(function(){
        //验证成功
  }, function(err){
        //验证失败
  });
```
{% endblock %}

{% block send_sms_by_template %}
```javascript
  AV.Cloud.requestSmsCode({
    mobilePhoneNumber: '186xxxxxxxx',
    template: 'Order_Notice',
    order_id: '7623432424540'
  }).then(function(){
    //发送成功
  }, function(err){
    //发送失败
  });
```
{% endblock %}

{% block send_marketing_by_template %}
```js
  AV.Cloud.requestSmsCode({
    mobilePhoneNumber: '186xxxxxxxx',
    template: 'New_Series'
  }).then(function(){
    //发送成功
  }, function(err){
    //发送失败
  });
```
{% endblock %}

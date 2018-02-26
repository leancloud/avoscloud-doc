{% extends "./sms_guide.tmpl" %}
{% set platform_name = "Android" %}

{% block avuser_signup_send_sms %}
  ```java
        AVUser user = new AVUser();
        user.setUsername("hjiang");
        user.setPassword("f32@ds*@&dsa");
        user.setEmail("hang@leancloud.rocks");
        
        // 其他属性可以像其他AVObject对象一样使用put方法添加
        user.put("mobilePhoneNumber", "186-1234-0000");

        user.signUpInBackground(new SignUpCallback() {
            public void done(AVException e) {
                if (e == null) {
                    // successfully
                } else {
                    // failed
                }
            }
        });
  ```
{% endblock %}

{% block builtin_account_url %}
leanstorage_guide-android.html#用户
{% endblock %}

{% block avuser_signup_sms_verify %}
  ```java
        AVUser.verifyMobilePhoneInBackground("123456", new AVMobilePhoneVerifyCallback() {
            @Override
            public void done(AVException e) {
                if(e == null){
                    // 验证成功
                } else {
                    Log.d("SMS", "Verified failed!");
                }
            }
        });
  ```
{% endblock %}

{% block avuser_request_sms_code %}
  ```java
        AVUser.requestMobilePhoneVerifyInBackground("13800000000", new RequestMobileCodeCallback() {
            @Override
            public void done(AVException e) {
                if(e == null){
                    // 发送成功
                } else {
                    Log.d("SMS", "Send failed!");
                }
            }
        });
  ```
{% endblock %}

{% block avuser_verify_sms_code %}
  ```java
        AVUser.verifyMobilePhoneInBackground("654321", new AVMobilePhoneVerifyCallback() {
            @Override
            public void done(AVException e) {
                if (e == null) {
                    // 验证成功
                } else {
                    Log.d("SMS", "Verified failed!");
                }
            }
        });
  ```
{% endblock %}

{% block operation_request_sms_code %}
  ```java
        AVOSCloud.requestSMSCodeInBackground(AVUser.getCurrentUser().getMobilePhoneNumber(), "某应用", "具体操作名称", 10, new RequestMobileCodeCallback() {
            @Override
            public void done(AVException e) {
                if (e == null) {
                    mSMSCode.requestFocus();
                } else {
                    Log.e("Home.OperationVerify", e.getMessage());
                }
            }
        });
  ```
{% endblock %}

{% block operation_verify_sms_code %}
  ```java
        AVOSCloud.verifyCodeInBackground("777777", "13888888888", new AVMobilePhoneVerifyCallback() {
            @Override
            public void done(AVException e) {
                if (e == null) {
                    Toast.makeText(getBaseContext(), getString(R.string.msg_operation_valid), Toast.LENGTH_SHORT).show();
                } else {
                    Log.e("Home.DoOperationVerify", e.getMessage());
                }
            }
        });
  ```
{% endblock %}

{% block send_sms_by_template %}
```java
        Map<String, Object> parameters = new HashMap<String, Object>();
        parameters.put("order_id", "7623432424540");
        AVOSCloud.requestSMSCodeInBackground(AVUser.getCurrentUser().getMobilePhoneNumber(),
                "Order_Notice",
                parameters,
                new RequestMobileCodeCallback() {
                    @Override
                    public void done(AVException e) {
                        if (e == null) {
                            Toast.makeText(getBaseContext(), getString(R.string.msg_notice_sent), Toast.LENGTH_SHORT).show();
                        } else {
                            Log.e("Home.SendNotice", e.getMessage());
                        }
                    }
                });
```
{% endblock %}
{% block send_marketing_by_template %}
```java
        AVOSCloud.requestSMSCodeInBackground(AVUser.getCurrentUser().getMobilePhoneNumber(),
                "Notice_Welcome",
                null,
                new RequestMobileCodeCallback() {
                    @Override
                    public void done(AVException e) {
                        if (e == null) {
                            Toast.makeText(getBaseContext(), getString(R.string.msg_notice_sent), Toast.LENGTH_SHORT).show();
                        } else {
                            Log.e("Home.SendNotice", e.getMessage());
                        }
                    }
                });
```
{% endblock %}
{% block sms_demo %}
## Demo

为了方便开发者理解短信服务流程，我们特地开发了专门针对短信服务的 [LeanCloud SMS Demo](https://github.com/wujun4code/LeanCloud_SMS_Tutorial)，开发者可以通过代码学习和了解。
{% endblock %}

{% extends "./sms_guide.tmpl" %}
{% set platform_name = "Objective-C" %}

{% block avuser_signup_send_sms %}
  ```objc
  AVUser *user = [AVUser user];
  user.username = @"hjiang";
  user.password =  @"f32@ds*@&dsa";
  user.email = @"hang@leancloud.rocks";
  user.mobilePhoneNumber = @"18612340000";
  NSError *error = nil;
  [user signUp:&error];
  ```
{% endblock %}

{% block builtin_account_url %}
leanstorage_guide-objc.html#用户
{% endblock %}

{% block avuser_signup_sms_verify %}
  ```objc
[AVUser verifyMobilePhone:@"123456" withBlock:^(BOOL succeeded, NSError *error) {
    //验证结果
}];
  ```
{% endblock %}

{% block avuser_request_sms_code %}
  ```objc
[AVUser requestMobilePhoneVerify:@"18612345678" withBlock:^(BOOL succeeded, NSError *error) {
    if(succeeded){
        //发送成功
    }
}];
  ```
{% endblock %}

{% block avuser_verify_sms_code %}
  ```objc
[AVUser verifyMobilePhone:@"123456" withBlock:^(BOOL succeeded, NSError *error) {
    if(succeeded){
        //验证成功
    }
}];
  ```
{% endblock %}

{% block operation_request_sms_code %}
  ```objc
    [AVOSCloud requestSmsCodeWithPhoneNumber:@"13613613613"
                                     appName:@"某应用"
                                   operation:@"具体操作名称"
                                  timeToLive:10
                                    callback:^(BOOL succeeded, NSError *error) {
                                        if (succeeded) {
                                            // 发送成功
                                            //短信格式类似于：
                                            //您正在{某应用}中进行{具体操作名称}，您的验证码是:{123456}，请输入完整验证，有效期为:{10}分钟
                                        }
                                    }];
  ```
{% endblock %}

{% block operation_verify_sms_code %}
  ```objc
[AVOSCloud verifySmsCode:@"123456" mobilePhoneNumber:@"18612345678" callback:^(BOOL succeeded, NSError *error) {
    if(succeeded){
        //验证成功
    }
}];
  ```
{% endblock %}

{% block send_sms_by_template %}
```objc
    NSMutableDictionary *dict = [[NSMutableDictionary alloc] init];
    [dict setObject:@"7623432424540" forKey:@"order_id"];
    [AVOSCloud requestSmsCodeWithPhoneNumber:@"18612345678" templateName:@"Order_Notice" variables:dict callback:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            //操作成功
        } else {
            NSLog(@"%@", error);
        }
    }];
```
{% endblock %}

{% block send_marketing_by_template %}
```objc
    NSMutableDictionary *dict = [[NSMutableDictionary alloc] init];
    [AVOSCloud requestSmsCodeWithPhoneNumber:@"18612345678" templateName:@"New_Series" variables:nil callback:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
            //操作成功
        } else {
            NSLog(@"%@", error);
        }
    }];
```
{% endblock %}

{% block sms_demo %}
## Demo

为了方便开发者理解短信服务流程，我们特地开发了专门针对短信服务的 [LeanCloud SMS Demo](https://github.com/leancloud/leancloud-smsdemo-ios)，开发者可以通过代码学习和了解。
{% endblock %}

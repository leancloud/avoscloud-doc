{% extends "./leanengine_cloudfunction_guide.tmpl" %}

{% set platformName = "Java" %}
{% set productName = "LeanEngine" %}
{% set storageName = "LeanStorage" %}
{% set leanengine_middleware = "[LeanEngine ' + platformName + ' SDK](https://github.com/leancloud/leanengine-java-sdk)" %}
{% set sdk_guide_link = "[Java SDK](./leanstorage_guide-java.html)" %}
{% set cloud_func_file = "$PROJECT_DIR/src/main/java/cn/leancloud/demo/todo/Cloud.java" %}
{% set runFuncName = "AVCloud.callFunction" %}
{% set defineFuncName = "@EngineFunction 注解" %}
{% set runFuncApiLink = "[AVCloud.callFunction](/api-docs/java/com/avos/avoscloud/AVCloud.html#callFunction(java.lang.String,%20java.util.Map))" %}
{% set hook_before_save = "beforeSave" %}
{% set hook_after_save = "afterSave" %}
{% set hook_before_update = "beforeUpdate" %}
{% set hook_after_update = "afterUpdate" %}
{% set hook_before_delete = "beforeDelete" %}
{% set hook_after_delete = "afterDelete" %}
{% set hook_on_verified = "onVerified" %}
{% set hook_on_login = "onLogin" %}

{% block cloudFuncExample %}

```java
  @EngineFunction("averageStars")
  public static float getAverageStars(@EngineFunctionParam("movie") String movie)
      throws AVException {
    AVQuery<AVObject> query = new AVQuery("Review");
    query.whereEqualTo("movie", movie);
    List<AVObject> reviews = query.find();
    int sum = 0;
    if (reviews == null && reviews.isEmpty()) {
      return 0;
    }
    for (AVObject review : reviews) {
      sum += review.getInt("star");
    }
    return sum / reviews.size();
  }
```
{% endblock %}

{% block cloudFuncParams %}

云函数的信息是通过 @EngineFunctionParam 来指定传入参数的名字和对应的类型的.

AVUser.getCurrentUser() 则可以获取与每个请求关联(根据客户端发送的 LC-Session 头)的用户信息


EngineRequestContext 则可以获取额外的一些 metaData 信息
{% endblock %}

{% block runFuncExample %}

```java
    Map<String, Object> params = new HashMap<String, Object>();
    params.put("movie", "夏洛特烦恼");
    try {
      float result = AVCloud.callFunction("averageStars", params);
    } catch (AVException e) {
      e.printStackTrace();
    }
```
{% endblock %}

{% block errorCodeExample %}

错误响应码允许自定义。可以在云函数中间 throw AVException 来指定 code 和 error 消息,如果是普通的 Exception，code 值则是默认的1 。

```java
  @EngineFunction("me")
  public static AVUser getCurrentUser() throws Exception {
    AVUser u = AVUser.getCurrentUser();
    if (u == null) {
      throw new AVException(211, "Could not find user");
    } else {
      return u;
    }
  }
```
{% endblock %}

{% block errorCodeExample2 %}

```java
  @EngineFunction()
  public static void customErrorCode() throws Exception {
    throw new AVException(123,"custom error message");
  }
```
{% endblock %}

{% block beforeSaveExample %}

```java
  @EngineHook(className = "Review", type = EngineHookType.beforeSave)
  public static AVObject reviewBeforeSaveHook(AVObject review) throws Exception {
    if (AVUtils.isBlankString(review.getString("comment"))) {
      throw new Exception("No Comment");
    } else if (review.getString("comment").length() > 140) {
      review.put("comment", review.getString("comment").substring(0, 137) + "...");
    }
    return review;
  }
```
{% endblock %}

{% block afterSaveExample %}

```java
  @EngineHook(className = "Review", type = EngineHookType.afterSave)
  public static void reviewAfterSaveHook(AVObject review) throws Exception {
    AVObject post = review.getAVObject("post");
    post.fetch();
    post.increment("comments");
    post.save();
  }
```
{% endblock %}

{% block afterSaveExample2 %}

```java
  @EngineHook(className = "_User", type = EngineHookType.afterSave)
  public static void userAfterSaveHook(AVUser user) throws Exception {
    user.put("from", "LeanCloud");
    user.save();
  }
```
{% endblock %}

{% block beforeUpdateExample %}

```java
 @EngineHook(className = "Review", type = EngineHookType.beforeUpdate)
  public static AVObject reviewBeforeUpdateHook(AVObject review) throws Exception {
    List<String> updateKeys = EngineRequestContext.getUpdateKeys();
    for (String key : updateKeys) {
      if ("comment".equals(key) && review.getString("comment").length()>140) {
        throw new Exception("comment 长度不得超过 140 字符");
      }
    }
    return review;
  }
```
{% endblock %}

{% block afterUpdateExample %}

```java
  @EngineHook(className = "Article", type = EngineHookType.afterUpdate)
  public static void articleAfterUpdateHook(AVObject article) throws Exception {
    LogUtil.avlog.d("updated article,the id is:" + article.getObjectId());
  }
```
{% endblock %}

{% block beforeDeleteExample %}

``` java
  @EngineHook(className = "Album", type = EngineHookType.beforeDelete)
  public static AVObject albumBeforeDeleteHook(AVObject album) throws Exception {
    AVQuery query = new AVQuery("Photo");
    query.whereEqualTo("album", album);
    int count = query.count();
    if (count > 0) {
      throw new Exception("无法删除非空相簿");
    } else {
      return album;
    }
  }
```
{% endblock %}

{% block afterDeleteExample %}

``` java
  @EngineHook(className = "Album", type = EngineHookType.afterDelete)
  public static void albumAfterDeleteHook(AVObject album) throws Exception {
    AVQuery query = new AVQuery("Photo");
    query.whereEqualTo("album", album);
    List<AVObject> result = query.find();
    if (result != null && !result.isEmpty()) {
      AVObject.deleteAll(result);
    }
  }
```
{% endblock %}

{% block onVerifiedExample %}

``` java
  @EngineHook(className = "_User", type = EngineHookType.onVerified)
  public static void userOnVerifiedHook(AVUser user) throws Exception {
    LogUtil.avlog.d("onVerified: sms,user:" + user.getObjectId());
  }
```
{% endblock %}

{% block onLoginExample %}

```java
  @EngineHook(className = "_User", type = EngineHookType.onVerified)
  public static AVUser userOnLoginHook(AVUser user) throws Exception {
    if ("noLogin".equals(user.getUsername())) {
      throw new Exception("Forbidden");
    } else {
      return user;
    }
  }
```
{% endblock %}

{% block errorCodeExampleForHooks %}

```java
  @EngineHook(className = "Review", type = EngineHookType.beforeSave)
  public static AVObject reviewBeforeSaveHook(AVObject review) throws Exception {
    throw new AVException(123,"自定义错误信息");
  }
```
{% endblock %}

{% block masterKeyInit %}

```java
  AVOSCloud.initialize({{appid}},{{appkey}},{{masterkey}});
  EngineRequestSign.instance().setUserMasterKey(true);
```
{% endblock %}

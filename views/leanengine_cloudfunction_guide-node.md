{% extends "./leanengine_cloudfunction_guide.tmpl" %}

{% set platformName = 'Node.js' %}
{% set productName = 'LeanEngine' %}
{% set storageName = 'LeanStorage' %}
{% set leanengine_middleware = '[LeanEngine Node.js SDK](https://github.com/leancloud/leanengine-node-sdk)' %}

{% set sdk_guide_link = '[JavaScript SDK](./js_guide.html)' %}
{% set cloud_func_file = '`$PROJECT_DIR/cloud.js`' %}
{% set runFuncName = '`AV.Cloud.run`' %}
{% set defineFuncName = '`AV.Cloud.define`' %}
{% set runFuncApiLink = '[AV.Cloud.run](/api-docs/javascript/symbols/AV.Cloud.html#.run)' %}

{% set hook_before_save   = "beforeSave" %}
{% set hook_after_save    = "afterSave" %}
{% set hook_before_update = "beforeUpdate" %}
{% set hook_after_update  = "afterUpdate" %}
{% set hook_before_delete = "beforeDelete" %}
{% set hook_after_delete  = "afterDelete" %}
{% set hook_on_verified   = "onVerified" %}
{% set hook_on_login      = "onLogin" %}

{% block cloudFuncExample %}
```javascript
AV.Cloud.define('averageStars', function(request, response) {
  var query = new AV.Query('Review');
  query.equalTo('movie', request.params.movie);
  query.find({
    success: function(results) {
      var sum = 0;
      for (var i = 0; i < results.length; ++i) {
        sum += results[i].get('stars');
      }
      response.success(sum / results.length);
    },
    error: function() {
      response.error('查询失败');
    }
  });
});
```
{% endblock %}

{% block cloudFuncParams %}
有两个参数会被传入到云函数：

* **request**：包装了请求信息的请求对象，下列这些字段将被设置到 request 对象内：
  * **params**：客户端发送的参数对象
  * **user**：`AV.User` 对象，发起调用的用户，如果没有登录，则不会设置此对象。如果通过 REST API 调用时模拟用户登录，需要增加一个头信息 `X-AVOSCloud-Session-Token: <sessionToken>`，该 `sessionToken` 在用户登录或注册时服务端会返回。
* **response**：应答对象，包含两个函数：
  * **success**：这个函数可以接收一个额外的参数，表示返回给客户端的结果数据。这个参数对象可以是任意的 JSON 对象或数组，并且可以包含 `AV.Object` 对象。
  * **error**：如果这个方法被调用，则表示发生了一个错误。它也接收一个额外的参数来传递给客户端，提供有意义的错误信息。
{% endblock %}

{% block runFuncExample %}
```javascript
AV.Cloud.run('averageStars', {movie: "夏洛特烦恼"}, {
  success: function(data){
    //调用成功，得到成功的应答data
  },
  error: function(err){
    //处理调用失败
  }
});
```
{% endblock %}

{% block beforeSaveExample %}

```javascript
AV.Cloud.beforeSave('Review', function(request, response) {
  var comment = request.object.get('comment');
  if (comment) {
    if (comment.length > 140) {
      // 截断并添加...
      request.object.set('comment', comment.substring(0, 137) + '...');
    }
    // 保存到数据库中
    response.success();
  } else {
    // 不保存数据，并返回错误
    response.error('No comment!');
  }
});
```
{% endblock %}

{% block afterSaveExample %}

```javascript
AV.Cloud.afterSave('Comment', function(request) {
  var query = new AV.Query('Post');
  query.get(request.object.get('post').id, {
    success: function(post) {
      post.increment('comments');
      post.save();
    },
    error: function(error) {
      throw 'Got an error ' + error.code + ' : ' + error.message;
    }
  });
});
```
{% endblock %}

{% block afterSaveExample2 %}

```javascript
AV.Cloud.afterSave('_User', function(request) {
  console.log(request.object);
  request.object.set('from','LeanCloud');
  request.object.save(null,{success:function(user)
    {
      console.log('ok!');
    },error:function(user,error)
    {
      console.log('error',error);
    }
    });
});
```
{% endblock %}

{% block beforeUpdateExample %}

```javascript
AV.Cloud.beforeUpdate('Review', function(request, response) {
  // 如果 comment 字段被修改了，检查该字段的长度
  if (request.object.updatedKeys.indexOf('comment') != -1) {
    if (request.object.get('comment').length <= 140) {
      response.success();
    } else {
      // 拒绝过长的修改
      response.error('commit 长度不得超过 140 字符');
    }
  } else {
    response.success();
  }
});
```

请注意：

* 需要将 {{leanengine_middleware}} 中间件升级至 0.2.0 版本以上才能使用这个功能。
* 不要修改 `request.object`，因为对它的改动并不会保存到数据库，但可以用 `response.error` 返回一个错误，拒绝这次修改。
{% endblock %}

{% block afterUpdateExample %}

```javascript
AV.Cloud.afterUpdate('Article', function(request) {
   console.log('Updated article,the id is :' + request.object.id);
});
```
{% endblock %}

{% block beforeDeleteExample %}

```javascript
AV.Cloud.beforeDelete('Album', function(request, response) {
  //查询Photo中还有没有属于这个相册的照片
  var query = new AV.Query('Photo');
  var album = AV.Object.createWithoutData('Album', request.object.id);
  query.equalTo('album', album);
  query.count({
    success: function(count) {
      if (count > 0) {
        //还有照片，不能删除，调用error方法
        response.error('Can\'t delete album if it still has photos.');
      } else {
        //没有照片，可以删除，调用success方法
        response.success();
      }
    },
    error: function(error) {
      response.error('Error ' + error.code + ' : ' + error.message + ' when getting photo count.');
    }
  });
});
```
{% endblock %}

{% block afterDeleteExample %}

```javascript
AV.Cloud.afterDelete('Album', function(request) {
  var query = new AV.Query('Photo');
  var album = AV.Object.createWithoutData('Album', request.object.id);
  query.equalTo('album', album);
  query.find({
    success: function(posts) {
    //查询本相册的照片，遍历删除
    AV.Object.destroyAll(posts);
    },
    error: function(error) {
      console.error('Error finding related comments ' + error.code + ': ' + error.message);
    }
  });
});
```
{% endblock %}

{% block onVerifiedExample %}

```javascript
AV.Cloud.onVerified('sms', function(request, response) {
    console.log('onVerified: sms, user: ' + request.object);
    response.success();
```
{% endblock %}

{% block onLoginExample %}

```javascript
AV.Cloud.onLogin(function(request, response) {
  // 因为此时用户还没有登录，所以用户信息是保存在 request.object 对象中
  console.log("on login:", request.object);
  if (request.object.get('username') == 'noLogin') {
    // 如果是 error 回调，则用户无法登录（收到 401 响应）
    response.error('Forbidden');
  } else {
    // 如果是 success 回调，则用户可以登录
    response.success();
  }
});
```
{% endblock %}

{% block errorCodeExample %}
错误响应码允许自定义。云引擎方法最终的错误对象如果有 `code` 和 `message` 属性，则响应的 body 以这两个属性为准，否则 `code` 为 1， `message` 为错误对象的字符串形式。比如：

```
AV.Cloud.define('errorCode', function(req, res) {
  AV.User.logIn('NoThisUser', 'lalala', {
    error: function(user, err) {
      res.error(err);
    }
  });
});
```
{% endblock %}

{% block errorCodeExample2 %}
```
AV.Cloud.define('customErrorCode', function(req, res) {
  res.error({code: 123, message: 'custom error message'});
});
```
{% endblock %}

{% block errorCodeExampleForHooks %}
```
AV.Cloud.beforeSave('Review', function(request, response) {
  // 使用 JSON.stringify() 将 object 变为字符串
  response.error(JSON.stringify({
    code: 123,
    message: '自定义错误信息'
  }));
});
```
{% endblock %}

{% block online_editor %}
## 在线编写云函数

很多人使用 {{productName}} 是为了在服务端提供一些个性化的方法供各终端调用，而不希望关心诸如代码托管、npm 依赖管理等问题。为此我们提供了在线维护云函数的功能。

使用此功能需要注意：

* 会替代你之前 git 或者命令行部署的项目。
* 暂不提供主机托管功能。

在 [控制台 > 存储 > 云引擎 > 部署 > 在线编辑](/cloud.html?appid={{appid}}#/deploy/online) 标签页，可以：

* 创建函数：指定函数类型，函数名称，函数体的具体代码，注释等信息，然后「保存」即可创建一个云函数。
* 部署：选择要部署的环境，点击「部署」即可看到部署过程和结果。
* 预览：会将所有函数汇总并生成一个完整的代码段，可以确认代码，或者将其保存为 `cloud.js` 覆盖项目模板的同名文件，即可快速的转换为使用项目部署。
* 维护云函数：可以编辑已有云函数，查看保存历史，以及删除云函数。

**提示**：云函数编辑之后需要重新部署才能生效。
{% endblock %}

{% block timerLegacy %}
**原来提供的 `AV.Cloud.setInterval` 和 `AV.Cloud.cronjob` 都已经废弃，这两个函数的功能变成和 `AV.Cloud.define` 一样，已经定义的任务会自动帮你做转换并启动。**
{% endblock %}

{% block timerExample %}
```javascript
AV.Cloud.define('log_timer', function(req, res){
    console.log('Log in timer.');
    return res.success();
});
```
{% endblock %}

{% block timerExample2 %}
```javascript
AV.Cloud.define('push_timer', function(req, res){
  AV.Push.send({
        channels: [ 'Public' ],
        data: {
            alert: 'Public message'
        }
    });
   return res.success();
});
```
{% endblock %}

{% block masterKeyInit %}
```javascript
//参数依次为 AppId, AppKey, MasterKey
AV.initialize('{{appid}}', '{{appkey}}', '{{masterkey}}');
AV.Cloud.useMasterKey();
```
{% endblock %}

{% block masterKeyInitLegacy %}
**注意：**云引擎 2.0 版本已经默认使用 master key 初始化 SDK，所以不需要额外初始化。
{% endblock %}

{% block loggerExample %}
```javascript
AV.Cloud.define('Logger', function(request, response) {
  console.log(request.params);
  response.success();
});
```
{% endblock %}

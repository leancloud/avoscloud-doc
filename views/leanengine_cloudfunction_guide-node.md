{% extends "./leanengine_cloudfunction_guide.tmpl" %}

{% set platformName = "Node.js" %}
{% set productName = "LeanEngine" %}
{% set storageName = "LeanStorage" %}
{% set leanengine_middleware = "[LeanEngine Node.js SDK](https://github.com/leancloud/leanengine-node-sdk)" %}
{% set sdk_guide_link = "[JavaScript SDK](./leanstorage_guide-js.html)" %}
{% set cloud_func_file = "`$PROJECT_DIR/cloud.js`" %}
{% set runFuncName = "`AV.Cloud.run`" %}
{% set defineFuncName = "`AV.Cloud.define`" %}
{% set runFuncApiLink = "[AV.Cloud.run](https://leancloud.github.io/javascript-sdk/docs/AV.Cloud.html#.run)" %}
{% set hook_before_save = "beforeSave" %}
{% set hook_after_save = "afterSave" %}
{% set hook_before_update = "beforeUpdate" %}
{% set hook_after_update = "afterUpdate" %}
{% set hook_before_delete = "beforeDelete" %}
{% set hook_after_delete = "afterDelete" %}
{% set hook_on_verified = "onVerified" %}
{% set hook_on_login = "onLogin" %}
{% set hook_message_received = "_messageReceived" %}
{% set hook_receiver_offline = "_receiversOffline" %}
{% set hook_message_sent = "_messageSent" %}
{% set hook_conversation_start = "_conversationStart" %}
{% set hook_conversation_started = "_conversationStarted" %}
{% set hook_conversation_add = "_conversationAdd" %}
{% set hook_conversation_remove = "_conversationRemove" %}
{% set hook_conversation_update = "_conversationUpdate" %}

{% block cloudFuncExample %}

```javascript
AV.Cloud.define('averageStars', function(request, response) {
  var query = new AV.Query('Review');
  query.equalTo('movie', request.params.movie);
  query.find().then(function(results) {
    var sum = 0;
    for (var i = 0; i < results.length; i++ ) {
      sum += results[i].get('stars');
    }
    response.success(sum / results.length);
  }).catch(function(error) {
    response.error('查询失败');
  });
});
```
{% endblock %}

{% block cloudFuncParams %}

Request 和 Response 会作为两个参数传入到云函数中：

`Request` 上的属性包括：

* `params: object`：客户端发送的参数对象，当使用 `rpc` 调用时，也可能是 `AV.Object`。
* `currentUser?: AV.User`：客户端所关联的用户（根据客户端发送的 `LC-Session` 头）。
* `meta: object`：有关客户端的更多信息，目前只有一个 `remoteAddress` 属性表示客户端的 IP。
* `sessionToken?: string`：客户端发来的 sessionToken（`X-LC-Session` 头）。

`Response` 上的属性包括：

* `success: function(result?)`：向客户端发送结果，可以是包括 AV.Object 在内的各种数据类型或数组，客户端解析方式见各 SDK 文档。
* `error: function(err?: string)`：向客户端返回一个错误，目前仅支持字符串，`Error` 等类型也会被转换成字符串。
{% endblock %}

{% block runFuncExample %}

```js
var paramsJson = {
  movie: '夏洛特烦恼',
};
AV.Cloud.run('averageStars', paramsJson).then(function(data) {
  // 调用成功，得到成功的应答 data
}, function(error) {
  // 处理调用失败
});
```

云引擎中默认会直接进行一次本地的函数调用，而不是像客户端一样发起一个 HTTP 请求。如果你希望发起 HTTP 请求来调用云函数，可以传入一个 `remote: true` 的选项（与 success 和 error 回调同级），当你在云引擎之外运行 Node SDK 时这个选项非常有用：

```js
AV.Cloud.run('averageStars', paramsJson).then(function(data) {
  // 成功
}, function(error) {
  // 失败
});
```
{% endblock %}

{% block cloudFuncTimeout %}

### 云函数超时

云函数超时时间为 15 秒，如果超过阈值，{{leanengine_middleware}} 将强制响应：

* 客户端收到 HTTP status code 为 503 响应，body 为 `The request timed out on the server.`。
* 服务端会出现类似这样的日志：`LeanEngine function timeout, url=/1.1/functions/<cloudFunc>, timeout=15000`。

另外还需要注意：虽然 {{leanengine_middleware}} 已经响应，但此时云函数可能仍在执行，但执行完毕后的响应是无意义的（不会发给客户端，会在日志中打印一个 `Can't set headers after they are sent` 的异常）。

#### 超时的处理方案

我们建议将代码中的任务转化为异步队列处理，以优化运行时间，避免云函数或 [定时任务](#定时任务) 发生超时。比如：

- 在存储服务中创建一个队列表，包含 `status` 列；
- 接到任务后，向队列表保存一条记录，`status` 值设置为「处理中」，然后直接 response，也可以把队列对象 id 返回，如 `response.success(id);`；
- 当业务处理完毕，根据处理结果更新刚才的队列对象状态，将 `status` 字段设置为「完成」或者「失败」；
- 在任何时候，在控制台通过队列 id 可以获取某个任务的执行结果，判断任务状态。
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
  query.get(request.object.get('post').id).then(function(post) {
    post.increment('comments');
    post.save();
  });
});
```
{% endblock %}

{% block afterSaveExample2 %}

```javascript
AV.Cloud.afterSave('_User', function(request) {
  console.log(request.object);
  request.object.set('from','LeanCloud');
  request.object.save().then(function(user)  {
    console.log('ok!');
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
      response.error('comment 长度不得超过 140 字符');
    }
  } else {
    response.success();
  }
});
```

**注意：** 不要修改 `request.object`，因为对它的改动并不会保存到数据库，但可以用 `response.error` 返回一个错误，拒绝这次修改。
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
  query.count().then(function(count) {
    if (count > 0) {
      //还有照片，不能删除，调用error方法
      response.error('Can\'t delete album if it still has photos.');
    } else {
      //没有照片，可以删除，调用success方法
      response.success();
    }
  }, function(error) {
    response.error('Error ' + error.code + ' : ' + error.message + ' when getting photo count.');
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
  query.find().then(function(posts) {
    //查询本相册的照片，遍历删除
    AV.Object.destroyAll(posts);
  }).then(function(error) {
    console.error('Error finding related comments ' + error.code + ': ' + error.message);
  });
});
```
{% endblock %}

{% block onVerifiedExample %}

```javascript
AV.Cloud.onVerified('sms', function(request, response) {
    console.log('onVerified: sms, user: ' + request.object);
    response.success();
});
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
  AV.User.logIn('NoThisUser', 'lalala').catch(function(err) {
    res.error(err);
  });
});
```
{% endblock %}

{% block errorCodeExample2 %}

```
AV.Cloud.define('customErrorCode', function(request, response) {
  response.error({code: 123, message: 'custom error message'});
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

* 在定义的函数会覆盖你之前用 Git 或命令行部署的项目。
* 目前只能在线编写云函数和 Hook，不支持托管静态网页、编写动态路由。

{% if node=='qcloud' %}
在 `控制台 > 存储 > 云引擎 > 部署 > 在线编辑` 标签页，可以：
{% else %}
在 [控制台 > 存储 > 云引擎 > 部署 > 在线编辑](/cloud.html?appid={{appid}}#/deploy/online) 标签页，可以：
{% endif %}

* 创建函数：指定函数类型，函数名称，函数体的具体代码，注释等信息，然后「保存」即可创建一个云函数。
* 部署：选择要部署的环境，点击「部署」即可看到部署过程和结果。
* 预览：会将所有函数汇总并生成一个完整的代码段，可以确认代码，或者将其保存为 `cloud.js` 覆盖项目模板的同名文件，即可快速的转换为使用项目部署。
* 维护云函数：可以编辑已有云函数，查看保存历史，以及删除云函数。

**提示**：云函数编辑之后需要重新部署才能生效。
{% endblock %}

{% block timerExample %}

```javascript
AV.Cloud.define('log_timer', function(request, response){
  console.log('Log in timer.');
  return response.success();
});
```
{% endblock %}

{% block timerExample2 %}

```javascript
AV.Cloud.define('push_timer', function(request, response){
  AV.Push.send({
    channels: ['Public'],
    data: {
      alert: 'Public message'
    }
  });
  return response.success();
});
```
{% endblock %}

{% block masterKeyInit %}

```javascript
//参数依次为 AppId, AppKey, MasterKey
AV.init({
  appId: '{{appid}}',
  appKey: '{{appkey}}',
  masterkey: '{{masterkey}}'
})
AV.Cloud.useMasterKey();
```
{% endblock %}

{% block loggerExample %}

```javascript
AV.Cloud.define('Logger', function(request, response) {
  console.log(request.params);
  response.success();
});
```
{% endblock %}


{% block code_hook_message_received %}

```js
AV.Cloud.define("_messageReceived", (request, response) => {
	// request.params = {
	// 	fromPeer: 'Tom',
	// 	receipt: false,
	// 	groupId: null,
	// 	system: null,
	// 	content: '{"_lctext":"耗子，起床！","_lctype":-1}',
	// 	convId: '5789a33a1b8694ad267d8040',
	// 	toPeers: ['Jerry'],
	// 	__sign: '1472200796787,a0e99be208c6bce92d516c10ff3f598de8f650b9',
	// 	bin: false,
	// 	transient: false,
	// 	sourceIP: '121.239.62.103',
	// 	timestamp: 1472200796764
	// };
	console.log('_messageReceived start');
	let content = JSON.parse(request.params.content);
	let text = content._lctext;
	console.log('text', text);
	let processedContent = text.replace('XX中介', '**');
	// 必须含有以下语句给服务端一个正确的返回，否则会引起异常
	response.success({
		content: processedContent
	});
	console.log('_messageReceived end');
});
```
{% endblock %}

{% block code_hook_receiver_offline %}

```js
AV.Cloud.define('_receiversOffline', (request, response) => {
	console.log('_receiversOffline start');
	let params = request.params;
	let content = params.content;
	let shortContent = content;
	// params.content 为消息的内容
	if (shortContent.length > 6) {
		shortContent = content.slice(0, 6);
	}
	console.log('shortContent', shortContent);
	let json = {
		// 自增未读消息的数目，不想自增就设为数字
		badge: "Increment",
		sound: "default",
		// 使用开发证书
		_profile: "dev",
		alert: shortContent
	};

	let pushMessage = JSON.stringify(json);

	response.success({
		"pushMessage": pushMessage
	});
	console.log('_receiversOffline end');
});
```
{% endblock %}


{% block code_hook_message_sent %}

```js
AV.Cloud.define('_messageSent', (request, response) => {
	console.log('_messageSent start');
	let params = request.params;
	console.log('params', params);
	response.success({});
	console.log('_messageSent end');

	// 在云引擎中打印的日志如下：
	// _messageSent start
	// params { fromPeer: 'Tom',
	//   receipt: false,
	//   onlinePeers: [],
	//   content: '12345678',
	//   convId: '5789a33a1b8694ad267d8040',
	//   msgId: 'fptKnuYYQMGdiSt_Zs7zDA',
	//   __sign: '1472703266575,30e1c9b325410f96c804f737035a0f6a2d86d711',
	//   bin: false,
	//   transient: false,
	//   sourceIP: '114.219.127.186',
	//   offlinePeers: [ 'Jerry' ],
	//   timestamp: 1472703266522 }
	// _messageSent end
});
```
{% endblock %}

{% block code_hook_conversation_start %}

```js
AV.Cloud.define('_conversationStart', (request, response) => {
	console.log('_conversationStart start');
	let params = request.params;
	console.log('params', params);
	response.success({});
	console.log('_conversationStart end');

	// 在云引擎中打印的日志如下：
	//_conversationStart start
	// params {
	// 	initBy: 'Tom',
	// 	members: ['Tom', 'Jerry'],
	// 	attr: {
	// 		name: 'Tom & Jerry'
	// 	},
	// 	__sign: '1472703266397,b57285517a95028f8b7c34c68f419847a049ef26'
	// }
	//_conversationStart end
});
```
{% endblock %}

{% block code_hook_conversation_started %}

```js
AV.Cloud.define('_conversationStarted', (request, response) => {
	console.log('_conversationStarted start');
	let params = request.params;
	console.log('params', params);
	response.success({});
	console.log('_conversationStarted end');

	// 在云引擎中打印的日志如下：
	// _conversationStarted start
	// params {
	// 	convId: '5789a33a1b8694ad267d8040',
	// 	__sign: '1472723167361,f5ceedde159408002fc4edb96b72aafa14bc60bb'
	// }
	// _conversationStarted end
});
```
{% endblock %}

{% block code_hook_conversation_add %}

```js
AV.Cloud.define('_conversationAdd', (request, response) => {
	console.log('_conversationAdd start');
	let params = request.params;
	console.log('params', params);
	response.success({});
	console.log('_conversationAdd end');

	// 在云引擎中打印的日志如下：
	// _conversationAdd start
	// params {
	// 	initBy: 'Tom',
	// 	members: ['Mary'],
	// 	convId: '5789a33a1b8694ad267d8040',
	// 	__sign: '1472786231813,a262494c252e82cb7a342a3c62c6d15fffbed5a0'
	// }
	// _conversationAdd end
});
```
{% endblock %}

{% block code_hook_conversation_remove %}

```js
AV.Cloud.define('_conversationRemove', (request, response) => {
	console.log('_conversationRemove start');
	let params = request.params;
	console.log('params', params);
	response.success({});
	console.log('removed client Id:', params.members[0]);
	console.log('_conversationRemove end');

	// 在云引擎中打印的日志如下：
	// _conversationRemove start
	// params {
	// 	initBy: 'Tom',
	// 	members: ['Jerry'],
	// 	convId: '57c8f3ac92509726c3dadaba',
	// 	__sign: '1472787372605,abdf92b1c2fc4c9820bc02304f192dab6473cd38'
	// }
	//removed client Id: Jerry
	// _conversationRemove end
});
```
{% endblock %}
{% block code_hook_conversation_update %}

```js
AV.Cloud.define('_conversationUpdate', (request, response) => {
	console.log('_conversationUpdate start');
	let params = request.params;
	console.log('params', params);
	console.log('name', params.attr.name);
	response.success({});
	console.log('_conversationUpdate end');

	// 在云引擎中打印的日志如下：
	// _conversationUpdate start
	// params {
	// 	convId: '57c9208292509726c3dadb4b',
	// 	initBy: 'Tom',
	// 	attr: {
	// 		name: '聪明的喵星人',
	// 		type: 'public'
	// 	},
	// name 聪明的喵星人
	// _conversationUpdate end
});
```
{% endblock %}
{% block hookDeadLoop %}

### 防止死循环调用

在实际使用中有这样一种场景：在 `Post` 类的 `afterUpdate` Hook 函数中，对传入的 `Post` 对象做了修改并且保存，而这个保存动作又会再次触发 `afterUpdate`，由此形成死循环。针对这种情况，我们为所有 Hook 函数传入的 `request.object` 对象做了处理，以阻止死循环调用的产生。

不过请注意，以下情况还需要开发者自行处理：

- 对传入的 `request.object` 对象进行 `fetch` 操作。
- 重新构造传入的 `request.object` 对象，如使用 `AV.Object.createWithoutData()` 方法。

对于使用上述方式产生的对象，请根据需要自行调用以下 API：

- `object.disableBeforeHook()` 或
- `object.disableAfterHook()`

这样，对象的保存或删除动作就不会再次触发相关的 Hook 函数。

```javascript
AV.Cloud.afterUpdate('Post', function(request) {
  // 直接修改并保存对象不会再次触发 afterUpdate Hook 函数
  request.object.set('foo', 'bar');
  request.object.save().then(function(obj) {
    // 你的业务逻辑
  }).catch(console.error);

  // 如果有 fetch 操作，则需要在新获得的对象上调用相关的 disable 方法
  // 来确保不会再次触发 Hook 函数
  request.object.fetch().then(function(obj) {
    obj.disableAfterHook();
    obj.set('foo', 'bar');
    return obj.save();
  }).then(function(obj) {
    // 你的业务逻辑
  }).catch(console.error);

  // 如果是其他方式构建对象，则需要在新构建的对象上调用相关的 disable 方法
  // 来确保不会再次触发 Hook 函数
  var obj = AV.Object.createWithoutData('Post', request.object.id);
  obj.disableAfterHook();
  obj.set('foo', 'bar');
  obj.save().then(function(obj) {
    // 你的业务逻辑
  }).catch(console.error);
});
```

**提示**：云引擎 Node.js 环境从 [0.3.0](https://github.com/leancloud/leanengine-node-sdk/blob/master/CHANGELOG.md#v030-20151231) 开始支持 `object.disableBeforeHook()` 和 `object.disableAfterHook()`。


{% endblock %}

{% extends "./leanengine_guide.tmpl" %}

{% block quick_start_create_project %}
从 Github 迁出实例项目，该项目可以作为一个你应用的基础：

```
$ git clone git@github.com:leancloud/node-js-getting-started.git
$ cd node-js-getting-started
```

然后添加应用 appId 等信息到该项目：

```
$ avoscloud add <appName> <appId>
```
{% endblock %}

{% block demo %}
* [node-js-getting-started](https://github.com/leancloud/node-js-getting-started)：这是一个非常简单的基于 Express 4 的项目，可以作为大家的项目模板。效果体验： http://node.avosapps.com/
* [leanengine-todo-demo](https://github.com/leancloud/leanengine-todo-demo)：这是一个稍微复杂点的项目，是上一个项目的扩展，演示了基本的用户注册、会话管理、业务数据的增删查改、简单的 ACL 使用。这个项目可以作为初学 LeanEngine 和 [JS-SDK](https://leancloud.cn/docs/js_guide.html) 使用。效果体验：http://todo-demo.avosapps.com/
{% endblock %}

{% block runtime_env %}**注意**： 目前 LeanEngine 的 Node.js 版本为 0.12，请你最好使用此版本进行开发，至少不要低于 0.10 。{% endblock %}

{% block run_in_local_command %}
安装依赖：

```
$ npm install
```

启动应用：

```
$ avoscloud
```
{% endblock %}

{% block cloud_func_file %}`$PROJECT_DIR/cloud.js`{% endblock %}

{% block project_constraint %}
LeanEngine Node.js 项目必须有 `$PROJECT_DIR/server.js` 文件，该文件为整个项目的启动文件。

**注意：**项目中**不能**有 `$PROJECT_DIR/cloud/main.js` 文件，否则会被识别为 [2.0 版本](./leanengine_guide-cloudcode.html#项目约束) 的项目。{% endblock %}

{% block ping %}
LeanEngine 中间件内置了该 URL 的处理，只需要将中间件添加到请求的处理链路中即可：

```
app.use(AV.Cloud);
```

或者类似于 [项目框架](https://github.com/leancloud/node-js-getting-started) 那样，有一个 [cloud.js](https://github.com/leancloud/node-js-getting-started/blob/master/cloud.js) 且最终是以 `module.exports = AV.Cloud;` 结尾，然后在 [app.js](https://github.com/leancloud/node-js-getting-started/blob/master/app.js) 中加载 `cloud.js` 也可以达到一样的效果：

```
var cloud = require('./cloud');

// 加载云代码方法
app.use(cloud);
```

如果未使用 LeanEngine 中间件，则需要自己实现该 URL 的处理，比如这样：

```
// 健康监测 router
app.use('/__engine/1/ping', function(req, res) {
  res.end(JSON.stringify({
    "runtime": "nodejs-" + process.version,
    "version": "custom"
  }));
});
```
{% endblock %}

{% block others_web_framework %}
LeanEngine 支持任意 Node.js 的 web 框架，你可以使用你最熟悉的框架进行开发，或者不使用任何框架，直接使用 Node.js 的 http 模块进行开发。但是请保证通过执行 `server.js` 能够启动你的项目，启动之后程序监听的端口为 `process.env.LC_APP_PORT`。
{% endblock %}

{% block install_middleware %}
在 Node.js 环境，使用 [leanengine](https://github.com/leancloud/leanengine-node-sdk) 来代替 [javascript-sdk](https://github.com/leancloud/javascript-sdk) 组件。前者扩展了后者，增加了云代码方法和 hook 的支持。在项目根目录下，执行：

```
$ npm install leanengine --save
```

来安装 leanengine，之后你就可以在项目中使用了。
{% endblock %}

{% block init_middleware %}
```js
var AV = require('leanengine');

var APP_ID = process.env.LC_APP_ID || '{{appid}}'; // your app id
var APP_KEY = process.env.LC_APP_KEY || '{{appkey}}'; // your app key
var MASTER_KEY = process.env.LC_APP_MASTER_KEY || '{{masterkey}}'; // your app master key

AV.initialize(APP_ID, APP_KEY, MASTER_KEY);
```
{% endblock %}

{% block sdk_guide_link %}[JavaScript SDK](./js_guide.html){% endblock %}

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
      response.error('movie lookup failed');
    }
  });
});
```
{% endblock %}

{% block cloudFuncParams %}
有两个参数会被传入到Cloud函数：

* request - 包装了请求信息的请求对象，下列这些字段将被设置到request对象内:
 * params - 客户端发送的参数对象
 * user - `AV.User` 对象，发起调用的用户，如果没有登录，则不会设置此对象。如果通过 REST API 调用时模拟用户登录，需要增加一个头信息 `X-AVOSCloud-Session-Token: <sessionToken>`，该 `sessionToken` 在用户登录或注册时服务端会返回。
* response - 应答对象，包含两个函数：
 * success - 这个函数可以接收一个额外的参数，表示返回给客户端的结果数据。这个参数对象可以是任意的JSON对象或数组，并且可以包含`AV.Object`对象。
 * error - 如果这个方法被调用，则表示发生了一个错误。它也接收一个额外的参数来传递给客户端，提供有意义的错误信息。
{% endblock %}

{% block runFuncName %}`AV.Cloud.run`{% endblock %}

{% block defineFuncName %}`AV.Cloud.define`{% endblock %}

{% block runFuncExample %}
```javascript
AV.Cloud.run('hello', {name: 'dennis'}, {
  success: function(data){
      //调用成功，得到成功的应答data
  },
  error: function(err){
      //处理调用失败
  }
});
```
{% endblock %}

{% block runFuncApiLink %}[AV.Cloud.run](https://leancloud.cn/docs/api/javascript/symbols/AV.Cloud.html#.run){% endblock %}

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
  query = new AV.Query('Post');
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
  query = new AV.Query('Photo');
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
  query = new AV.Query('Photo');
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

有些时候你希望能自己定义错误响应码。云代码方法最终的错误对象如果有 `code` 和 `message` 属性，则响应的 `body` 以这两个属性为准，否则 `code` 为 `1`， `message` 为错误对象的字符串形式。比如下列代码：

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

{% block http_client %}
LeanEngine 允许你使用 `AV.Cloud.httpRequest` 函数来发送 HTTP 请求到任意的 HTTP 服务器。不过推荐您使用 [request](https://www.npmjs.com/package/request) 等第三方模块来处理 HTTP 请求。

使用 `AV.Cloud.httpRequest` ，一个简单的 GET 请求看起来是这样：

```javascript
AV.Cloud.httpRequest({
  url: 'http://www.google.com/',
  success: function(httpResponse) {
    console.log(httpResponse.text);
  },
  error: function(httpResponse) {
    console.error('Request failed with response code ' + httpResponse.status);
  }
});
```

当返回的 HTTP 状态码是成功的状态码（例如200,201等），则success函数会被调用，反之，则error函数将被调用。

### 查询参数

如果你想添加查询参数到URL末尾，你可以设置选项对象的params属性。你既可以传入一个JSON格式的key-value对象，像这样：

```javascript
AV.Cloud.httpRequest({
  url: 'http://www.google.com/search',
  params: {
    q : 'Sean Plott'
  },
  success: function(httpResponse) {
    console.log(httpResponse.text);
  },
  error: function(httpResponse) {
    console.error('Request failed with response code ' + httpResponse.status);
  }
});
```
也可以是一个原始的字符串：

```javascript
AV.Cloud.httpRequest({
  url: 'http://www.google.com/search',
  params: 'q=Sean Plott',
  success: function(httpResponse) {
    console.log(httpResponse.text);
  },
  error: function(httpResponse) {
    console.error('Request failed with response code ' + httpResponse.status);
  }
});
```

### 设置 HTTP 头部

通过设置选项对象的header属性，你可以发送HTTP头信息。假设你想设定请求的`Content-Type`，你可以这样做：

```javascript
AV.Cloud.httpRequest({
  url: 'http://www.example.com/',
  headers: {
    'Content-Type': 'application/json'
  },
  success: function(httpResponse) {
    console.log(httpResponse.text);
  },
  error: function(httpResponse) {
    console.error('Request failed with response code ' + httpResponse.status);
  }
});
```

### 设置超时

默认请求超时设置为10秒，超过这个时间没有返回的请求将被强制终止，您可以调整这个超时，通过 timeout 选项（单位毫秒）：

```javascript
AV.Cloud.httpRequest({
  url: 'http://www.example.com/',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  },
  success: function(httpResponse) {
    console.log(httpResponse.text);
  },
  error: function(httpResponse) {
    console.error('Request failed with response code ' + httpResponse.status);
  }
});
```
上面的代码设置请求超时为15秒。

### 发送 POST 请求

通过设置选项对象的method属性就可以发送POST请求。同时可以设置选项对象的body属性来发送数据，一个简单的例子：

```javascript
AV.Cloud.httpRequest({
  method: 'POST',
  url: 'http://www.example.com/create_post',
  body: {
    title: 'Vote for Pedro',
    body: 'If you vote for Pedro, your wildest dreams will come true'
  },
  success: function(httpResponse) {
    console.log(httpResponse.text);
  },
  error: function(httpResponse) {
    console.error('Request failed with response code ' + httpResponse.status);
  }
});
```

这将会发送一个POST请求到`http://www.example.com/create_post`，body是被URL编码过的表单数据。 如果你想使用JSON编码body，可以这样做：

```javascript
AV.Cloud.httpRequest({
  method: 'POST',
  url: 'http://www.example.com/create_post',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
    title: 'Vote for Pedro',
    body: 'If you vote for Pedro, your wildest dreams will come true'
  },
  success: function(httpResponse) {
    console.log(httpResponse.text);
  },
  error: function(httpResponse) {
    console.error('Request failed with response code ' + httpResponse.status);
  }
});
```

当然，body可以被任何想发送出去的String对象替换。

### HTTP 应答对象

传给success和error函数的应答对象包括下列属性：

* status - HTTP状态码
* headers - HTTP应答头部信息
* text - 原始的应答body内容。
* buffer - 原始的应答Buffer对象
* data - 解析后的应答内容，如果 LeanEngine 可以解析返回的`Content-Type`的话（例如JSON格式，就可以被解析为一个JSON对象）

如果你不想要text（会消耗资源做字符串拼接），只需要buffer，那么可以设置请求的text选项为false:

```javascript
AV.Cloud.httpRequest({
  method: 'POST',
  url: 'http://www.example.com/create_post',
  text: false,
  ......
});
```
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
AV.initialize('app id', 'app key', 'master key');
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

{% block use_framework %}

LeanEngine 中可以使用 [express](http://expressjs.com/)、[connect](http://senchalabs.github.com/connect) 等 web 框架，您只要安装了 LeanEngine 提供的中间件即可正常运行。

```javascript
var express = require('express');
var AV = require('leanengine');

var app = express();

app.use(AV.Cloud);
app.listen(process.env.LC_APP_PORT);
```

{% endblock %}

{% block upload_file %}
在 LeanEngine 里上传文件也很容易，首先配置app使用bodyParser中间件，它会将上传表单里的文件存放到临时目录并构造一个文件对象放到request.files里：

```javascript
app.use(express.bodyParser());
```

使用表单上传文件，假设文件字段名叫iconImage:

```html
<form enctype="multipart/form-data" method="post" action="/upload">
  <input type="file" name="iconImage">
  <input type="submit" name="submit" value="submit">
</form>
```

上传文件使用multipart表单，并POST提交到/upload路径下。

接下来定义文件上传的处理函数，使用受到严格限制并且只能读取上传文件的`fs`模块：

```javascript
var fs = require('fs');
app.post('/upload', function(req, res){
  var iconFile = req.files.iconImage;
  if(iconFile){
    fs.readFile(iconFile.path, function(err, data){
      if(err)
        return res.send('读取文件失败');
      var base64Data = data.toString('base64');
      var theFile = new AV.File(iconFile.name, {base64: base64Data});
      theFile.save().then(function(theFile){
        res.send('上传成功！');
      });
    });
  }else
    res.send('请选择一个文件。');
});
```
{% endblock %}

{% block cookie_session %}

### 处理用户登录和登出

要让 LeanEngine 支持 LeanCloud 用户体系的 Session，在 app.js 里添加下列代码：

```javascript
var express = require('express');
var AV = require('leanengine');

var app = express();
// 加载 cookieSession 以支持 AV.User 的会话状态
app.use(AV.Cloud.CookieSession({ secret: 'my secret', maxAge: 3600000, fetchUser: true }));
```

使用 `AV.Cloud.CookieSession` 中间件启用 CookieSession，注意传入一个 secret 用于 cookie 加密（必须）。它会自动将AV.User的登录信息记录到 cookie 里，用户每次访问会自动检查用户是否已经登录，如果已经登录，可以通过 `req.AV.user` 获取当前登录用户。

`AV.Cloud.CookieSession` 支持的选项包括：

* fetchUser -- **是否自动fetch当前登录的AV.User对象。默认为false。**如果设置为true，每个HTTP请求都将发起一次LeanCloud API调用来fetch用户对象。如果设置为false，默认只可以访问 `req.AV.user` 当前用户的id属性，您可以在必要的时候fetch整个用户。通常保持默认的false就可以。
* name -- session在cookie中存储的key名称，默认为 `avos.sess`。
* maxAge -- 设置cookie的过期时间。

`httpOnly` 和 `signed` 参数我们强制设置为 true。

**注意**：我们通常不建议在云代码环境中通过 `AV.User.current()` 获取登录用户的信息，虽然这样做不会有问题，也不会有串号的风险，但是我们仍建议:

* 在云代码方法中，通过 request.user 获取用户信息。
* 在 webHosting 中，通过 req.AV.user 获取用户信息。
* 在后续的方法调用显示的传递 user 对象。

登录很简单：

```javascript
app.get('/login', function(req, res) {
  // 渲染登录页面
  res.render('login.ejs');
});
// 点击登录页面的提交将出发下列函数
app.post('/login', function(req, res) {
  AV.User.logIn(req.body.username, req.body.password).then(function() {
    //登录成功，AV.Cloud.CookieSession 会自动将登录用户信息存储到 cookie
    //跳转到profile页面。
    console.log('signin successfully: %j', req.AV.user);
    res.redirect('/profile');
  },function(error) {
    //登录失败，跳转到登录页面
    res.redirect('/login');
  });
});
//查看用户profile信息
app.get('/profile', function(req, res) {
  // 判断用户是否已经登录
  if (req.AV.user) {
    // 如果已经登录，发送当前登录用户信息。
    res.send(req.AV.user);
  } else {
    // 没有登录，跳转到登录页面。
    res.redirect('/login');
  }
});

//调用此url来登出帐号
app.get('/logout', function(req, res) {
  // AV.Cloud.CookieSession 将自动清除登录 cookie 信息
  AV.User.logOut();
  res.redirect('/profile');
});
```

登录页面大概是这样login.ejs:

```html
<html>
    <head></head>
    <body>
      <form method="post" action="/login">
        <label>Username</label>
        <input name="username"></input>
        <label>Password</label>
        <input name="password" type="password"></input>
        <input class="button" type="submit" value="登录">
      </form>
    </body>
  </html>
```

注意： express 框架的 express.session.MemoryStore 在我们云代码中是无法正常工作的，因为我们的云代码是多主机，多进程运行，因此内存型 session 是无法共享的，建议用 [cookieSession中间件](https://gist.github.com/visionmedia/1491756)。
{% endblock %}

{% block custom_session %}

### 自定义 session

有时候你需要将一些自己需要的属性保存在 session 中，你可以增加通用的 `cookie-session` 组件，详情可以参考 [文档](https://github.com/expressjs/cookie-session)。该组件和 {% block cookie_session_middleware %}{% endblock %} 组件可以并存。{% endblock %}

{% block cookie_session_middleware %}`AV.Cloud.CookieSession`{% endblock %}

{% block https_redirect %}
```javascript
var HttpsRedirect = AV.Cloud.HttpsRedirect;
app.use(HttpsRedirect());
```
{% endblock %}

{% block get_env %}
```javascript
var NODE_ENV = process.env.NODE_ENV || 'development';
if (NODE_ENV === 'development') {
  // 当前环境为「开发环境」，是由命令行工具启动的
} else if(NODE_ENV == 'production') {
  // 当前环境为「生产环境」，是线上正式运行的环境
} else {
  // 当前环境为「测试环境」
}
```
{% endblock %}

{% block project_start %}### 项目启动

如果 `$PROJECT_DIR/package.json` 文件有类似下面的声明：

```
{
  ...
  "scripts": {
    ...
    "start": "node server.js",
    ...
  },
  ...
}
```

则会使用 `npm start` 方式启动。这意味着可以使用 [npm scripts](https://docs.npmjs.com/misc/scripts) 来定制启动过程。

**提示：**有些遗留项目可能会将 `start` 脚本写成 `node ./app.js` 从而导致启动检测失败，所以将脚本改成 `node server.js` 或者你确认的启动方式即可。

如果没有 `start` 脚本，则默认使用 `npm server.js` 来启动，所以需要保证存在 `$PROJECT_DIR/server.js` 文件。 {% endblock %}

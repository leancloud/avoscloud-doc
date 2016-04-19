{# 指定继承模板 #}
{% extends "./leanengine_webhosting_guide.tmpl" %}

{% set productName = '云引擎' %}
{% set platformName = 'Node.js' %}
{% set fullName = productName + ' ' + platformName %}
{% set sdk_name = 'JavaScript' %}
{% set leanengine_middleware = '[LeanEngine Node.js SDK](https://github.com/leancloud/leanengine-node-sdk)' %}


{% block custom_api_random_string %}
打开 `./app.js` ，添加如下代码：

```js
app.get('/time', function(req, res) {
  res.send({ currentTime: new Date() });
});
```
{% endblock %}

{% block project_constraint %}
{{fullName}} 项目必须有 `$PROJECT_DIR/server.js` 文件，该文件为整个项目的启动文件。

**注意：**项目中**不能**有 `$PROJECT_DIR/cloud/main.js` 文件，否则会被识别为 [2.0 版本](./leanengine_guide-cloudcode.html#项目约束) 的项目。
{% endblock %}

{% block project_start %}
### 项目启动

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

如果没有 `start` 脚本，则默认使用 `node server.js` 来启动，所以需要保证存在 `$PROJECT_DIR/server.js` 文件。 {% endblock %}

{% block ping %}
{{leanengine_middleware}} 内置了该 URL 的处理，只需要将中间件添加到请求的处理链路中即可：

```
app.use(AV.Cloud);
```

或者类似于 [项目框架](https://github.com/leancloud/node-js-getting-started) 那样，有一个 [cloud.js](https://github.com/leancloud/node-js-getting-started/blob/master/cloud.js) 且最终是以 `module.exports = AV.Cloud;` 结尾，然后在 [app.js](https://github.com/leancloud/node-js-getting-started/blob/master/app.js) 中加载 `cloud.js` 也可以达到一样的效果：

```
var cloud = require('./cloud');

// 加载云引擎方法
app.use(cloud);
```

如果未使用 {{leanengine_middleware}}，则需要自己实现该 URL 的处理，比如这样：

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

{% block supported_frameworks %}
{{fullName}} 支持任意 [Node.js](https://nodejs.org) 的 Web 框架，你可以使用你最熟悉的框架进行开发，或者不使用任何框架，直接使用 Node.js 的 http 模块进行开发。但是请保证通过执行 `server.js` 能够启动你的项目，启动之后程序监听的端口为 `process.env.LC_APP_PORT`。

```js
var express = require('express');
var AV = require('leanengine');

var app = express();

app.use(AV.Cloud);
app.listen(process.env.LC_APP_PORT);
```
{% endblock %}

{% block code_get_client_ip_address %}
```js
app.get('/', function(req, res) {
  console.log(req.headers['x-real-ip']);// 打印 IP 地址
  res.render('index', { currentTime: new Date() });
});
```
{% endblock %}

{% block use_leanstorage %}
云引擎使用 {{leanengine_middleware}} 来代替 [JavaScript 存储 SDK](https://github.com/leancloud/javascript-sdk) 。前者包含了后者，并增加了云函数和 Hook 函数的支持，因此开发者可以直接使用 [LeanCloud 的存储服务](js_guide.html) 来存储自己的数据。

如果使用项目框架作为基础开发，{{leanengine_middleware}} 默认是配置好的，可以根据示例程序的方式直接使用。

如果是自定义项目，则需要自己配置：

* 配置依赖：在项目根目录下执行以下命令来增加 {{leanengine_middleware}} 的依赖：
  ```
  $ npm install leanengine --save
  ```
* 初始化：在正式使用数据存储之前，你需要使用自己的应用 key 进行初始化中间件：
  ```js
  var AV = require('leanengine');
  
  var APP_ID = process.env.LC_APP_ID || '{{appid}}'; // 你的 app id
  var APP_KEY = process.env.LC_APP_KEY || '{{appkey}}'; // 你的 app key
  var MASTER_KEY = process.env.LC_APP_MASTER_KEY || '{{masterkey}}'; // 你的 master key
  
  AV.initialize(APP_ID, APP_KEY, MASTER_KEY);
  // 如果不希望使用 masterKey 权限，可以将下面一行删除
  AV.Cloud.useMasterKey();
  ```
{% endblock %}

{% block http_client %}

**提示**：推荐使用 [request](https://www.npmjs.com/package/request) 等第三方模块来处理 HTTP 请求。

云引擎允许你使用 `AV.Cloud.httpRequest` 函数来发送 HTTP 请求到任意的 HTTP 服务器。使用 `AV.Cloud.httpRequest` ，一个简单的 GET 请求看起来是这样：

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

当返回的 HTTP 状态码是成功的状态码（例如 200、201 等），则 success 函数会被调用，反之 error 函数将被调用。

#### 查询参数

如果你想添加查询参数到 URL 末尾，你可以设置选项对象的 params 属性。你既可以传入一个 JSON 格式的 key-value 对象，像这样：

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

#### 设置 HTTP 头部

通过设置选项对象的 header 属性，你可以发送 HTTP 头信息。假设你想设定请求的 `Content-Type`，你可以这样做：

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

#### 设置超时

默认请求超时设置为 10 秒，超过这个时间没有返回的请求将被强制终止，你可以通过 timeout 选项（单位毫秒）调整这个超时，比如把请求超时设置为 15 秒：

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


#### 发送 POST 请求

通过设置选项对象的 method 属性就可以发送 POST 请求。同时可以设置选项对象的 body 属性来发送数据，例如：

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

这将会发送一个 POST 请求到 `http://www.example.com/create_post`，body 是被 URL 编码过的表单数据。 如果你想使用 JSON 编码 body，可以这样做：

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

当然，body 可以被任何想发送出去的 String 对象替换。

#### HTTP 应答对象

传给 success 和 error 函数的应答对象包括下列属性：

- **status**：HTTP 状态码
- **headers**：HTTP 应答头部信息
- **text**：原始的应答 body 内容
- **buffer**：原始的应答 Buffer 对象
- **data**：解析后的应答内容，如果云引擎可以解析返回的 `Content-Type` 的话（例如 JSON 格式，就可以被解析为一个 JSON 对象）

如果你不想要 text（会消耗资源做字符串拼接），只需要 buffer，那么可以设置请求的 text 选项为 false：

```javascript
AV.Cloud.httpRequest({
  method: 'POST',
  url: 'http://www.example.com/create_post',
  text: false,
  ......
});
```
{% endblock %}

{% block upload_file_special_middleware %}
然后配置应用使用 [multiparty](https://www.npmjs.com/package/multiparty) 中间件：

```javascript
var multiparty = require('multiparty');
```
{% endblock %}

{% block code_upload_file_sdk_function %}
```javascript
var fs = require('fs');
app.post('/upload', function(req, res){
  var form = new multiparty.Form();
  form.parse(req, function(err, fields, files) {
    var iconFile = files.iconImage[0];
    if(iconFile.size !== 0){
      fs.readFile(iconFile.path, function(err, data){
        if(err) {
          return res.send('读取文件失败');
        }
        var base64Data = data.toString('base64');
        var theFile = new AV.File(iconFile.originalFilename, {base64: base64Data});
        theFile.save().then(function(theFile){
          res.send('上传成功！');
        });
      });
    } else {
      res.send('请选择一个文件。');
    }
  });
});
```
{% endblock %}

{% block cookie_session %}
### 处理用户登录和登出

要让云引擎支持 LeanCloud 用户体系的 Session，在 app.js 里添加下列代码：

```javascript
var express = require('express');
var AV = require('leanengine');

var app = express();
// 加载 cookieSession 以支持 AV.User 的会话状态
app.use(AV.Cloud.CookieSession({ secret: 'my secret', maxAge: 3600000, fetchUser: true }));
```

使用 `AV.Cloud.CookieSession` 中间件启用 CookieSession，注意传入一个 secret 用于 cookie 加密（必须）。它会自动将 `AV.User` 的登录信息记录到 cookie 里，用户每次访问会自动检查用户是否已经登录，如果已经登录，可以通过 `req.AV.user` 获取当前登录用户。

`AV.Cloud.CookieSession` 支持的选项包括：

* **fetchUser**：**是否自动 fetch 当前登录的 AV.User 对象。默认为 false。**  
  如果设置为 true，每个 HTTP 请求都将发起一次 LeanCloud API 调用来 fetch 用户对象。如果设置为 false，默认只可以访问 `req.AV.user` 当前用户的 id 属性（即 _User 表记录的 ObjectId），你可以在必要的时候 fetch 整个用户。通常保持默认的 false 就可以。
* **name**：session 在 cookie 中存储的 key 名称，默认为 `avos.sess`。
* **maxAge**：设置 cookie 的过期时间。

`httpOnly` 和 `signed` 参数我们强制设置为 true。

**注意**：我们通常不建议在云引擎环境中通过 `AV.User.current()` 获取登录用户的信息，虽然这样做不会有问题，也不会有串号的风险，但由于这个功能依赖 Node.js 的 Domain 模块，而 Node.js 4.x 已经不推荐使用 Domain 模块了，所以在云引擎中获取 currentUser 的机制后续会发生改变。因此，我们建议：

* 在云引擎方法中，通过 `request.user` 获取用户信息。
* 在网站托管中，通过 `req.AV.user` 获取用户信息。
* 在后续的方法调用显示传递 user 对象。

登录很简单：

```javascript
app.get('/login', function(req, res) {
  // 渲染登录页面
  res.render('login.ejs');
});
// 点击登录页面的提交将出发下列函数
app.post('/login', function(req, res) {
  AV.User.logIn(req.body.username, req.body.password).then(function(user) {
    //登录成功，AV.Cloud.CookieSession 会自动将登录用户信息存储到 cookie
    //跳转到profile页面。
    console.log('signin successfully: %j', user);
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

//调用此 url 来登出账号
app.get('/logout', function(req, res) {
  // AV.Cloud.CookieSession 将自动清除登录 cookie 信息
  AV.User.logOut();
  res.redirect('/profile');
});
```

登录页面大概是这样 login.ejs:

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

注意：express 框架的 `express.session.MemoryStore` 在我们云引擎中是无法正常工作的，因为我们的云引擎是多主机，多进程运行，因此内存型 session 是无法共享的，建议用 [express.js &middot; cookie-session 中间件](https://github.com/expressjs/cookie-session)。
{% endblock %}

{% block custom_session %}
### 自定义 session
有时候你需要将一些自己需要的属性保存在 session 中，你可以增加通用的 `cookie-session` 组件，详情可以参考 [express.js &middot; cookie-session](https://github.com/expressjs/cookie-session)。该组件和 `AV.Cloud.CookieSession` 组件可以并存。
{% endblock %}

{% block https_redirect %}
```javascript
app.enable('trust proxy');
app.use(AV.Cloud.HttpsRedirect());
```
{% endblock %}


{% block custom_runtime %}
目前{{fullName}}在项目框架中使用 {{platformName}} 4.x，开发者最好使用此版本进行开发。

对于早期云引擎项目如果想使用 Node.js 4.x 版本，请在项目的 `package.json` 中为指定 `engine` 的版本，例如：

```
...
"engines": {
  "node": "4.x"
},
...
```

**提示**：{{productName}} 0.12 和 4.x 差异较大，建议升级后充分测试。

**提示**：如果 {{productName}} 不支持所指定的版本，则会默认使用 {{platformName}} 4.x 版本。
{% endblock %}

{% block get_env %}
```javascript
var NODE_ENV = process.env.NODE_ENV || 'development';
if (NODE_ENV === 'development') {
  // 当前环境为「开发环境」，是由命令行工具启动的
} else if(NODE_ENV == 'production') {
  // 当前环境为「生产环境」，是线上正式运行的环境
} else {
  // 当前环境为「预备环境」
}
```
{% endblock %}

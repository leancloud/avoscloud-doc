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

**注意：** 项目中 **不能** 有 `$PROJECT_DIR/cloud/main.js` 文件，否则会被识别为 [2.0 版本](./leanengine_guide-cloudcode.html#项目约束) 的项目。
{% endblock %}

{% block project_start %}
### 项目启动

如果 `$PROJECT_DIR/package.json` 文件有自定义的启动脚本：

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

**提示：** 有些遗留项目可能会将 `start` 脚本写成 `node ./app.js` 从而导致启动检测失败，所以将脚本改成 `node server.js` 或者你确认的启动方式即可。

如果没有 `start` 脚本，则默认使用 `node server.js` 来启动，所以需要保证存在 `$PROJECT_DIR/server.js` 文件。 {% endblock %}

{% block ping %}
{{leanengine_middleware}} 内置了该 URL 的处理，只需要将中间件添加到请求的处理链路中即可：

```
app.use(AV.express());
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

// 云函数列表
app.get('/1.1/_ops/functions/metadatas', function(req, res) {
  res.end(JSON.stringify([]));
});
```
{% endblock %}

{% block supported_frameworks %}
{{fullName}} 支持任意 [Node.js](https://nodejs.org) 的 Web 框架，你可以使用你最熟悉的框架进行开发，或者不使用任何框架，直接使用 Node.js 的 http 模块进行开发。但是请保证通过执行 `server.js` 能够启动你的项目，启动之后程序监听的端口为 `process.env.LEANCLOUD_APP_PORT`。

```js
var express = require('express');
var AV = require('leanengine');

var app = express();

app.use(AV.express());
app.listen(process.env.LEANCLOUD_APP_PORT);
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
$ npm install leanengine@next --save
```

* 初始化：在正式使用数据存储之前，你需要使用自己的应用 key 进行初始化中间件：

```js
var AV = require('leanengine');

AV.init({
  appId: process.env.LEANCLOUD_APP_ID || '{{appid}}', // 你的 app id
  appKey: process.env.LEANCLOUD_APP_KEY || '{{appkey}}', // 你的 app key
  masterKey: process.env.LEANCLOUD_APP_MASTER_KEY || '{{masterkey}}' // 你的 master key
});

// 如果不希望使用 masterKey 权限，可以将下面一行删除
AV.Cloud.useMasterKey();
```
{% endblock %}

{% block http_client %}

推荐使用 [request](https://www.npmjs.com/package/request) 这个第三方模块来完成 HTTP 请求。

安装 request:

```sh
npm install request --save
```

代码示例：

```javascript
var request = require('request');

request({
  method: 'POST',
  url: 'http://www.example.com/create_post',
  json: {
    title: 'Vote for Pedro',
    body: 'If you vote for Pedro, your wildest dreams will come true'
  }
}, function(err, res, body) {
  if (err) {
    console.error('Request failed with response code ' + res.statusCode);
  } else {
    console.log(body);
  }
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
        var theFile = new AV.File(iconFile.originalFilename, data);
        theFile.save().then(function(theFile){
          res.send('上传成功！');
        }).catch(console.error);
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

云引擎提供了一个 `AV.Cloud.CookieSession` 中间件，用 Cookie 来维护用户（`AV.User`）的登录状态，要使用这个中间件可以在 `app.js` 中添加下列代码：

```javascript
var express = require('express');
var AV = require('leanengine');

var app = express();
// 加载 cookieSession 以支持 AV.User 的会话状态
app.use(AV.Cloud.CookieSession({ secret: 'my secret', maxAge: 3600000, fetchUser: true }));
```

你需要传入一个 secret 用于加密 Cookie（必须提供），这个中间件会将 `AV.User` 的登录状态信息记录到 Cookie 中，用户下次访问时自动检查用户是否已经登录，如果已经登录，可以通过 `req.currentUser` 获取当前登录用户。

`AV.Cloud.CookieSession` 支持的选项包括：

* **fetchUser**：**是否自动 fetch 当前登录的 AV.User 对象。默认为 false。**  
  如果设置为 true，每个 HTTP 请求都将发起一次 LeanCloud API 调用来 fetch 用户对象。如果设置为 false，默认只可以访问 `req.currentUser` 的 `id`（`_User` 表记录的 ObjectId）和 `sessionToken` 属性，你可以在需要时再手动 fetch 整个用户。
* **name**：Cookie 的名字，默认为 `avos.sess`。
* **maxAge**：设置 Cookie 的过期时间。

**注意**：在 Node SDK 1.x 之后我们不再允许通过 `AV.User.current()` 获取登录用户的信息（详见 [升级到云引擎 Node.js SDK 1.0](leanengine-node-sdk.html)）：

* 在云引擎方法中，通过 `request.currentUser` 获取用户信息。
* 在网站托管中，通过 `request.currentUser` 获取用户信息。
* 在后续的方法调用显示传递 user 对象。

你可以这样简单地实现一个具有登录功能的站点：

```javascript
// 渲染登录页面
app.get('/login', function(req, res) {
  res.render('login.ejs');
});

// 处理登录请求（可能来自登录界面中的表单）
app.post('/login', function(req, res) {
  AV.User.logIn(req.body.username, req.body.password).then(function(user) {
    console.log('signin successfully: %j', user);
    res.saveCurrentUser(user); // 保存当前用户到 Cookie.
    res.redirect('/profile'); // 跳转到个人资料页面
  },function(error) {
    //登录失败，跳转到登录页面
    res.redirect('/login');
  });
})

// 查看个人资料
app.get('/profile', function(req, res) {
  // 判断用户是否已经登录
  if (req.currentUser) {
    // 如果已经登录，发送当前登录用户信息。
    res.send(req.currentUser);
  } else {
    // 没有登录，跳转到登录页面。
    res.redirect('/login');
  }
});

// 登出账号
app.get('/logout', function(req, res) {
  req.currentUser.logOut();
  res.clearCurrentUser(); // 从 Cookie 中删除用户
  res.redirect('/profile');
});
```

一个简单的登录页面（`login.ejs`）可以是这样：

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

{% endblock %}

{% block custom_session %}
### 自定义 session
有时候你需要将一些自己需要的属性保存在 session 中，你可以增加通用的 `cookie-session` 组件，详情可以参考 [express.js &middot; cookie-session](https://github.com/expressjs/cookie-session)。该组件和 `AV.Cloud.CookieSession` 组件可以并存。

注意：express 框架的 `express.session.MemoryStore` 在我们云引擎中是无法正常工作的，因为我们的云引擎是多主机、多进程运行，因此内存型 session 是无法共享的，建议用 [express.js &middot; cookie-session 中间件](https://github.com/expressjs/cookie-session)。
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

**提示**：如果 {{productName}} 不支持所指定的版本，则会默认使用 {{platformName}} 0.12 版本。
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

{% extends "./leanengine_guide.tmpl" %}

{% block updateToLeanEngine%}
### 升级到 LeanEngine
云代码 2.0 和 LeanEngine 的差别主要是应用的目录结构：因为 LeanEngine 没有沙箱环境，所以不强制 `cloud` 和 `config` 等目录结构，只要是一个普通的 Node.js 项目即可。而 SDK 将作为一个普通组件添加到项目中，所以使用方面也有一些变化：

* 需要自己初始化 AV 对象：云代码 2.0 的环境会直接将 AV 对象初始化并保存在沙箱环境上下文中，所以不需要任何声明而直接使用。我们认为这样违背了编程规则，所以 LeanEngine 环境需要自行初始化 AV 对象，而且可以根据需要来决定此过程是否使用 masterKey 。
* 时区：云代码 2.0 默认使用 UTC 时区，这给很多开发者带来了困惑。所以 LeanEngine 默认情况使用东八区时区，在 [时区问题](#时区问题) 部分详细讨论这个问题。
* `avos-express-cookie-session` 的改变：该组件不再依赖 `cookie-parse`，而且引入方式发生变化，详情见 [处理用户登录和登出](#处理用户登录和登出)。
* 运行环境判断：云代码 2.0 使用 `__production` 全局变量判断当前环境是「测试环境」还是「生产环境」，而 LeanEngine 尊重 Node.js 的习惯，使用 `NODE_ENV` 这个变量来进行区分，`test` 为测试环境，`production` 为生产环境。详情见 [运行环境区分](#运行环境区分)

请参见详细的 [升级指南](./leanengine_upgrade_3.0.html)。
{% endblock %}

{% block quick_start_create_project %}
命令行界面输入命令创建应用：

```
$ avoscloud new
```

根据提示信息输入 appId 等相关信息即可创建一个初始应用。然后进入项目目录：

```
$ cd <appName>
```
{% endblock %}

{% block introduceCloudCodeV2 %}
## 云代码 2.0 版

2014 年 8 月 14 号，云代码推出 2.0 版本，最主要特性：可以自由添加和使用三方类库，去除一些对模块的限制。从 14 号开始，新创建的应用都将使用云代码2.0版本。

### 升级到 2.0

1. 时区问题：2.0版彻底修复了时区问题，应用不再需要自己对时间做 8 小时的时区修正。所以需要确认，在迁移到云代码2.0之前，移除代码中之前对时间修正的部分代码。
  * 需要注意的是，云代码 2.0 使用的默认时区仍然为 UTC 时区，在 [时区问题](#时区问题) 部分详细讨论。
1. 引入 package.json （可选）：如果项目需要引入其他三方类库，可以像标准 Node.js 项目一样，在项目根目录添加一个 `package.json` 配置文件，下面是一个简单的样例：

```json
{
    "name": "cloud-code-test",
    "description": "Cloud Code test project.",
    "version": "0.0.1",
    "private": true,
    "dependencies": {
        "async": "0.9.x"
    }
}
```

需要注意的是，云代码 2.0 运行环境默认包含一些组件，如果 `package.json` 指定明确版本则以用户自定义的为准，否则使用下面的默认版本：

```
nodejs: "0.10.29"
qiniu: "6.1.3"
underscore: "1.6.0"
underscore.string: "2.3.3"
moment: "2.7.0"
express-ejs-layouts: "0.3.1"
weibo: "0.6.9"
node-qiniu: "6.1.6"
mailgun: "0.4.2"
mandrill: "0.1.0"
stripe: "2.5.0"
sendgrid: "1.0.5"
xml2js: "0.4.4"
```

**注意**：`express` 目前只支持 `3.4.x` 版本，即使 `package.json` 指定其他版本也是无效的。

在以上问题都确认后，就可以进行升级动作。升级操作完成后，因为缓存的原因，需要等待最多5分钟，平台将自动迁移完成，在5分钟迁移时间内，老的云代码将继续提供服务，因此无需担心迁移期间服务暂停。

### 最新特性

* 有着更好的资源隔离机制，因此 `fs` 等官方模块的限制取消了。
* 可以自由添加和使用三方类库
* 时区问题彻底解决
* `views` 目录不再需要分成两个目录（ `cloud/views` 和 `cloud/dev_views` ）
* 修正：项目从代码仓库迁出有可能失败的问题
{% endblock %}

{% block download_skeleton %}
### 下载项目框架

你可以在 云代码 -> 设置 页面下载到项目框架：

![image](images/cloud_code_skeleton.png)

点击 `下载项目框架(基本版)` 链接，会自动下载一个初始的项目框架，下载后的文件是一个 zip 打包文件，请解压该文件，会看到一个以 App 名称命名的目录，目录结构是这样：

```
<appName>
├── README.md
├── cloud
│   └── main.js
├── config
│   └── global.json
└── public
    └── index.html
```
其中：

* cloud 目录下有一个 `main.js`，这就是你的业务逻辑代码存放的地方，初始内容定义了一个函数，代码如下：

```javascript
// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
AV.Cloud.define('hello', function(request, response) {
  response.success('Hello world!');
});
```
  
  这段代码定义了一个名为`hello`的函数，它简单的返回应答`Hello world!`。

* config 目录下是项目的配置文件 `global.json`，已经按照你的项目信息（主要是 appId 和 appKey）帮你自动配置好了。
* public 目录，用于存放 [Web Hosting](#web_hosting) 功能的静态资源文件，具体请看后面的介绍。

### 下载Web Hosting项目框架

进入 云代码 -> 设置 菜单下载项目框架（web主机版）：

![image](images/cloud_code_skeleton.png)

下载后的代码结构类似 LeanEngine（基本版），只是在`Cloud`目录下多了`app.js`文件和`views`目录:

```
<appName>
├── README.md
├── cloud
│   ├── app.js
│   ├── main.js
│   └── views
│       └── hello.ejs
├── config
│   └── global.json
└── public
    └── index.html
```

并且`cloud/main.js`里还多了一行代码：

```javascript
require('cloud/app.js');
```

用来加载app.js

代码部署的过程跟 LeanEngine 部署是一样的，具体见[部署](#部署)。
{% endblock %}

{% block demo %}
* [cloudcode-test](https://github.com/killme2008/cloudcode-test)：一个简单留言板网站。效果体验：https://myapp.avosapps.com/
{% endblock %}

{% block run_in_local_command %}
```
$ avoscloud
```
{% endblock %}

{% block cloud_func_file %}`$PROJECT_DIR/cloud/main.js`{% endblock %}

{% block project_constraint %}
云代码 2.0 的项目必须有 `$PROJECT_DIR/cloud/main.js` 文件，该文件为整个项目的启动文件。
{% endblock %}

{% block ping %}
云代码 2.0 沙箱环境内置了该 URL 的处理，所以不需要做额外操作。
{% endblock %}

{% block others_web_framework %}
因为云代码 2.0 是运行在沙箱环境，所以不支持其他的 web 框架。只能使用预定义的 Express 3.x。
{% endblock %}

{% block install_middleware_cloudcode %}
因为云代码 2.0 是运行在沙箱环境，所以不需要安装和初始化，直接可以在项目中使用。
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

{% block timerLegacy %}
**原来提供的`AV.Cloud.setInterval`和`AV.Cloud.cronjob`都已经废弃，这两个函数的功能变成和`AV.Cloud.define`一样，已经定义的任务会自动帮您做转换并启动**
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

{% block masterKeyInitLegacy%}
**注意：**云代码 2.0 版本已经默认使用 masterKey 初始化 SDK，所以不需要额外初始化。
{% endblock %}

{% block loggerExample %}
```javascript
AV.Cloud.define('Logger', function(request, response) {
  console.log(request.params);
  response.success();
});
```
{% endblock %}

{% block static_cache %}
### 静态资源

`public`目录下的资源将作为静态文件服务，例如，你在public下有个文件叫`index.html`，那么就可以通过`http://${your_app_domain}.avosapps.com/index.html`访问到这个文件。

通常，你会将资源文件按照类型分目录存放，比如css文件放在`stylesheets`目录下，将图片放在`images`目录下，将javascript文件放在`js`目录下，LeanEngine 同样能支持这些目录的访问。

例如，`public/stylesheets/app.css`可以通过`http://${your_app_domain}.avosapps.com/stylesheets/app.css`访问到。

在你的HTML文件里引用这些资源文件，使用相对路径即可，比如在`public/index.html`下引用`app.css`：

```html
<link href="stylesheets/app.css" rel="stylesheet">
```

默认静态资源的`Cache-Control`是`max-age=0`，这样在每次请求静态资源的时候都会去服务端查询是否更新，如果没有更新返回304状态码。你还可以在`app.listen`的时候传入选项，设置静态资源的maxAge：

```javascript
//设置7天不过期
app.listen({'static': {maxAge: 604800000}});
```

请注意`maxAge`的单位是毫秒，这样cache-control头会变成`max-age=604800`。更多static选项参考[static middleware](http://www.senchalabs.org/connect/static.html)。
{% endblock %}

{% block dynamic_request %}
### 动态请求

如果只是展现静态资源，您可能使用 Github Pages 类似的免费服务也能做到，但是 LeanEngine 提供的 Web Hosting 功能同时支持动态请求。 这是通过编写 [Node.js](http://nodejs.org) 代码，基于[express.js](http://expressjs.com/)这个web MVC框架做到的。

关于[express.js](http://expressjs.com/)框架，请参考官方文档来学习。

在下载的项目框架`cloud/app.js`，我们可以看到一个初始代码：

```javascript
// 在 LeanEngine 里初始化express框架
var express = require('express');
var app = express();
var name = require('cloud/name.js');

// App全局配置
app.set('views','cloud/views');   //设置模板目录
app.set('view engine', 'ejs');    // 设置template引擎
app.use(express.bodyParser());    // 读取请求body的中间件

//使用express路由API服务/hello的http GET请求
app.get('/hello', function(req, res) {
  res.render('hello', { message: 'Congrats, you just set up your app!' });
});

//最后，必须有这行代码来使express响应http请求
app.listen();
```

我们使用`ejs`模板来渲染view，默认的模板都放在`views`目录下，比如这里`hello.ejs`:

```html
<%= message %>
```

简单地显示message内容。你还可以选用[jade](https://github.com/visionmedia/jade)这个模板引擎：

```javascript
app.set('view engine', 'jade');
```

您可以参照上面的 [部署](#部署) 章节来部署这个框架代码，部署成功之后，直接可以访问 `http://${your_app_domain}.avosapps.com/hello` 将看到展示的 message:

```
Congrats, you just set up your app!
```

更多复杂的路由和参数传递，请看 [express.js框架文档](http://expressjs.com/guide.html)。

我们还提供了一个在线demo： http://myapp.avosapps.com/ ，源码在 https://github.com/killme2008/cloudcode-test ，您可以作为参考。
{% endblock %}

{% block error_page_404 %}
### 自定义404页面

自定义404页面在云代码里比较特殊，假设我们要渲染一个404页面，必须将下列代码放在`app.listen()`之后：

```javascript
// 在app.listen();之后。
app.use(function(req, res, next){
  res.status(404).render('404', {title: 'Sorry, page not found'});
});
```

这将渲染views下面的404模板页面。
{% endblock %}

{% block get_client_ip %}
```javascript
var ip = req.headers['x-real-ip']
```
{% endblock %}

{% block upload_file %}
在 LeanEngine 里上传文件也很容易，首先配置 app 使用 bodyParser 中间件，它会将上传表单里的文件存放到临时目录并构造一个文件对象放到 request.files 里：

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

假设你创建了一个支持web主机功能的云代码项目，在app.js里添加下列代码：

```javascript
var express = require('express');
var app = express();
var avosExpressCookieSession = require('avos-express-cookie-session');

// App全局配置
app.set('views','cloud/views');   //设置模板目录
app.set('view engine', 'ejs');    // 设置template引擎
app.use(express.bodyParser());    // 读取请求body的中间件

// 启用 cookieParser
app.use(express.cookieParser('Your Cookie Secure'));
// 使用 avos-express-cookie-session 记录登录信息到 cookie
app.use(avosExpressCookieSession({ cookie: { maxAge: 3600000 }, fetchUser: true}));
```

使用`express.cookieParser`中间件启用 cookieParser，注意传入一个 secret 用于 cookie 加密（必须）。然后使用 `require('avos-express-cookie-session')` 导入的 avosExpressCookieSession 创建一个session存储，它会自动将AV.User的登录信息记录到 cookie 里，用户每次访问会自动检查用户是否已经登录，如果已经登录，可以通过 `req.AV.user` 获取当前登录用户。

`avos-express-cookie-session`支持的选项包括：

* cookie  -- 可选参数，设置cookie属性，例如maxAge,secure等。我们会强制将httpOnly和signed设置为true。
* fetchUser -- **是否自动fetch当前登录的AV.User对象。默认为false。**如果设置为true，每个HTTP请求都将发起一次LeanCloud API调用来fetch用户对象。如果设置为false，默认只可以访问 `req.AV.user` 当前用户的id属性，您可以在必要的时候fetch整个用户。通常保持默认的false就可以。
* key -- session在cookie中存储的key名称，默认为 `avos.sess`。

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
      //登录成功，avosExpressCookieSession会自动将登录用户信息存储到cookie
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
  //avosExpressCookieSession将自动清除登录cookie信息
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

注意： express框架的express.session.MemoryStore在我们云代码中是无法正常工作的，因为我们的云代码是多主机，多进程运行，因此内存型session是无法共享的，建议用[cookieSession中间件](https://gist.github.com/visionmedia/1491756)。
{% endblock %}

{% block cookie_session_middleware %}`avosExpressCookieSession`{% endblock%}

{% block https_redirect %}
```javascript
var avosExpressHttpsRedirect = require('avos-express-https-redirect');
app.use(avosExpressHttpsRedirect());
```
{% endblock %}

{% block get_env %}
```javascript
if (__local) {
  // 当前环境为「开发环境」，是由命令行工具启动的
} else if(__production) {
  // 当前环境为「生产环境」，是线上正式运行的环境
} else {
  // 当前环境为「测试环境」
}
```
{% endblock %}

{% block cloud_code_module %}
## 模块

云代码 2.0 支持将JavaScript代码拆分成各个模块。为了避免加载模块带来的不必要的副作用，云代码模块的运作方式和CommonJS模块类似。当一个模块被加载的时候，JavaScript文件首先被加载，然后执行文件内的源码，并返回全局的export对象。例如，假设`cloud/name.js`包含以下源码：

```javascript
var coolNames = ['Ralph', 'Skippy', 'Chip', 'Ned', 'Scooter'];
exports.isACoolName = function(name) {
  return coolNames.indexOf(name) !== -1;
}
```
然后在`cloud/main.js`包含下列代码片段：

```javascript
var name = require('cloud/name.js');
name.isACoolName('Fred'); // 返回false
name.isACoolName('Skippy'); // 返回true;
name.coolNames; // 未定义.
```
（提示，你可以利用`console.log`来打印这几个调用的返回值到日志）

name模块包含一个名为`isACoolName`的函数。`require`接收的路径是相对于你的云代码项目的根路径，并且只限`cloud/`目录下的模块可以被加载。

### 可用的第三方模块

因为云代码 1.0 运行在沙箱环境，我们只允许使用部分类库，这个名单如下：

```
qiniu
underscore
underscore.string
moment
util
express
crypto
url
events
string_decoder
buffer
punycode
querystring
express-ejs-layouts
weibo
node-qiniu
mailgun
mandrill
stripe
sendgrid
xml2js
```
上面这些模块都可以直接require使用。
我们还提供受限制的`fs`文件模块，仅可以读取上传文件目录下的文件。

**云代码 2.0 开始将没有模块限制，但是上述必选的模块仍然将优先使用云代码环境中使用的版本**
{% endblock %}

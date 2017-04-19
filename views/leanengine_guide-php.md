{% extends "./leanengine_guide.tmpl" %}

{% set environment        = "PHP" %}
{% set hook_before_save   = "beforeSave" %}
{% set hook_after_save    = "afterSave" %}
{% set hook_before_update = "beforeUpdate" %}
{% set hook_after_update  = "afterUpdate" %}
{% set hook_before_delete = "beforeDelete" %}
{% set hook_after_delete  = "afterDelete" %}
{% set hook_on_verified   = "onVerified" %}
{% set hook_on_login      = "onLogin" %}

{% block quick_start_create_project %}
从 Github 迁出实例项目，该项目可以作为一个你应用的基础：

```
$ git clone https://github.com/leancloud/php-getting-started.git
$ cd php-getting-started
```

然后添加应用 appId 等信息到该项目：

```
$ lean app add <APP-NAME> <APP-ID>
```

`<APP-NAME>` 是应用名称，`<APP-ID>` 是应用 ID。这些信息可以 [控制台 /（选择应用）/ 设置 / 基本信息](/app.html?appid={{appid}}#/general) 和 [应用 Key](/app.html?appid={{appid}}#/key) 中找到。
{% endblock %}

{% block runtime_env %}
**注意**：目前云引擎提供 PHP 5.5 的运行环境，请注意兼容性。
{% endblock %}

{% block demo %}
* [php-getting-started](https://github.com/leancloud/php-getting-started)：这是一个非常简单的 PHP Web 的项目，可以作为大家的项目模板。（在线演示：<http://php-todo-demo.leanapp.cn/>）
{% endblock %}

{% block run_in_local_command %}

云引擎 PHP 环境使用 composer 包管理器来管理依赖，请参考文档[下载和安装 composer](http://docs.phpcomposer.com/00-intro.html#Installation-Windows)

通过 composer 安装依赖：

```
$ composer install
```

启动应用：

```
$ lean up
```
{% endblock %}

{% block install_middleware %}
通过 composer 安装 LeanCloud PHP SDK:

```
composer require leancloud/leancloud-sdk
```
{% endblock %}

{% block init_middleware %}
```php
use \LeanCloud\LeanClient;
use \LeanCloud\Engine\LeanEngine;

LeanClient::initialize(
    getenv("LC_APP_ID"),
    getenv("LC_APP_KEY"),
    getenv("LC_APP_MASTER_KEY")
);

$engine = new LeanEngine();
$engine->start();
```
{% endblock %}

{% block cloudFuncExample %}
```php
use \LeanCloud\Engine\Cloud;
use \LeanCloud\LeanQuery;
use \LeanCloud\CloudException;

Cloud::define("averageStars", function($params, $user) {
    $query = new LeanQuery("Review");
    $query->equalTo("movie", $params["movie"]);
    try {
        $reviews = $query->find();
    } catch (CloudException $ex) {
        // 查询失败, 将错误输出到日志
        error_log($ex->getMessage());
        return 0;
    }
    $sum = 0;
    forEach($reviews as $review) {
        $sum += $review->get("stars");
    }
    if (count($reviews) > 0) {
         return $sum / count($reviews);
    } else {
         return 0;
    }
});

```
{% endblock %}

{% block cloudFuncParams %}
客户端传递的参数，会被作为第一个参数(数组)传递进云函数。

比如上面的例子，调用时传递的参数为 `$params = array("movie" => "夏洛特烦恼", "stars" => 5 ...)`。

如果是已登录的用户发起云引擎调用，可以通过
`LeanUser->getCurrentUser()` 拿到用户。如果通过 REST API 调用时模拟用
户登录，需要增加一个头信息 `X-LC-Session: <sessionToken>`，该
`sessionToken` 在用户登录或注册时服务端会返回。

当前用户(如果有登录)，会以第 2 个 `$user` 参数传递给函数。

{% endblock %}

{% block runFuncName %}`Cloud::run()`{% endblock %}

{% block defineFuncName %}`Cloud::define()`{% endblock %}

{% block runFuncExample %}
```php
use \LeanCloud\Engine\Cloud;

result = Cloud::run("hello", array("name" => "dennis"));

```
{% endblock %}

{% block runFuncApiLink %}[Cloud::run()](/api-docs/php/class-LeanCloud.Engine.Cloud.html#_run){% endblock %}

{% block beforeSaveExample %}
```php
use \LeanCloud\Engine\Cloud;
use \LeanCloud\Engine\FunctionError;

// Review 为需要 hook 的类名称
Cloud::beforeSave("Review", function($review, $user) {
    $comment = $review->get("comment");
    if ($comment) {
        if (strlen($comment) > 140) {
            // 修改数据
            $review->set("comment", substr($comment, 0, 140) . "...");
        }
    } else {
        // 返回错误，并取消数据保存
        throw new FunctionError("No Comment!", 101);
    }
    // 如果正常返回，则数据会保存
});

```
{% endblock %}

{% block afterSaveExample %}
```php
Cloud::afterSave("comment", function($comment, $user) {
    $query = new LeanQuery("Post");
    $post = $query->get($comment->get("post")->getObjectId());
    $post->increment("commentCount");
    try {
        $post->save();
    } catch (CloudException $ex) {
        throw new FunctionError("保存 Post 对象失败: " . $ex->getMessage());
    }
});
```
{% endblock %}

{% block afterSaveExample2 %}
```php
Cloud::afterSave("_User", function($userObj, $currentUser) {
    $userObj->set("from", "LeanCloud");
    try {
        $userObj->save();
    } catch (CloudException $ex) {
        throw new FunctionError("保存 User 对象失败: " . $ex->getMessage());
    }
});
```
{% endblock %}

{% block beforeUpdateExample %}

```php
Cloud::beforeUpdate("Review", function($review, $user) {
    // 对象的 updateKeys 字段记录了本次将要修改的字段名列表，
    // 可用于检测并拒绝对某些字段的修改
    if (in_array("comment", $review->updatedKeys) &&
        strlen($review->get("comment")) > 140) {
        throw new FunctionError("comment 长度不得超过 140 个字符");
    }
});
```

{% endblock %}

{% block afterUpdateExample %}

```php
Cloud::afterUpdate("Article", function($article, $user) {
    // 输出日志到控制台
    error_log("Article {$article->getObjectId()} has been updated.");
});

```
{% endblock %}

{% block beforeDeleteExample %}
```php
Cloud::beforeDelete("Album", function($album, $user) {
    $query = new LeanQuery("Photo");
    $query->equalTo("album", $album);
    try {
        $count = $query->count();
    } catch (CloudException $ex) {
        // Delete 操作会被取消
        throw new FunctionError("Error getting photo count: {$ex->getMessage()}");
    }
    if ($count > 0) {
        // 取消 Delete 操作
        throw new FunctionError("Cannot delete album that has photos.");
    }
});
```
{% endblock %}

{% block afterDeleteExample %}
```php
Cloud::afterDelete("Album", function($album, $user) {
    $query = new LeanQuery("Photo");
    $query->equalTo("album", $album);
    try {
        // 删除相关的 photos
        $photos = $query->find();
        LeanObject::destroyAll($photos);
    } catch (CloudException $ex) {
        throw new FunctionError("删除关联 photos 失败: {$ex->getMessage()}");
    }
});
```
{% endblock %}

{% block onVerifiedExample %}
```php
Cloud::onVerifed("sms", function($userObj, $meta) {
    error_log("User {$user->getUsername()} verified by SMS");
});
```
{% endblock %}

{% block onLoginExample %}
```php
Cloud::onLogin(function($user) {
    error_log("User {$user->getUsername()} is logging in.");
    if ($user->get("blocked")) {
        // 抛出异常禁止用户登录
        throw new FunctionError("Forbidden");
    }
    // 如果正常执行，则用户将正常登录
});
```
{% endblock %}

{% block errorCodeExample %}
错误响应码允许自定义。云引擎抛出的  `FunctionError`（数据存储 API 会抛出此异常）会直接将错误码和原因返回给客户端。若想自定义错误码，可以自行构造 `FunctionError`，将 `code` 与 `error` 传入。否则 `code` 为 1， `message` 为错误对象的字符串形式。

```php
Cloud::define("errorCode", function($params, $user) {
    // 尝试登录一个不存在的用户，会返回 211 错误
    LeanUser::logIn("not_this_user", "xxxxxx");
});
```
{% endblock %}

{% block errorCodeExample2 %}
```php
Cloud::define("customErrorCode", function($params, $user) {
    // 返回 123 自定义错误信息
    throw new FunctionError("自定义错误信息", 123);
});
```
{% endblock %}

{% block errorCodeExampleForHooks %}
```php
Cloud::beforeSave("Review", function($review, $user) {
   $comment = $review->get("comment");
   if (!$comment) {
       throw new FunctionError(json_encode(array(
           "code" => 123,
           "message" => "自定义错误信息",
       )));
   }
});

```
{% endblock %}

{% block project_constraint %}

云引擎 PHP 项目必须有 `$PROJECT_DIR/public/index.php` 与
`$PROJECT_DIR/composer.json` 文件，它们分别是项目的入口文件和依赖定义
文件。

{% endblock %}

{% block ping %}
云引擎中间件内置了该 URL 的处理，只需要将中间件添加到请求的处理链路中即可：

```php
require 'vendor/autoload.php';

use \LeanCloud\Engine\LeanEngine;

$engine= new LeanEngine();
$engine->start();
```

{% endblock %}

{% block others_web_framework %}

云引擎 PHP 中间件不依赖任何框架，可以不使用任何框架开发。但是请确保有
项目的入口文件 `public/index.php`，且云引擎中间件启用
(`$engine->start()`) 要在所有路由之前。

{% endblock %}


{% block http_client %}

云引擎 PHP 环境可以使用内置的 curl 模块，不过我们推荐使用
[guzzle](http://guzzlephp.org) 等第三方库来处理 HTTP 请求。

{% endblock %}

{% block timerExample %}
```php
Cloud::define("logTimer", function($params, $user) {
    error_log("Log in timer");
});
```
{% endblock %}

{% block timerExample2 %}
```php
use \LeanCloud\LeanPush;

Cloud::define("pushTimer", function($params, $user) {
    $push = new LeanPush(array("alert" => "Public message"));
    $push->setChannels(array("Public"));
    $push->send();
});
```
{% endblock %}

{% block masterKeyInit %}
```php
use \LeanCloud\LeanClient;
LeanClient::initialize($appId, $appKey, $masterKey);
LeanClient::useMasterKey(true);
```
{% endblock %}

{% block loggerExample %}
```php
Cloud::define("logSomething", function($params, $user) {
    error_log(json_encode($params));
});
```
{% endblock %}

{% block use_framework %}

PHP 云引擎中间件并不依赖任何第三方框架，但我们推荐使用
[Slim](http://www.slimframework.com/)。我们提供了 Adapter 可以方便地在
Slim 应用中启用云引擎中间件：

```php

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use \LeanCloud\LeanClient;
use \LeanCloud\Storage\CookieStorage;
use \LeanCloud\Engine\LeanEngine;

$app = new \Slim\App();

// 禁用 Slim 默认的 handler，使得错误栈被日志捕捉
unset($app->getContainer()['errorHandler']);

LeanClient::initialize(
    getenv("LC_APP_ID"),
    getenv("LC_APP_KEY"),
    getenv("LC_APP_MASTER_KEY")
);
// 将 sessionToken 持久化到 cookie 中，以支持多实例共享会话
LeanClient::setStorage(new CookieStorage());

// SlimEngine::enableHttpsRedirect();
$app->add(new SlimEngine());

$app->get('/hello/{name}', function (Request $request, Response $response) {
    $name = $request->getAttribute('name');
    $response->getBody()->write("Hello, $name");
    return $response;
});

```
{% endblock %}

{% block upload_file %}{% endblock %}

{% block cookie_session %}
{% endblock %}

{% block custom_session %}
{% endblock %}

{% block https_redirect %}

```php
// 启用 https 转发
LeanEngine::enableHttpsRedirect();

// Slim 应用中可以使用
// SlimEngine:enableHttpsRedirect();

$engine = new LeanEngine();
$engine->start();
```
{% endblock %}

{% block get_env %}
```php

if (getenv("LC_APP_PROD") == 1) {
    // 当前为生产环境
} else if (getenv("LC_APP_PROD" == 0)) {
    // 当前为预备环境
} else {
    // 当前为开发环境
}
```
{% endblock %}

{% block hookDeadLoop %}
#### 防止死循环调用

在实际使用中有这样一种场景：在 `Post` 类的 `{{hook_after_update}}` Hook 函数中，对传入的 `Post` 对象做了修改并且保存，而这个保存动作又会再次触发 `{{hook_after_update}}`，由此形成死循环。针对这种情况，我们为所有 Hook 函数传入的 `LeanObject` 对象做了处理，以阻止死循环调用的产生。

不过请注意，以下情况还需要开发者自行处理：

- 对传入的 `LeanObject` 对象进行 `fetch` 操作。
- 重新构造传入的 `LeanObject` 对象，如使用 `LeanObject::create()` 方法。

对于使用上述方式产生的对象，请根据需要自行调用以下 API：

- `LeanObject->disableBeforeHook()` 或
- `LeanObject->disableAfterHook()`

这样，对象的保存或删除动作就不会再次触发相关的 Hook 函数。

```php
Cloud::afterUpdate("Post", function($post, $user) {
    // 直接修改并保存对象不会再次触发 after update hook 函数
    $post->set('foo', 'bar');
    $post->save();

    // 如果有 fetch 操作，则需要在新获得的对象上调用相关的 disable 方法
    // 来确保不会再次触发 Hook 函数
    $post->fetch();
    $post->disableAfterHook();
    $post->set('foo', 'bar');
    $post->save();

    // 如果是其他方式构建对象，则需要在新构建的对象上调用相关的 disable 方法
    // 来确保不会再次触发 Hook 函数
    $post = LeanObject::create("Post", $post->getObjectId());
    $post->disableAfterHook();
    $post->save();
});
```

{% endblock %}


{% import "views/_helper.njk" as docs %}
{% import "views/_leanengine.njk" as leanengine %}
{% import "views/_parts.html" as include %}

{{ include.setService('engine') }}

# 云引擎 REST API 使用指南

LeanCloud 云端提供的统一的访问云函数的接口，所有的客户端 SDK 也都是封装了这个接口从而实现对云函数的调用。

我们推荐使用 [Postman](http://www.getpostman.com/) 来调试 REST API，我们的社区中有一篇 [使用 Postman 调试 REST API 教程](https://forum.leancloud.cn/t/postman-rest-api/8638)。

## 预备环境和生产环境

在客户端通过 REST API 调用云函数时，可以设置 HTTP 头 `X-LC-Prod` 来区分调用的环境。

* `X-LC-Prod: 0` 表示调用预备环境
* `X-LC-Prod: 1` 表示调用生产环境

在云引擎通过 SDK 调用云函数时，包括显式调用以及隐式调用（由于触发 hook 条件导致 hook 函数被调用），
SDK 会根据云引擎所属环境（预备、生产）调用相应环境的云函数。
例如，假定定义了 beforeDelete 云函数，在预备环境通过 SDK 删除一个对象，会触发预备环境的 beforeDelete hook 函数。

在云引擎以外的环境通过 SDK 显式或隐式调用云函数时，`X-LC-Prod` 的默认值一般为 `1`，也就是调用生产环境。
但由于历史原因，各 SDK 的具体行为有一些差异：

- 在 Node.js、PHP、Java 这三个 SDK 下，默认总是调用生产环境的云函数。
- 在 Python SDK 下，配合 lean-cli 本地调试时，且应用存在预备环境时，默认调用预备环境的云函数，其他情况默认调用生产环境的云函数。
- 云引擎 Java 环境的模板项目 [java-war-getting-started] 和 [spring-boot-getting-started] 做了处理，配合 lean-cli 本地调试时，且应用存在预备环境时，默认调用预备环境的云函数，其他情况默认调用生产环境的云函数（与 Python SDK 的行为一致）。

[java-war-getting-started]: https://github.com/leancloud/java-war-getting-started/
[spring-boot-getting-started]: https://github.com/leancloud/spring-boot-getting-started/

在本地调试时，可以通过设置 `LEANCLOUD_APP_ENV` (Node.js 是 `NODE_ENV`）这个环境变量来指定调用哪个环境的云函数（`stage` 对应预备环境，`production` 对应生产环境）。

## 云函数

云函数可以通过 REST API 来使用，比如调用一个叫 hello 的云函数：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{}' \
  https://{{host}}/1.1/functions/hello
```

通过 `POST /functions/:name` 这个 API 调用时，参数和结果都是 JSON 格式。例如，我们传入电影的名字来获取电影的目前的评分：

```sh
curl -X POST -H "Content-Type: application/json; charset=utf-8" \
       -H "X-LC-Id: {{appid}}" \
       -H "X-LC-Key: {{appkey}}" \
       -d '{"movie":"夏洛特烦恼"}' \
https://{{host}}/1.1/functions/averageStars
```

上述命令行实际上就是向云端发送一个 JSON 对象作为参数，请求 `averageStars` 云函数，参数的内容是要查询的电影的名字。

响应：

```json
{
  "result": {
    "movie": "夏洛特烦恼",
    "stars": "2.5"
  }
}
```

有些时候我们希望使用 AVObject 作为云函数的参数，或者希望云函数返回一个 AVObject，这时我们可以使用 `POST /1.1/call/:name` 这个 API，云函数 SDK 会将参数解释为一个 AVObject，同时在返回 AVObject 时提供必要的元信息：

```sh
curl -X POST \
  -H "X-LC-Id: {{appid}}" \
  -H "X-LC-Key: {{appkey}}" \
  -H "Content-Type: application/json" \
  -d '{"__type": "Object", "className": "Post", "pubUser": "LeanCloud官方客服"}' \
  https://{{host}}/1.1/call/addPost
```

响应：

```json
{
  "result": {
    "__type": "Object",
    "className": "Post",
    "pubUser": "LeanCloud官方客服"
  }
}
```

你还可以阅读以下云引擎开发指南来获取更多的信息。

* [云引擎 Node.js 环境](leanengine_cloudfunction_guide-node.html)
* [云引擎 Python 环境](leanengine_cloudfunction_guide-python.html)
* [云引擎 PHP 环境](leanengine_cloudfunction_guide-php.html)
* [云引擎 Java 环境](leanengine_cloudfunction_guide-java.html)
* [云引擎 .Net 环境](leanengine_cloudfunction_guide-dotnet.html)

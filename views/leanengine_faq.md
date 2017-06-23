# 云引擎常见问题和解答

## 云引擎都支持哪些语言

目前支持 Node.js、Python、Java 和 PHP 运行环境，未来可能还会引入其他语言。

## 云引擎的二级域名多久生效

我们设置的 TTL 是 5 分钟，但各级 DNS 服务都有可能对其进行缓存，实际生效会有一定延迟。

## 云引擎二级域名可以启用 HTTPS 吗

对于 `.leanapp.cn` 的二级域名我们默认支持 HTTPS，如需配置自动跳转到 HTTPS，请看 [《重定向到 HTTPS》](leanengine_webhosting_guide-node.html#重定向到_HTTPS)。自定义的域名如需配置 HTTPS 需要在进行域名绑定时上传 HTTPS 证书。

## 为什么在控制台通过在线定义函数或项目定义函数中的 Class Hook 没有被运行？

首先确认一下 Hook 被调用的时机是否与你的理解一致：

* `beforeSave`：对象保存或创建之前
* `afterSave`：对象保存或创建之后
* `beforeUpdate`：对象更新之前
* `afterUpdate`：对象更新之后
* `beforeDelete`：对象删除之前
* `afterDelete`：对象删除之后
* `onVerified`：用户通过邮箱或手机验证后
* `onLogin`：用户在进行登录操作时

还需注意在本地进行云引擎调试时，运行的会是线上预备环境的 Hook，如果没有预备环境则不会运行。

然后检查 Hook 函数是否被执行过：

{% if node=='qcloud' %}
可以先在 Hook 函数的入口打印一行日志，然后进行操作，再到 `云引擎日志` 中检查该行日志是否被打印出来，如果没有看到日志原因可能包括：
{% else %}
可以先在 Hook 函数的入口打印一行日志，然后进行操作，再到 [云引擎日志](/cloud.html?appid={{appid}}#/log) 中检查该行日志是否被打印出来，如果没有看到日志原因可能包括：
{% endif %}

* 代码没有被部署到正确的应用
* 代码没有被部署到生产环境（或没有部署成功）
* Hook 的类名不正确

如果日志已打出，则继续检查函数是否成功，检查控制台上是否有错误信息被打印出。如果是 before 类 Hook，需要保证 Hook 函数在 15 秒内结束，否则会被系统认为超时。

相关文档：

* [云引擎指南：Hook 函数](leanengine_cloudfunction_guide-node.html#Hook_函数)

## 命令行工具在本地调试时提示 `Error: listen EADDRINUSE :::3000`，无法访问应用

`listen EADDRINUSE :::3000` 表示你的程序默认使用的 3000 端口被其他应用占用了，可以按照下面的方法找到并关闭占用 3000 端口的程序：

* [Mac 使用 `lsof` 和 `kill`](http://stackoverflow.com/questions/3855127/find-and-kill-process-locking-port-3000-on-mac)
* [Linux 使用 `fuser`](http://stackoverflow.com/questions/11583562/how-to-kill-a-process-running-on-particular-port-in-linux)
* [Windows 使用 `netstat` 和 `taskkill`](http://stackoverflow.com/questions/6204003/kill-a-process-by-looking-up-the-port-being-used-by-it-from-a-bat)

也可以修改命令行工具默认使用的 3000 端口：
```
lean -p 3002
```

## Application not found 错误

访问云引擎服务时，服务端返回错误「Application not found」或在云引擎日志中出现同一错误。

- 调用错了环境。最常见的情况是，免费的体验实例是没有预备环境，开发者却主动设置去调用预备环境。
- `???.leanapp.cn` 二级域名填错了，比如微信回调地址。请确认与 `???` 的拼写完全一致。

## 云函数如何获取 Header、如何响应 GET 方法？

不建议在 Header 中传递信息，云函数可以说是 LeanCloud 所提供的一种 RPC 的封装，这种封装的目的是隐藏掉底层使用 HTTP 协议的细节，所以建议将所有的参数都放在 Body 中、只使用 POST 方法请求。

如果希望能够充分利用 HTTP 提供的语义化特征，可以考虑使用云引擎的「[网站托管](leanengine_webhosting_guide-node.html#Web_框架)」功能，自行来处理 HTTP 请求。

## 如何判断当前是预备环境还是生产环境？

请参考 [网站托管开发指南 · 预备环境和生产环境](leanengine_webhosting_guide-node.html#预备环境和生产环境) / [Python · 运行环境区分](leanengine_webhosting_guide-python.html#预备环境和生产环境)。

## 怎么添加第三方模块

只需要像普通的 Node.js 项目那样，在项目根目录的 `package.json` 中添加依赖即可：

```
{
  "dependencies": {
    "async": "0.9.0",
    "moment": "2.9.0"
  }
}
```

`dependencies` 内的内容表明了该项目依赖的三方模块（比如示例中的 `async` 和 `moment`）。关于 `package.json` 的更多信息见 [网站托管开发指南 · package.json](leanengine_webhosting_guide-node.html#package_json)。

然后即可在代码中使用第三方包（`var async = require('async')`），如需在本地调试还需运行 `npm install` 来安装这些包。

**注意**：命令行工具部署时是不会上传 `node_modules` 目录，因为云引擎服务器会根据 `package.json` 的内容自动下载三方包。所以也建议将 `node_modules` 目录添加到 `.gitignore` 中，使其不加入版本控制。

## Maximum call stack size exceeded 如何解决？

如果你的应用时不时出现 `Maximum call stack size exceeded` 异常，可能是因为在 hook 中调用了 `AV.Object.extend`。有两种方法可以避免这种异常：

- 升级 leanengine 到 v1.2.2 或以上版本
- 在 hook 外定义 Class（即定义在 `AV.Cloud.define` 方法之外），确保不会对一个 Class 执行多次 `AV.Object.extend`

我们在 [JavaScript 指南 - AV.Object](./leanstorage_guide-js.html#AV_Object) 章节中也进行了描述。

{% if node != 'qcloud' %}
## 如何进行域名备案和域名绑定？

只有网站类的才需要备案，并且在主域名已备案的情况下，二级子域名不需要备案。如果主站需要托管在我们这边，且还没有备案过，请进入 **应用控制台 > 账号设置 >** [域名备案](/settings.html#/setting/domainrecord) 和 [域名绑定](/settings.html#/setting/domainbind)，按照步骤提示操作即可。
{% endif %}

## 调用云引擎方法如何收费？

云引擎中如果有 LeanCloud 的存储等 API 调用，按 [API 收费策略](faq.html#API_调用次数的计算) 收费。另外如果使用的是云引擎专业版，该服务也会产生使用费，具体请参考 [云引擎运行方案](leanengine_plan.html#价格)。

## 「定义函数」和「Git 部署」可以混用吗？

「定于函数」的产生是为了方便大家初次体验云引擎，或者只是需要一些简单 hook 方法的应用使用。我们的实现方式就是把定义的函数拼接起来，生成一个云引擎项目然后部署。

所以可以认为「定义函数」和 「Git 部署」最终是一样的，都是一个完整的项目。

是一个单独功能，可以不用使用基础包，git 等工具快速的生成和编辑云引擎。

当然，你也可以使用基础包，自己写代码并部署项目。

这两条路是分开的，任何一个部署，就会导致另一种方式失效掉。

## 如何从「在线编辑」迁移到项目部署？

1. 按照 [命令行工具使用指南](leanengine_cli.html) 安装命令行工具，使用 `lean init` 初始化项目，模板选择 `node-js-getting-started`（我们的 Node.js 示例项目）。
2. 在 [应用控制台 > 云引擎 > 部署 > 在线编辑](https://leancloud.cn/cloud.html?appid={{appid}}#/deploy/online) 中点击 **预览**，将全部函数的代码拷贝到新建项目中的 `cloud.js`（替换掉原有内容）。
3. 检查 `cloud.js` 的代码，将 `AV.User.current()` 改为 `request.currentUser` 以便从 Node SDK 的 0.x 版本升级到 1.x，有关这个升级的更多信息见 [升级到云引擎 Node.js SDK 1.0](leanengine-node-sdk-upgrade-1.html)。
4. 运行 `lean up`，在 <http://localhost:3001> 的调试界面中测试云函数和 Hook，然后运行 `lean deploy` 部署代码到云引擎（专业版用户还需要执行 `lean publish`）。
5. 部署后请留意云引擎控制台上是否有错误产生。

## 为什么查询 include 没有生效？

> 将 JavaScript SDK 和 Node SDK 升级到 3.0 以上版本可以彻底解决该问题。  

以 JavaScript 云引擎为例子，很多时候，经常会定义一个云函数，在里面使用 `AV.Query` 查询一张表，并 include 其中一个 pointer 类型的字段，然后返回给客户端:

``` javascript
AV.Cloud.define('querySomething', function(req, res) {
  var query = new AV.Query('Something');
  //假设 user 是 Something 表的一个 Pointer 列。
  query.include('user');
  //……其他条件或者逻辑……
  query.find().then(function(results) {
    //返回查询结果给客户端
    res.success(results);
  }).catch(function(err){
    //返回错误给客户端
  });
});
```

你会看到返回的结果里， user 仍然是 pointer 类型，似乎 include 没有生效？

``` json
{
 result: [
   {
     ……Something 其他字段
     "user": {
       "className": "_User",
       "__type": "Pointer",
       "objectId": "abcdefg"
     }
   }
   ……
 ]
}
```

这其实是因为 `res.success(results)` 会调用到 `AV.Object#toJSON` 方法，将结果序列化为 JSON 对象返回给客户端。

而 `AV.Object#toJSON` 方法为了防止循环引用，当遇到属性是 Pointer 类型会返回 pointer 元信息，不会将 include 的其他字段添加进去。

因此，你需要主动将该字段进行 JSON 序列化，例如：

``` javascript
 query.find().then(function(results) {
    //主动序列化 json 列。
    results.forEach(function(result){
      result.set('user', result.get('user') ?  result.get('user').toJSON() : null);
    });
    //再返回结果
    res.success(results);
  }).catch(function(err){
    //返回错误给客户端
  });
```

## Gitlab 部署常见问题

很多用户自己使用 [Gitlab](http://gitlab.org/)搭建了自己的源码仓库，有朋友会遇到无法部署到 LeanCloud 的问题，即使设置了 Deploy Key，却仍然要求输入密码。

可能的原因和解决办法如下：

* 确保你 gitlab 运行所在服务器的 /etc/shadow 文件里的 git（或者 gitlab）用户一行的 `!`修改为 `*`，原因参考 [Stackoverflow - SSH Key asks for password](http://stackoverflow.com/questions/15664561/ssh-key-asks-for-password)，并重启 SSH 服务：`sudo service ssh restart`。
* 在拷贝 deploy key 时，确保没有多余的换行符号。
* Gitlab 目前不支持有 comment 的 deploy key。早期 LeanCloud 用户生成的 deploy key 可能带 comment，这个 comment 是在 deploy key 的末尾 76 个字符长度的字符串，例如下面这个 deploy key：

```
ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEA5EZmrZZjbKb07yipeSkL+Hm+9mZAqyMfPu6BTAib+RVy57jAP/lZXuosyPwtLolTwdyCXjuaDw9zNwHdweHfqOX0TlTQQSDBwsHL+ead/p6zBjn7VBL0YytyYIQDXbLUM5d1f+wUYwB+Cav6nM9PPdBckT9Nc1slVQ9ITBAqKZhNegUYehVRqxa+CtH7XjN7w7/UZ3oYAvqx3t6si5TuZObWoH/poRYJJ+GxTZFBY+BXaREWmFLbGW4O1jGW9olIZJ5/l9GkTgl7BCUWJE7kLK5m7+DYnkBrOiqMsyj+ChAm+o3gJZWr++AFZj/pToS6Vdwg1SD0FFjUTHPaxkUlNw== App dxzag3zdjuxbbfufuy58x1mvjq93udpblx7qoq0g27z51cx3's cloud code deploy key
```
其中最后 76 个字符：

```
App dxzag3zdjuxbbfufuy58x1mvjq93udpblx7qoq0g27z51cx3's cloud code deploy key
```

就是 comment，删除这段字符串后的 deploy key（如果没有这个字样的comment无需删除）保存到 gitlab 即可正常使用：

```
ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEA5EZmrZZjbKb07yipeSkL+Hm+9mZAqyMfPu6BTAib+RVy57jAP/lZXuosyPwtLolTwdyCXjuaDw9zNwHdweHfqOX0TlTQQSDBwsHL+ead/p6zBjn7VBL0YytyYIQDXbLUM5d1f+wUYwB+Cav6nM9PPdBckT9Nc1slVQ9ITBAqKZhNegUYehVRqxa+CtH7XjN7w7/UZ3oYAvqx3t6si5TuZObWoH/poRYJJ+GxTZFBY+BXaREWmFLbGW4O1jGW9olIZJ5/l9GkTgl7BCUWJE7kLK5m7+DYnkBrOiqMsyj+ChAm+o3gJZWr++AFZj/pToS6Vdwg1SD0FFjUTHPaxkUlNw==
```

## Exceeded Limit

很多用户使用云引擎时会遇到 http 响应码为 `529` 的错误页面：

```
Exceeded Limit
当前 IP [118.186.7.27] 超过并发限制。
```

这是因为云引擎的网站托管服务对每个广域网 IP 有 60 个连接的限制，来防止恶意用户使用较低的成本对云引擎应用发起较大的攻击。

如果正常使用时遇到这个问题，一般是由以下场景所触发：

* 一个办公室很多人都访问同一个云引擎应用：因为整个办公室出口 IP 是一样的，所以相对比较容易达到限制。
* 自有服务器与云引擎通信：可能短时间产生大量请求，导致达到限制。
* 应用响应很慢：导致请求不能迅速释放，请求堆积导致达到限制。

解决办法：

* 对于前两种情况，建议使用 [自定义域名](leanengine_webhosting_guide-node.html#备案和自定义域名) 绑定到云引擎，这样限制会扩大到每个 IP 允许 300 个连接。
* 如果是最后一种情况，建议优化云引擎的业务降低响应时间，或者绑定 [自定义域名](leanengine_webhosting_guide-node.html#备案和自定义域名)。

{% extends "./sdk_setup.tmpl" %}
{% set platform_name = "PHP" %}

{% block libs_tool_automatic %}

#### composer

composer 是推荐的 PHP 包管理工具。安装 leancloud-sdk 只需执行以下命令：
```
composer require leancloud/leancloud-sdk
```

注意：

- leancloud-sdk 依赖 PHP 的 curl 扩展（常见 Linux 系统下一般需要安装 `php-curl` 这个包）


- 如果 composer 访问 packagist 仓库有问题，需要[设置镜像][packagist-mirror]或者通过代理访问。composer 尚不支持 socks 代理，如果使用 socks 代理，可配合 proxychains 使用：

        proxychains composer require leancloud/leancloud-sdk

    （有些人可能更习惯用 tsocks 而不是 proxychains，然而 [composer 搭配 tsocks 使用无效]。）

[composer 搭配 tsocks 使用无效]: https://github.com/composer/composer/issues/2900#issuecomment-269097050
[packagist-mirror]: https://pkg.phpcomposer.com/

{% endblock %}

{% block init_with_app_keys %}

然后导入 `Client`，并调用 `initialize` 方法进行初始化：

```php
use \LeanCloud\Client;
// 参数依次为 AppId, AppKey, MasterKey
Client::initialize("{{appid}}", "{{appkey}}", "{{masterkey}}");
Client::setServerUrl("https://{{host}}"); // 0.7.0 及以上版本支持
```
{% endblock %}

{% block sdk_switching_node %}
```php
use \LeanCloud\Client;
use \LeanCloud\Region;
// 参数依次为 AppId, AppKey, MasterKey
Client::initialize("{{appid}}", "{{appkey}}", "{{masterkey}}");
{% if node != 'qcloud' %}
// 启用美国节点
// Client::useRegion(Region::US);
// 启用中国节点（默认启用）
Client::useRegion(Region::CN);
{% else %}
// 启用中国节点（默认启用）目前仅支持 E1。
Client::useRegion(Region::CN_E1);
{% endif %}
```
{% endblock %}

{% block save_a_hello_world %}

```php
// test.php

// 通过 composer 安装
require_once 'vendor/autoload.php';
// 手动安装
// require_once("vendor/leancloud/src/autoload.php");

use \LeanCloud\Client;
use \LeanCloud\LeanObject;
// 参数依次为 AppId, AppKey, MasterKey
Client::initialize("{{appid}}", "{{appkey}}", "{{masterkey}}");
Client::setServerUrl("https://{{host}}");

$testObject = new LeanObject("TestObject");
$testObject->set("words", "Hello World!");
try {
    $testObject->save();
    echo "Save object success!";
} catch (Exception $ex) {
    echo "Save object fail!";
}
```

保存后运行 `php test.php`。
{% endblock %}

{% extends "./sdk_setup.tmpl" %}

{% block language %}PHP{% endblock %}

{% block libs_tool_automatic %}

#### composer

composer 是推荐的 PHP 包管理工具。安装 leancloud-sdk 只需执行以下命令：
```
composer require leancloud/leancloud-sdk
```

{% endblock %}

{% block init_with_app_keys %}

然后导入 `LeanClient`，并调用 `initialize` 方法进行初始化：

```php
use \LeanCloud\LeanClient;
// 参数依次为 AppId, AppKey, MasterKey
LeanClient::initialize("{{appid}}", "{{appkey}}", "{{masterkey}}");
```
{% endblock %}

{% block sdk_switching_node %}
```php
use \LeanCloud\LeanClient;
// 参数依次为 AppId, AppKey, MasterKey
LeanClient::initialize("{{appid}}", "{{appkey}}", "{{masterkey}}");
// 启用美国节点
// LeanClient::useRegion("US");
// 启用国内节点 (默认启用)
LeanClient::useRegion("CN");
```
{% endblock %}

{% block save_a_hello_world %}

```php
// test.php

require 'vendor/autoload.php';

use \LeanCloud\LeanClient;
use \LeanCloud\LeanObject;
// 参数依次为 AppId, AppKey, MasterKey
LeanClient::initialize("{{appid}}", "{{appkey}}", "{{masterkey}}");

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

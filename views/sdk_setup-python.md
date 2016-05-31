{% extends "./sdk_setup.tmpl" %}

{% block language %}Python{% endblock %}

{% block libs_tool_automatic %}

#### pip

pip 是 最推荐的 Python 包管理工具，它是 easy_install 的替代。安装 leancloud-sdk 只需执行以下命令：
```
pip install leancloud-sdk
```
根据你的环境，命令之前还可能需要加上`sudo`

#### easy_install

也可以使用 easy_install 进行安装：
```
easy_install leancloud-sdk
```
根据你的环境，命令之前还可能需要加上`sudo`
{% endblock %}

{% block init_with_app_keys %}

然后导入 leancloud，并调用 init 方法进行初始化：

```python
import leancloud

leancloud.init("appId", "appKey")
#或者使用 masterKey
#leancloud.init("appId", master_key="masterKey")
```
将上述代码中的 App ID 以及 App Key 替换成从控制台复制粘贴的对应的数据即可。
{% endblock %}

{% block sdk_switching_node %}
```python
import leancloud

leancloud.init("appId", "appKey")
leancloud.use_region('US') #启用美国节点
#leancloud.use_region('CN') 启用国内节点，是默认行为
```
{% endblock %}

{% block save_a_hello_world %}
在文本编辑器中编写如下代码：

```python
import leancloud
from leancloud import Object

leancloud.init("appId", "masterKey")

TestObject = Object.extend('TestObject')
testObject = TestObject()
testObject.set('words',"Hello World!")
testObject.save()
```

然后编译执行。
{% endblock %}

{% block permission_access_network_config %}{% endblock %}

{% block platform_specific_faq %}{% endblock %}

{% block android_mutildex_issue %}
### 运行中遇到 `NoClassDefFoundError` 异常
一般来说遇到这个问题只有两种可能：
第一种是 Android SDK 的间接依赖并没有能全部下载导致的，可以通过在 gradle 配置中显式指定 `transitive=true` 来解决这个问题:


```

dependencies {
    compile 'com.android.support:multidex:'
    compile 'com.android.support:support-v4:21.0.3'
    compile 'cn.leancloud.android:avoscloud-sdk:v3.+'
    compile('cn.leancloud.android:avoscloud-push:v3.+@aar') { transitive = true }
}


```

第二种情况则是由在 v3.13.+ 以后 Android SDK 引入了 Google ProtoBuf 来提高实时通信模块的传输效率，随之而来的是类和方法数量的激增,超过了 Android 上存在着方法总数不能超过 65k 的上限而导致的。这个时候我们可以采用 Google 提出的[解决方案](http://developer.android.com/intl/zh-cn/tools/building/multidex.html#about)来解决这个问题。

{% endblock%}

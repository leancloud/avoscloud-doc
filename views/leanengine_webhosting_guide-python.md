{# 指定继承模板 #}
{% extends "./leanengine_webhosting_guide.tmpl" %}

{% set productName = '云引擎' %}
{% set platformName = 'Python' %}
{% set fullName = productName + ' ' + platformName %}
{% set sdk_name = 'Python' %}
{% set leanengine_middleware = '[LeanCloud Python SDK](https://github.com/leancloud/python-sdk)' %}

{% block project_constraint %}
你的项目需要遵循一定格式才会被云引擎识别并运行。

{{fullName}} 项目根目录下必须有 `wsgi.py` 与 `requirements.txt` 文件，可选文件 `runtime.txt`。
{% endblock %}

{% block project_start %}
Python 云引擎使用 WSGI 规范来运行项目。

云引擎运行时会首先加载 `wsgi.py` 这个模块，并将此模块的全局变量 `application` 做为 WSGI 函数进行调用。因此请保证 `wsgi.py` 文件中包含一个 `application` 的全局变量／函数／类，并且符合 WSGI 规范。

更多关于 **WSGI 函数** 的内容，请参考 [WSGI 接口](http://www.liaoxuefeng.com/wiki/0014316089557264a6b348958f449949df42a6d3a2e542c000/001432012393132788f71e0edad4676a3f76ac7776f3a16000) 或者 [PEP333](https://www.python.org/dev/peps/pep-0333/)。

{% endblock %}

{% block custom_runtime %}
### 添加第三方依赖模块

`requirements.txt` 中填写项目依赖的第三方模块，每行一个，如：

```
# 井号至行尾为注释
leancloud-sdk
Flask>=0.10.1  # 可以指定版本号／范围
git+https://github.com/foo/bar.git@master#egg=bar  # 可以使用 Git/SVN 等版本管理工具的远程地址
```

详细格式请参考 [pip 文档 &middot Requirements Files](https://pip.pypa.io/en/stable/user_guide/#requirements-files)。

应用部署到云引擎之后，会自动按照 `requirements.txt` 中的内容进行依赖安装。在本地运行和调试项目的时候，可以在项目目录下使用如下命令安装依赖：

```sh
pip install -r requirements.txt
```

另外当你部署应用的时候，建议将依赖的包的版本都按照 `foo==1.0.0` 这种格式来明确指定版本号（或版本的范围），防止因为依赖的模块升级且不再兼容老的 API 时，当再次部署时会导致应用运行失败。

### 指定 Python 版本

你可以选择运行代码的 Python 版本，目前支持 3.5 和 2.7 两个版本。

指定方法为在 `runtime.txt` 中填写 `python-3.5` 或者 `python-2.7` 即可。
{% endblock %}


{% block supported_frameworks %}
如前所述，只要兼容 Python WSGI 规范的框架都可以在云引擎运行。目前比较流行的 Python Web 框架对此都有支持，比如 [Flask](http://flask.pocoo.org)、[Django](https://www.djangoproject.com)、[Tornado](http://www.tornadoweb.org)。

我们提供了 Flask 和 Django 两个框架的示例项目作为参考，你也可以直接把它们当作一个应用项目的初始化模版：

- [Flask](https://github.com/leancloud/python-getting-started)
- [Django](https://github.com/leancloud/django-getting-started)
{% endblock %}


{% block use_leanstorage %}
在云引擎中你可以使用 LeanCloud 提供的 [数据存储](storage_overview.html) 作为应用的后端数据库，以及使用其他 LeanCloud 提供的功能。 LeanCloud Python SDK 可以让你更加方便地使用这些功能。

### 安装

将 `leancloud-sdk` 添加到 `requirements.txt` 中，部署到线上即可自动安装此依赖。在本地运行和调试项目的时候，可以在项目目录下使用如下命令进行依赖安装：

```sh
pip install -r requirements.txt
```

### 初始化

因为 `wsgi.py` 是项目最先被执行的文件，推荐在此文件进行 LeanCloud Python SDK 的初始化工作：

```python
import os

import leancloud

APP_ID = os.environ['LEANCLOUD_APP_ID']
APP_KEY = os.environ['LEANCLOUD_APP_KEY']
MASTER_KEY = os.environ['LEANCLOUD_APP_MASTER_KEY']

leancloud.init(APP_ID, app_key=APP_KEY, master_key=MASTER_KEY)
# 如果需要使用 master key 权限访问 LeanCLoud 服务，请将这里设置为 True
leancloud.use_master_key(False)
```

接下来就可以在项目的其他部分中使用 LeanCloud Python SDK 提供的功能了。更多用法请参考 [LeanCloud Python SDK 数据存储开发指南](leanstorage_guide-python.html)。

## 本地运行和调试

在本地运行 LeanEngine Python 应用，首先需要这几个依赖：

- **Python**：目前云引擎线上支持 2.7 / 3.5 两个 Python 版本，最好确保本地安装的 Python 版本与线上使用的相同。
- **pip**：用来安装第三方依赖。
- **virtualenv**：可选，建议使用 virtualenv 或者类似的工具来创建一个独立的 Python 环境，以免项目使用到的依赖与系统／其他项目的版本产生冲突。

请确保以上依赖都已经在本机上安装就绪，然后在项目目录下执行如下命令，来安装项目用到的第三方依赖：

```sh
pip install -r requirements.txt
```

接下来便可以在项目目录，用我们的命令行工具来启动本地调试了：

```sh
lean up
```

更多有关命令行工具和本地调试的内容请参考 [云引擎命令行工具使用详解](leanengine_cli.html)。
{% endblock %}

{% block get_env %}
```python
import os

env = os.environ.get('LEANCLOUD_APP_ENV')
if env == 'development':
  # 当前环境为「开发环境」，是由命令行工具启动的
  do_some_thing()
elif env == 'production':
  # 当前环境为「生产环境」，是线上正式运行的环境
  do_some_thing()
elif env == 'staging':
  # 当前环境为「预备环境」
  do_some_thing()
```
{% endblock %}

{% block cookie_session %}
Python 暂时不支持。
{% endblock %}


{% block http_client %}
你可以使用任意 Python 的模块来发送 HTTP 请求，比如内置的 urllib。不过我们推荐 [requests](http://www.python-requests.org/) 这个第三方模块。

在 `requirements.txt` 中新增一行 `requests>=2.11.0`，然后在此目录重新执行 `pip install -r requirements.txt` 就可以安装这个模块。

```python
import requests

response = requests.post('http://www.example.com/create_post', json={
    'title': 'Vote for Pedro',
    'body': 'If you vote for Pedro, your wildest dreams will come true',
})

print(response.json())
```

{% endblock %}

{% block code_get_client_ip_address %}
Flask:

```python
from flask import Flask
from flask import request

app = Flask(__name__)

@app.route('/')
def index():
    print(request.headers['x-real-ip'])
    return 'ok'
```

Django:

根据 [Django 的官方文档](https://docs.djangoproject.com/el/1.10/ref/request-response/#django.http.HttpRequest.META)，第三方定义的 HTTP Header 会加上 `HTTP_` 的前缀，并且 `-` 会被替换成 `_`，所以要通过 `HTTP_X_REAL_IP` 来访问。

```python
def index(request):
    print(request.META['HTTP_X_REAL_IP'])
    return render(request, 'index.html', {})
```

其他框架请参考对应文档。
{% endblock %}

{% block https_redirect %}
```python
import leancloud

application = get_your_wsgi_func()

# 使用 `leancloud.HttpsRedirectMiddleware` 这个 WSGI 中间件包装一下原始的提供给 LeanEngine 的 WSGI 函数
application = leancloud.HttpsRedirectMiddleware(application)
```
{% endblock %}

{% block loggerExample %}

**Python 2**

```python
import sys

print 'hello!'  # info
print >> sys.stderr, 'some error'  # error
```

**Python 3**

```python
import sys

print('hello!')  # info
print('some err', file=sys.stderr)  # error
```
{% endblock %}

{% block code_calling_custom_variables %}
```python
# 在云引擎 Python 环境中使用自定义的环境变量
import os

MY_CUSTOM_VARIABLE = os.environ.get('MY_CUSTOM_VARIABLE')
print(MY_CUSTOM_VARIABLE)
```
{% endblock %}

{% block code_upload_file_sdk_function %}
Flask:

```python
# app is your Flask instance

@app.route('/upload', methods=['POST'])
def upload():
    upload_file = request.files['iconImage']
    f = leancloud.File(upload_file.filename, data=upload_file.stream)
    print(f.url)
    return 'upload file ok!'
```

其他 Web 框架，请参考对应文档。

{% endblock %}

{% block leancache %}
首先添加相关依赖到云引擎应用的 `requirements.txt` 中：

``` python
Flask>=0.10.1
leancloud-sdk>=1.0.9
...
redis
```

然后可以使用下列代码获取 Redis 连接：

``` python
import os
import redis

r = redis.from_url(os.environ.get("REDIS_URL_<实例名称>"))
```
{% endblock %}

{% block custom_session %}
推荐使用 Web 框架自带的 session 组件。
{% endblock %}

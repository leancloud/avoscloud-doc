# LeanCloud Documentation
[![Build Status](https://travis-ci.org/leancloud/docs.svg)](https://travis-ci.org/leancloud/docs)
[![devDependency Status](https://david-dm.org/leancloud/docs/dev-status.svg)](https://david-dm.org/leancloud/docs#info=devDependencies)
[![Issue Stats](http://issuestats.com/github/leancloud/docs/badge/pr?style=flat)](http://issuestats.com/github/leancloud/docs)
[![Issue Stats](http://issuestats.com/github/leancloud/docs/badge/issue?style=flat)](http://issuestats.com/github/leancloud/docs)

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/leancloud/docs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

LeanCloud 开发者文档

## 说明

这个项目是 LeanCloud [文档](http://leancloud.cn/docs/)上的所有文档的 Markdown 格式的源码，最终将渲染成你在网站上看到的 [HTML 文档](http://leancloud.cn/docs/)。

因此 Markdown 文件里部分链接写的是最终渲染后的链接，如果直接点击会发现 404 错误。

## 贡献

我们欢迎所有用户为我们贡献或者修正错误，LeanCloud 衷心感谢您的贡献。

可以按照以下步骤贡献：

- `fork` 这个项目
- `npm install` 安装相关依赖
- 执行 `grunt server` 可以本地预览
- 修改 `/views` 目录中的文档
  - `/views` 中是模板文件，会被编译为 `/md` 目录中对应的文档文件
  - 如果 `/views` 中没有相应文档，可以直接修改 `/md` 目录中对应的文档（历史遗留问题）
  - 相关图片放在 `/images` 目录中
  - 模板是支持嵌套的，如 views 中 a.md 是可以被嵌套在 a.tmpl 中的，具体阅读下面关于模板的文档
- 提交修改并发起 `Pull Request`

项目的目录结构说明如下：

```
├── README.md                          // 说明文档
├── archive                            // 已下线存档的文档，请勿更新
├── custom                             // 文档页面样式及 JavaScript 代码
├── images                             // 文档中引用的所有图片
├── md                                 // Markdown 格式的全部文档（部分是通过 views 目录中的模板编译生成）
├── dist                               // 编译之后生成的文件将会在此目录下
├── private                            // 未完成、未发布的文档临时保存在这里，以便让重建全站文档索引的系统任务忽略这些文件
├── react                              // 文档评论功能所需要用的 React 组件
├── server_public                      // 文档评论功能所需要用的 React 组件
├── templates                          // 文档网站的页面模板
├── views                              // Markdown 格式文档的模板文件，使用时会被编译到 md 目录中
├── app.coffee
├── app.json
├── CHANGELOG.md                       // changelog 记录
├── circle.yml
├── CONTRIBUTING.md                    // 贡献指南
├── package.json
└── ...
```

## 预览

开发服务基于 Grunt，所以需要有 Nodejs 环境，通过 NPM 安装测试需要的依赖

安装 Grunt

```bash
$ sudo npm install -g grunt-cli
```

安装需要的依赖

```bash
$ npm install
```

本地启动一个 HTTP Server，然后打开浏览器访问 <http://localhost:3000> 即可

```bash
$ grunt server
```

## 版本更新

- 请通过 `grunt release` 命令自动 bump `package.json`、自动打标签，请不要手动更新
- 请按照 `CONVENTIONS.md` 的格式书写有意义的 commits，`CHANGELOG.md` 会被自动生成，请不要手动修改

## 一套模板多份渲染

有些文档的相似度非常高，所以可以使用一份模板，多分变量渲染的方式一次性生成多份文档，比如 「LeanEngine 指南」的文档就是这样生成的。这份文档分为三个运行时：Node.js、Python、云引擎 2.0。最终效果可见 [LeanEngine (Node.js 环境)](https://leancloud.cn/docs/leanengine_guide-node.html) 和 [LeanEngine（Python 环境）](https://leancloud.cn/docs/leanengine_guide-python.html)。这类文档编写方式如下：

* 在 `views` 目录先编写一份「模板」（以 `tmpl` 作为扩展名），将文档的主体部分完成，将文档之间不一样的部分（比如不同语言的代码片段）使用：

  ```
  {% block <blockName> %}{% endblock %}
  ```

  括起来。可以参考 [leanengine_guide.tmpl](https://github.com/leancloud/docs/blob/master/views/leanengine_guide.tmpl)。
* 在 `views` 目录里编写多份渲染变量（以 `md` 作为文件扩展名）。第一行表明自己继承哪个模板：

  ```
  {% extends "./<your-tmpl-file>" %}
  ```

  后续的内容就是用：

  ```
  {% block <blockName> %}<不同文档之间的差异>{% endblock%}
  ```

  来替换模板中存在的 block。可以参考 [leanengine_guide-node.tmpl](https://github.com/leancloud/docs/blob/master/views/leanengine_guide-node.md)
* 生成文档：使用下列命令会在 md 文件夹中生成最终的 md 文件：

  ```
  grunt nunjucks
  ```

  同样支持 `grunt server` 命令，该命令最终会执行 `watch` 插件，此时修改模板文件，或者变量文件都会自动重新生成最终的 md 文件（可能需要等待 2~4 秒）。
* 记得将这种方式生成的 md 文件添加到 [.gitignore](https://github.com/leancloud/docs/blob/master/.gitignore) 文件中，确保这类文件不会被提交。

**注意：如果在模板中需要渲染 `{{appid}}` 这样的 AngularJS 变量，则必须在模板文件的最上方先定义好一个新变量，如 `appid`，其值为 `'{{appid}}'`，例如：**

```
{% set appid = '{{appid}}' %}
{% set appkey = '{{appkey}}' %}
{% set masterkey = '{{masterkey}}' %}
```

这样，在生成的 html 文档中，`{{appid}}` 才可以被正确渲染，否则，它会被替换为空值，原因是 nunjucks 在上下文中找不到该变量的定义。

其他常用的 [nunjucks 模板方法](https://mozilla.github.io/nunjucks/templating.html) 还有：

```
{# 这是注释，用 <!-- --> 无效 #}

{% if numUsers < 5 %}...{% endif %}
{% if i != "String" %}...{% endif %}
{% if users and showUsers %}...{% endif %}
{% if i == 0 and not hideFirst %}...{% endif %}
{% if (x < 5 or y < 5) and foo %}...{% endif %}

// 复用文档片断
{% macro ... %}
{% include ... %}
```

### 辅助工具

「一套模板多分渲染」的不同渲染文件编写起来比较困难，需要先从主模板上找到变量在对应到渲染文件，所以开发了一个简单的工具来简化这一步骤。使用方式如下：

* 安装需要的依赖，该步骤只需要执行一次：

  ```
  npm install
  ```

* 启动辅助工具的本地 webServer，使用以下命令：

  ```
  $ node server
  ```
* 使用浏览器打开 http://localhost:3001，将会看到一个「选择模板」的下拉列表框，该列表框里会显示 `views/<tmplName>.tmpl` 的所有模板文件，文件名的 `tmplName` 部分是下拉列表框选项的名称。选择你需要编写的模板（比如 `leanengine_guide`）。
* 你会看到模板文件被读取，其中所有 `{% block <blockName> %}<content>{% endblock %}` 部分的下面都会有一些按钮。这些按钮表示该「模板」拥有的不同「渲染」，也就是对应的 `views/<tmplName>-<impl>.md` 文件，文件名的 `impl` 部分是按钮的名称。
* 点击对应的按钮，即可看到「渲染」文件中对应 `block` 的内容已经读取到一个文本域中，如果为空，表明该「渲染」文件未渲染该 block，或者内容为空。
* 在文本域中写入需要的内容，然后点击保存，编写的内容就会保存到对应的「渲染」文件的 block 中。
* 最后建议打开「渲染」文件确认下内容，没问题即可通过 `grunt server` 查看效果。当然整个过程打开 `grunt server` 也是没问题的，它会发现「渲染」文件变动后重新加载。

有问题请与 <wchen@leancloud.rocks> 联系。

## 注意事项

* 所有 `.md` 格式文档需要更新到 `/md` 目录下
* 更新文档只需要修改或创建相应的 `.md` 文件，然后提交 Pull Request 即可
* 由于文档会采用 AngularJS 渲染，当文档中需要显示 `{{content}}` 这种格式时，外面需要加上 `<span ng-non-bindable></span>`，以不被 AngularJS 渲染
* 图片资源放在当前 repo 的 `/images` 文件夹下，引用方式类似
  ```
![image](images/cloud_code_menu.png)
  ```
* 当增加一个全新的文档，需要更新文档首页 `templates/pages/index.html`，顶部菜单 `templates/include/header.html`


## LeanCloud 内部员工发布新文档

* 自己修改的文档，自己负责检查和发布
* 通过 Jenkins 执行 `cn-avoscloud-docs-prod-ucloud` 任务发布即可

## 协议

[LGPL-3.0](https://www.gnu.org/licenses/lgpl.html)

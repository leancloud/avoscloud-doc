# 云引擎命令行工具使用详解

## 介绍

云引擎命令行工具是用来管理、部署云引擎项目的命令行工具。通过它你可以部署、发布、回滚云引擎代码，并且可以对同一个云引擎项目做多应用管理，还可以查看云引擎日志，批量上传文件到 LeanCloud 平台上等。

## 安装命令行工具

### macOS

可以使用 [Homebrew](http://brew.sh/) 进行安装：

```sh
brew update
brew install lean-cli
```

如果之前使用 `npm` 安装过旧版本的命令行工具，为了避免与新版本产生冲突，建议先使用 `npm` 卸载旧版本命令行工具；或者直接按照 `homebrew` 的提示，执行 `brew link --overwrite lean-cli` 覆盖掉之前的 `lean` 命令来解决。

### Windows

Windows 用户可以在 [lean-cli release 页面](https://github.com/leancloud/lean-cli/releases) 根据自己操作系统版本（32位／64位）下载最新的 `msi` 安装包来进行安装，安装成功之后打开 `命令提示符` 或者 `PowerShell` 直接输入 `lean` 命令就可以使用了。

另外还提供预编译好的绿色版下载，可以在 [lean-cli release 页面](https://github.com/leancloud/lean-cli/releases)根据操作系统下载对应版本，然后在 Windows 命令提示符（或者 PowerShell）下输入此文件的完整路径，就可以正常使用了。比如下载之后保存的文件位置是 `C:\Users\Downloads\`，文件名是`lean-windows-amd64.exe`，输入 `C:\Users\Downloads\lean-windows-amd64.exe` 即可使用。

对于使用绿色版的用户，我们强烈建议将此文件改名为 `lean.exe`，并且将所在文件夹加入到系统 `PATH` 环境变量中去，这样就可以直接在任意目录下输入 `lean` 就可以使用命令行工具了。设置 Windows PATH 环境变量的方法，请参考[此文档](https://www.java.com/zh_CN/download/help/path.xml) 。另外还可以将此文件放到已经是系统 `PATH` 环境变量的目录中去，比如 `C:\Windows\System32` 中。

如果之前使用 `npm` 安装过旧版本的命令行工具，为了避免与新版本产生冲突，建议使用 `npm uninstall -g leancloud-cli` 卸载旧版本命令行工具。

### Linux

可以使用预编译好的二进制文件，在 [lean-cli release](https://github.com/leancloud/lean-cli/releases) 页面根据操作系统下载对应版本，放在 `PATH` 环境变量所在目录中即可。

### 通过源码安装

请参考项目源码 [README](https://github.com/leancloud/lean-cli)

## 使用

安装成功之后，直接在 terminal（终端）运行 `lean -h`，输出帮助信息：

```sh
$ lean help

 _                        ______ _                 _
| |                      / _____) |               | |
| |      ____ ____ ____ | /     | | ___  _   _  _ | |
| |     / _  ) _  |  _ \| |     | |/ _ \| | | |/ || |
| |____( (/ ( ( | | | | | \_____| | |_| | |_| ( (_| |
|_______)____)_||_|_| |_|\______)_|\___/ \____|\____|
NAME:
   lean - Command line to manage and deploy LeanCloud apps

USAGE:
   lean [global options] command [command options] [arguments...]
   
VERSION:
   0.3.0
   
COMMANDS:
     login     登录 LeanCloud 账户
     info      查看当前登录用户以及应用信息
     up        本地启动云引擎应用
     init      初始化云引擎项目
     checkout  切换当前项目关联的 LeanCloud 应用
     deploy    部署云引擎项目到服务器
     publish   部署当前预备环境的代码至生产环境
     upload    上传文件到当前应用 File 表
     logs      查看 LeanEngine 产生的日志
     env       输出运行当前云引擎应用所需要的环境变量
     cache     LeanCache 管理相关功能
     cql       进入 CQL 交互查询
     help, h   显示全部命令或者某个子命令的帮助

GLOBAL OPTIONS:
   --version, -v  print the version
```

可以通过 `--version` 选项查看版本：


```sh
$ lean --version
lean version 0.3.0
```

后面凡是以 `$ lean` 开头的即表示在终端里执行这个命令。

## 登录

安装完命令行工具之后，首先第一步需要登录 LeanCloud 账户。

```sh
$ lean login
```

之后按照提示输入 LeanCloud 用户名／密码就可以登录了。

对于美国节点用户，需要增加参数 `--region=US` 来进行登录，腾讯云 TAB 的用户需要增加 `--region=TAB` 来进行登录。

## 初始化项目

登录完成之后，可以使用 `init` 命令来初始化一个项目，并且关联到已有 LeanCloud 应用上。

```sh
$ lean init
[?] 请选择应用节点
 1) 国内
 2) 美国
 3) TAB
 =>
```

首先需要选择项目节点。选择完成之后会展示出此节点当前用户的所有应用：

```sh
[?] 请选择 APP
 1) AwesomeApp
 2) Foobar
```

接下来选择项目语言／框架：

```sh
[?] 请选择需要创建的应用模版：
 1) node-js-getting-started
 2) python-getting-started
 3) slim-getting-started
 4) java-war-getting-started
 5) django-getting-started
 6) static-getting-started
```

选择完毕之后，命令行工具会下载此项目模版到本地，初始化就完成了：

```sh
 ✓ 下载模版文件 5.93 KB / 5.93 KB [=======================================] 100.00% 0s
 ✓ 正在创建项目...
```

进入应用名命名的目录就可以看到新建立的项目。

## 关联已有项目

如果已经使用其他方法创建好项目，可以直接在项目目录执行

```sh
$ lean checkout
```

将已有项目关联到 LeanCloud 应用上。

## 本地运行

如果想简单的部署一份代码到服务器，而不在本地运行和调试的话，可以暂时跳过此章节。

进入项目目录：

```sh
$ cd AwesomeApp
```

之后需要安装此项目相关依赖，需要根据项目语言来查看不同文档：

- [Python](leanengine_webhosting_guide-python.html#本地运行和调试)
- [Node.js](leanengine_webhosting_guide-node.html#本地运行和调试)
- [PHP](leanengine_webhosting_guide-php.html#本地运行和调试)
- [Java](leanengine_webhosting_guide-java.html#命令行工具)

启动应用：

```sh
$ lean up
```

* 通过浏览器打开 <http://localhost:3000>，进入 web 应用的首页。
* 通过浏览器打开 <http://localhost:3001>，进入云引擎云函数和 Hook 函数调试界面。

**提示**：如果想变更启动端口号，可以使用 `lean up --port 新端口号` 命令来指定。

**提示**：命令行工具所有自命令都可以通过 `-h` 参数来查看详细的参数说明信息，比如 `lean up -h`。

更多关于云引擎开发，请参考 [云引擎服务总览](leanengine_overview.html) 。

## 部署

### 从本地代码部署

在你开发和本地测试云引擎项目通过后，你可以直接将本地源码推送到 LeanCloud 云引擎平台运行，只要执行 `deploy` 命令：

```sh
$ lean deploy
```

对于使用了免费版云引擎的应用，这个命令会将本地源码部署到线上的生产环境，无条件覆盖之前的代码（无论是从本地仓库部署、Git 部署还是在线定义）；如果是有预备环境的专业版应用，这个命令会先部署到预备环境，后续需要再用 `lean publish` 部署到生产环境。

在部署的过程中会实时地打印进度：

```sh
 ✓ 获取应用信息
 ✓ 准备部署至目标应用：AwesomeApp (xxxxxx)
 ✓ 获取应用分组信息
 ✓ 准备部署应用到生产环境: web
 ✓ 检测到 Python 运行时
 ✓ 压缩项目文件
 ✓ 上传应用文件 6.41 KB / 6.41 KB [=======================================] 100.00% 0s
 ✓ 开始构建 20161021-171836
 ✓ 正在下载应用代码 ...
 ✓ 正在解压缩应用代码 ...
 ✓ 运行环境: python (leanengine/python-base-2.7)
 ✓ 从之前的构建中恢复依赖项 ...
 ✓ 正在下载和安装依赖项 ...
 ✓ 缓存最新的依赖项 ...
 ✓ 存储镜像到仓库 ...
 ✓ 镜像构建完成：20161021-171836
 ✓ 开始部署 20161021-171836 到 web1
 ✓ 正在创建新实例 ...
 ✓ 正在启动新实例 ...
 ✓ 实例启动成功：{"version": "1.6.5", "runtime": "cpython-2.7.6"}
 ✓ 正在统一切换新旧实例 ...
 ✓ 正在更新云函数信息 ...
 ✓ 部署完成：1 个实例部署成功
 ✓ 删除临时文件
```

默认部署备注（将会显示在 LeanCloud 的网站控制台上）是简单的一句 `从命令行工具构建`，你可以通过 `-m` 选项来自定义部署备注：

```sh
$ lean deploy -m 'Be more awesome'
```

部署之后，你可以通过 curl 命令，或者访问你设置的 `${your_app_domain}.leanapp.cn` 的二级域名对应的专用测试域名 `stg-${your_app_domain}.leanapp.cn` 测试你的云引擎代码。

### 从 Git 仓库部署

如果你的代码是保存在某个 Git 仓库，例如 [Github](https://github.com) 上，并且在 LeanCloud 控制台正确设置了 git repo 地址以及 deploy key，你也可以请求 LeanCloud 平台从 Git 仓库获取源码并自动部署，这个操作可以在云引擎的部署菜单里完成，也可以在本地执行 `deploy` 命令和 `-g` 参数配合完成：

```sh
$ lean deploy -g
```

* `-g` 选项指定要求从 Git 仓库部署，Git 仓库地址必须已经在云引擎菜单里保存。

默认部署都将是 master 分支的最新代码，你可以通过 `-r <revision>` 来指定部署特定的 commit 或者 branch。

## 发布到生产环境

注意：体验版用户没有预备环境，因此不需要发布这个步骤。

预备环境如果测试没有问题，你希望将预备环境的云引擎代码切换到生产环境，你可以使用开发者平台的云引擎部署菜单做发布，也可以直接运行 `publish` 命令：

```sh
$ lean publish
```

就会将预备环境的云引擎代码发布到生产环境：

```sh
 ✓ 获取应用信息
 ✓ 准备部署至目标应用：AwesomeApp (xxxxxx)
 ✓ 开始部署 20161021-173118 到 web1,web2
 ✓ 正在创建新实例 ...
 ✓ 正在创建新实例 ...
 ✓ 正在启动新实例 ...
 ✓ 实例启动成功：{"version": "1.6.5", "runtime": "cpython-3.5.1"}
 ✓ 正在启动新实例 ...
 ✓ 实例启动成功：{"version": "1.6.5", "runtime": "cpython-3.5.1"}
 ✓ 正在统一切换新旧实例 ...
 ✓ 正在更新云函数信息 ...
 ✓ 部署完成：2 个实例部署成功
```

## 查看日志

使用 `logs` 命令可以查询云引擎最新日志：

```sh
$ lean logs
2016-05-16 16:03:53 [PROD] [INFO]
2016-05-16 16:03:53 [PROD] [INFO] > playground@1.0.0 start /home/leanengine/app
2016-05-16 16:03:53 [PROD] [INFO] > node server.js
2016-05-16 16:03:53 [PROD] [INFO]
2016-05-16 16:03:54 [PROD] [INFO] Node app is running, port: 3000
2016-05-16 16:03:54 [PROD] [INFO] connected to redis server
2016-05-16 16:03:54 [PROD] [INFO] 实例启动成功：{"runtime":"nodejs-v4.4.3","version":"0.4.0"}
2016-05-16 16:03:54 [PROD] [INFO] 正在统一切换新旧实例 ...
2016-05-16 16:03:55 [PROD] [INFO] 正在更新云函数信息 ...
2016-05-16 16:03:55 [PROD] [INFO] 部署完成：2 个实例部署成功
```

默认返回最新的 30 条，最新的在最下面。

可以通过 `-l` 选项设定返回的日志数目，例如返回最近的 100 条

```sh
$ lean logs -l 100
```

也可以加上 `-f` 选项来自动滚动更新日志，类似 `tail -f` 命令的效果：

```sh
$ lean logs -f
```

当有新的云引擎日志产生，都会自动填充到屏幕下方。

## 多应用管理

一个项目的代码可以同时部署到多个 LeanCloud 应用上。

### 查看当前应用状态

使用 `lean info` 可以查看当前项目关联的应用：

```sh
$ lean info
当前登录用户: asaka (lan@leancloud.rocks)
当前目录关联应用：AwesomeApp (xxxxxx)
```

此时，执行 `deploy`、`publish`、`logs` 等命令都将是针对当前激活的应用。

### 切换应用

如果你想将当前项目切换到其他 LeanCloud 应用，你可以通过 `checkout` 命令来添加一个应用：

```sh
$ lean checkout
```

之后会运行向导供选择想要切换的目标应用。

另外还可以直接执行 `$ lean checkout another_app_id` 来快速切换关联应用。


## 上传文件

如果你有一些文件希望上传到 LeanCloud 平台上，可以通过 `upload` 命令，既可以上传单个文件，也可以批量上传一个目录下（包括子目录）下的所有文件。

```sh
$ lean upload public/index.html
Uploads /Users/dennis/programming/avos/new_app/public/index.html successfully at: http://ac-7104en0u.qiniudn.com/f9e13e69-10a2-1742-5e5a-8e71de75b9fc.html
```

上传成功后会显示文件在 LeanCloud 平台上的 URL。

上传 images 目录下的所有文件：

```sh
$ lean upload images/
```

## CQL 交互查询

可以直接使用 `cql` 命令来查询存储服务数据：

```sh
$ lean cql
```

使用 [CQL](./cql_guide.html) 语言做查询，结果如下：

```
$ lean cql
CQL > select objectId, mime_type, createdAt, updatedAt from _File where mime_type != null limit 10;
objectId                   mime_type                                   createdAt                  updatedAt
5583bc44e4b0ef6154cb1b9e   application/zip, application/octet-stream   2015-06-19T06:52:52.106Z   2015-06-19T06:52:52.106Z
559a63bee4b0c4d3e72432f6   application/zip, application/octet-stream   2015-07-06T11:17:18.885Z   2015-07-06T11:17:18.885Z
55cc4d3b60b28da5fc3af7c5   image/jpeg                                  2015-08-13T07:54:35.119Z   2015-08-13T07:54:35.119Z
55cc4d7660b2d1408c770cde   image/jpeg                                  2015-08-13T07:55:34.496Z   2015-08-13T07:55:34.496Z
55cc4df460b2c0a2834d63e2   image/jpeg                                  2015-08-13T07:57:40.013Z   2015-08-13T07:57:40.013Z
55cc4eb660b2597462bc093e   image/jpeg                                  2015-08-13T08:00:54.983Z   2015-08-13T08:00:54.983Z
55cc4ece60b2597462bc0e06   image/jpeg                                  2015-08-13T08:01:18.323Z   2015-08-13T08:01:18.323Z
563b2fc360b216575c579204   application/zip, application/octet-stream   2015-11-05T10:30:27.721Z   2015-11-05T10:30:27.721Z
564ae21400b0ee7f5ca4e11a   application/zip, application/octet-stream   2015-11-17T08:15:16.951Z   2015-11-17T08:15:16.951Z
564da57360b2ed36207ad273   text/plain                                  2015-11-19T10:33:23.854Z   2015-11-19T10:33:23.854Z
```

如果需要查询的 class 有大量 Object / Array 等嵌套的数据结构，上面展示的表格形式的展示结果不能方便的查看这些数据，可以使用 `$ lean cql --format=json` 指定使用 `JSON` 来展示结果：

```
$ lean cql --format=json
CQL > select objectId, mime_type from _File where mime_type != null limit 3;
[
  {
    "createdAt": "2015-06-19T06:52:52.106Z",
    "mime_type": "application/zip, application/octet-stream",
    "objectId": "5583bc44e4b0ef6154cb1b9e",
    "updatedAt": "2015-06-19T06:52:52.106Z"
  },
  {
    "createdAt": "2015-07-06T11:17:18.885Z",
    "mime_type": "application/zip, application/octet-stream",
    "objectId": "559a63bee4b0c4d3e72432f6",
    "updatedAt": "2015-07-06T11:17:18.885Z"
  },
  {
    "createdAt": "2015-08-13T07:54:35.119Z",
    "mime_type": "image/jpeg",
    "objectId": "55cc4d3b60b28da5fc3af7c5",
    "updatedAt": "2015-08-13T07:54:35.119Z"
  }
]
```

## 其他命令

为了方便开发阶段查询资料或者文档，可以使用 `search` 命令：

```sh
$ lean search AVObject
```

这将打开浏览器，显示 [搜索结果](/search.html?q=AVObject)。

也可以查询多个关键字，空格隔开即可：

```sh
$ lean search 云引擎 命令行
```

## 贡献

`lean-cli` 本身是开源，基于 [Apache](https://github.com/leancloud/lean-cli/blob/master/LICENSE.txt) 协议，源码托管在 Github: <https://github.com/leancloud/lean-cli>，欢迎大家贡献。

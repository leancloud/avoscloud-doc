# 云引擎命令行工具使用详解

## 介绍

云引擎命令行工具是用来管理、部署云引擎项目的命令行工具，称之为 avoscloud-code 项目。通过它，你可以部署、发布、回滚云引擎代码，并且可以对同一个云引擎项目做多应用管理，还可以查看云引擎日志，批量上传文件到 LeanCloud 平台上等。

<div class="callout callout-info">命令行工具不支持美国节点（avosapps.us），请使用 git 部署。</div>

## 安装

### Linux 和 Mac OSX

首先，你需要安装 [Node.js](http://nodejs.org/) 环境以及 [npm](https://npmjs.org/) 包管理工具，在 ubuntu 上的 terminal（终端）可以简单地执行

```sh
apt-get install nodejs
```

在一些系统上你可能需要 `sudo` 权限：`sudo apt-get install nodejs`。

提示：apt 提供的 Node.js 版本可能比较滞后，推荐从[官方网站](http://nodejs.org/)下载安装。

在 Mac OSX 上，可以通过 [Homebrew](http://brew.sh/) 或者 [MacPort](http://www.macports.org/) 安装，terminal（终端）执行下列命令：

```sh
sudo port install nodejs
```

或者

```sh
brew install nodejs
```

在其他操作系统上，你也可以从 nodejs 官方网站下载源码或者二进制安装，自己安装。

接下来，通过执行下列命令安装 avoscloud 命令行工具：

```sh
npm install -g avoscloud-code
```

**在一些系统上你可能需要 `sudo` 权限**：`sudo npm install -g avoscloud-code`。

加上 `-g` 表示全局安装。**以后升级也请执行此命令**。

安装过程可能有些慢，请耐心等待。我们更推荐从 [cnpm](http://cnpmjs.org/) 仓库安装，速度理论上更快，请执行下列两个命令：

```sh
npm install -g cnpm --registry=http://r.cnpmjs.org
cnpm install -g avoscloud-code
```

如果从 npm 安装失败，也可以直接从 Github 源码安装：

```sh
npm install -g  git+https://github.com/leancloud/avoscloud-code-command
```

### Windows 系统

首先，你需要安装 [Node.js](http://nodejs.org/)，到网站下载安装包安装即可。

**注意：**Windows 系统用户请确保在系统盘 C 盘默认目录安装 Node.js，否则命令行工具无法正常运行。

然后通过命令行执行下列命令：

```
npm install -g avoscloud-code
```

加上 `-g` 表示全局安装。**以后升级也请执行此命令**。

安装过程可能有些慢，请耐心等待。

#### cnpm 安装

【不建议使用】使用 `cnpm` 安装全局模块（-g 参数）时会将模块保存在 `c:\Program Files\nodejs\node_modules\` 目录，该目录没有 admin 权限是无法写入的。而原生的 `npm` 会将全局模块安装在 `%USERPROFILE%\AppData\Roaming\npm\node_modules\` 目录下，该目录写入不需要 admin 权限。

使用 `cnpm` 安装命令行工具，运行时可能出现下列提示信息：

```
C:\Users\wchen\workspace\cloud-code-unit-test_v2.0>avoscloud
提示：你可以敲入 rs 命令并回车来重启本进程
module.js:338
    throw err;
          ^
Error: Cannot find module 'C:\Users\wchen\workspace\cloud-code-unit-test_v2.0\"C:\Program'
    at Function.Module._resolveFilename (module.js:336:15)
    at Function.Module._load (module.js:278:25)
    at Function.Module.runMain (module.js:501:10)
    at startup (node.js:129:16)
    at node.js:814:3
```

为了提高安装速度，可以使用 `cnpm` 的仓库进行安装：

```
npm install -g avoscloud-code --registry=https://r.cnpmjs.org
```

#### 问题排查

如果安装完执行仍然出现一些问题，请尝试下列步骤：

**移除命令行工具：**

  ```
  npm uninstall -g avoscloud-code
  ```

移除之后，确认命令行工具不可运行，即执行 avoscloud 命令时会有如下提示：
  
  ```
  C:\Users\wchen\workspace\cloud-code-unit-test_v2.0>avoscloud
  'avoscloud' 不是内部或外部命令，也不是可运行的程序或批处理文件。
  ```

**清除缓存：**
  
  ```
  npm cache clean
  ```
  
如果有安装 `cnpm`，还需要清除 `cnpm` 的缓存：
  
  ```
  cnpm cache clean
  ```

然后使用 `npm` 重新安装 avoscloud 命令行工具。

## 使用

安装成功之后，直接在 terminal（终端）运行 `lean -h`，输出帮助信息：

```sh
$ lean -h

  Usage: lean [options] [command]


  Commands:

    up [options]                             本地启动云引擎应用。
    search <keywords...>                     根据关键字查询开发文档。
    new [options]                            创建云引擎项目。
    deploy [options]                         部署到云引擎。
    publish [options]                        发布预备环境代码到生产环境。
    status [options]                         查询当前部署状态。
    undeploy [options]                       从 LeanEngine 平台清除云引擎部署，包括生产环境和预备环境。
    logs [options]                           查看云引擎日志。
    image                                    应用镜像管理。
    instance                                 应用实例管理。
    app                                      多应用管理，可以使用一个云引擎项目关联多个 LeanCloud 应用。
    cql [options]                            进入 CQL 查询交互。
    redis                                    LeanCache Redis 命令行。
    upload [options] <file-or-directory...>  导入文件到 LeanCloud 平台，如果是目录，则会将该目录下的文件递归导入。
    clear [options]                          清除本地状态，在输入 app id 或者 master key 错误的情况下使用。
    help [cmd]                               显示关于 [cmd] 命令的帮助信息。

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

可以通过 `-V` 选项查看版本：


```sh
$ lean -V
0.11.0
```

后面凡是以 `$ lean` 开头的即表示在终端里执行这个命令。

## Bash Completion

下载 [avoscloud_completion.sh](https://raw.githubusercontent.com/leancloud/avoscloud-code-command/master/avoscloud_completion.sh) 保存到某个目录，例如通常保存为 `~/.leancloud_completion.sh`，然后在 `~/.bashrc` 或者 `~/.bash_profile` 文件中添加：

```sh
source ~/.leancloud_completion.sh
```

重启终端 bash，或者重新加载 profile 文件，就可以让 lean 命令拥有自动提示和完成功能（tab 按键提示）。

### Mac 上安装 bash-completion

Mac 上建议通过 homebrew 安装 bash-completion:

```
brew install bash-completion
```

请将下面的内容添加到 `~/.bash_profile` 文件中：

```
if [ -f $(brew --prefix)/etc/bash_completion ]; then
  . $(brew --prefix)/etc/bash_completion
fi
```

## 创建项目

在安装命令行工具后，除了下载我们在 Github 上维护的 [新应用项目框架（Node.js）](https://github.com/leancloud/node-js-getting-started) 之外，你也可以通过 `new` 命令来创建一个新的云引擎项目：

```sh
$ lean new
```

窗口会提示输入应用的 Id 和 Master Key，该信息可以在 [控制台 / 设置 / 应用 Key](/app.html?appid={{appid}}#/key) 中找到。

<div class="callout callout-info">复制粘贴 Master Key 后，窗口不会有任何显示，直接按回车键确认即可。</div>

接下来选择项目语言，确认后一个新的云引擎项目框架就被创建出来了：

```sh
开始输入应用信息，这些信息可以从'开发者平台的应用设置 -> 应用 key'里找到。
正在创建项目 ...
  .gitignore
  .jshintrc
  app.js
  cloud.js
  package.json
  public/
  public/stylesheets/
  public/stylesheets/style.css
  README.md
  routes/
  routes/todos.js
  server.js
  views/
  views/error.ejs
  views/index.ejs
  views/todos.ejs
项目创建完成！
```

进入 `new_app` 目录就可以看到新建立的项目。

## 本地运行

进入项目目录：

```sh
$ cd new_app
``` 

安装依赖：

```sh
$ npm install
``` 

启动应用：

```sh
$ lean up
``` 
可能会提示输入应用的 Master Key，粘贴后窗口不会有任何显示，直接回车，即可在本机调试云引擎。

* 通过浏览器打开 <http://localhost:3000>，进入 web 应用的首页。
* 通过浏览器打开 <http://localhost:3001>，进入云引擎云函数和 Hook 函数调试界面。

`lean up` 命令包装了 [nodemon](https://github.com/remy/nodemon)，它会监视文件变更，修改代码后会自动重启进程，无需手工重启命令行工具就可以看到代码的最新效果。

**提示**：如果想变更启动端口号，可以使用 `lean up -P 新端口号` 命令来指定。

**提示**：命令行工具所有自命令都可以通过 `-h` 参数来查看详细的参数说明信息，比如 `lean up -h`。

更多关于云引擎开发，请参考 [云引擎服务总览](leanengine_overview.html) 。

## 部署

### 本地推送部署

在你开发和本地测试云引擎项目通过后，你可以直接将本地源码推送到 LeanCloud 云引擎平台运行，只要执行 `deploy` 命令：

```sh
$ lean deploy
```

请注意，这个命令将部署本地源码到远程平台的预备环境，无条件覆盖原来预备环境的版本（无论是从 Git 仓库部署或者还是本地部署）。

如果部署成功，会打印部署后的状态：

```sh
[INFO]: Cloud Code Project Home Directory: /Users/dennis/programming/avos/new_app/
Compress cloud code files...
Wrote compressed file /var/folders/90/xwqqy61d6lg6v8ztpbfhwb5c0000gp/T/1412920453227.tar.gz ...
Begin to upload cloud code files...
Upload cloud code files successfully. Begin to deploy...
Congrats! Deploy cloud code successfully.
Cloud code status is:

Development version    : 'local:adcce5dfb740a0e80c261dea038798b5'
Development commit log : 'Uploaded at 2014-10-10 13:54:26'
Production version     : 'local:3684975ddc5dc7abbfb06ed72ebcb371'
Production commit log  : 'Uploaded at 2014-10-09 16:56:06'

```

默认部署日志是 `Updated at YYYY-MM-DD HH:mm:ss` 的时间戳日志，你可以通过 `-o` 选项来提供更详细的部署日志：

```sh
$ lean deploy -o '测试本地推送部署'
```

部署之后，你可以通过 curl 命令，或者访问你设置的 `${your_app_domain}.leanapp.cn` 的二级域名对应的专用测试域名 `stg-${your_app_domain}.leanapp.cn` 测试你的云引擎代码。

### Git 仓库部署

如果你的代码是保存在某个 Git 仓库，例如 [Github](https://github.com) 上，你也可以请求 LeanCloud 平台从 Git 仓库获取源码并自动部署，这个操作可以在云引擎的部署菜单里完成，也可以在本地执行 `deploy` 命令和 `-g` 选项配合完成：

```sh
$ lean -g deploy
```

* `-g` 选项指定要求从 Git 仓库部署，Git 仓库地址必须已经在云引擎菜单里保存。

默认部署都将是 master 分支的最新代码，你可以通过 `-r <revision>` 来指定部署特定的 commit 或者 branch。

## 发布

预备环境如果测试没有问题，你希望将预备环境的云引擎代码切换到生产环境，你可以使用开发者平台的云引擎部署菜单做发布，也可以直接运行 `publish` 命令：

```sh
$ lean publish
```

就会将预备环境的云引擎代码发布到生产环境。

```sh
[INFO]: Cloud Code Project Home Directory: /Users/dennis/programming/avos/new_app/
[INFO]: Current App: origin <app id>
Publishing cloud code to production...
Published cloud code successfully. Current status is:

Development version    : 'local:adcce5dfb740a0e80c261dea038798b5'
Development commit log : 'Uploaded at 2014-10-10 13:54:26'
Production version     : 'local:adcce5dfb740a0e80c261dea038798b5'
Production commit log  : 'Uploaded at 2014-10-10 13:54:26'

```

## 查看部署状态

可以通过 `status` 命令查询当前生产环境和预备环境的部署状态：

```sh
$ lean status
[INFO]: Cloud Code Project Home Directory: /Users/dennis/programming/avos/new_app/
[INFO]: Current App: origin <app id>
Cloud code status is:

Development version    : 'local:adcce5dfb740a0e80c261dea038798b5'
Development commit log : 'Uploaded at 2014-10-10 13:54:26'
Production version     : 'local:adcce5dfb740a0e80c261dea038798b5'
Production commit log  : 'Uploaded at 2014-10-10 13:54:26'

```

通过 `undeploy` 命令，可以将云引擎代码彻底从 LeanCloud 平台移除（包括代码、版本信息、提交日志等）：

```sh
$ lean undeploy
```

**请慎重执行此操作**。

## 查看日志

使用 `logs` 命令可以查询云引擎最新日志：

```sh
$ lean logs
[INFO]: Cloud Code Project Home Directory: /Users/dennis/programming/avos/new_app/
[INFO]: Current App: origin 7104en0u071tcb5d1tr2juxa499ouvdn1gm5szq47nqzt06q
[2014-10-09T16:56:32.279Z] [production] -- info:  undefined

[2014-10-09T17:03:33.672Z] [development] -- info:  Deploying cloud code to development environment, the commit is 'local:3684975ddc5dc7abbfb06ed72ebcb371', and log is 'Uploaded at 2014-10-09 17:03:33'.

[2014-10-10T13:54:26.450Z] [development] -- info:  Deploying cloud code to development environment, the commit is 'local:adcce5dfb740a0e80c261dea038798b5', and log is 'Uploaded at 2014-10-10 13:54:26'.

[2014-10-10T14:09:11.744Z] [production] -- info:  Deploying cloud code to production environment, the commit is 'local:adcce5dfb740a0e80c261dea038798b5', and log is 'Uploaded at 2014-10-10 13:54:26'.
```

默认返回最新的 10 条，最新的在最下面。

可以通过 `-n` 选项设定返回的日志数目，例如返回最近的 100 条

```sh
$ lean -n 100 logs
```

也可以加上 `-t` 选项来自动滚动更新日志，类似`tailf`命令的效果：

```sh
$ lean -t logs
```

当有新的云引擎日志产生，都会自动填充到屏幕下方。


## 多应用管理

从 0.5.0 版本开始，我们为 lean 添加了多应用管理功能，类似 git 的多分支功能。使用这个功能，允许你将同一个云引擎项目部署到多个 LeanCloud 应用上，**但是仅限于云引擎 2.0 项目使用**。

### 查看应用状态

使用 `lean app list` 可以查看当前应用列表，默认情况下应该显示 `config/global.json` 里设定的应用：

```sh
$ lean app list
  origin <config/global.json 里的 applicationId>
```

执行 `lean app` 查看当前应用，因为目前没有明确指定，会告诉你：

```sh
$ lean app
You are not in an app.Please checkout <app>
```

我们明确切换到 `origin` 应用试试：

```sh
$ lean app checkout origin
Switced to app origin
$ lean app
* origin <config/global.json 里的 applicationId>
```

现在确认我们处于默认的初始应用。此时，执行 `deploy`、`publish`、`status`、`logs`等命令都将是针对当前应用。

### 添加应用

如果你想将 new_app 发布到其他 LeanCloud 应用，你可以通过 `add` 命令来添加一个应用：

```sh
$ lean app add other_app <other app 的应用 id>
```

`add` 接收两个参数，第一个是应用的名称，用于后续的显示和切换，第二个是新应用的 id，可以在应用设置的应用 Key 信息里找到。

添加成功将打印：

```sh
Added a new app: other_app -- <应用 id>
```

通过 `app list` 命令将看到两个应用：

```sh
$ lean app list
* origin    7104en0u071tcb5d1tr2juxa499ouvdn1gm5szq47nqzt06q
  other_app 1qdney6b5qg2i69t79yq941krrwdu3glt0ot69re6w7xv6lf
```

前面有星号的应用，表示是当前应用。切换应用，需要使用 `checkout` 命令。

### 切换应用

从当前应用切换到另一个应用，可以使用 `checkout <应用名称>`:

```sh
$ lean app checkout other_app
Switched to app other_app
```

切换成功后，执行 `deploy`、`publish`、`status`、`logs`等命令都将运行在 `other_app` 上。如果你过去没有部署过，第一次部署的时候会要求你输入新应用的 master key。

通过 `app` 命令可以看到当前应用已经是 `other_app`:

```sh
$ lean app
* other_app <应用 id>
```

如果你想在不切换应用的情况下去部署云引擎到其他应用，也可以通过 `--app` 选项来指定，例如:

```sh
$ lean deploy --app other_app
```

这样就无需通过 checkout 切换应用，就可以部署项目到其他应用。`status`、`publish` 等应用相关的命令也同样支持 `--app` 选项。

### 移除应用

同样，你可以删除一个应用，使用  `rm` 命令：

```sh
$ lean app rm other_app
Removed app: other_app
```

通过 `app list` 确认已经删除：

```sh
$ lean app list
  origin 7104en0u071tcb5d1tr2juxa499ouvdn1gm5szq47nqzt06q
```

## 批量上传文件

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

0.6.1 版本开始，我们支持 cql 命令来进入交互查询界面：

```sh
$ lean cql
```

使用 [CQL](./cql_guide.html) 语言做查询，结果如图：

![image](images/cql_command.png)

## 其他命令

为了方便开发阶段查询资料或者文档，可以使用 `search` 命令：

```sh
$ lean search AVObject
```

这将打开浏览器，显示[搜索结果](/search.html?q=AVObject)。

也可以查询多个关键字，空格隔开即可：

```sh
$ lean search 云引擎 命令行
```


## 贡献

`avoscloud-code` 本身是开源，基于 [GNU LGPL](https://www.gnu.org/licenses/lgpl.html) 协议，源码托管在 Github: [https://github.com/leancloud/avoscloud-code-command](https://github.com/leancloud/avoscloud-code-command)

欢迎大家贡献。

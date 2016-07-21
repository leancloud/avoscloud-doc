{% extends "./sdk_setup.tmpl" %}
{% block language %}iOS / OS X{% endblock %} 
{% set command_install_cocoapods = "$ sudo gem install cocoapods" %}
{% set code_import_sdk_core = "#import <AVOSCloud/AVOSCloud.h>" %}

{% block libs_tool_automatic %}
通过 [CocoaPods](http://www.cocoapods.org) 来安装可以最大化地简化安装过程。

首先确保开发环境中已经安装了 Ruby（一般安装了 Xcode，Ruby 会被自动安装上），如果没有安装请执行以下命令行：

```sh
{{command_install_cocoapods}}
```

如果遇到网络问题无法从国外主站上直接下载，我们推荐一个国内的镜像：[RubyGems 镜像](http://ruby.taobao.org/)，具体操作步骤如下：

```sh
$ gem sources --remove https://rubygems.org/
$ gem sources -a https://ruby.taobao.org/
# 请确保下列命令的输出只有 ruby.taobao.org
$ gem sources -l
*** CURRENT SOURCES ***
https://ruby.taobao.org
```

然后再安装 CocoaPods：

```sh
{{command_install_cocoapods}}
```

在项目根目录下创建一个名为 `Podfile` 的文件（无扩展名），并添加以下内容：

- 请根据实际需要选择模块。譬如，项目用不到实时通信 IM 功能，则不必集成 AVOSCloudIM 模块。

```ruby
pod 'AVOSCloud'               # 数据存储、短信、云引擎调用等基础服务模块
pod 'AVOSCloudIM'             # 实时通信模块
pod 'AVOSCloudCrashReporting' # 错误报告模块
```

执行命令 `pod install --verbose` 安装 SDK。如果本地安装过最新版本的 SDK，则可执行 `pod install --verbose --no-repo-update` 来加快安装速度。

### 导入模块

SDK 集成完毕后，就可以将模块导入到项目中了。导入的方式取决于项目的语言类型。项目的语言类型是在创建项目时选择的。

#### Objective-C 项目

如果项目的语言类型是 Objective-C，只需要在合适的地方导入头文件。譬如，希望在某个源文件中使用 AVOSCloud 基础模块，则可以这样导入：

```objc
{{code_import_sdk_core| safe}}
```

此外，还可以在项目的 `pch` 文件中导入。这样就可以全局访问 AVOSCloud 基础模块，不用在单个文件中导入了。

#### Swift 项目

如果项目的语言类型是 Swift，则要看集成的是静态库还是动态库。如果要集成**动态库**，则在源文件中直接导入即可：

```swift
import AVOSCloud
```

如果是集成**静态库**，则需要先为项目创建一个桥接头文件 Bridging Header（[步骤见附录](#创建桥接头文件)），然后在该桥接头文件中使用 Objective-C 的语法来导入模块的头文件：

```objc
{{code_import_sdk_core| safe}}
```

再编译运行一下项目，确认一切是否正常。

<div class="callout callout-info">注意：不要在 Swift 源文件中导入，因为目前 Xcode 还无法处理这种情况。</div>

完成上述步骤，就可以在 Swift 源文件中使用 Objective-C 的类和方法了。
{% endblock %}

{% block import_sdk %}
下载文件解压成功后会得到以下文件：

```
├── AVOSCloud.zip                  // LeanCloud 核心组件，包含数据存储、推送、统计等
├── AVOSCloudIM.zip                // LeanCloud 实时消息模块                          
└── AVOSCloudCrashReporting.zip    // LeanCloud 崩溃报告
```
根据上述包及其对应的功能模块，开发者可以根据需求自行导入对应的模块。

手动导入项目的过程请参考 [快速入门](/start.html)。

这里要特别注意如下几点：

* 手动添加下列依赖库：
  * SystemConfiguration
  * MobileCoreServices
  * CoreTelephony
  * CoreLocation
  * libicucore

* 如果使用 [崩溃报告 AVOSCloudCrashReporting](./ios_crashreporting_guide.html)，还需额外添加 **libc++**。

* 在 Target 的 **Build Settings** 中，为 **Other Linker Flags** 增加：
  * `-lz`
  * `-licucore`
  * `-ObjC`
  * `-lc++` （Crash Reporting 模块需要）
  * `-lsqlite3` （IM 模块需要）

{% endblock %}

{% block init_with_app_keys %}

打开 `AppDelegate.m` 文件，添加下列导入语句到头部：

```
#import <AVOSCloud/AVOSCloud.h>;
// 如果使用了实时通信模块，请添加以下导入语句：
#import <AVOSCloudIM/AVOSCloudIM.h>
```

如果使用 Swift 语言开发并使用动态库，请在 `AppDelegate.swift` 中包含 AVOSCloud 模块；如果已经在 [桥接头文件](#创建桥接头文件) 中 `import` 过，跳过此步即可。

```swift
import AVOSCloud
//如果使用了实时通信模块，请添加下列导入语句到头部：
import AVOSCloudIM
```

然后粘贴下列代码到 `application:didFinishLaunchingWithOptions` 函数内：

```objc
// applicationId 即 App Id，clientKey 是 App Key。
[AVOSCloud setApplicationId:@"{{appid}}"
                  clientKey:@"{{appkey}}"];
```

如果想跟踪统计应用的打开情况，后面还可以添加下列代码：

```objc
[AVAnalytics trackAppOpenedWithLaunchOptions:launchOptions];
```

{% endblock %}

{% block sdk_switching_node %}

```
//如果使用美国站点，请加上这行代码，并且写在初始化前面
[AVOSCloud setServiceRegion:AVServiceRegionUS];
// applicationId 即 App Id，clientKey 是 App Key。
[AVOSCloud setApplicationId:@"{{appid}}"
                  clientKey:@"{{appkey}}"];
```
{% endblock %}

{% block save_a_hello_world %}

```
AVObject *post = [AVObject objectWithClassName:@"TestObject"];
[post setObject:@"Hello World!" forKey:@"words"];
[post saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
    if (succeeded) {
      // 保存成功了！
    }
}];
```

然后，点击 `Run` 运行调试，真机和虚拟机均可。
{% endblock %}

{% block permission_access_network_config %}{% endblock %}

{% block platform_specific_faq %}
## 附录

### 创建桥接头文件

要在 Swift 项目中使用 Objective-C 的类和方法，则需要创建一个 Objective-C 桥接头文件（bridging header），把在 Swift 中要使用的 Objective-C 的头文件都包含进来。

首先在项目中创建一个临时的 Objective-C 类文件（如 `Dummy.m`），Xcode 将询问是否要创建一个桥接头文件：

<img src="images/bridgingheader_2x.png" width="592" height="168">

点击 **Create Bridging Header** 后，Xcode 会生成一个以 `-Bridging-Header.h` 结尾的新文件（假设项目名称为 MyApp，则新文件名为 `MyApp-Bridging-Header.h`），此时 `Dummy.m` 文件的使命已经完成，可以安全删除了。

你也可以选择手工创建桥接头文件，并手工配置编译设置（File > New > File > (iOS, watchOS, tvOS, or OS X) > Source > Header File），详细步骤请参考 [Apple Developer Docs &middot; Swift and Objective-C in the Same Project](
https://developer.apple.com/library/ios/documentation/Swift/Conceptual/BuildingCocoaApps/MixandMatch.html#//apple_ref/doc/uid/TP40014216-CH10-ID122)。
{% endblock %}

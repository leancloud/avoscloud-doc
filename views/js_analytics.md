# JavaScript 统计分析开发指南

## 简介

使用本模块，你不仅可以精准统计每个分发渠道所获取的新增用户、活跃用户、留存率等指标，还可以自定义事件来深度追踪用户的使用细节、用户属性以及行为特征，直观解读用户的操作流程，为业务分析和用户体验优化获取最真实的样本数据。

## 特性

* 该 SDK 可以使用在 Web 页面及 WebApp 等场景中，各种移动端浏览器，及各种 WebView，包括 Phonegap、Cordova 和微信的 WebView。

* 使用简单，功能强大。只需要加载，实例化之后，开启 SDK 相关统计方法，LeanCloud 的后台会自动来分析，最终可以在控制台相关应用的「分析」中看到诸如访问时长、用户增长、用户留存率和实时在线用户量等各种统计数据。

* 支持 WebApp，支持 Web 前端路由。

## 安装

请使用 `leancloud-storage` 对应的 JS SDK，安装参考 [JavaScript SDK 安装指南](sdk_setup-js.html)

## Demo 及示例代码

如果您觉得一点点阅读文档较慢，可以直接看我们的 [Demo 代码](https://github.com/leancloud/javascript-sdk/tree/master/demo)，并且下载自己运行一下试试看。

```javascript
// 最简的示例代码，请换成自己的 appId 和 appKey
var appId = '{{appid}}';
var appKey = '{{appkey}}';

// 服务器地区选择，不传入时，默认是中国节点
const region = 'cn';

// 初始化 JS SDK
AV.init({
    appId: appId,
    appKey: appKey,
    region: region,
});

// 开启统计 Pageview（页面访问）
AV.Analyse.recordPageview();

// 开启统计 Session view（会话访问）
AV.Analyse.recordSession();

// 发送统计自定义事件
AV.Analyse.send({
    // 你当前应用或者想要指定的版本号（自定义）
    version: 'version1234',

    // 你当前应用的渠道或者你想指定的渠道（自定义）
    channel: 'channel1234',

    // 统计的事件名称
    event: 'test-event-name',

    // 事件属性，任意数据
    attributes: {
        testa: 123,
        testb: 'abc',
    },

    // 该事件持续时间（毫秒）
    duration: 6000,
}).then(function() {
    // 发送成功
    console.log('统计数据发送成功！');
}).catch(function(err) {
    // 发送失败
    console.log(err);
});
```

## 方法文档

### 全局命名空间

LeanCloud JavaScript 相关 SDK 都会使用「AV」作为命名空间。

### AV.Analyse.send(options)

描述：发送自定义事件，可以用来监测用户行为，或者做其他相关统计。

参数：

* options {Object} （必须）发送数据的配置，具体参数包括：

参数|类型|约束|说明
---|---|---|:---
version|String|可选|可以设置一个版本号，可以是当前应用的版本，完全自定义
channel|String|可选|渠道信息，可以设置一个渠道，完全自定义，比如微信、微博等
event|String|必须|事件的名称
attributes|Object|可选|事件所携带的数据，可以是任意的 JSON，完全自定义
duration|Number|可选|该事件持续的时间，单位是毫秒

返回：{Promise} 返回一个 Promise 对象

例子：

```javascript
// 发送统计自定义事件
AV.Analyse.send({
    // 你当前应用或者想要指定的版本号（自定义）
    version: 'version1234',

    // 你当前应用的渠道或者你想指定的渠道（自定义）
    channel: 'channel1234',

    // 统计的事件名称
    event: 'test-event-name',

    // 事件属性，任意数据
    attributes: {
        testa: 123,
        testb: 'abc',
    },

    // 该事件持续时间（毫秒）
    duration: 6000,
}).then(function() {
    // 发送成功
    console.log('统计数据发送成功！');
}).catch(function(err) {
    // 发送失败
    console.log(err);
});
```

### AV.Analyse.recordPageview()

描述：开启统计 Pageview（页面访问）

例子：

```javascript
AV.Analyse.recordPageview();
```

### AV.Analyse.recordSession()

描述：开启统计 Session view（会话访问）

例子：

```javascript
AV.Analyse.recordSession();
```

## 数据时效性

在控制台的 **分析** 页面中，有些报告可以展示实时数据，有些报告则依靠内部离线数据进行分析，因此有时你会看不到当天的数据。

如果当前页面中存在 **日期选择** 选项（通常在页面右上角），你可以以此判断当前的统计结果是否有延迟。如果 **结束日期** 显示为 **当日日期** 或在其下拉菜单中有「今日」选项，即为实时数据；反之则为离线数据（如下图所示），要推迟一天才能看到当日的情况。

<img src="images/analytics_datepicker_for_offline_data.png" alt="" width="231" height="256">

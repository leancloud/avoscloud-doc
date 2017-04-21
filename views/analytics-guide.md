# 统计分析开发指南

## 统计分析解决了什么问题？
使用 LeanCloud 统计服务可以帮助开发者在应用上线之后的统计指标，它包含但不限于如下内容：

- 应用趋势（实时数据，版本分布，渠道分布）
- 行为分析（应用使用，推送统计，路径分析，使用时长，使用频率，访问页面）
- 用户分析（用户留存，终端设备，地理位置）
- 推广营销分析（渠道对比）
- 错误分析（错误分析，错误统计）

## 统计分析服务如何工作的？

![analytics-workflow](images/analytics-wrokflow.svg)

## SDK 安装与初始化

- [Objective-C](sdk_setup-objc.html)
- [Android](sdk_setup-android.html)
- [Unity](sdk_setup-dotnet.html)
- [Windows](sdk_setup-dotnet.html)

## 开启统计功能

```cs
AVAnalytics.InitAsync(IAVAnalyticsDevice device);
// IAVAnalyticsDevice 是一个接口，需要开发者自己实现针对当前运行平台下的一些硬件和网络等相关的数据
// 下面是一个在 PC 实现这个接口的样例
public class PC : IAVAnalyticsDevice
{
    public string access
    {
        get
        {
            return "WIFI";
        }
    }

    public string app_version
    {
        get
        {
            return "0.12.34";
        }
    }

    public string carrier
    {
        get
        {
            return "China Unicom";
        }
    }

    public string channel
    {
        get
        {
            return "Market Place";
        }
    }

    public string device_id
    {
        get
        {
            return "98DD09BDFDC24E359E0426219E9FA79A";
        }
    }

    public string device_model
    {
        get
        {
            return "Windows 10";
        }
    }

    public string device_brand
    {
        get
        {
            return "ASUS";
        }
    }

    public string iid
    {
        get
        {
            return null;
        }
    }

    public string language
    {
        get
        {
            return "zh-CN";
        }
    }

    public string mc
    {
        get
        {
            return "02:00:00:00:00:00";
        }
    }

    public string os
    {
        get
        {
            return "Windows";
        }
    }

    public string os_version
    {
        get
        {
            return "10";
        }
    }

    public string resolution
    {
        get
        {
            return "1920x1080";
        }
    }

    public string timezone
    {
        get
        {
            return "8";
        }
    }
}
// 然后在初始化的时候传递给 InitAsync 即可：
AVAnalytics.InitAsync(new PC());
```
## 应用打开

一般情况下应用被打开的方式有两种：

- 用户主动打开
- 设备接收到应用的推送消息，用户点击消息而打开应用

因此 SDK 提供了统计这两种打开方式的接口：

```cs
// 记录本次应用的打开是用户主动打开
AVAnalytics.Current.TrackAppOpened();

// 记录本次应用的打开是来自于推送消息的点击
AVAnalytics.Current.TrackAppOpenedWithPush();
```

## 页面访问

用户访问一个页面是一个持续性的过程，我们关注的是用户在什么时间开始进入，在这个页面停留了多长时间，最后在什么时间结束这三个主要的参数，因此我们提供的接口如下：

```cs
var pageId = AVAnalytics.Current.BeginPage("ChatPage");
// pageId 是本地生成的唯一的 id，它是为了保证这一次记录是一次新的打开
// 有可能用户同时打开了两个聊天页面，而在之后记录关闭页面的时候，需要给予一个 ID 来一一对应
// 关闭页面代码如下：
AVAnalytics.Current.EndPage(pageId);

// 调用这两个方法的时间间隔就是访问页面的时长，SDK 自动会进行计算
```

## 自定义事件

用户点击了某个按钮或者使用了某一个触屏手势可以使用如下代码来记录：

```cs
// 记录登录按钮被点击
AVAnalytics.Current.TrackEvent("LogIn_Button_Clicked");
// 记录用户使用了手指滑动的手势
AVAnalytics.Current.TrackEvent("Gesture_Flick");
```

### 多标签事件
有一些事件并不是只有一个名字，它也可能有一些其他标签或者自定义属性，例如电商应用需要了解消费者下单之后用户是否浏览的页面上的其他广告：

```cs
var orderEventId = AVAnalytics.Current.BeginEvent("Order", "OrderAction", new Dictionary<string, object>()
{
    { "clicked_ads","left" },//用户点击了左边栏的广告
    { "scorll_down",true},//用户是否拉到了页面底部
});
```

### 事件累计
有的时候一次购物用户可能会分批次下几次订单，因此我们也可以记录多次同名事件:

```cs
var orderEventId1 = AVAnalytics.Current.BeginEvent("Order");
var orderEventId2 = AVAnalytics.Current.BeginEvent("Order");
var orderEventId3 = AVAnalytics.Current.BeginEvent("Order");

...
AVAnalytics.Current.EndEvent(orderEventId1);
AVAnalytics.Current.EndEvent(orderEventId2);
AVAnalytics.Current.EndEvent(orderEventId3);

// 分别下单 3次，然后可以调用结束，这样就可以统计每一次下单的时间消耗
```


## 统计数据的发送
默认情况下只要调用下面的接口，SDK 会根据[设置数据发送策略](#设置数据发送策略) 的策略进行发送，无需开发者关心里面的发送逻辑:

```cs
// 结束这一次统计
AVAnalytics.Current.CloseSession();
```

## 设置数据发送策略
{% if node=='qcloud' %}
你可以进入应用的 `**分析** > **统计设置**<span class="text-muted">（左下角）</span> > **数据发送策略**` 在线更改 SDK 端的数据报告发送策略。在没有取到在线配置的发送策略的情况下，会使用默认的发送策略。
{% else %}
你可以进入应用的 [**分析** > **统计设置**<span class="text-muted">（左下角）</span> > **数据发送策略**](/stat.html?appid={{appid}}&os=android#/statconfig/trans_strategoy) 在线更改 SDK 端的数据报告发送策略。在没有取到在线配置的发送策略的情况下，会使用默认的发送策略。
{% endif %}

以下均为在线配置中的可选策略。

## 数据时效性

在控制台的 **分析** 页面中，有些报告可以展示实时数据，有些报告则依靠内部离线数据进行分析，因此有时你会看不到当天的数据。

如果当前页面中存在 **日期选择** 选项（通常在页面右上角），你可以以此判断当前的统计结果是否有延迟。如果 **结束日期** 显示为<u>当天日期</u>或在其下拉菜单中有「今日」的选项，则为实时数据。如下图所示，菜单中无「今日」，所以可以判断这是离线数据，统计结果要延迟一天。

<img src="images/analytics_datepicker_for_offline_data.png" alt="" width="231" height="256">
# 数据存储开发指南 · .NET

## 简介

目前我们的 .NET 数据存储支持如下运行时：

- Windows Desktop .NET Framework 4.5+
- Xamarin Form 1.4+
- Xamarin iOS 8+
- Xamarin Android 5+
- .NET Core 2.0+

以上几个运行时，我们称之为 `.NET Portable`。

而 Unity 较为特殊，它暂时还不支持 .NET 3.5 之后的版本，因此我们单独列为 `Unity`

## 安装

### Visual Studio / Xamarin

在 Nuget Package Manager 里面打开 Package Manager Console 执行如下命令行：

```sh
PM> Install-Package LeanCloud
```

它会自动安装当前运行时的版本。相关依赖可以通过 [LeanCloud on Nuget](https://www.nuget.org/packages/LeanCloud/) 查询和了解。

### Unity Editor

Unity 在 Github 上托管了发布 SDK 的服务，可以通过 [leancloud/unity-sdk](https://github.com/leancloud/unity-sdk/releases) 这里来获取最新的发布版本。

例如下载了 `LeanCloud-Unity-SDK-20161215.3.zip` 这个包，解压之后，需要把里面所有的 dll 文件都导入到 Unity 的 Assets 目录下。

## 介绍

LeanCloud .NET SDK 依赖于微软提供的[基于任务的异步模式 (TAP)](http://msdn.microsoft.com/zh-cn/library/hh873175.aspx)的方式，所以您最好有 .NET Framework 4.5 的编程经验，或者对 .NET Framework 4.5 的新 API 有所了解。

## 应用

在 LeanCloud 的每个应用有自己的 ID 和客户端密钥，在客户端代码中应该用他们来初始化 SDK。
LeanCloud 的每一个账户都可以创建多个应用。同一个应用可以分别在测试环境和生产环境部署不同的版本。

### 初始化

在 LeanCloud 中，几乎所有平台下的接口我们都尽量保持一致，目的就是为了降低开发者的开发成本，所以在初始化的时候我们几乎都是遵循在 `LCApplication` 这个类下有一个叫做 `Initialize`（不同平台的编程规范可能不一样，但是在 C# 语言风格中一般方法名的首字母都是大写）的方法：

```c#
// 传入您的 `App ID`，`App Key` 以及 `ServerURL`，SDK 会根据 `App ID` 的规律确定节点
LCApplication.Initialize("{{appid}}", "{{appkey}}", "https://please-replace-with-your-customized.domain.com");
```

## 对象

### LCObject

在 LeanCloud 上，数据存储是围绕 `LCObject` 进行的。每个 `LCObject` 都包含了与 JSON 兼容的键值对应的数据。数据是 schema-free 的，你不需要在每个 LCObject 上提前指定存在哪些键，只要直接设定对应的 key-value 即可。
key 必须是字母数字或下划线组成的字符串。值可以是字符串，数字，布尔值，甚至数组和字典。
每个 `LCObject` 都必须有一个类（Class）名称，以便于您区分不同类型的数据。例如，我们可以将对应的体育运动称为 `Sport`。我们建议的您将类和 key 按照 `NameYourClassesLikeThis` 以及 `nameYourKeysLikeThis` 这样的惯例命名。

### 保存对象

接下来，你需要将上文中的 `Sport` 存储到 LeanCloud 的服务。LeanCloud 的相关接口和 `IDictionary<string, object>` 类似，但只有调用 `Save` 方法时才会实际保存到服务器：

```cs
LCObject football = new LCObject("Sport");
football["totalTime"] = 90;
football["name"] = "Football";
await football.Save();
```

{% if node=='qcloud' %}
在运行此代码后，您应当了解保存动作是否已经生效 。为了确保数据被保存，您可以在 LeanCloud 上的`数据管理`中查看您应用的数据。
{% else %}
在运行此代码后，您应当了解保存动作是否已经生效 。为了确保数据被保存，您可以在 LeanCloud 上的数据管理中查看您应用的数据。
{% endif %}

此处有两件事情需要特别注明。
首先，在运行此代码之前，您不必配置或设置一个称为 「Sport」 的新类。LeanCloud 会自动创建这个类。

此外，为了更方便的使用 LeanCloud，还有其它几个字段您不需要事先指定。`ObjectId` 是为每个对象自动生成的唯一的标识符；`CreatedAt` 和 `UpdatedAt` 分别代表每个对象在 LeanCloud 中创建和最后修改的时间并会被自动填充。
在您执行保存操作之前，这些字段不会被自动保存到 `LCObject` 中。

### 在后台工作

关于异步编程，一直是每一种语言和平台上必须直面的问题，牵扯到线程，进程的问题大多数都是程序员很头疼的一个难点，但是在 .NET Framework 4.5 之后迎来了一种新的变革，那就是[基于任务的异步模式 (TAP)](http://msdn.microsoft.com/zh-cn/library/hh873175.aspx)。当然本篇指南的重点不是讲解 TAP 异步模式的好处，只是希望开发者能够足够的掌握 TAP 实现异步用法。

LeanCloud .NET SDK 都采用了 TAP 的方式去实现把所有跟 LeanCloud 服务端交互的部分放在后台去进行，这样可以让开发者可以花更多时间去做客户端应该做的事情，而把跟服务端交互的各种进程管理放权给 LeanCloud SDK 去做。

### 更新对象

更新对象和保存对象有点相似，只是更新对象会覆盖同名属性的值，在调用 `Save` 之后会发送到服务端生效。

```cs
var peter = new LCObject("Character");
peter["age"] = 37;
peter["name"] = "Peter Burke";
peter["from"] = "White Collar";
peter["skills"] = new List<string> { "FBI", "Agent Leader" };
await peter.Save();
// 保存成功之后，修改一个已经在服务端生效的数据，这里我们修改age
// LeanCloud 只会针对指定的属性进行覆盖操作，本例中的name不会被修改
peter["age"] = 40;
await peter.Save();
```

### 获取对象

如果确定了一个 `LCObject` 的 `ObjectId` 可以通过如下代码构造一个 `LCObject` 然后通过 `Fetch` 从服务端把数据加载到本地：

```cs
LCObject character = LCObject.CreateWithoutData("Character", "549818e0e4b096e3561a6abd");
await character.Fetch();
```

### 删除对象

如果想删除某个对象可以直接调用 `LCObject` 的 `Delete` 方法。

```cs
await myObject.Delete();
```

如果仅仅想删除某个对象的某一个属性，可以调用 `Unset` 方法。

```cs
// 执行下面的语句会将age字段置为空
myObject.Unset("age");
// 将删除操作发往服务器生效。
await myObject.Save();
```

### LCObject 的子类化

子类化的目的是为了使用给自己自定义的强类型来使用云存储而不需要在自己的代码里面拘泥于 LCObject 提供的默认的操作接口，

例如我们现在有一个公司内部的员工管理系统，之前是使用传统的 SQL Server 数据库做存储的，因此在系统里面存在了如下 `Employee` 类:

```cs
public class Employee {
    public string DisplayName {
        get;
        set;
    }

    public List<string> Positions {
        get;
        set;
    }
}
```

而现在改用 LeanCloud 云存储服务之后的代码改成如下即可：

```cs
public class Employee : LCObject {
    public string DisplayName {
        get { return this["DisplayName"] as string; }
        set { this["DisplayName"] = value; }
    }

    public List<object> Positions {
        get { return this["Positions"] as List<object>; }
        set { this["Positions"] = value; }
    }
}
```

然后在系统启动之后，注册子类:

```cs
LCObject.RegisterSubclass("Employee", () => new Employee());
```

#### 使用子类

##### 新增和修改

```cs
var tom = new Employee();
var className = tom.ClassName;
tom.Positions = new List<string>() { "manager", "vp" };
tom.DisplayName = "Tom";
await tom.Save();
```

##### 查询

```cs
var query = new LCQuery<Employee>();
var result = await query.Find();
var first = result.FirstOrDefault();
```

##### 删除

```cs
await tom.Delete();
```

因为 `Employee` 的继承自 `LCObject`，因此它具备了所有 `LCObject` 的灵活性又具备了当前业务系统的特殊性。

### 关系

软件程序就是抽象现实中的对象之间的关系在计算机世界里面的解释和展现。有对象必然就会有对象之间的关系，在 LeanCloud 中也给出了传统关系型的解决方案，并且简化了代码，使得代码简洁易维护。
假设这样一种场景，做一款时髦的相亲社交软件，男孩会在自己的资料里面标明自己喜欢的女生类型，于是有如下代码：

```cs
LCObject girlType = new LCObject("GirType");
girlType["typeName"] = "Hot";
LCObject beckham = new LCObject("Boy");
beckham["name"] = "David Beckham";
beckham["age"] = 38;
beckham["focusType"] = girlType;
// 保存 beckham 的时候会自动将 girlType 也保存到服务器。
await beckham.Save();
```

当然必然存在一种方法就是将已存在的对象通过 `ObjectId` 将它于目标对象进行关联：

```cs
beckham["focusType"] = LCObject.CreateWithoutData("GirType", "5372d119e4b0d4bef5f036ae");
```

值得注意的地方是，当需要从 LeanCloud 上读取数据的时候，默认的 fetch 方法是`不会加载关联数据类型的`，直到像如下代码执行之后，这些关联数据字段（如上实例中 Boy 的 focusType 字段）才会被实例化。

```cs
LCObject focusType = beckham["focusType"] as LCObject;
await focusType.Fetch();
```

## 查询

### LCQuery.Get

此方法对应的理解是根据 `ObjectId` 查询指定的一条数据，`Get` 方法的参数为一个 `ObjectId`：

```cs
LCQuery<LCObject> query = new LCQuery<LCObject>("Character");
LCObject character = await query.Get("549818e0e4b096e3561a6abd");
```

### 构建 LCQuery 的注意事项

根据 `ObjectId` 查询，显然无法满足正常的需求，所以 SDK 提供了许多简化了操作的查询。

```cs
LCQuery<LCObject> query = new LCQuery<LCObject>("Character");
query.WhereEqualTo("age", 37);
await query.Find();
```

以此类推，所有复合条件查询的构造都应该遵循用`.`这个符号进行链式创建出来的 `LCQuery<T>`，比如，查找所有 `age` 等于 37，并且 `name` 包含 `peter` 的`Character`：

```cs
LCQuery<LCObject> query = new LCQuery<LCObject>("Character")
    .WhereEqualTo ("age", 37)
    .WhereContains("name","peter");
```

### 基本查询

`LCQuery<T>.WhereEqualTo` 基本查询逻辑上可以理解为类似于 sql 语句中的

```cs
SELECT * FROM Persons WHERE FirstName='Bush'
```

的`=`操作，如下：

```cs
LCQuery<LCObject> query = new LCQuery<LCObject>("Persons")
    .WhereEqualTo("FirstName", "Bush");
ReadOnlyCollection<LCObject> persons = await query.Find();
int sum = persons.Count;
```

### 查询条件

如果要过滤掉特定键的值时可以使用 whereNotEqualTo 方法。比如需要查询 `name` 不等于 `Peter Burke` 的数据时可以这样写：

```cs
query.WhereNotEqualTo("name", "Peter Burke");
```

同时包含多个约束条件的查询，可以这样写：

```cs
query.WhereNotEqualTo("name", "Peter Burke");
query.WhereGreaterThan("age", 18); // 这样书写是为了文档阅读方便，但是我们还是比较推荐上一节介绍的链式表达式去创建 LCQuery
```

以此类推，可以添加多个约束条件，他们彼此是 `AND` 的关系。
有些需求中，也许只要较少的几条查询结果即可，这种情况下，可以通过设定查询结果的数量：

```cs
query.Limit(10);
```

在数据较多的情况下，分页显示数据是比较合理的解决办法，limit 默认 100，最大 1000，在 0 到 1000 范围之外的都强制转成默认的 100。
Skip 方法可以做到跳过首次查询的多少条数据来实现分页的功能。比如，一页显示 10 条数据，那么跳过前 10 个查询结果的方法就是：

```cs
query.Skip(10);
```

对应数据的排序，如数字或字符串，你可以使用升序或降序的方式来控制查询数据的结果顺序：

```cs
// 根据 age 字段升序显示数据
query.OrderByAscending("age");
// 根据 age 字段降序显示数据
query.OrderByDescending("age");
//各种不同的比较查询：
// 年龄 < 37
query.WhereLessThan("age", 37);
// 年龄 <= 37
query.WhereLessThanOrEqualTo("age", 37);
// 年龄 > 37
query.WhereGreaterThan("age", 37);
// 年龄 >= 37
query.WhereGreaterThanOrEqualTo("age", 37);
```

如果你想查询匹配几个不同值的数据，如：要查询 “peter”，“neal”，“alex” 三个人的详细数据，你可以使用 WhereContainedIn（类似 SQL 中的 in 查询）方法来实现。

```cs
var names = new[] { "peter", "neal", "alex" };
query.WhereContainedIn("name", names);
```

相反，你想查询排除 “peter”，“neal”，“alex” 这三个人的其他同学的信息（类似 SQL 中的 not in 查询），你可以使用 WhereNotContainedIn 方法来实现。

```cs
query.WhereNotContainedIn("name", names);
```

对字符串值的查询 查询包含字符串的值，有几种方法。你可以使用任何正确的正则表达式来检索相匹配的值，使用 WhereMatches 方法：

```cs
query.WhereMatches("name", "^[A-Z]\\d");
```

查询字符串中包含“XX“内容，可用如下方法：

```cs
// 查询 name 字段的值中包含 “pet” 字的数据
query.WhereContains("name", "pet");

// 查询 name 字段的值是以 “al” 字开头的数据
query.WhereStartsWith("name", "al");

// 查询 name 字段的值是以 “oz” 字结尾的数据
query.WhereEndsWith("name", "oz");
```

### 数组值的查询

如果一个 Key 对应的值是一个数组，你可以查询 key 的数组包含了数字 2 的所有对象:

```cs
// 查找出所有 arrayKey 对应的数组同时包含了数字 2 的所有对象
query.WhereEqualTo("arrayKey", 2);
```

同样，你可以查询出 Key 的数组同时包含了 2,3 和 4 的所有对象：

```cs
// 查找出所有 arrayKey 对应的数组同时包含了数字 2, 3, 4 的所有对象。
List<int> numbers = new List<int> { 2, 3, 4 };
query.WhereContainsAll("arrayKey", numbers);
```

### 查询对象个数

如果你只是想统计有多少个对象满足查询，你并不需要获取所有匹配的对象，可以直接使用 `Count` 替代 `Find`。例如，查询一部电视剧里面一共有多个角色：

```cs
query.WhereNotEqualTo("from", "White Collar");
int count = await query.Count();
```

`对于超过 1000 个对象的查询，这种计数请求可能被超时限制。他们可能遇到超时错误或者返回一个近似的值。因此，请仔细设计你的应用架构来避免依赖这种计数查询。`

_查询数量限定的方法 `Limit(int)` 在 Count() 中不会生效。_

### 关系查询

LeanCloud 支持用关系 `LCRelation` 关联 2 个对象，当然也支持用关系查询来获取相关联的对象。

```cs
LCObject girlType = new LCObject("GirType");
girlType["typeName"] = "Hot";
girlType["ageMax"] = 27;
girlType["ageMin"] = 18;
LCObject beckham = new LCObject("Boy");
beckham["name"] = "David Beckham";
beckham["age"] = 38;
beckham["focusType"] = girlType;
// 保存beckham的时候会自动将girlType也保存到服务器。
await beckham.Save();

LCQuery<LCObject> boyQuery = new LCQuery<LCObject>("Boy")
    .WhereEqualTo("focusType", girlType);
ReadOnlyCollection<LCObject> boys = boyQuery.Find();
```

关系的内嵌查询可以帮助开发者用简洁的代码处理复杂的关系内嵌查询，比如要查询`查询所有关注了年龄小于27岁女生类型的那些男生们`：

```cs
LCQuery<LCObject> girlTypeQuery = new LCQuery<LCObject>("GirType")
    .WhereLessThan("ageMax", 27); // 年龄小于 27 的萌妹纸
LCQuery<LCObject> query = new LCQuery<LCObject>("Boy")
    .WhereMatchesQuery("focusType", girlTypeQuery); // 找出喜欢这些类型的男生们
```

请注意，默认的 limit 限制 100 也同样作用在内嵌查询上。因此如果是大规模的数据查询，你可能需要仔细构造你的查询对象来获取想要的行为。反之，不想匹配某个子查询，你可以使用 `WhereDoesNotMatchQuery` 方法，代码不再敖述。

查询已经选择了喜欢的类型的男生，并且是限定在最近 10 个加入系统的男生，可以如此做：

```cs
LCQuery<LCObject> query = new LCQuery<LCObject>("Boy")
    .OrderByDescending("createdAt")
    .Limit(10)
    .Include("focusType");
```

你可以使用 dot（英语句号:"."）操作符来多层 Include 内嵌的对象。比如，你还想进一步获取 `GirType` 所关联的女生（就是那些标明了自己隶属于这个类型的女生）：

```cs
query.Include("focusType.girls");
```

## 用户

移动互联时代，把握住用户是核心的价值，任何一款 APP 都或多或少需要了解用户并且可能为用户建立一定的关系。例如，在社交软件中最基本就是要求用户注册和登录，哪怕是利用第三方（微博，QQ）API 登录，都应该为用户在当前系统中再注册一次。LeanCloud 已经在 SDK 中内嵌了关于用户这个较为特殊的对象的一些最基本的操作和数据服务。

### 注册

注册用户在 LeanCloud SDK 中极为简单，看如下实例代码：

```cs
var user = new LCUser();
user.Username = "demoUser";
user.Password = "avoscloud";
user.Email = "xxx@xxx.com";
await user.SignUp();
var uid = user.ObjectId;
```

以上代码就可以很快的注册为当前的应用注册一个用户，并且这个用户也会有一个唯一的 `ObjectId`。
**用户的密码在数据管理界面是无法显示的，这是因为服务端存储的并不是明文，是通过不可逆的特殊算法加密后的字符串**
{% if node != 'qcloud' and node != 'us' %}

### 手机号注册

为了适应移动互联时代的需求，我们特地增加了手机号注册的功能，当然前提是会进行短信认证，就如同微信一样，注册的时候会发送 6 位数字的验证码到用户输入的手机上，然后再回调我们的验证接口就可以完成一次手机号的注册。
在「控制台 > 存储 > 用户 > 设置」中可以开启这一个功能。

- 从客户端注册或更新手机号时，向注册手机号码发送验证短信
- 重置密码时，必须提供旧密码

如下一个简单的案例：

```cs
// 第一步先注册
var user = new LCUser();
user.Username = "WPUser";
user.Password = "avoscloud";
user.MobilePhoneNumber = "18688888888";
await user.SignUp();
// 如此做，短信就会发送到指定的手机号
```

以上完成之后，需要给用户一个输入界面，让用户输入收到的 6 位数字的验证码，然后再运行如下代码：

```cs
// 第二步回调认证
await LCUser.VerifyMobilePhone(code, mobilePhoneNumber); // code 代表 6 位数字的验证码
```

以上两步，就是一个完整的手机号注册流程。
{% endif %}

### 登录

登录是一个 `LCUser` 的静态方法，通过如下代码可以实现登录，登录之后，SDK 会默认将此次登录的用户设置为 `LCUser.currentUser`：

```cs
var userName = "demoUser";
var pwd = "avoscloud";
try {
    await LCUser.Login(userName, pwd);
    // 登录成功
} catch (LCException e) {
    // 登录失败，可以查看错误信息。

}
```

#### 手机号和密码登录

在短信服务上线之后，只要是<u>通过认证</u>的手机号可以当做用户名在 LeanCloud 服务端进行登录，自然 SDK 里面也加入了相应的支持（WP SDK 自 V1.1.0 以及以后的版本都有支持）。它的调用与用户名登录一样，只是方法名字不一样，代码如下:

```cs
LCUser user = await LCUser.LoginByMobilePhoneNumber(mobilePhone, password);
// 这里可以拿到登录之后的 LCUser，但是实际上 LCUser.CurrentUser 已经是当前登录的用户了。
// 这里提供返回值是为了使链式表达式脱离对全局变量的依赖，当然大部分情况下 LCUser.CurrentUser 应该已经可以满足一般的需求。
```

{% if node != 'qcloud' and node != 'us' %}

#### 手机号和短信验证码登录

在对客户端验证要求比较高的应用里面，也许有些应用要求支持短信随机的验证码作为临时的密码登录，这个应用场景在现在已经被普遍的采用了，这种验证机制被认为是安全性高的一种机制，自然 LeanCloud 也给予了支持。它比前 2 种静态登录的方法多了`发送短信验证码`这一步，具体代码如下：

```cs
// 第一步，请求服务端发送 6 为数字的验证码到指定 mobilePhoneNumber 上。
try {
    await LCUser.RequestLoginSmsCode(mobilePhoneNumber);
    // 判断返回值可以判断是否发送成功，不成功会抛出带有 error 的 LCException.
    // 在处理这种容易因为用户输入不合法而产生的异常的时候，为了保证程序的正常运行，建议使用 try/catch 机制进行提前的异常处理。
} catch(LCException e) {

}
```

```cs
// 第二步，直接使用验证码登录，如果验证码输入错误也会抛出异常。
try {
    await LCUser.LoginBySmsCode(mobilePhoneNumber, code);
} catch(LCException e) {

}
```

{% endif %}

### 邮箱认证

在移动互联时代，任何一个用户信息都是必须在双方统一认证之后才会被视为一种安全机制，比如邮箱的认证，同样，在 `LCUser` 这个特殊的 `LCObject` 拥有一个特殊字段 `email`，可以在 **数据管理** 的 `_User` 表看到这个默认的字段，这就是在注册时提供的邮箱。在 **控制台 > 存储 > 设置 > 用户账号** 中勾选 **用户注册邮箱或者更新邮箱时，发送验证邮件**，这样在注册用户的时候，LeanCloud 默认就会发送一封邮件，进行验证，邮件的模板也可以在邮件模板中进行设置。

注意，验证过的用户，TA 的 `emailVerified` 将会置成 `true`，反之 `false`，但是如果<u>未启用</u>注册用户邮箱验证，这个字段会为空。

### 手机号认证

相对于邮箱认证，手机号认证的过程稍微需要多一点代码，如果当您的应用在注册的时候没有开启短信验证，伴随业务发展，发现需要验证用户的手机，LeanCloud 正好提供了这一接口。

```cs
// 调用的前提是，该手机号已经与已存在的用户有关联（_User 表中的 mobilePhoneNumber 即可关联手机，至于如何关联取决于客户端的业务逻辑）
await LCUser.RequestMobilePhoneVerify("18688888888");
// 这样就成功的发送了验证码
```

回调认证的接口与 [手机号注册](#手机号注册) 小节的第二步一样。

验证成功后，用户的 `mobilePhoneVerified` 属性变为 true，并且调用云引擎的 `AV.Cloud.onVerifed('sms', function)` 方法。

除了在用户绑定、修改手机号**之后**进行验证，LeanCloud 也支持在用户绑定或修改手机号**之前**先通过短信验证。
也就是说，绑定手机号或修改手机号时先请求发送验证码（用户需处于登录状态），再凭短信验证码完成绑定或修改操作。

```cs
await LCUser.RequestSMSCodeForUpdatingPhoneNumber("+8618200008888");

await LCUser.VerifyCodeForUpdatingPhoneNumber("+8618200008888", "123456");
// 更新本地数据
var user = await LCUser.GetCurrent();
user.Mobile = "+8618200008888";
```

<div class="callout callout-info">以上只是针对 `_User` 表的一个属性 `mobilePhoneNumber` 进行验证，但是存在另一种需求，类似于支付宝在进行交易的时候会要求进行实时的短信认证，这一机制现在已经普遍存在于各种应用中进行敏感操作的首选，并不局限于注册登录这种通用功能，LeanCloud 也提供了这一机制。</div>

#### 手机短信针对应用自定义操作的验证

`AVCloud` 类包含了相关的静态方法，实例如下：

```cs
// 第一步，先请求发送，如果手机号无效则会发送失败。
await LCSMSClient.RequestSMSCode("18688888888");
```

如果开发者想简单地自定义短信的内容，可以调用另外一个版本，如下：

```cs
await LCSMSClient.RequestSMSCode("18688888888", "PP打车", "叫车服务", "8");
```

用户就会收到如下短信：

<samp class="bubble">您正在使用 PP 打车 服务进行 叫车服务，您的验证码是 012345，请在 8 分钟之内完成验证。</samp>

以上是调用发送，下一步就是验证。

```cs
try {
    await LCSMSClient.VerifyMobilePhone(mobileNumber, code);
    // 验证成功
} catch (LCException e) {
    // 验证失败
}
```

##### 语音短信验证码

文本短信验证码在到达率上有一定的风险，尽管经过我们长期得到的用户反馈，到达率已接近 100%，但是有些应用的时效性和安全性要求极高，所以我们也推出了语音短信验证码的服务，调用的方式如下：

```cs
await LCSMSClient.RequestVoiceCode("18688888888");
```

发送成功之后，用户的手机就会收到一段语音通话，它会播报 6 位数的验证码，然后开发者需要再次调用：

```cs
await LCSMSClient.VerifyMobilePhone("18688888888", "012345");
```

再次验证用户输入的验证码是否正确。

### 当前用户

诚如所有移动应用一样当前用户一直是被在客户端视作持久化存储处理，比如手机 QQ 等流行的 App，LeanCloud 必然也会如此为开发者解决持久化存储当前用户，只要调用了`登录`相关的接口，当前用户就会被持久化存储在客户端。

```cs
var user = await LCUser.GetCurrent();
```

如果调用了登出接口，那么当前用户就会被清除，并置为`null`：

```cs
await LCUser.LogOut();
var user = await LCUser.GetCurrent();	// 如此做就会抛出异常，因为登出之后，currentUser 已经为空。
```

### 重置密码

#### 邮箱重置

密码管理一直是移动应用的比较通用又比较繁琐的事情，LeanCloud 也为开发者提供了一套通用的解决方案，将开发者从繁琐中解脱出来。
当用户忘记密码的时候，开发者完全可以在客户端做一个简单的按钮，然后做一些友好的页面，但是真正实现重置密码的功能只需要如下一段代码：

```cs
await LCUser.RequestPasswordReset(user.Email);
```

这样服务端就会再次发送重置密码的邮件，开发者只要引导用户登录邮箱，进行操作就完成了。

{% if node != 'qcloud' and node != 'us' %}

#### 短信验证码重置

如果用户的手机是有效地，并且已经通过了验证码验证手机的有效性，那么开发者可以提供另一种在手机上体验较好的方式：通过短信验证码重置密码。具体实例如下：
首先，需要发送一个请求到服务端去发送 6 位数的验证码：

```cs
//只需要手机号即可，服务端会自动寻找与之匹配的用户，如果没有用户与此手机号绑定，将会提示错误信息。
await LCUser.RequestPasswordResetBySmsCode("138012345678");
```

发送之后，再给一个界面给用户，让用户输入 6 位数的短信验证码，并且同时输入新的密码，然后如下调用：

```cs
// 第一个参数是新密码（明文传递，请放心我们传输的时候做了加密，并且在服务端也绝不可能明文存储），第二个参数是上一步发送到用户手机的6位数验证码。
await LCUser.ResetPasswordBySmsCode(NewPassword,SMSCode);
```

这样 2 步就可以重置密码，这项功能我们建议在一些应用内操作比较频繁的应用使用，邮箱重置的话可能需要用户去单独打开一个邮箱应用或者用浏览器跳转。
{% endif %}

### 查询用户

请注意，**新创建应用的 `_User` 表的查询权限默认是关闭的**，通常我们推荐你在云引擎里封装用户查询，只查询特定条件的用户，避免开放用户表的全部查询权限。此外，你可以通过 class 权限设置打开查询权限，请参考 [数据与安全 - Class 级别的权限](data_security.html#Class_级别的_ACL)。

用户既然是个特殊的 `LCObject`，它当然也具备了 `LCObject` 的一些共同特性，很多场景下，关于用户的操作，首先就是通过条件查询，把符合特定条件的用户查询到客户端进行展现或者一些修改之类的操作。

```cs
ReadOnlyCollection<LCUser> women = await LCUser.GetQuery()
    .WhereEqualTo("gender", "female")
    .Find();
```

当然，也可以通过 `Get` 方法通过 `ObjectId` 获取特定的一个 `LCUser`。

### 用户安全数据的认证规则

很多时候，就算是开发者也不要轻易修改用户的基本信息，比如用户的一些比较敏感的个人信息，例如手机号，社交账号等，这些都应该让用户在 App 中自行修改，所以为了用户数据的数据有且仅有自己在登录的情况下得以修改，LeanCloud 服务端对所有针对 `LCUser` 对象的数据做了验证。

```cs
LCUser user = await LCUser.Login("demoUser", "asvscloud");
user = t.Result;
user.Username = "testUser"; // 修改用户名
await user.Save();

// 在登录之后，提交修改用户相关字段（密码除外），都会成功。
await LCUser.LogOut();

try {
    // 通过 Id 获取这个用户，注：如此做并未使当前用户登录。
    user = await LCUser.GetQuery().Get(user.ObjectId);
    user.Username = "devUser";
    await user.Save();
} catch (LCException e) {
    // 显然，如此做就会失败，因为单单从Id获取用户，当前的请求不具备权限去修改这个用户的相关属性。
}
```

## ACL 权限控制

任何一个成熟的并且可控的系统中，必然会存在权限控制的问题，经典的案例就是论坛的斑竹可以删帖而普通游客只能看帖，如此一来，发展出来的[基于角色的访问控制](http://zh.wikipedia.org/wiki/%E4%BB%A5%E8%A7%92%E8%89%B2%E7%82%BA%E5%9F%BA%E7%A4%8E%E7%9A%84%E5%AD%98%E5%8F%96%E6%8E%A7%E5%88%B6)被普遍应用于各类传统的软件中，即便是互联网时代的今天，它依然是可以很简便地帮助开发者以及使用者理解和应用。

基于以上这一点，LeanCloud 在开发者创建一个应用的时候，默认地在服务端为该应用添加了一张 `_Role` 的表，开发者可以在数据管理中看到这张表。

### 默认访问权限

在没有显式指定的情况下，LeanCloud 中的每一个对象都会有一个默认的 ACL 值。这个值代表了，所有的用户，对这个对象都是可读可写的。此时你可以在数据管理的表中 ACL 属性中看到这样的值:

```cs
{"*":{"read":true,"write":true}}
```

在.NET SDK 中创建符合默认的开放读写权限的 `LCACL` 的代码如下：

```cs
var defaultACL = new LCACL();
defaultACL.PublicWriteAccess = true;
defaultACL.PublicReadAccess = true;
```

### 指定用户访问权限

当一个用户在实现一个网盘类应用时，针对不同文件的私密性，用户就需要不同的文件访问权限。 譬如公开的文件，每一个其他用户都有读的权限，然后仅仅只有创建者才拥有更改和删除的权限。

```cs
byte[] data = System.Text.Encoding.UTF8.GetBytes("LeanCloud is a great cloud service!");
LCFile file = new LCFile("mytxtFile.txt", data);
file.AddMetaData("author", "LeanCloud");
LCObject book = new LCObject("book");
book["content"] = file;

LCACL acl = new LCACL();
acl.PublicReadAccess = true;
acl.SetUserWriteAccess(LCUser.CurrentUser, true);
book.ACL = acl;
await book.Save();
```

### 指定角色访问权限

#### 角色

`LCRole` 拥有一些默认的属性，当然它也是一个 `LCObject`，自然开发者也可以为角色添加业务逻辑所需的字段。

- `name` : `string` 类型，角色的名称，并且这是创建角色的`必须字段`，并且`唯一`，并且只在创建时赋值，不能被`修改`，命名必须由字母，连接符，下划线组成，这个字段可视为主键。
- `users` : `LCACL` 类型，它指向所有拥有（即`单用户可以拥有多角色`的系统）这个`角色`的用户。
- `roles` : `LCACL` 类型，它指向所有该角色的子角色，`子角色自动继承父角色的所有权限`。关于这一点下一节会做详细阐述。

#### LCUser 与 LCRole 的从属关系

指定用户访问权限虽然很方便，但是依然会有局限性。 以工资系统为例，一家公司的工资系统，工资最终的归属者和公司的出纳们只拥有工资的读权限，而公司的人事和老板才拥有全部的读写权限。当然你可以通过多次设置指定用户的访问权限来实现这一功能（多个用户的 ACL 设置是追加的而非覆盖）。

```cs
LCObject salary = new LCObject("salary");
salary["value"] = 2000000;

LCUser boss = new LCUser(); // 假设此处为老板
LCUser hrWang = new LCUser();  // 人事小王
LCUser me = new LCUser(); // 我们就在文档里爽一爽吧
LCUser cashierZhou = new LCUser(); // 出纳老周

LCACL acl = new LCACL();
acl.SetUserReadAccess(boss, true);
acl.SetUserReadAccess(hrWang, true);
acl.SetUserReadAccess(me, true);
acl.SetUserReadAccess(cashierZhou, true);

acl.SetUserWriteAccess(boss, true);
acl.SetUserWriteAccess(hrWang, true);
salary.ACL = acl;
await salary.Save();
```

但是这些涉及其中的人可能不止一个，也有离职换岗新员工的问题存在。这样的代码既不优雅，也太啰嗦, 同样会很难维护。 这个时候我们就引入了 `LCRole` 来解决这个问题。 公司的员工可以成百上千，然而一个公司组织里的角色却能够在很长一段时间时间内相对稳定。

```cs
LCObject salary = new LCObject("salary");
salary["value"] = 2000000;

var roleACL = new LCACL();
roleACL.PublicReadAccess = true; // LCRole 本身在创建之后，就尽量避免它被修改，这里是为了设定 LCRole 自身的 ACL 访问限制。

// 以下这些角色只为示意，如要正确执行本段代码，以下这些 LCUser 必须是已经存在于服务端的数据。
LCUser boss = new LCUser(); // 假设此处为老板
LCUser hrWang = new LCUser();  // 人事小王
LCUser me = new LCUser(); // 我们就在文档里爽一爽吧
LCUser cashierZhou = new LCUser(); // 出纳老周
LCUser cashierGe = new LCUser(); // 出纳小葛

LCRole hr = LCRole.Create("hr", roleACL);
LCRole cashier = LCRole.Create("cashier", roleACL);

hr.AddRelation("users", hrWang);

cashier.AddRelation("users", cashierZhou);
cashier.AddRelation("users", cashierGe);

var saveUsersTask = new List<Task> { hr.Save(), cashier.Save() };
await Task.WhenAll(saveUsersTask);

LCACL acl = new LCACL();
acl.SetUserReadAccess(boss, true);
acl.SetUserReadAccess(me, true);

acl.SetRoleReadAccess(hr, true);
acl.SetRoleReadAccess(cashier, true);

acl.SetUserWriteAccess(boss, true);
acl.SetRoleWriteAccess(hr, true);

await salary.Save();
```

#### LCRole 之间的从属关系

在讲清楚了用户与角色的关系后，我们还有一层角色与角色之间的关系。用下面的例子来理解可能会对我们有所帮助：

一家创业公司有移动部门，部门下面有不同的小组，Android 和 iOS。而每个小组只拥有自己组的代码的读写权限。但是他们同时拥有核心库代码的读取权限。

```cs
var roleACL = new LCACL();
roleACL.PublicReadAccess = true; // LCRole 本身在创建之后，就尽量避免它被修改，这里是为了设定 LCRole 自身的 ACL 访问限制。

LCRole androidTeam = new LCRole("androidTeam", roleACL);
LCRole iOSTeam = new LCRole("iOSTeam", roleACL);
LCRole mobileDep = new LCRole("mobileDep", roleACL);

LCObject androidCode = new LCObject("code");
androidCode["name"] = "android";

LCObject iOSCode = new LCObject("code");
iOSCode["name"] = "ios";

LCObject coreCode = new LCObject("code");
coreCode["name"] = "core";

var saveTeamTasks = new List<Task> {
    androidTeam.Save(),
    iOSTeam.Save()
};
await Task.WhenAll(saveTeamTasks);

mobileDep.AddRelation("roles", androidTeam);
mobileDep.AddRelation("roles", iOSTeam);
await mobileDep.Save();

var saveCodeTasks = new List<Task> {
    androidCode.Save(),
    iOSCode.Save(),
    coreCode.Save()
};
await Task.WhenAll(saveCodeTasks);

// androidCode 的读写权限对 androidTeam 开放
androidCode.ACL.SetRoleReadAccess(androidTeam, true);
androidCode.ACL.SetRoleWriteAccess(androidTeam, true);

// iOSCode 的读写权限对 iOSTeam 开放
iOSCode.ACL.SetRoleReadAccess(iOSTeam, true);
iOSCode.ACL.SetRoleWriteAccess(iOSTeam, true);

// coreCode对mobileDep 开放读取权限，注意，mobileDep 本身就已经包含了 iOSTeam和androidTeam 作为它的子角色
coreCode.ACL.SetRoleReadAccess(mobileDep, true);

var saveCodeTasks = new List<Task> {
    androidCode.Save(),
    iOSCode.Save(),
    coreCode.Save()
};
await Task.WhenAll(saveCodeTasks);
// 所有操作全部完成。
```

## 文件

### 上传文件

LCFile 可以让你的应用程序将文件存储到服务器中，比如常见的文件类型图像文件、影像文件、音乐文件和任何其他二进制数据都可以使用。
在这个例子中，我们将一段文本保存到服务器端：

```cs
byte[] data = System.Text.Encoding.UTF8.GetBytes("LeanCloud is a great cloud service!");
LCFile file = new LCFile("mytxtFile.txt", data);
file.AddMetaData("author", "LeanCloud");
await file.Save();
```

LCFile 构造函数的第一个参数指定文件名称，第二个构造函数接收一个 byte 数组，也就是将要上传文件的二进制。可以通过 `AddMetaData` 自定义元数据，比如你可以把文件的作者的名字当做元数据存入这个字典，LeanCloud 的服务端会把它保留起来，这样在以后获取的时候，这种类似的自定义元数据都会被获取。

### 本地文件

在 .NET SDK 中，如果很清楚地知道某一个文件所存在的路径，比如在游戏中上传一张游戏截图到 LeanCloud 中，可以通过 SDK 直接获取指定的文件，上传到 LeanCloud 中。

```cs
LCFile localFile = new LCFile("screenshot.PNG", Path.Combine("<Local Folder Path>", "screenshot.PNG"));
```

之后的操作与上一节类似。

### 文件元信息

LCFile 默认会存储文件大小和文件上传者 ObjectId 作为元信息。同样的，我们提供了一个字典接口帮助开发者可以为任意文件添加任意符合字典命名规则的自定义元数据。在本小节的第一个例子了已经为文件添加了一个自定义的元数据：

```cs
LCFile file = new LCFile("mytxtFile.txt", data);
file.AddMetaData("author", "LeanCloud");
```

这个就是简单的用法，在创建文件的时候，可以指定一组字典去保留文件的自定义元数据。

你还可以在上传前自动一些元信息保存起来，以便后续获取，例如我们还保存图片的高度和宽度：

```cs
file.AddMetaData("width", 100);
file.AddMetaData("height", 100);
```

### 删除文件

**删除文件就意味着，执行之后在数据库中立刻删除记录，并且原始文件也会从存储仓库中删除（所有涉及到物理级别删除的操作请谨慎使用）**

```cs
await file.Delete();
```

## 调用云引擎

云引擎是 LeanCloud 提供给开发者自定义服务端逻辑的解决方案，例如想在用户注册的时候，服务端统一给用户分配随机的昵称，这一操作就可以用云引擎实现。具体关于云引擎的一些相关概念和操作可以先查看 [云引擎指南](leanengine_cloudfunction_guide-node.html)。

调用云引擎在 SDK 中比较方便，它是 `AVCloud` 的静态方法，全局均可调用。

```cs
var dict = new Dictionary<string, object>();
dict.Add("name", "Justin");
//...
//增加参数
//...
//...
await LCCloud.Run("TestFunctionName", dict);
```

只需要传入云引擎中函数的名字和这个函数需要参数即可，如果是无参的函数，直接传入 `null` 即可。

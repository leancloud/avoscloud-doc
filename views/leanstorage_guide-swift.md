{# 指定继承模板 #}
{% extends "./leanstorage_guide.tmpl" %}

{# --Start--变量定义，主模板使用的单词和短语在所有子模板都必须赋值 #}
{% set cloudName ="LeanCloud" %}
{% set productName ="LeanStorage" %}
{% set platform_title ="Swift" %}
{% set segment_code ="swift" %}
{% set sdk_name ="Swift SDK" %}
{% set baseObjectName ="LCObject" %}
{% set objectIdName ="objectId" %}
{% set updatedAtName ="updatedAt" %}
{% set createdAtName ="createdAt" %}
{% set backgroundFunctionTemplate ="xxxxInBackground" %}
{% set saveEventuallyName ="saveEventually" %}
{% set deleteEventuallyName ="deleteEventually" %}
{% set relationObjectName ="LCRelation" %}
{% set pointerObjectName ="LCPointer" %}
{% set baseQueryClassName ="LCQuery" %}
{% set geoPointObjectName ="LCGeoPoint" %}
{% set userObjectName ="LCUser" %}
{% set fileObjectName ="LCFile" %}
{% set dateType= "NSDate" %}
{% set byteType= "NSData" %}
{% set link_to_acl_doc ="[iOS / OS X 权限管理使用指南](acl_guide-ios.html)"%}
{% set funtionName_whereKeyHasPrefix = "whereKey:hasPrefix:" %}
{% set saveOptions_query= "where" %}
{% set saveOptions_fetchWhenSave= "fetch_when_save" %}

{# --End--变量定义，主模板使用的单词和短语在所有子模板都必须赋值 #}

{# --Start--主模板留空的代码段落，子模板根据自身实际功能给予实现 #}

{% block code_create_todo_object %}

```swift
    // className 参数对应控制台中的 Class Name
     let todo = LCObject(className: "Todo")
```
{% endblock %}

{% block code_save_object_by_cql %}

```swift
    // 执行 CQL 语句实现新增一个 TodoFolder 对象
    LeanCloud.CQLClient.execute("insert into TodoFolder(name, priority) values('工作', 1)") { (result) in
        if(result.isFailure){
            print(result.error)
        } else {
            if(result.objects.count > 0){
                let todoFolder = result.objects[0]
                // 打印 objectId
                print("objectId",todoFolder.objectId?.value)
            }
        }
    }

//https://github.com/leancloud/Swift-Sample-Code/blob/master/Swift-Sample-CodeTests/LCObject%23saveByCQL.swift
```
{% endblock %}

{% block code_quick_save_a_todo %}

```swift
    // className 参数对应控制台中的 Class Name
    let todo = LCObject(className: "Todo")
    todo.set("title", object:"工作")
    todo.set("content", object: "每周工程师会议，周一下午2点")
    
    todo.save { result in
      // 读取 result.isSuccess 可以判断是否操作成功
    }
```
{% endblock %}

{% block code_quick_save_a_todo_with_location %}

```swift
    // className 参数对应控制台中的 Class Name
    let todo = LCObject(className: "Todo")
    todo.set("title", object:"工作")
    todo.set("content", object: "每周工程师会议，周一下午2点")
    // 设置 location 的值为「会议室」
    todo.set("location", object: "会议室")
    
    todo.save { result in
      // 读取 result.isSuccess 可以判断是否操作成功
      
    }
```
{% endblock %}

{% block code_save_todo_folder %}

```swift
    // className 参数对应控制台中的 Class Name
    let todoFolder = LCObject(className: "TodoFolder")
    todoFolder.set("name", object:"工作")
    todoFolder.set("priority", object: 1)
    
    // 保存到云端
    todoFolder.save { result in
    }
```
{% endblock %}
{% block section_saveOptions %}{% endblock %}
{% block code_saveoption_query_example %}
{% endblock %}

{% block code_get_todo_by_objectId %}

```swift
    let query = LCQuery(className: "Todo")
    query.get("575cf743a3413100614d7d75", completion: { (result) in
        if(result.isSuccess) {
            let todo = result.object
            print(todo?.objectId?.value)
            print( todo?.get("title"))
        }
    })
```
{% endblock %}

{% block code_fetch_todo_by_objectId %}

```swift
    let todo = LCObject(className: "Todo", objectId: "575cf743a3413100614d7d75")
    
    todo.fetch({ (result ) in
        if(result.error != nil){
            print(result.error)
        }
        // 读取 title 属性
        let title = todo.get("title")
        // 读取 content 属性
        let content = todo.get("content")
    })
```

{% endblock %}

{% block code_save_callback_get_objectId %}

```swift
    let todo = LCObject(className: "Todo")
    todo.set("title", object: "工程师周会")
    todo.set("content", object: "每周工程师会议，周一下午2点")
    todo.set("location", object: "会议室")
    
    todo.save { (result) in
        if(result.isSuccess){
            print(todo.objectId)
        } else {
            // 失败的话，请检查网络环境以及 SDK 配置是否正确
        }
    }
```
{% endblock %}

{% block code_access_todo_folder_properties %}

```swift
    let query = LCQuery(className: "Todo")
    query.get("558e20cbe4b060308e3eb36c") { (result) in
        // todoObj 就是 id 为 558e20cbe4b060308e3eb36c 的 Todo 对象实例
        let todoObj = result.object
        let location = todoObj?.get("location") as! LCString
        let title = todoObj?.get("title") as! LCString
        let content = todoObj?.get("content") as! LCString
        
        // 获取三个特性
        let objectId = todoObj?.objectId
        let updatedAt = todoObj?.updatedAt
        let createdAt = todoObj?.createdAt
    }
```
{% endblock %}

{% block text_refresh_object %}{% endblock %}

{% block code_object_fetch %}

> TODO

{% endblock %}

{% block code_object_fetchWhenSave %}

> TODO

{% endblock %}


{% block code_object_fetch_with_keys %}

> TODO

{% endblock %}

{% block code_update_todo_location %}

```swift
    let todo = LCObject(className: "Todo")
    todo.set("title", value: LCString("工程师周会"))
    todo.set("content", value: LCString("每周工程师会议，周一下午2点"))
    todo.set("location", value: LCString("会议室"))
    todo.save { (result) in
        // 存储成功
        if(result.isSuccess){
            // 修改地址
            todo.set("location", value: LCString("二楼大会议室"))
            // 保存修改
            todo.save { _ in }
        }
    }
```
{% endblock %}

{% block code_update_todo_content_with_objectId %}

```swift
    let todo = LCObject(className: "Todo", objectId: "575cf743a3413100614d7d75")
    todo.set("content", object: "每周工程师会议，本周改为周三下午3点半。")
    
    todo.save({ (result) in
        if(result.isSuccess){
            print("保存成功")
        }
    })
```

{% endblock %}

{% block code_update_object_by_cql %}

```swift
    LeanCloud.CQLClient.execute("update TodoFolder set name='家庭' where objectId='575d2c692e958a0059ca3558'", completion: { (result) in
        if(result.isSuccess){
            // 成功执行了 CQL
        }
    })
```
{% endblock %}

{% block code_atomic_operation_increment %}

```swift
    let todo = LCObject(className: "Todo", objectId: "575cf743a3413100614d7d75")
    todo.set("views", object: 50)
    todo.save({ (saveResult) in
        todo.increase("views", by: LCNumber(1));
        todo.save({ (increaseResult) in
            if(increaseResult.isSuccess){
                print(todo.get("views"))
            }
        })
    })
```
{% endblock %}

{% block code_atomic_operation_array %}

* `append(String, element: LCType)`<br>
  将指定对象附加到数组末尾。
* `append(String, element: LCType, unique: Bool)`<br>
   将指定对象附加到数组末尾，并且可以设置一个 `unique` 的 `bool` 值表示只是确保唯一，不会重复添加
* `append(String, elements: [LCType])`<br>
   将指定对象数组附加到数组末尾。
* `append(String, elements: [LCType], unique: Bool)`<br>
   将指定对象附加到数组末尾，并且可以设置一个 `unique` 的 `bool` 值表示只是确保唯一，不会重复添加
* `remove(String, element: LCType)`<br>
   从数组字段中删除指定的对象。
* `remove(String, elements: [LCType])`<br>
   从数组字段中删除指定的对象数组。

{% endblock %}

{% block code_set_array_value %}

```swift
func getDateWithDateString(dateString:String) -> LCDate {
    let dateStringFormatter = NSDateFormatter()
    dateStringFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
    dateStringFormatter.locale = NSLocale(localeIdentifier: "en_US_POSIX")
    let date = dateStringFormatter.dateFromString(dateString)!
    let lcDate = LCDate(date);
    return lcDate;
}

func testSetArray() {

    let renminder1 = self.getDateWithDateString("2015-11-11 07:10:00")
    let renminder2 = self.getDateWithDateString("2015-11-11 07:20:00")
    let renminder3 = self.getDateWithDateString("2015-11-11 07:30:00")
    
    let reminders = LCArray(arrayLiteral: renminder1,renminder2,renminder3)
    
    let todo = LCObject(className: "Todo")
    todo.set("reminders", value: reminders)
    
    todo.save({ (result) in
        // 新增一个闹钟时间
        let todo4 = self.getDateWithDateString("2015-11-11 07:40:00")
        // 使用 append 方法添加
        todo.append("reminders", element: todo4, unique: true)
        todo.save({ (updateResult) in
            if(result.isSuccess){
                // 成功执行了 CQL
            }
        })
    })
}

//https://github.com/BenBBear/cordova-plugin-leanpush
```
{% endblock %}
{% block text_batch_operation %}{% endblock %}
{% block code_batch_operation %}

```swift
暂不支持                    
```
{% endblock %}

{% block code_batch_set_todo_completed %}

```swift
暂不支持
```

{% endblock %}

{% block text_work_in_background %}
### 后台运行
细心的开发者已经发现，在所有的示例代码中几乎都是用了异步来访问 {{productName}} 云端，如下代码：

```swift
    todo.save({ (result) in
        if(result.isSuccess){
            // 操作成功
        }
    })
``` 
上述用法都是提供给开发者在主线程调用用来实现后台运行的方法，因此开发者可以放心地在主线程调用这种命名方式的函数。另外，需要强调的是：**回调函数的代码是在主线程执行。**
{% endblock %}

{% block code_delete_todo_by_objectId %}

```swift
    // 调用实例方法删除对象
    todo.delete { (result) in
        if(result.isSuccess){
            // 根据 result.isSuccess 可以判断是否删除成功
        } else {
            if (result.error != nil){
                print(result.error?.reason)
                // 如果删除失败，可以查看是否当前正确使用了 ACL
            }
        }
    }
```
{% endblock %}

{% block code_delete_todo_by_cql %}

```swift
    // 执行 CQL 语句实现删除一个 Todo 对象
    LeanCloud.CQLClient.execute("delete from Todo where objectId='558e20cbe4b060308e3eb36c'") { (result) in
        if(result.isSuccess){
            // 删除成功
        } else {
            // 删除失败，打印错误信息
            print(result.error?.reason)
        }
```
{% endblock %}

{% block save_eventually %}{% endblock %}


{% block code_relation_todoFolder_one_to_many_todo %}

```swift
    // 以下代码需要同步执行
    // 新建一个 TodoFolder 对象
    let todoFolder = LCObject(className: "TodoFolder")
    todoFolder.set("name", object: "工作")
    todoFolder.set("priority", object: 1)
    todoFolder.save()
    
    // 新建 3 个 Todo 对象
    let todo1 = LCObject(className: "Todo")
    todo1.set("title", object: "工程师周会")
    todo1.set("content", object: "每周工程师会议，周一下午2点")
    todo1.set("location", object: "会议室")
    todo1.save()
    
    let todo2 = LCObject(className: "Todo")
    todo2.set("title", object: "维护文档")
    todo2.set("content", object: "每天 16：00 到 18：00 定期维护文档")
    todo2.set("location", object: "当前工位")
    todo2.save()
    
    let todo3 = LCObject(className: "Todo")
    todo3.set("title", object: "发布 SDK")
    todo3.set("content", object: "每周一下午 15：00")
    todo3.set("location", object: "SA 工位")
    todo3.save()
    
    // 使用接口 insertRelation 建立 todoFolder 与 todo1,todo2,todo3 的一对多的关系
    todoFolder.insertRelation("containedTodos", object: todo1)
    todoFolder.insertRelation("containedTodos", object: todo2)
    todoFolder.insertRelation("containedTodos", object: todo3)
    
    todoFolder.save()
    
    // 保存完毕之后，读取 LCRelation 对象
    let relation : LCRelation = todoFolder.get("containedTodos")
```
{% endblock %}

{% block code_pointer_comment_one_to_many_todoFolder %}

```swift
    // 新建一条留言
    let comment = LCObject(className: "Comment")
    // 如果点了赞就是 1，而点了不喜欢则为 -1，没有做任何操作就是默认的 0
    comment.set("like", object: 1)
    // 留言的内容
    comment.set("content", object: "这个太赞了！楼主，我也要这些游戏，咱们团购么？")
    
    // 假设已知了被分享的该 TodoFolder 的 objectId 是 5590cdfde4b00f7adb5860c8
    let todoFolder = LCObject(className: "TodoFolder", objectId: "5590cdfde4b00f7adb5860c8")
    comment.set("targetTodoFolder", object: todoFolder)
    // 以上代码的执行结果是在 comment 对象上有一个名为 targetTodoFolder 属性，它是一个 Pointer 类型，指向 objectId 为 5590cdfde4b00f7adb5860c8 的 TodoFolder
    comment.save {_ in}
```
{% endblock %}

{% block code_create_geoPoint %}

```swift
  let leancloudOffice  = LCGeoPoint(latitude: 39.9, longitude: 116.4)
```
{% endblock %}

{% block code_use_geoPoint %}

```swift
  todo.set("whereCreated", object: leancloudOffice)
```
{% endblock %}

{% block code_serialize_baseObject_to_string %}

```swift
    let todoFolder = LeanCloud.LCObject(className: "TodoFolder")
    todoFolder.set("priority", object: 1)
    todoFolder.set("name", object: "工作")
    todoFolder.set("owner", object: LCUser.current)
    
    let serializeObject = NSKeyedArchiver.archivedDataWithRootObject(todoFolder)
    // serializeObject 可以存在本地当做缓存或者作为参数传递
```
{% endblock %}

{% block code_deserialize_string_to_baseObject %}

```swift
    // 假设 serializeObject 是一个已经被序列化之后的 NSData
    let serializeObject = NSKeyedArchiver.archivedDataWithRootObject(todoFolder)
    
    // 反序列化的方式如下
    let deserializeObject = NSKeyedUnarchiver.unarchiveObjectWithData(serializeObject) as! LCObject
```
{% endblock %}

{% block code_data_protocol_save_date %}{% endblock %}

{% block code_data_type %}

```swift
    let bool = true
    let number = 123
    let str = "abc"
    let date = NSDate()
    let data = "短篇小说".dataUsingEncoding(NSUTF8StringEncoding)
    let array:[String] = ["Eggs", "Milk"]
    let dictionary: [String: String] = ["YYZ": "Toronto Pearson", "DUB": "Dublin"]
    
    let testObject = LeanCloud.LCObject(className: "Todo")
    testObject.set("testBoolean", object: bool)
    testObject.set("testNumber", object: number)
    testObject.set("testString", object: str)
    testObject.set("testDate", object: date)
    testObject.set("testData", object: data)
    testObject.set("testArray", object: array)
    testObject.set("testDictionary", object: dictionary)
    
    testObject.save({ (result) in
    })
```

若想了解更多有关 LeanStorage 如何解析处理数据的信息，请查看专题文档《[数据与安全](./data_security.html)》。
{% endblock %}

{% block text_LCType_convert %}
#### LCString
`LCString` 是 Swift SDK 针对 String 对象的封装，它与 String 相互转化的代码如下：

```swift
    // String 转化成 LCString
    let lcString = LCString("abc")
    // 从 LCString 获取 String
    let abc  = lcString.value
```

#### LCNumber
`LCNumber` 是 Swift SDK 针对 Double 数据类型的封装，它与 Double 相互转化的代码如下：

```swift
    // Double 转化成 LCNumber
    let number123 : Double = 123
    let lcNumber  = LCNumber(number123)
    // 从 LCNumber 获取 Double
    let testNumber = lcNumber.value
    
    // 从 LCObject 中读取 Double
    let priority = todo.get("priority") as! LCNumber
    let priorityDoubule = priority.value
```
#### LCArray
`LCArray` 是 Swift SDK 针对  Array 类型的封装，它的构造方式如下：

```swift
    let lcNumberArray = LCArray(arrayLiteral: LCNumber(1),LCNumber(2),LCNumber(3))
    let lcStringArray: LCArray = [LCString("a"), LCString("b"), LCString("c")]
```

#### LCDate
`LCDate` 是 Swift SDK 针对  日期类型的封装，它的使用方式如下：

```swift
    let dateStringFormatter = NSDateFormatter()
    dateStringFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
    dateStringFormatter.locale = NSLocale(localeIdentifier: "en_US_POSIX")
    let date = dateStringFormatter.dateFromString("2016-07-09 22:15:16")!
    
    // 使用 NSDate 构造 LCDate
    let lcDate = LCDate(date);
    // 从 LCDate 读取 NSDate
    let nativeDate = lcDate.value
```

{% endblock %}

{% block module_file %}{% endblock %}

{% block module_in_app_search %}{% endblock %}

{% block module_in_app_social %}{% endblock %}

{% block code_create_avfile_by_stream_data %}{% endblock %}

{% block text_sns %}{% endblock %}

{% block text_feedback %}{% endblock %}

{% block js_push_guide %}{% endblock %}

{% block code_create_avfile_from_local_path %}{% endblock %}

{% block code_create_avfile_from_url %}{% endblock %}

{% block code_upload_file %}{% endblock %}

{% block code_upload_file_with_progress %}{% endblock %}

{% block code_file_image_thumbnail %}{% endblock %}

{% block code_file_metadata %}{% endblock %}

{% block code_download_file %}{% endblock %}

{% block code_file_delete %}{% endblock %}

{% block code_cache_operations_file %}
{% endblock %}

{% block text_https_access_for_ios9 %}
### iOS 9 适配

iOS 9 默认屏蔽了 HTTP 访问，只支持 HTTPS 访问。LeanCloud 除了文件的 getData 之外的 API 都是支持 HTTPS 访问的。 现有两种方式解决这个问题。

#### 项目中配置访问策略

一是在项目中额外配置一下该接口的访问策略。选择项目的 Info.plist，右击以 Source Code 的方式打开。在 plist -> dict 节点中加入以下文本：

```
  <key>NSAppTransportSecurity</key>
  <dict>
    <key>NSExceptionDomains</key>
    <dict>
      <key>clouddn.com</key>
      <dict>
        <key>NSIncludesSubdomains</key>
        <true/>
        <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
        <true/>
      </dict>
    </dict>
  </dict>
```

或者在 Target 的 Info 标签中修改配置：

![Info.plist Setting](images/ios_qiniu_http.png)

如果是美国节点，请把上面的 `clouddn.com` 换成 `amazonaws.com`。

也可以根据项目需要，允许所有的 HTTP 访问，更多可参考 [iOS 9 适配系列教程](https://github.com/ChenYilong/iOS9AdaptationTips)。

#### 启用文件 SSL 域名

另外一种方法是在网站控制台中进入相关的应用，点击上方的设置选项卡，勾选「启用文件 SSL 域名（对应 _File 中存储的文件）」选项。这样便启用了文件 SSL 域名，支持 HTTPS 访问。如图所示：

![File SSL Config](images/ios_file_ssl_config.png)

如果启用文件 SSL 域名前已经保存了许多文件，启用之后，这些文件的 URL 也会跟着变化，来支持 HTTPS 访问。

这两种方式都能解决这个问题。但需要注意的是，实时通信组件 LeanMessage 也用了 AVFile 来保存消息的图片、音频等文件，并且把文件的地址写入到了消息内容中。开启了文件 SSL 域名后，历史消息中的文件地址将不会像控制台里 _File 表那样跟着改变。所以如果使用了实时通信组件并已上线，推荐使用方式一。
{% endblock %}

{% block code_create_query_by_className %}

```swift
  let query = LCQuery(className: "Todo")
```
{% endblock %}

{% block text_create_query_by_avobject %}{% endblock %}

{% block code_create_query_by_avobject %}{% endblock %}

{% block code_priority_equalTo_zero_query %}

```swift
    // 构建 LCQuery 对象
    let query = LCQuery(className: "Todo")
    // 查询所有 priority 等于 0 的 Todo
    query.whereKey("priority", LCQuery.Constraint.EqualTo(value: LCNumber(0)))
    // 执行查找
    query.find({ (result) in
        if(result.isSuccess){
            // 获取 Todo 数组
            let todos = result.objects
            // 遍历数组
            for todo in todos! {
                // 打印 title
                print(todo.get("title"))
            }
        }
    })
```
{% endblock %}

{% block code_priority_equalTo_zero_and_one_wrong_example %}

```swift
    let query = LCQuery(className: "Todo")
    query.whereKey("priority", LCQuery.Constraint.EqualTo(value: LCNumber(0)))
    query.whereKey("priority", LCQuery.Constraint.EqualTo(value: LCNumber(1)))
    // 如果这样写，第二个条件将覆盖第一个条件，查询只会返回 priority = 1 的结果
    query.find({ (result) in
        if(result.isSuccess){
            let todos = result.objects
            for todo in todos! {
                if(todo.get("priority") == LCNumber(1)){
                  // todos 集合里面所有的 Todo 的 priority 属性都应该是 1
                }
            }
        }
    })

```
{% endblock %}

{% block table_logic_comparison_in_query %}

逻辑操作 | AVQuery 方法|
---|---
等于 | `whereKey("key", LCQuery.Constraint.EqualTo(value: LCType()))`
不等于 |  `whereKey("key", LCQuery.Constraint.NotEqualTo(value: LCType))`
大于 | `whereKey("key", LCQuery.Constraint.GreaterThan(value: LCType))`
大于等于 | `whereKey("key", LCQuery.Constraint.GreaterThanOrEqualTo(value: LCType))`
小于 | `whereKey("key", LCQuery.Constraint.LessThan(value: LCType))`
小于等于 | `whereKey("key", LCQuery.Constraint.LessThanOrEqualTo(value: LCType))`
{% endblock %}

{% block code_query_lessThan %}

```swift
  query.whereKey("priority", LCQuery.Constraint.LessThan(value: LCNumber(2)))
```
{% endblock %}

{% block code_query_greaterThanOrEqualTo %}

```swift
  query.whereKey("priority", LCQuery.Constraint.GreaterThanOrEqualTo(value: LCNumber(2)))
```
{% endblock %}

{% block code_query_with_regular_expression %}

```swift
    let query = LCQuery(className: "Todo")
    query.whereKey("title", LCQuery.Constraint.MatchedPattern(pattern: "[\\u4e00-\\u9fa5]", option:nil))
```
{% endblock %}

{% block code_query_with_contains_keyword %}

```swift
    let query = LCQuery(className: "Todo")
    query.whereKey("title", LCQuery.Constraint.MatchedSubstring(string: "李总"))
```
{% endblock %}

{% block code_query_with_not_contains_keyword_using_regex %}

```swift
    let query = LCQuery(className: "Todo")
    query.whereKey("title", LCQuery.Constraint.MatchedPattern(pattern: "^((?!机票).)*$", option: nil))
```
{% endblock %}

{% block code_query_with_not_contains_keyword %}

```swift
    let query = LCQuery(className: "Todo")
    let filterArray = LCArray([ LCString("休假"),LCString("出差")])
    query.whereKey("title", LCQuery.Constraint.NotContainedIn(array: filterArray))
```
{% endblock %}

{% block code_query_array_contains_using_equalsTo %}

```swift
    func queryRemindersContains(){
        let reminder = self.getDateWithDateString("2015-11-11 08:30:00")
        let query = LCQuery(className: "Todo")
        query.whereKey("reminders", LCQuery.Constraint.EqualTo(value: reminder))
    }
    func getDateWithDateString(dateString:String) -> LCDate {
        let dateStringFormatter = NSDateFormatter()
        dateStringFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
        dateStringFormatter.locale = NSLocale(localeIdentifier: "en_US_POSIX")
        let date = dateStringFormatter.dateFromString(dateString)!
        let lcDate = LCDate(date)
        return lcDate
    }
```
{% endblock %}

{% block code_query_array_contains_all %}

```swift
    func testArrayContainsAll() {
        let reminder1 = self.getDateWithDateString("2015-11-11 08:30:00")
        let reminder2 = self.getDateWithDateString("2015-11-11 09:30:00")
        
        // 构建查询时间点数组
        let reminders: LCArray = [reminder1, reminder2]
        let query = LCQuery(className: "Todo")
        query.whereKey("reminders", LCQuery.Constraint.ContainedAllIn(array: reminders))
        
    }
    
    func getDateWithDateString(dateString:String) -> LCDate {
        let dateStringFormatter = NSDateFormatter()
        dateStringFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
        dateStringFormatter.locale = NSLocale(localeIdentifier: "en_US_POSIX")
        let date = dateStringFormatter.dateFromString(dateString)!
        let lcDate = LCDate(date)
        return lcDate
    }
```
{% endblock %}

{% block code_query_whereHasPrefix %}

```swift
    // 找出开头是「早餐」的 Todo
    let query = LCQuery(className: "Todo")
    query.whereKey("content", LCQuery.Constraint.PrefixedBy(string: "早餐"))
```
{% endblock %}

{% block code_query_comment_by_todoFolder %}

```swift
    let query = LCQuery(className: "Comment")
    let targetTodoFolder = LCObject(className: "TodoFolder", objectId: "5590cdfde4b00f7adb5860c8")
    query.whereKey("targetTodoFolder", LCQuery.Constraint.EqualTo(value: targetTodoFolder))
```
{% endblock %}

{% block code_create_tag_object %}

```swift
    let tag = LCObject(className: "Tag")
    tag.set("name", object: "今日必做")
    tag.save(){ _ in }
```
{% endblock %}

{% block code_create_family_with_tag %}

```swift
    let tag1 = LCObject(className: "Tag")
    tag1.set("name", object: "今日必做")
    
    let tag2 = LCObject(className: "Tag")
    tag2.set("name", object: "老婆吩咐")
    
    let tag3 = LCObject(className: "Tag")
    tag3.set("name", object: "十分重要")
    
    let todoFolder = LCObject(className: "TodoFolder") // 新建 TodoFolder 对象
    todoFolder.set("name", object: "家庭")
    todoFolder.set("priority", object: 1)
    
    // 分别将 tag1,tag2,tag3 分别插入到关系中
    todoFolder.insertRelation("tags", object: tag1)
    todoFolder.insertRelation("tags", object: tag2)
    todoFolder.insertRelation("tags", object: tag3)
    
    todoFolder.save(){_ in} //保存到云端
```
{% endblock %}

{% block code_query_tag_for_todoFolder %}

```swift
    let targetTodoFolder = LCObject(className: "TodoFolder", objectId: "5590cdfde4b00f7adb5860c8")
    let relation = todoFolder.relationForKey("tags")
    let realationQuery = relation.query;
    realationQuery.find { (result) in
        let tags = result.objects
    }
```
{% endblock %}

{% block code_query_todoFolder_with_tag %}

```swift
    let tag = LCObject(className: "Tag",objectId: "5661031a60b204d55d3b7b89")
    let todoFolderQuery = LCQuery(className: "TodoFolder")
    todoFolderQuery.whereKey("Tags", LCQuery.Constraint.EqualTo(value: tag))
    todoFolderQuery.find { (result) in
        // objects 指的就是所有包含当前 tag 的 TodoFolder
        let objects = result.objects
    }
```
{% endblock %}

{% block code_query_comment_include_todoFolder %}

```swift
    let query = LCQuery(className: "Comment")
    query.whereKey("targetTodoFolder", LCQuery.Constraint.Included)// 关键代码，用 LCQuery.Constraint.Included 告知云端需要返回的关联属性对应的对象的详细信息，而不仅仅是 objectId
    query.whereKey("targetTodoFolder.targetAVUser", LCQuery.Constraint.Included)// 关键代码，同上，会返回 targetAVUser 对应的对象的详细信息，而不仅仅是 objectId
    query.whereKey("createdAt", LCQuery.Constraint.Descending)
    query.limit = 10
    query.find { (result) in
        let comments = result.objects
        // comments 是最近的十条评论, 其 targetTodoFolder 字段也有相应数据
        for comment in comments!{
            print(comment.objectId?.value)
            let todoFolder = comment.get("targetTodoFolder")
            let avUser = todoFolder.get("targetAVUser")
        }
    }
```
{% endblock %}

{% block code_query_comment_match_query_todoFolder %}

```swift
    // 构建内嵌查询
    let innerQuery = LCQuery(className: "TodoFolder")
    innerQuery.whereKey("likes", LCQuery.Constraint.GreaterThan(value: LCNumber(20)))
    // 将内嵌查询赋予目标查询
    let query = LCQuery(className: "Comment")
    // 执行内嵌操作
    query.whereKey("targetTodoFolder", LCQuery.Constraint.MatchedQuery(query: innerQuery))
    query.find { (result) in
        let comments = result.objects
    }
    
    // 注意如果要做相反的查询可以使用
    query.whereKey("targetTodoFolder", LCQuery.Constraint.NotMatchedQuery(query: innerQuery))
    // 如此做将查询出 likes 小于或者等于 20 的 TodoFolder 的 Comment 对象
```
{% endblock %}

{% block code_query_find_first_object %}

```swift
    let query = LCQuery(className: "Todo")
    query.whereKey("priority", LCQuery.Constraint.EqualTo(value: LCNumber(0)))
    query.getFirst { (result) in
        // result.object 就是符合条件的第一个 LCObject
    }
```
{% endblock %}

{% block code_set_query_limit %}

```swift
    let query = LCQuery(className: "Todo")
    query.whereKey("priority", LCQuery.Constraint.EqualTo(value: LCNumber(0)))
    query.limit = 10
    query.find { (result) in
        if(result.objects?.count <= 10){
            // 因为设置了 limit，因此返回的结果数量一定小于等于 10
        }
    }
```
{% endblock %}

{% block code_set_skip_for_pager %}

```swift
    let query = LCQuery(className: "Todo")
    query.whereKey("priority", LCQuery.Constraint.EqualTo(value: LCNumber(0)))
    query.limit = 10 // 返回 10 条数据
    query.skip = 20 // 跳过 20 条数据
    query.find { (result) in
        // 每一页 10 条数据，跳过了 20 条数据，因此获取的是第 3 页的数据
    }
```

{% endblock %}

{% block code_query_select_keys %}

```swift
    let query = LCQuery(className: "Todo")
    // 指定返回 title 属性
    query.whereKey("title", LCQuery.Constraint.Selected)
    // 指定返回 content 属性
    query.whereKey("content", LCQuery.Constraint.Selected)
    query.find { (result) in
        for todo in result.objects!{
            let title = todo.get("title") // 读取 title
            let content = todo.get("content") // 读取 content
            
            // 如果访问没有指定返回的属性（key），则会报错，在当前这段代码中访问 location 属性就会报错
            let location = todo.get("location")
        }
    }```
{% endblock %}

{% block code_query_count %}

```swift
    let query = LCQuery(className: "Todo")
    query.whereKey("status", LCQuery.Constraint.EqualTo(value: LCNumber(1)))
    query.count()
```
{% endblock %}

{% block code_query_orderby %}

``` swift
    // 按时间，升序排列
    query.whereKey("createdAt", LCQuery.Constraint.Ascending)

    // 按时间，降序排列
    query.whereKey("createdAt", LCQuery.Constraint.Descending)
```
{% endblock %}

{% block code_query_orderby_on_multiple_keys %}

```swift
    query.whereKey("priority", LCQuery.Constraint.Ascending)
    query.whereKey("createdAt", LCQuery.Constraint.Descending)
```
{% endblock %}

{% block code_query_with_or %}

```swift
    let priorityQuery = LCQuery(className: "Todo")
    priorityQuery.whereKey("priority", LCQuery.Constraint.GreaterThanOrEqualTo(value: LCNumber(3)))
    
    let statusQuery = LCQuery(className: "Todo")
    statusQuery.whereKey("status", LCQuery.Constraint.EqualTo(value: LCNumber(1)))
    
    let query = priorityQuery.or(statusQuery)
    
    query.find { (result) in
        // 返回 priority 大于等于 3 或 status 等于 1 的 Todo
        let todos = result.objects
    }
```
{% endblock %}

{% block code_query_with_and %}

```swift
    let priorityQuery = LCQuery(className: "Todo")
    priorityQuery.whereKey("priority", LCQuery.Constraint.LessThan(value: LCNumber(3)))
    
    let statusQuery = LCQuery(className: "Todo")
    statusQuery.whereKey("status", LCQuery.Constraint.EqualTo(value: LCNumber(0)))
    
    let query = priorityQuery.and(statusQuery)
    
    query.find { (result) in
        // 返回 priority 小于 3 并且 status 等于 0 的 Todo
        let todos = result.objects
    }
```
{% endblock %}

{% block code_query_where_keys_exist %}

```swift
    // 使用非空值查询获取有图片的 Todo
    query.whereKey("images", LCQuery.Constraint.Existed)

    // 使用空值查询获取没有图片的 Todo
    query.whereKey("images", LCQuery.Constraint.NotExisted)
```
{% endblock %}

{% block code_query_by_cql %}

```swift
    LCCQLClient.execute("select * from Todo where status = 1") { (result) in
         // result.objects 就是满足条件的 Todo 对象
        for todo in result.objects {
            let title = todo.get("title")
        }
    }

    LCCQLClient.execute("select count(*) from Todo where priority = 0") { (result) in
        // result.count 就是 priority = 0 的 Todo 的数量
    }
```
{% endblock %}

{% block code_query_by_cql_with_placeholder %}

```swift
    let cql = "select * from Todo where status = ? and priority = ?"
    let pvalues = [0,1]
    LCCQLClient.execute(cql, parameters: pvalues) { (result) in
        // result.objects 就是满足条件(status = 0 and priority = 1)的 Todo 对象
    }
```
{% endblock %}

{% block code_set_cache_policy %}{% endblock %}
{% block text_query_cache_intro %}{% endblock %}
{% block table_cache_policy %}{% endblock %}

{% block code_cache_operation %}{% endblock %}

{% block code_query_geoPoint_near %}

```swift
    let query = LCQuery(className: "Todo")
    let point = LCGeoPoint(latitude: 39.9, longitude: 116.4)
    
    query.whereKey("whereCreated", LCQuery.Constraint.NearbyPoint(point: point))
    query.limit = 10
    query.find { (result) in
        // 离这个位置最近的 10 个 Todo 对象
        let todos = result.objects
    }
```

在上面的代码中，`nearbyTodos` 返回的是与 `point` 这一点按距离排序（由近到远）的对象数组。注意：**如果在此之后又使用了排序方法，则按距离排序会被新排序覆盖。**

{% endblock %}

{% block text_platform_geoPoint_notice %}
* iOS 8.0 之后，使用定位服务之前，需要调用 `[locationManager requestWhenInUseAuthorization]` 或 `[locationManager requestAlwaysAuthorization]` 来获取用户的「使用期授权」或「永久授权」，而这两个请求授权需要在 `info.plist` 里面对应添加 `NSLocationWhenInUseUsageDescription` 或 `NSLocationAlwaysUsageDescription` 的键值对，值为开启定位服务原因的描述。SDK 内部默认使用的是「使用期授权」。
{% endblock %}

{% block code_query_geoPoint_within %}

```swift
    let query = LCQuery(className: "Todo")
    let point = LCGeoPoint(latitude: 39.9, longitude: 116.4)
    let from = LCGeoPoint.Distance(value: 1.0, unit: LCGeoPoint.Unit.Kilometer)
    let to = LCGeoPoint.Distance(value: 2.0, unit: LCGeoPoint.Unit.Kilometer)
    // 查询离指定 point 距离在 1.0 和 2.0 公里的 Todo
    query.whereKey("whereCreated", LCQuery.Constraint.NearbyPointWithRange(point: point, from: from, to: to))
```
{% endblock %} code_object_fetch_with_keys

{% block link_to_relation_guide_doc %}[iOS / OS X 数据模型设计指南](relation_guide-ios.html){% endblock %}

{% set link_to_sms_guide_doc = '[iOS / OS X 短信服务使用指南](sms_guide-ios.html#注册验证)' %}

{% block text_send_sms_code_for_loginOrSignup %}{% endblock %}
{% block code_send_sms_code_for_loginOrSignup %}{% endblock %}
{% block code_verify_sms_code_for_loginOrSignup %}{% endblock %}

{% block code_user_signUp_with_username_and_password %}

```swift
    let randomUser = LCUser()
    randomUser.username = LCString("Tom")
    randomUser.password = LCString("leancloud")
    randomUser.signUp()
```
{% endblock %}

{% block code_user_logIn_with_username_and_password %}

```swift
LCUser.logIn(username: "Tom", password: "leancloud", completion: { ( result ) in
        let user = result.object! as LCUser
    })
```
{% endblock %}

{% block code_user_logIn_with_mobilephonenumber_and_password %}

```swift
    LCUser.logIn(mobilePhoneNumber: "13577778888", password: "leancloud") { _ in }
```
{% endblock %}

{% block code_user_logIn_requestLoginSmsCode %}

```swift
    LCUser.requestLoginShortCode(mobilePhoneNumber: "13577778888") { _ in }
```
{% endblock %}

{% block code_user_logIn_with_smsCode %}

```swift
    LCUser.logIn(mobilePhoneNumber: "13577778888", shortCode: "238825"){ _ in }
```
{% endblock %}

{% block code_get_user_properties %}

<div class="callout callout-info">当前版本的 Swift SDK 尚未实现本地的持久化存储， 因此只能在登录成功之后访问 `LCUser.current`。</div>

```swift
    let username = LCUser.current?.username // 当前用户名
    let email = LCUser.current?.email // 当前用户的邮箱

    // 请注意，以下代码无法获取密码
    let password = LCUser.current?.password
```
{% endblock %}

{% block code_set_user_custom_properties %}

```swift
    LCUser.current?.set("age", object: "27")
    LCUser.current?.save(){ _ in }
```
{% endblock %}

{% block code_update_user_custom_properties %}

```swift
    LCUser.current?.set("age", object: "25")
    LCUser.current?.save(){ _ in }
```
{% endblock %}

{% block code_reset_password_by_email %}

``` swift
    LCUser.requestPasswordReset(email: "myemail@example.com") { _ in}
```
{% endblock %}

{% block code_reset_password_by_mobilephoneNumber %}

```swift
    LCUser.requestPasswordReset(mobilePhoneNumber: "13577778888") { _ in}
```
{% endblock %}

{% block code_reset_password_by_mobilephoneNumber_verify %}

```swift
    LCUser.resetPassword(mobilePhoneNumber: "13577778888", shortCode: "123456", newPassword: "newpassword") { _ in}
```
{% endblock %}
{% block text_current_user %}{% endblock %}
{% block code_current_user %}

```swift
  let currentUser = LCUser.current?
  if (currentUser != nil) {
      // 跳转到首页
  } else {
      // 缓存用户对象为空时，可打开用户注册界面…
  }
```
{% endblock %}

{% block code_current_user_logout %}

```objc
  [AVUser logOut];  //清除缓存用户对象
  AVUser *currentUser = [AVUser currentUser]; // 现在的currentUser是nil了
```
{% endblock %}

{% block code_query_user %}

```objc
  let query = LCQuery(className: "_User")
```
{% endblock %}

{% block text_subclass %}
## 子类化

子类化推荐给进阶的开发者在进行代码重构的时候做参考。 你可以用 `LCObject` 访问到所有的数据，用 `get` 方法获取任意字段。 在成熟的代码中，子类化有很多优势，包括降低代码量，具有更好的扩展性，和支持自动补全。

子类化是可选的，请对照下面的例子来加深理解：

```swift
let student = LCObject(className:"Student")
student.set("name", object: "小明")
student.save()
```

可改写成:

```swift
let student = Student()
student.name = "小明"
student.save()
```

这样代码看起来是不是更简洁呢？

### 子类化的实现

要实现子类化，需要下面两个步骤：

1. 继承 `LCObject`；
2. 重载静态方法 `objectClassName`，返回的字符串是原先要传递给 `LCObject(className:)` 初始化方法的参数。如果不实现，默认返回的是类的名字。**请注意：`LCUser` 子类化后必须返回 `_User`**。

下面是实现 Student 子类化的例子：

```swift
import LeanCloud

class Student: LCObject {
    dynamic var name: LCString?

    override static func objectClassName() -> String {
        return "Student"
    }
}
```

### 属性

为 `LCObject` 的子类添加自定义的属性和方法，可以更好地将这个类的逻辑封装起来。

自定义属性必须使用 `dynamic var` 来声明，请看下面的例子是怎么添加一个「年龄」属性：


```swift
import LeanCloud

class Student: LCObject {
    dynamic var age: LCNumber?
}
```

这样就可以通过 `student.age = 19` 这样的方式来读写 `age` 字段了，当然也可以写成：

```swift
student.set("age", object: 19)
```

{% endblock %}
{% block link_to_in_app_search_doc %}[iOS / OS X 应用内搜索指南](app_search_guide.html){% endblock %}
{% block link_to_status_system_doc %}[iOS / OS X 应用内社交模块](status_system.html#iOS_SDK){% endblock %}
{% block link_to_sns_doc %}[iOS / OS X SNS 开发指南](sns.html#iOS_SNS_组件){% endblock %}
{% block link_to_feedback_doc %}[iOS / OS X 用户反馈指南](feedback.html#iOS_反馈组件){% endblock %}

{# --End--主模板留空的代码段落，子模板根据自身实际功能给予实现 #}

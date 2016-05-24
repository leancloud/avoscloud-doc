{# 指定继承模板 #}
{% extends "./leanstorage_guide.tmpl" %}

{# --Start--变量定义，主模板使用的单词和短语在所有子模板都必须赋值 #}
{% set cloudName ="LeanCloud" %}
{% set productName ="LeanStorage" %}
{% set platform_title ="JavaScript" %}
{% set segment_code ="js" %}
{% set sdk_name ="JavaScript SDK" %}
{% set baseObjectName ="AV.Object" %}
{% set objectIdName ="id" %}
{% set updatedAtName ="updatedAt" %}
{% set createdAtName ="createdAt" %}
{% set backgroundFunctionTemplate ="xxxxInBackground" %}
{% set saveEventuallyName ="saveEventually" %}
{% set deleteEventuallyName ="deleteEventually" %}
{% set relationObjectName ="AV.Relation" %}
{% set pointerObjectName ="AV.Pointer" %}
{% set baseQueryClassName ="AV.Query" %}
{% set geoPointObjectName ="AV.GeoPoint" %}
{% set userObjectName ="AV.User" %}
{% set fileObjectName ="AV.File" %}
{% set dateType= "Date" %}
{% set byteType= "Buffer" %}
{% set link_to_acl_doc ="[JavaScript 权限管理使用指南](acl_guide-js.html)" %}
{% set funtionName_whereKeyHasPrefix = "startsWith" %}

{% block text_for_ts_developer %}
## TypeScript 开发者
伴随着 [Angular2](https://angular.io/) 以及  [ionic@2](http://ionicframework.com/docs/v2/) 的受欢迎，LeanCloud 也针对 JavaScript SDK 编写了一个 `d.ts` 定义文件提供给开发者使用。

本质上，TypeScript 经过编译之后实际上也是调用 JavaScript SDK 的对应的接口，因此在本文代码块中，一些 TypeScript 写法可以给开发者进行参考。

注意，TypeScript 针对异步函数有多种写法，本文以 [Promise](#Promise) 作为默认的示例代码书写方式，仅供参考。
[Promise](#Promise) 以及 TypeScript 中的 [async/await](https://blogs.msdn.microsoft.com/typescript/2015/11/03/what-about-asyncawait/) 的不同写法的支持取决于在 TypeScript 项目中的 `tsconfig.json` 的 `compilerOptions` 配置里面选择 `target` 是什么版本，例如，要支持 [async/await](https://blogs.msdn.microsoft.com/typescript/2015/11/03/what-about-asyncawait/) 需要进行如下配置：

```json
{
  ...
  "compilerOptions": {
    ...
    "target": "es6",
    "module": "commonjs",
    ...
  },
  ...
}
```
关于在 ES6 编译模式下如何使用 TypeScript 中的 [async/await](https://blogs.msdn.microsoft.com/typescript/2015/11/03/what-about-asyncawait/) 请参考这篇[文章](/*todo*/)：

注意：因为 TypeScript SDK 是基于 JavaScript SDK 编写的定义文件，因此并不是所有 JavaScript SDK 的接口都有对应 TypeScript 的版本，示例代码会持续更新。

### TypeScript SDK 安装
#### 通过 typings 工具安装

> Todo

#### 直接引用 d.ts 文件

> Todo

{% endblock %}

{# --End--变量定义，主模板使用的单词和短语在所有子模板都必须赋值 #}

{# --Start--主模板留空的代码段落，子模板根据自身实际功能给予实现 #}

{% block code_quick_save_a_todo %}

```js
  var Todo = AV.Object.extend('Todo');// 声明一个 Todo 类型
  var todo = new Todo();  // 新建一个 Todo 对象
  todo.set('title', '工程师周会');
  todo.set('content', '每周工程师会议，周一下午2点');
  todo.save().then(function (todo) {
    // 成功保存之后，执行其他逻辑.
    console.log('New object created with objectId: ' + todo.id);
  }, function (error) {
    // 失败之后执行其他逻辑
    // error 是 AV.Error 的实例，包含有错误码和描述信息.
    console.log('Failed to create new object, with error message: ' + error.message);
  });
```
```ts
  let todo = new AV.Object('Todo');
  todo.set('title', '工程师周会');
  todo.set('content', '每周工程师会议，周一下午2点');
  todo.save<AV.Object>().then(
      (data) => {
        // data 是根据 todo.save<AV.Object> 传入的泛型参数决定
        let savedTodo : AV.Object = data;
      },
      (error) => {
        if(error) throw error;
      }
  );
```

{% endblock %}

{% block code_quick_save_a_todo_with_location %}

```js
  var Todo = AV.Object.extend('Todo');
  var todo = new Todo();
  todo.set('title', '工程师周会');
  todo.set('content', '每周工程师会议，周一下午2点');
  todo.set('location','会议室');// 只要添加这一行代码，服务端就会自动添加这个字段
  todo.save().then(function (todo) {
    // 成功保存之后，执行其他逻辑.
  }, function (error) {
    // 失败之后执行其他逻辑
    // error 是 AV.Error 的实例，包含有错误码和描述信息.
  });
```
```ts
  let todo = new AV.Object('Todo');
  todo.set('title', '工程师周会');
  todo.set('content', '每周工程师会议，周一下午2点');
  todo.set('location', '会议室');//只要添加这一行代码，服务端就会自动添加这个字段
  todo.save<AV.Object>().then(
      (data) => {
        // data 是根据 todo.save<AV.Object> 传入的泛型参数决定
        let savedTodo : AV.Object = data;
        console.log(savedTodo.get('location'));
      },
      (error) => {
        if(error) throw error;
      }
  );
```
{% endblock %}

{% block code_create_todo_object %}

```js
  // AV.Object.extend('className') 所需的参数 className 则表示对应的表名
  var Todo = AV.Object.extend('Todo');// 声明一个类型
```
```ts
  // AV.Object.extend('className') 所需的参数 className 则表示对应的表名
  var Todo = AV.Object.extend('Todo');

  // 在 TypeScript 当中我们推荐如下创建对象的方式
  let todo = new AV.Object('Todo');
```

**注意**：`AV.Object.extend` 产生的对象需要作为全局变量保存，因为每调用
一次，就会产生一个新的类的实例，并且和之前创建的实例形成一个链表。
如果你的应用时不时出现 `Maximum call stack size exceeded` 错误，请
确认是否误用了该方法。
{% endblock %}

{% block code_save_object_by_cql %}

```js
  // 执行 CQL 语句实现新增一个 TodoFolder 对象
  AV.Query.doCloudQuery('insert into TodoFolder(name, priority) values("工作", 1)').then(function (data) {
    // data 中的 results 是本次查询返回的结果，AV.Object 实例列表
    var results = data.results;
  }, function (error) {
    //查询失败，查看 error
    console.log(error);
  });
```
```ts
  // 执行 CQL 语句实现新增一个 TodoFolder 对象
  AV.Query.doCloudQuery<any>('insert into TodoFolder(name, priority) values("工作", 1)').then(
    (data) => {
      // 传入泛型参数提高代码阅读性以及后续的智能提示
      let savedTodo : AV.Object = data.results[0];
    },
    (error) => {
    if(error) throw error;
    }
  );
```
{% endblock %}

{% block code_data_type %}
```js
// 该语句应该只声明一次
var TestObject = AV.Object.extend('DataTypeTest');

var number = 2014;
var string = 'famous film name is ' + number;
var date = new Date();
var array = [string, number];
var object = { number: number, string: string };

var testObject = new TestObject();
testObject.set('testNumber', number);
testObject.set('testString', string);
testObject.set('testDate', date);
testObject.set('testArray', array);
testObject.set('testObject', object);
testObject.set('testNull', null);
testObject.save().then(function(testObject) {
  // 成功
}, function(error) {
  // 失败
});
```
```ts
  let testNumber : number = 13;
  let testString : string = 'here is a test string';
  let testDate : Date = new Date('2016-06-04');
  let testNumberArray : Array<number> = [1, 2, 3];
  let testStringArray : Array<string> = ['here','is','a','string','array'];
  let testObjectType : Object = {name:'LeanCloud',url:'https://leancloud.cn'};

  let testAVObject = new AV.Object('TestClass');
  testAVObject.set('testNumber', testNumber);
  testAVObject.set('testString', testString);
  testAVObject.set('testDate', testDate);
  testAVObject.set('testNumberArray', testNumberArray);
  testAVObject.set('testStringArray', testStringArray);
  testAVObject.set('testObject', testObjectType);

  testAVObject.save<AV.Object>().then(
    (data) => {
  },(error) =>{
    if(error) throw error;
  });
```

我们**不推荐**在 `AV.Object` 中储存大块的二进制数据，比如图片或整个文件。**每个 `AV.Object` 的大小都不应超过 128 KB**。如果需要储存更多的数据，建议使用 [`AV.File`](#文件)。

若想了解更多有关 LeanStorage 如何解析处理数据的信息，请查看专题文档《[数据与安全](./data_security.html)》。
{% endblock %}

{% block code_save_todo_folder %}

```js
   var TodoFolder = AV.Object.extend('TodoFolder');// 声明类型
   var todoFolder = new TodoFolder();// 新建对象
   todoFolder.set('name','工作');// 设置名称
   todoFolder.set('priority',1);// 设置优先级
   todoFolder.save().then(function (todo) {
      console.log('objectId is ' + todo.id);
    }, function (error) {
      console.log(error);
   });// 保存到云端
```
```ts
  let todoFolder:AV.Object = new AV.Object('TodoFolder');// 新建对象
  todoFolder.set('name','工作');// 设置名称
  todoFolder.set('priority',1);// 设置优先级
  todoFolder.save<AV.Object>().then(
    (data) => {
      let savedTodoFolder : AV.Object = data;
  },(error)=>{
    if(error) throw error;
  });
```
{% endblock %}

{% block code_saveoption_query_example %}

```js
    new AV.Query('Wiki').first().then(function (data) {
        var wiki = data;
        var currentVersion = wiki.get('version');
        wiki.set('version', currentVersion + 1);
        wiki.save(null, {
            query: new AV.Query('Wiki').equalTo('version', currentVersion)
        }).then(function (data) {
        }, function (error) {
            if (error)
                throw error;
        });
    }, function (error) {
        if (error)
            throw error;
    });
```
```ts
  new AV.Query('Wiki').first<AV.Object>().then((data) => {
    let wiki:AV.Object = data;
    let currentVersion = wiki.get('version');
    wiki.set('version',currentVersion + 1);
    wiki.save<AV.Object>(null,{
      query:new AV.Query('Wiki').equalTo('version', currentVersion)
    }).then((data) =>{
    // data 是一个 AV.Object 并且是版本更新之后的 Wiki 对象
    },error=>{
      if(error) throw error;
    });
  },error=>{
    if(error) throw error;
  })
```
{% endblock %}

{% block code_get_todo_by_objectId %}

```js
  var query = new AV.Query('Todo');
  query.get('57328ca079bc44005c2472d0').then(function (data) {
    // 成功获得实例
    // data 就是 id 为 57328ca079bc44005c2472d0 的 Todo 对象实例
  }, function (error) {
    // 失败了
  });
```
```ts
  var query = new AV.Query('Todo');
  query.get<AV.Object>('57328ca079bc44005c2472d0').then((data)=>{
    // 成功获得实例
    // data 就是 id 为 57328ca079bc44005c2472d0 的 Todo 对象实例
  },(error)=>{
    if(error) throw error;
  });
```
{% endblock %}

{% block code_save_callback_get_objectId %}

```js
  var todo = new Todo();
  todo.set('title', '工程师周会');
  todo.set('content', '每周工程师会议，周一下午2点');
  todo.save().then(function (todo) {
    // 成功保存之后，执行其他逻辑
    var objectId = todo.id;// 获取 objectId
  }, function (error) {
    // 失败之后执行其他逻辑
    // error 是 AV.Error 的实例，包含有错误码和描述信息.
  });
```
```ts
  let todo : AV.Object = new AV.Object('Todo');
  todo.set('title', '工程师周会');
  todo.set('content', '每周工程师会议，周一下午2点');
  todo.save<AV.Object>().then((data) => {
    // 成功保存之后，执行其他逻辑
    let objectId = data.id;// 获取 objectId
  },  (error)=> {
    // 失败之后执行其他逻辑
    // error 是 AV.Error 的实例，包含有错误码和描述信息.
  });
```
{% endblock %}

{% block code_access_todo_folder_properties %}

```js
  var query = new AV.Query('Todo');
  query.get('558e20cbe4b060308e3eb36c').then(function (todo) {
    // 成功获得实例
    // todo 就是 id 为 558e20cbe4b060308e3eb36c 的 Todo 对象实例
    var priority = todo.get('priority');
    var location = todo.get('location');
    var title = todo.get('title');
    var content = todo.get('content');

    // 获取三个特殊属性
    var objectId = todo.id;
    var updatedAt = todo.updatedAt;
    var createdAt = todo.createdAt;
    console.log(createdAt);//Wed May 11 2016 09:36:32 GMT+0800 (CST)
  }, function (error) {
    // 失败了
  });
```
```ts
  let query : AV.Query = new AV.Query('Todo');
  query.get<AV.Object>('57328ca079bc44005c2472d0').then((todo)=>{
    let priority : number = todo.get('priority');
    let location : string = todo.get('location');// 可以指定读取的类型
    let title = todo.get('title');// 也可以不指定读取的类型

    // 获取三个特殊属性
    let objectId : string = todo.id;
    var updatedAt : Date = todo.updatedAt;
    var createdAt : Date = todo.createdAt;
    console.log(createdAt);//Wed May 11 2016 09:36:32 GMT+0800 (CST)
  },(error)=>{
    if(error) throw error;
  });
```
{% endblock %}

{% block code_object_fetch %}

```js
  // 使用已知 objectId 构建一个 AV.Object
  var todo = new Todo();
  todo.id = '5590cdfde4b00f7adb5860c8';
  todo.fetch().then(function (todo) {
    // // todo 是从服务器加载到本地的 Todo 对象
    var priority = todo.get('priority');
  }, function (error) {

  });
```
```ts
  let todo : AV.Object = new AV.Object('Todo');
  todo.id = '57328ca079bc44005c2472d0';
  todo.fetch<AV.Object>().then((todo)=>{
    // todo 是从服务器加载到本地的 AV.Object
    let priority : number = todo.get('priority');// 读取 todo 的属性
  },(error)=>{
    if(error) throw error;
  });
```
{% endblock %}

{% block code_object_fetchWhenSave %}

```js
  todo.fetchWhenSave(true);//设置 fetchWhenSave 为 true
  todo.save().then(function () {
    // 保存成功
  }, function (error) {
    // 失败
  });
```
```ts
  let todo : AV.Object = new AV.Object('Todo');
  todo.fetchWhenSave(true);
  todo.save<AV.Object>().then((data)=>{
    // 保存成功
  },(error)=>{
    if(error) throw error;
  });
```
{% endblock %}

{% block code_object_fetch_with_keys %}

```js
  // 使用已知 objectId 构建一个 AV.Object
  var todo = new Todo();
  todo.id = '5590cdfde4b00f7adb5860c8';
  todo.fetch({include:'priority,location'},{}).then(function (todo) {
    // 获取到本地
  }, function (error) {

  });
```
```ts
  // 使用已知 objectId 构建一个 AV.Object
  let todo:AV.Object = AV.Object.createWithoutData('Todo', '57328ca079bc44005c2472d0');
  //  传入 include 参数，指定获取的属性
  todo.fetch<AV.Object>(
    {include:'priority,location'
  },{}).then(
    (todo) =>{
    // 获取到本地
  }, (error) =>{
    if(error) throw error;
  });
```
{% endblock %}

{% block code_update_todo_location %}

```js
  // 已知 objectId，创建 AVObject
  // 第一个参数是 className，第二个参数是该对象的 objectId
  var todo = AV.Object.createWithoutData('Todo', '558e20cbe4b060308e3eb36c');
  // 更改属性
  todo.set('location', '二楼大会议室');
  // 保存
  todo.save().then(function () {
    // 保存成功
  }, function (error) {
    // 失败
  });
```
```ts
  // 已知 objectId，创建 AV.Object
  // 第一个参数是 className，第二个参数是该对象的 objectId
  let todo:AV.Object = AV.Object.createWithoutData('Todo', '558e20cbe4b060308e3eb36c');
  // 更改属性
  todo.set('location', '二楼大会议室');
  todo.save<AV.Object>().then((todo)=>{
    // 保存成功，可以打开控制台核对修改结果
    done();
  },(error)=>{
    if(error) throw error;
  });
```
{% endblock %}

{% block code_update_object_by_cql %}

```js
  // 执行 CQL 语句实现更新一个 TodoFolder 对象
  AV.Query.doCloudQuery('update TodoFolder set name="家庭" where objectId="558e20cbe4b060308e3eb36c"').then(function (data) {
    // data 中的 results 是本次查询返回的结果，AV.Object 实例列表
    var results = data.results;
  }, function (error) {
    //查询失败，查看 error
    console.log(error);
  });
```
```ts
  // 执行 CQL 语句实现更新一个 TodoFolder 对象
  AV.Query.doCloudQuery<any>('update TodoFolder set name="家庭" where objectId="558e20cbe4b060308e3eb36c"').then(
    (data) => {
      let savedTodo : AV.Object = data.results[0];
    },
    (error) => {
      if(error) throw error;
    }
  );
```
{% endblock %}

{% block code_atomic_operation_increment %}

```js
  var todo = AV.Object.createWithoutData('Todo', '57328ca079bc44005c2472d0');
  todo.set('views', 0);
  todo.save().then(function (todo) {
      todo.increment("views", 1);
      todo.fetchWhenSave(true);
      // 也可以指定增加一个特定的值
      // 例如一次性加 5
      todo.increment("views", 5);
      todo.save().then(function (data) {
        // 因为使用了 fetchWhenSave 选项，save 调用之后，如果成功的话，对象的计数器字段是当前系统最新值。
      }, function (error) {
          if (error)
              throw error;
      });
  }, function (error) {
      if (error)
          throw error;
  });
```
```ts
  let todo:AV.Object = AV.Object.createWithoutData('Todo', '57328ca079bc44005c2472d0');
  todo.set('views',0);
  todo.save<AV.Object>().then((todo)=>{
    todo.increment("views",1);
    todo.fetchWhenSave(true);
    // 也可以指定增加一个特定的值
    // 例如一次性加 5
    todo.increment("views",5);
    todo.save<AV.Object>().then((data)=>{
      // 因为使用了 fetchWhenSave 选项，save 调用之后，如果成功的话，对象的计数器字段是当前系统最新值。
    },(error)=>{
      if(error) throw error;
    });
  },(error)=>{
    if(error) throw error;
  });
```
{% endblock %}

{% block code_atomic_operation_array %}

* `AV.Object.add('arrayKey',arrayValue)`<br>
  将指定对象附加到数组末尾。
* `AV.Object.addUnique('arrayKey',arrayValue);`<br>
  如果不确定某个对象是否已包含在数组字段中，可以使用此操作来添加。对象的插入位置是随机的。  
* `AV.Object.remove('arrayKey',arrayValue);`<br>
  从数组字段中删除指定对象的所有实例。

{% endblock %}

{% block code_set_array_value %}

```js
  var reminder1 = new Date('2015-11-11 07:10:00');
  var reminder2 = new Date('2015-11-11 07:20:00');
  var reminder3 = new Date('2015-11-11 07:30:00');

  var reminders = [reminder1, reminder2, reminder3];

  var todo = new AV.Object('Todo');
  // 指定 reminders 是做一个 Date 对象数组
  todo.addUnique('reminders', reminders);
  todo.save().then(function (todo) {
   console.log(todo.id);
  }, function (error) {
  });
```
```ts
  let reminder1: Date = new Date('2015-11-11 07:10:00');
  let reminder2: Date = new Date('2015-11-11 07:20:00');
  let reminder3: Date = new Date('2015-11-11 07:30:00');

  let reminders : Array<Date> = [reminder1,reminder2,reminder3];

  let todo : AV.Object = new AV.Object('Todo');
  todo.addUnique('reminders',reminders);
  todo.save<AV.Object>().then((todo)=>{
  },(error)=>{
  })
```
{% endblock %}

{% block code_delete_todo_by_objectId %}

```js
    var todo = AV.Object.createWithoutData('Todo', '57328ca079bc44005c2472d0');
    todo.destroy().then(function (success) {
    // 删除成功
    }, function (error) {
    // 删除失败
    });
```
```ts
  let todo:AV.Object = AV.Object.createWithoutData('Todo', '57328ca079bc44005c2472d0');
  todo.destroy().then(
    (success)=>{
    // 删除成功
  },(error)=>{
    // 删除失败
  });
```
{% endblock %}

{% block code_delete_todo_by_cql %}

```js
  // 执行 CQL 语句实现删除一个 Todo 对象
  AV.Query.doCloudQuery('delete from Todo where objectId="558e20cbe4b060308e3eb36c"').then(function (data) {
  }, function (error) {
  });
```
```ts
  // 执行 CQL 语句实现删除一个 Todo 对象
  AV.Query.doCloudQuery<AV.Object>('delete from Todo where objectId="558e20cbe4b060308e3eb36c"').then(
    (data) => {
    },
    (error) => {
    }
  );
```
{% endblock %}

{% block code_batch_operation %}

```js
  var avObjectArray = [];// 构建一个本地的 AV.Object 对象数组

   // 批量创建、更新
  AV.Object.saveAll(avObjectArray).then(function (avobjs) {
  }, function (error) {
  });
  // 批量删除
  AV.Object.destroyAll(avObjectArray).then(function (avobjs) {
  }, function (error) {
  });
  // 批量获取
  AV.Object.fetchAll(avObjectArray).then(function (avobjs) {
  }, function (error) {
  });                    
```
```ts
  let avObjectArray:Array<AV.Object> = [/*...*/];// 构建一个 AV.object 数组

  // 批量创建、更新
  AV.Object.saveAll<AV.Object []>(avObjectArray).then((avobjs)=>{
  },(error)=>{
  });

  // 批量删除
  AV.Object.destroyAll<AV.Object []>(avObjectArray).then((avobjs)=>{
  },(error)=>{
  });

  // 批量获取
  AV.Object.fetchAll<AV.Object []>(avObjectArray).then((avobjs)=>{
  },(error)=>{
  });
```
{% endblock %}

{% block code_batch_set_todo_completed %}

```js
  var query = new AV.Query('Todo');
  query.find().then(function (todos) {
      for (var i = 0; i < todos.length; i++) {
          var todo = todos[i];
          todo['status'] = 1;
      }
      AV.Object.saveAll(todos).then(function (success) {
      }, function (error) {
      });
  }, function (error) {
  });
```
```ts
  let query:AV.Query = new AV.Query('Todo');
  query.find<AV.Object []>().then((todos)=>{
    for(let todo of todos){
      todo['status'] = 1;
    }

    AV.Object.saveAll(todos).then(
      (success)=>{
        // 保存成功
    },(error)=>{
    })
  },(error)=>{
  });
```
{% endblock %}

{% block text_work_in_background %}{% endblock %}
{% block save_eventually %}{% endblock %}

{% block code_relation_todoFolder_one_to_many_todo %}

```js
  var todoFolder = new AV.Object('TodoFolder');
  todoFolder.set('name', '工作');
  todoFolder.set('priority', 1);

  var todo1 = new AV.Object('Todo');
  todo1.set('title', '工程师周会');
  todo1.set('content', '每周工程师会议，周一下午2点');
  todo1.set('location', '会议室');

  var todo2 = new AV.Object('Todo');
  todo2.set('title', '维护文档');
  todo2.set('content', '每天 16：00 到 18：00 定期维护文档');
  todo2.set('location', '当前工位');

  var todo3 = new AV.Object('Todo');
  todo3.set('title', '发布 SDK');
  todo3.set('content', '每周一下午 15：00');
  todo3.set('location', 'SA 工位');

  var localTodos = [todo1, todo2, todo3];
  AV.Object.saveAll(localTodos).then(function (cloudTodos) {
      var relation = todoFolder.relation('containedTodos'); // 创建 AV.Relation
      for (var i = 0; i < cloudTodos.length; i++) {
          var todo = cloudTodos[i];
          relation.add(todo);// 建立针对每一个 Todo 的 Relation
      }
      todoFolder.save();// 保存到云端
  }, function (error) {
  });
```
```ts
  let todoFolder : AV.Object = new AV.Object('TodoFolder');
  todoFolder.set('name','工作');
  todoFolder.set('priority',1);

  let todo1 : AV.Object = new AV.Object('Todo');
  todo1.set('title','工程师周会');
  todo1.set('content','每周工程师会议，周一下午2点');
  todo1.set('location','会议室');

  let todo2 : AV.Object = new AV.Object('Todo');
  todo2.set('title','维护文档');
  todo2.set('content','每天 16：00 到 18：00 定期维护文档');
  todo2.set('location','当前工位');

  let todo3 : AV.Object = new AV.Object('Todo');
  todo3.set('title','发布 SDK');
  todo3.set('content','每周一下午 15：00');
  todo3.set('location','SA 工位');

  let localTodos:Array<AV.Object> = [todo1,todo2,todo3];// 构建一个 AV.object 数组
  AV.Object.saveAll<AV.Object []>(localTodos).then(
    (cloudTodos)=>{
      let relation: AV.Relation = todoFolder.relation('containedTodos');// 创建 AV.Relation
      for(let todo of cloudTodos){
        relation.add(todo);// 建立针对每一个 Todo 的 Relation
      }
      todoFolder.save();// 保存到云端
    },(error)=>{

    });
```
{% endblock %}

{% block code_pointer_comment_one_to_many_todoFolder %}

```js
  var comment = new AV.Object('Comment');// 构建 Comment 对象
  comment.set('like', 1);// 如果点了赞就是 1，而点了不喜欢则为 -1，没有做任何操作就是默认的 0
  comment.set('content', '这个太赞了！楼主，我也要这些游戏，咱们团购么？');
  // 假设已知被分享的该 TodoFolder 的 objectId 是 5735aae7c4c9710060fbe8b0
  var targetTodoFolder = AV.Object.createWithoutData('TodoFolder', '5735aae7c4c9710060fbe8b0');
  comment.set('targetTodoFolder', targetTodoFolder);
  comment.save();//保存到云端
```
```ts
  let comment : AV.Object = new AV.Object('Comment');// 构建 Comment 对象
  comment.set('like',1);// 如果点了赞就是 1，而点了不喜欢则为 -1，没有做任何操作就是默认的 0
  comment.set('content','这个太赞了！楼主，我也要这些游戏，咱们团购么？');

  // 假设已知被分享的该 TodoFolder 的 objectId 是 5735aae7c4c9710060fbe8b0
  let targetTodoFolder : AV.Object = AV.Object.createWithoutData('TodoFolder','5735aae7c4c9710060fbe8b0');
  comment.set('targetTodoFolder',targetTodoFolder);
  comment.save();//保存到云端
```
{% endblock %}

{% block code_create_geoPoint %}
``` js
  // 第一个参数是： latitude ，纬度
  // 第二个参数是： longitude，经度
  var point1 = new AV.GeoPoint(39.9, 116.4);

  // 以下是创建 AV.GeoPoint 对象不同的方法
  var point2 = new AV.GeoPoint([12.7, 72.2]);
  var point3 = new AV.GeoPoint({ latitude: 30, longitude: 30 });
```
```ts
  // 第一个参数是： latitude ，纬度
  // 第二个参数是： longitude，经度
  let point1 : AV.GeoPoint = new AV.GeoPoint(39.9,116.4);

  // 以下是创建 AV.GeoPoint 对象不同的方法
  let point2 : AV.GeoPoint = new AV.GeoPoint([12.7,72.2]);
  let point3 : AV.GeoPoint = new AV.GeoPoint({latitude: 30, longitude: 30});
```
{% endblock %}

{% block code_use_geoPoint %}
``` objc
[todo setObject:point forKey:@"whereCreated"];
```
{% endblock %}

{% block text_deserialize_and_serialize %}
<!--- js 以及 ts 没有序列化和反序列化的需求--->
{% endblock %}

{% block code_data_protocol_save_date %}
```js
  var testDate = new Date('2016-06-04');
  var testAVObject = new AV.Object('TestClass');
  testAVObject.set('testDate', testDate);
  testAVObject.save();
```
```ts
  let testDate : Date = new Date('2016-06-04');
  let testAVObject = new AV.Object('TestClass');
  testAVObject.set('testDate', testDate);
  testAVObject.save();
```
{% endblock %}

{% block code_create_avfile_by_stream_data %}

```js
  var data = { base64: '6K+077yM5L2g5Li65LuA5LmI6KaB56C06Kej5oiR77yf' };
  var file = new AV.File('resume.txt', data);
  file.save().then(function (savedFile) {
  }, function (error) {
  });

  var bytes = [0xBE, 0xEF, 0xCA, 0xFE];
  var byteArrayFile = new AV.File('myfile.txt', bytes);
  byteArrayFile.save();
```
```ts
  let data = { base64:'6K+077yM5L2g5Li65LuA5LmI6KaB56C06Kej5oiR77yf'};
  let file : AV.File = new AV.File('resume.txt',data);
  file.save<AV.File>().then((savedFile)=>{
  },(error)=>{
  });

  let bytes = [ 0xBE, 0xEF, 0xCA, 0xFE ];
  let byteArrayFile:AV.File = new AV.File('myfile.txt',bytes);
  byteArrayFile.save();
```
{% endblock %}

{% block code_create_avfile_from_local_path %}
假设在页面上有如下文件选择框：

```html
<input type="file" id="photoFileUpload"/>
```
上传文件对应的代码如下：
```js
    var fileUploadControl = $('#photoFileUpload')[0];
    if (fileUploadControl.files.length > 0) {
      var file = fileUploadControl.files[0];
      var name = 'avatar.jpg';

      var avFile = new AV.File(name, file);
      avFile.save().then(function(obj) {
        // 数据保存成功
        console.log(obj.url());
      }, function(error) {
        // 数据保存失败
        console.log(error);
      });
    }
```
{% endblock %}

{% block code_create_avfile_from_url %}

```js
  var file = AV.File.withURL('Satomi_Ishihara.gif', 'http://ww3.sinaimg.cn/bmiddle/596b0666gw1ed70eavm5tg20bq06m7wi.gif');
  file.save().then(function (savedFile) {
  }, function (error) {
  });
```
```ts
  let file : AV.File = AV.File.withURL('Satomi_Ishihara.gif','http://ww3.sinaimg.cn/bmiddle/596b0666gw1ed70eavm5tg20bq06m7wi.gif');
  file.save<AV.File>().then((savedFile)=>{
  },(error)=>{
  });
```
{% endblock %}

{% block code_upload_file %}
如果仅是想简单的上传，可以直接在 Web 前端使用 AV.File 上面的相关方法。但真实使用场景中，还有很多开发者需要自行实现一个上传接口，对数据做更多的处理。

以下是一个在 Web 中完整上传一张图片的 Demo，包括前端与 Node.js 服务端代码。服务端推荐使用 LeanCloud 推出的「[云引擎](leanengine_overview.html)」，非常出色的 Node.js 环境。

前端页面（比如:fileUpload.html）：
```html
// 页面元素（限制上传为图片类型，使用时可自行修改 accept 属性）
<form id="upload-file-form" class="upload" enctype="multipart/form-data">
  <input name="attachment" type="file" accept="image/gif, image/jpeg, image/png">
</form>
```
纯前端调用方式：

```javascript
// 前端代码，基于 jQuery
function uploadPhoto() {
  var uploadFormDom = $('#upload-file-form');
  var uploadInputDom = uploadFormDom.find('input[type=file]');
  // 获取浏览器 file 对象
  var files = uploadInputDom[0].files;
  // 创建 formData 对象
  var formData = new window.FormData(uploadFormDom[0]);
  if (files.length) {
    $.ajax({
      // 注意，这个 url 地址是一个例子，真实使用时需替换为自己的上传接口 url
      url: 'https://leancloud.cn/xxx/xxx/upload',
      method: 'post',
      data: formData,
      processData: false,
      contentType: false
    }).then((data) => {
      // 上传成功，服务端设置返回
      console.log(data);
    });
  }
};
```

在服务端可以编写如下代码：

```javascript
// 服务端代码，基于 Node.js、Express
var AV = require('leanengine');
// 服务端需要使用 connect-busboy（通过 npm install 安装）
var busboy = require('connect-busboy');
// 使用这个中间件
app.use(busboy());

// 上传接口方法（使用时自行配置到 router 中）
function uploadFile (req, res) {
  if (req.busboy) {
    var base64data = [];
    var pubFileName = '';
    var pubMimeType = '';
    req.busboy.on('file', (fieldname, file, fileName, encoding, mimeType) => {
      var buffer = '';
      pubFileName = fileName;
      pubMimeType = mimeType;
      file.setEncoding('base64');
      file.on('data', function(data) {
        buffer += data;
      }).on('end', function() {
        base64data.push(buffer);
      });
    }).on('finish', function() {
      var f = new AV.File(pubFileName, {
        // 仅上传第一个文件（多个文件循环创建）
        base64: base64data[0]
      });
      try {
        f.save().then(function(fileObj) {
          // 向客户端返回数据
          res.send({
            fileId: fileObj.id,
            fileName: fileObj.name(),
            mimeType: fileObj.metaData().mime_type,
            fileUrl: fileObj.url()
          });
        });
      } catch (error) {
        console.log('uploadFile - ' + error);
        res.status(502);
      }
    })
    req.pipe(req.busboy);
  } else {
    console.log('uploadFile - busboy undefined.');
    res.status(502);
  }
};
```

{% endblock %}
{% block text_upload_file_with_progress %}{% endblock %}
{% block text_download_file_with_progress %}{% endblock %}
{% block code_file_image_thumbnail %}

```js
  //获得宽度为100像素，高度200像素的缩略图
  var url = file.thumbnailURL(100, 200);
```
```ts
  //获得宽度为100像素，高度200像素的缩略图
  let thumbnailURL = file.thumbnailURL(100,200);
```
{% endblock %}

{% block code_file_metadata %}

```js
    // 获取文件大小
    var size = file.size();
    // 上传者(AV.User) 的 objectId，如果未登录，默认为空
    var ownerId = file.ownerId();

    // 获取文件的全部元信息
    var metadata = file.metaData();
    // 设置文件的作者
    file.metaData('author', 'LeanCloud');
    // 获取文件的格式
    var format = file.metaData('format');
```
``` ts
  // 获取文件大小
  let size = file.size();
  // 上传者(AV.User) 的 objectId，如果未登录，默认为空
  let ownerId = file.ownerId();

  // 获取文件的全部元信息
  let metadata = file.metaData();
  // 设置文件的作者
  file.metaData('author','LeanCloud');
  // 获取文件的格式
  let format = file.metaData('format');
```
{% endblock %}

{% block code_file_delete %}

```js
  var file = AV.File.createWithoutData('552e0a27e4b0643b709e891e');
  file.destroy().then(function (success) {
  }, function (error) {
  });
```
```ts
  let file:AV.File = AV.File.createWithoutData('552e0a27e4b0643b709e891e');
  file.destroy().then((success)=>{
  },(error)=>{
  });
```
{% endblock %}

{% block code_cache_operations_file %}{% endblock %}

{% block text_https_access_for_ios9 %}{% endblock %}

{% block code_create_query_by_className %}

```js
  var query = new AV.Query('Todo');
```
```ts
  let query: AV.Query= new AV.Query('Todo');
```
{% endblock %}

{% block code_priority_equalTo_zero_query %}

```js
  var query = new AV.Query('Todo');
  // 查询 priority 是 0 的 Todo
  query.equalTo('priority', 0);
  query.find().then(function (results) {
      var priorityEqualsZeroTodos = results;
  }, function (error) {
  });
```
```ts
  let query: AV.Query= new AV.Query('Todo');
  // 查询 priority 是 0 的 Todo
  query.equalTo('priority',0);
  query.find<AV.Object []>().then((results)=>{
    let priorityEqualsZeroTodos : Array<AV.Object> =results;
  },(error)=>{

  });
```
{% endblock %}

{% block code_priority_equalTo_zero_and_one_wrong_example %}

```js
  var query = new AV.Query('Todo');
  query.equalTo('priority', 0);
  query.equalTo('priority', 1);
  query.find().then(function (results) {
  // 如果这样写，第二个条件将覆盖第一个条件，查询只会返回 priority = 1 的结果
  }, function (error) {
  });
```
```ts
  let query: AV.Query= new AV.Query('Todo');
  query.equalTo('priority',0);
  query.equalTo('priority',1);
  query.find<AV.Object []>().then((results)=>{
    // 如果这样写，第二个条件将覆盖第一个条件，查询只会返回 priority = 1 的结果
  },(error)=>{
  });
```
{% endblock %}

{% block table_logic_comparison_in_query %}
逻辑操作 | AVQuery 方法|
---|---
等于 | `equalTo`
不等于 |  `notEqualTo`
大于 | `greaterThan`
大于等于 | `greaterThanOrEqualTo`
小于 | `lessThan`
小于等于 | `lessThanOrEqualTo`
{% endblock %}

{% block code_query_lessThan %}

```js
  var query = new AV.Query('Todo');
  query.lessThan('priority', 2);
```
```ts
  let query: AV.Query= new AV.Query('Todo');
  query.lessThan('priority',2);
```
{% endblock %}

{% block code_query_greaterThanOrEqualTo %}

```js
  query.greaterThanOrEqualTo('priority',2);
```
```ts
  query.greaterThanOrEqualTo('priority',2);
```
{% endblock %}

{% block code_query_with_regular_expression %}

```js
  var query = new AV.Query('Todo');
  var regExp = new RegExp('[\u4e00-\u9fa5]', 'i');
  query.matches('title', regExp);
  query.find().then(function (results) {
  }, function (error) {
  });
```
```ts
  let query: AV.Query= new AV.Query('Todo');
  let regExp : RegExp = new RegExp('[\u4e00-\u9fa5]','i');
  query.matches('title',regExp);
  query.find<AV.Object []>().then((results)=>{
  },(error)=>{
  });
```
{% endblock %}

{% block code_query_with_contains_keyword %}

```js
  query.contains('title','李总');  
```
```ts
  query.contains('title','李总');  
```
{% endblock %}

{% block code_query_with_not_contains_keyword_using_regex %}

```js
  var query = new AV.Query('Todo');
  var regExp = new RegExp('^((?!机票).)*$', 'i');
  query.matches('title', regExp);
```
```ts
  let query: AV.Query= new AV.Query('Todo');
  let regExp : RegExp = new RegExp('^((?!机票).)*$','i');
  query.matches('title',regExp);
```
{% endblock %}

{% block code_query_with_not_contains_keyword %}

```js
  var query = new AV.Query('Todo');
  var filterArray = ['出差', '休假'];
  query.notContainedIn('title', filterArray);
```
```ts
  let query: AV.Query= new AV.Query('Todo');
  let filterArray : Array<string> = ['出差','休假'];
  query.notContainedIn('title',filterArray);
```
{% endblock %}

{% block code_query_array_contains_using_equalsTo %}

```js
  var query = new AV.Query('Todo');
  var reminderFilter = [new Date('2015-11-11 08:30:00')];
  query.containsAll('reminders', reminderFilter);
```
```ts
  let query: AV.Query= new AV.Query('Todo');
  let reminderFilter: Array<Date> = [new Date('2015-11-11 08:30:00')];
  query.containsAll('reminders',reminderFilter);
```
{% endblock %}

{% block code_query_array_contains_all %}

```js
  var query = new AV.Query('Todo');
  var reminderFilter = [new Date('2015-11-11 08:30:00'), new Date('2015-11-11 09:30:00')];
  query.equalTo('reminders', reminderFilter);
```
```ts
  let query: AV.Query= new AV.Query('Todo');
  let reminderFilter: Array<Date> = [new Date('2015-11-11 08:30:00'),new Date('2015-11-11 09:30:00')];
  query.equalTo('reminders',reminderFilter);
```
{% endblock %}

{% block code_query_whereHasPrefix %}

```js
  // 找出开头是「早餐」的 Todo
  var query = new AV.Query('Todo');
  query.startsWith('content', '早餐');
```
```ts
  // 找出开头是「早餐」的 Todo
  let query: AV.Query= new AV.Query('Todo');
  query.startsWith('content','早餐');
```
{% endblock %}

{% block code_query_comment_by_todoFolder %}

```js
  var query = new AV.Query('Todo');
  var todoFolder = AV.Object.createWithoutData('Todo', '5735aae7c4c9710060fbe8b0');
  query.equalTo('targetTodoFolder', todoFolder);
```
```ts
  let query: AV.Query= new AV.Query('Todo');
  let todoFolder : AV.Object = AV.Object.createWithoutData('Todo','5735aae7c4c9710060fbe8b0');
  query.equalTo('targetTodoFolder',todoFolder);
```
{% endblock %}

{% block code_create_tag_object %}

```js
  var tag = new AV.Object('Todo');
  tag.set('name', '今日必做');
  tag.save();
```
```ts
  let tag: AV.Object= new AV.Object('Todo');
  tag.set('name','今日必做');
  tag.save();
```
{% endblock %}

{% block code_create_family_with_tag %}

```js
  var tag1 = new AV.Object('Todo');
  tag1.set('name', '今日必做');

  var tag2 = new AV.Object('Todo');
  tag2.set('name', '老婆吩咐');

  var tag3 = new AV.Object('Todo');
  tag3.set('name', '十分重要');

  var tags = [tag1, tag2, tag3];
  AV.Object.saveAll(tags).then(function (savedTags) {

      var todoFolder = new AV.Object('TodoFolder');
      todoFolder.set('name', '家庭');
      todoFolder.set('priority', 1);

      var relation = todoFolder.relation('tags');
      relation.add(tag1);
      relation.add(tag2);
      relation.add(tag3);

      todoFolder.save();
  }, function (error) {
  });
```
```ts
  let tag1: AV.Object= new AV.Object('Todo');
  tag1.set('name','今日必做');

  let tag2: AV.Object= new AV.Object('Todo');
  tag2.set('name','老婆吩咐');

  let tag3: AV.Object= new AV.Object('Todo');
  tag3.set('name','十分重要');

  let tags:Array<AV.Object> = [tag1,tag2,tag3];

  AV.Object.saveAll<AV.Object []>(tags).then((savedTags)=>{
    let todoFolder:AV.Object = new AV.Object('TodoFolder');
    todoFolder.set('name','家庭');
    todoFolder.set('priority',1);

    let relation : AV.Relation = todoFolder.relation('tags');
    relation.add(tag1);
    relation.add(tag2);
    relation.add(tag3);

    todoFolder.save();
  },(error)=>{

  });
```
{% endblock %}

{% block code_query_tag_for_todoFolder %}

```js
  var todoFolder = AV.Object.createWithoutData('Todo', '5735aae7c4c9710060fbe8b0');
  var relation = todoFolder.relation('tags');
  var query = relation.query();
  query.find().then(function (results) {
    // results 是一个 AV.Object 的数组，它包含所有当前 todoFolder 的 tags
  }, function (error) {
  });
```
```ts
  let todoFolder : AV.Object = AV.Object.createWithoutData('Todo','5735aae7c4c9710060fbe8b0');
  let relation : AV.Relation = todoFolder.relation('tags');
  let query : AV.Query = relation.query();
  query.find<AV.Object []>().then((results)=>{
    // results 是一个 AV.Object 的数组，它包含所有当前 todoFolder 的 tags
  },(error)=>{

  });
```
{% endblock %}

{% block code_query_todoFolder_with_tag %}

```js
  var targetTag = AV.Object.createWithoutData('Tag', '5655729900b0bf3785ca8192');
  var query = new AV.Query('TodoFolder');
  query.equalTo('tags', targetTag);
  query.find().then(function (results) {
  // results 是一个 AV.Object 的数组
  // results 指的就是所有包含当前 tag 的 TodoFolder
  }, function (error) {
  });
```
```ts
  let targetTag : AV.Object = AV.Object.createWithoutData('Tag','5655729900b0bf3785ca8192');
  let query: AV.Query= new AV.Query('TodoFolder');
  query.equalTo('tags',targetTag);
  query.find<AV.Object []>().then((results)=>{
    // results 是一个 AV.Object 的数组
    // results 指的就是所有包含当前 tag 的 TodoFolder
  },(error)=>{

  });
```
{% endblock %}

{% block code_query_comment_include_todoFolder %}

```js
  var commentQuery = new AV.Query('Comment');
  commentQuery.descending('createdAt');
  commentQuery.limit(10);
  commentQuery.include('targetTodoFolder');// 关键代码，用 includeKey 告知服务端需要返回的关联属性对应的对象的详细信息，而不仅仅是 objectId
  commentQuery.find().then(function (comments) {
      // comments 是最近的十条评论, 其 targetTodoFolder 字段也有相应数据
      for (var i = 0; i < comments.length; i++) {
          var comment = comments[i];
          // 并不需要网络访问
          var todoFolder = comment.get('targetTodoFolder');
      }
  }, function (error) {
  });
```
```ts
  let commentQuery: AV.Query = new AV.Query('Comment');
  commentQuery.descending('createdAt');
  commentQuery.limit(10);
  commentQuery.include('targetTodoFolder');// 关键代码，用 includeKey 告知服务端需要返回的关联属性对应的对象的详细信息，而不仅仅是 objectId
  commentQuery.find<AV.Object []>().then((comments)=>{
    // comments 是最近的十条评论, 其 targetTodoFolder 字段也有相应数据
    for(let comment of comments){
      // 并不需要网络访问
      let todoFolder = comment.get('targetTodoFolder');
    }
  },(error)=>{

  });
```
{% endblock %}

{% block code_query_comment_match_query_todoFolder %}

```js
  // 构建内嵌查询
  var innerQuery = new AV.Query('TodoFolder');
  innerQuery.greaterThan('likes', 20);

  // 将内嵌查询赋予目标查询
  var query = new AV.Query('Comment');

  // 执行内嵌操作
  query.matchesQuery('targetTodoFolder', innerQuery);
  query.find().then(function (results) {
     // results 就是符合超过 20 个赞的 TodoFolder 这一条件的 Comment 对象集合
  }, function (error) {
  });

  query.doesNotMatchQuery('targetTodoFolder', innerQuery);
  // 如此做将查询出 likes 小于或者等于 20 的 TodoFolder 的 Comment 对象
```
```ts
  // 构建内嵌查询
  let innerQuery: AV.Query = new AV.Query('TodoFolder');
  innerQuery.greaterThan('likes',20);

  // 将内嵌查询赋予目标查询
  let query: AV.Query = new AV.Query('Comment');

  // 执行内嵌操作
  query.matchesQuery('targetTodoFolder',innerQuery);

  query.find<AV.Object []>().then((results)=>{
    // results 就是符合超过 20 个赞的 TodoFolder 这一条件的 Comment 对象集合
  },(error)=>{

  });

  query.doesNotMatchQuery('targetTodoFolder',innerQuery);
  // 如此做将查询出 likes 小于或者等于 20 的 TodoFolder 的 Comment 对象
```
{% endblock %}

{% block code_query_find_first_object %}

```js
  var query = new AV.Query('Comment');
  query.equalTo('priority', 0);
  query.first().then(function (data) {
    // data 就是符合条件的第一个 AV.Object
  }, function (error) {
  });
```
```ts
  let query: AV.Query = new AV.Query('Comment');
  query.equalTo('priority',0);
  query.first<AV.Object>().then((data)=>{
    // data 就是符合条件的第一个 AV.Object
  },(error)=>{
  });
```
{% endblock %}

{% block code_set_query_limit %}

```js
  var query = new AV.Query('Todo');
  var now = new Date();
  query.lessThanOrEqualTo('createdAt', now);//查询今天之前创建的 Todo
  query.limit(10);// 最多返回 10 条结果
```
```ts
  let query: AV.Query = new AV.Query('Todo');
  let now : Date = new Date();
  query.lessThanOrEqualTo('createdAt',now);//查询今天之前创建的 Todo
  query.limit(10);// 最多返回 10 条结果
```
{% endblock %}

{% block code_set_skip_for_pager %}

```js
  var query = new AV.Query('Todo');
  var now = new Date();
  query.lessThanOrEqualTo('createdAt', now);//查询今天之前创建的 Todo
  query.limit(10);// 最多返回 10 条结果
  query.skip(20);// 跳过 20 条结果
```
```ts
  let query: AV.Query = new AV.Query('Todo');
  let now : Date = new Date();
  query.lessThanOrEqualTo('createdAt',now);//查询今天之前创建的 Todo
  query.limit(10);// 最多返回 10 条结果
  query.skip(20);  // 跳过 20 条结果
```

{% endblock %}

{% block code_query_select_keys %}

```js
  var query = new AV.Query('Todo');
  query.select('title', 'content');
  query.find().then(function (results) {
      for (var i = 0； i < results.length; i++) {
          var todo = results[i];
          var title = todo.get('title');
          var content = todo.get('content');
          var location_1 = todo.get('location');
      }
  }, function (error) {
  });
```
```ts
  let query: AV.Query = new AV.Query('Todo');
  // 指定返回的属性
  query.select('title','content');
  query.find<AV.Object []>().then((results)=>{
    for(let todo of results){
      let title = todo.get('title');
      let content = todo.get('content');

      // 如果访问没有指定返回的属性（key），则会报错，在当前这段代码中访问 location 属性就会报错
      let location = todo.get('location');
    }
  },(error)=>{

  });
```
{% endblock %}

{% block code_query_count %}

```js
  var query = new AV.Query('Todo');
  query.equalTo('status', 1);
  query.count().then(function (count) {
      console.log(count);
  }, function (error) {
  });
```
```ts
  let query: AV.Query = new AV.Query('Todo');
  query.equalTo('status',1);
  query.count<number>().then((count)=>{
    console.log(count);
  },(error)=>{

  });
```
{% endblock %}

{% block code_query_orderby %}

```js
  // 按时间，升序排列
  query.ascending('createdAt');

  // 按时间，降序排列
  query.descending('createdAt');
```
```ts
  // 按时间，升序排列
  query.ascending('createdAt');

  // 按时间，降序排列
  query.descending('createdAt');
```
{% endblock %}

{% block code_query_orderby_on_multiple_keys %}

```js
  var query = new AV.Query('Todo');
  query.ascending('priority');
  query.descending('createdAt');
```
```ts
  let query: AV.Query = new AV.Query('Todo');
  query.ascending('priority');
  query.descending('createdAt');
```
{% endblock %}

{% block code_query_with_or %}

```js
  var priorityQuery = new AV.Query('Todo');
  priorityQuery.greaterThanOrEqualTo('priority', 3);

  var statusQuery = new AV.Query('Todo');
  statusQuery.equalTo('status', 1);

  var query = AV.Query.or(priorityQuery, statusQuery);
  // 返回 priority 大于等于 3 或 status 等于 1 的 Todo
```
```ts
  let priorityQuery: AV.Query = new AV.Query('Todo');
  priorityQuery.greaterThanOrEqualTo('priority',3);

  let statusQuery: AV.Query = new AV.Query('Todo');
  statusQuery.equalTo('status',1);

  let query : AV.Query =  AV.Query.or(priorityQuery,statusQuery);
  // 返回 priority 大于等于 3 或 status 等于 1 的 Todo
```
{% endblock %}

{% block code_query_with_and %}

```js
  var priorityQuery = new AV.Query('Todo');
  priorityQuery.greaterThanOrEqualTo('priority', 3);

  var statusQuery = new AV.Query('Todo');
  statusQuery.equalTo('status', 1);

  var query = AV.Query.and(priorityQuery, statusQuery);
  // 返回 priority 小于 3 并且 status 等于 0 的 Todo
```
```ts
  let priorityQuery: AV.Query = new AV.Query('Todo');
  priorityQuery.greaterThanOrEqualTo('priority',3);

  let statusQuery: AV.Query = new AV.Query('Todo');
  statusQuery.equalTo('status',1);

  let query : AV.Query =  AV.Query.and(priorityQuery,statusQuery);
  // 返回 priority 小于 3 并且 status 等于 0 的 Todo
```
{% endblock %}

{% block code_query_where_keys_exist %}

```js
  var aTodoAttachmentImage = AV.File.withURL('attachment.jpg', 'http://www.zgjm.org/uploads/allimg/150812/1_150812103912_1.jpg');
  var todo = new AV.Object('Todo');
  todo.set('images', aTodoAttachmentImage);
  todo.set('content', '记得买过年回家的火车票！！！');
  todo.save();

  var query = new AV.Query('Todo');
  query.exists('images');
  query.find().then(function (results) {
    // results 返回的就是有图片的 Todo 集合
  }, function (error) {
  });

  // 使用空值查询获取没有图片的 Todo
  query.doesNotExist('images');
```
```ts
  let aTodoAttachmentImage : AV.File = AV.File.withURL('attachment.jpg','http://www.zgjm.org/uploads/allimg/150812/1_150812103912_1.jpg');
  let todo: AV.Object = new AV.Object('Todo');
  todo.set('images',aTodoAttachmentImage);
  todo.set('content','记得买过年回家的火车票！！！');
  todo.save();

  let query : AV.Query = new AV.Query('Todo');
  query.exists('images');
  query.find<AV.Object []>().then((results)=>{
    // results 返回的就是有图片的 Todo 集合
  },(error)=>{

  });

  // 使用空值查询获取没有图片的 Todo
  query.doesNotExist('images');
```
{% endblock %}

{% block code_query_by_cql %}

```js
  var cql = 'select * from %@ where status = 1';
  AV.Query.doCloudQuery(cql).then(function (data) {
      // results 即为查询结果，它是一个 AV.Object 数组
      var results = data.results;
  }, function (error) {
  });
  cql = 'select * from %@ where status = 1';
  AV.Query.doCloudQuery(cql).then(function (data) {
      // 获取符合查询的数量
      var count = data.count;
  }, function (error) {
  });
```
```ts
  let cql : string = 'select * from %@ where status = 1';
  AV.Query.doCloudQuery<any>(cql).then((data)=>{
    let results = data.results;
    // results 即为查询结果，它是一个 AV.Object 数组
  },(error)=>{

  });

  cql  = 'select * from %@ where status = 1';
  AV.Query.doCloudQuery<any>(cql).then((data)=>{
     let count = data.count;
     // count 是 number 类型
  },(error)=>{

  });
```
{% endblock %}

{% block code_query_by_cql_with_placeholder %}

```js
  // 带有占位符的 cql 语句
  var cql = 'select * from %@ where status = ? and priority = ?';
  var pvalues = [0, 1];
  AV.Query.doCloudQuery(cql, pvalues).then(function (data) {
      // results 即为查询结果，它是一个 AV.Object 数组
      var results = data.results;
  }, function (error) {
  });
```
```ts
  // 带有占位符的 cql 语句
  let cql : string = 'select * from %@ where status = ? and priority = ?';
  let pvalues = [0,1];
  AV.Query.doCloudQuery<any>(cql,pvalues).then((data)=>{
     let results = data.results;
     // results 即为查询结果，它是一个 AV.Object 数组
  },(error)=>{

  });
```
{% endblock %}

{% block text_query_cache_intro %}{% endblock %}

{% block code_set_cache_policy %}{% endblock %}

{% block table_cache_policy %}{% endblock %}

{% block code_query_geoPoint_near %}

```js
  var query = new AV.Query('Todo');
  var point = new AV.GeoPoint('39.9', '116.4');
  query.withinKilometers('whereCreated', point, 2.0);
  query.find().then(function (results) {
      var nearbyTodos = results;
  }, function (error) {
  });
```
```ts
  let query : AV.Query = new AV.Query('Todo');
  let point : AV.GeoPoint = new AV.GeoPoint('39.9','116.4');
  query.withinKilometers('whereCreated',point,2.0);
  query.find<AV.Object []>().then((results)=>{
    let nearbyTodos : AV.Object [] = results;
  },(error)=>{
  });
```

在上面的代码中，`nearbyTodos` 返回的是与 `point` 这一点按距离排序（由近到远）的对象数组。注意：**如果在此之后又使用了 `ascending` 或 `descending` 方法，则按距离排序会被新排序覆盖。**
{% endblock %}

{% block text_platform_geoPoint_notice %}{% endblock %}

{% block code_query_geoPoint_within %}

```js
  var query = new AV.Query('Todo');
  var point = new AV.GeoPoint('39.9', '116.4');
  query.withinKilometers('whereCreated', point, 2.0);
```
```ts
  let query : AV.Query = new AV.Query('Todo');
  let point : AV.GeoPoint = new AV.GeoPoint('39.9','116.4');
  query.withinKilometers('whereCreated',point,2.0);
```
{% endblock %} code_object_fetch_with_keys


{% block link_to_relation_guide_doc %}[JavaScript 关系建模指南](relation_guide-js.html){% endblock %}

{% set link_to_sms_guide_doc = '[JavaScript 短信服务使用指南](sms_guide-js.html#注册验证)' %}

{% block code_send_sms_code_for_loginOrSignup %}

```js
  AV.Cloud.requestSmsCode('13577778888').then(function (success) {
  }, function (error) {
  });
```
```ts
    AV.Cloud.requestSmsCode('13577778888').then((success)=>{
    },(error)=>{
    });
```
{% endblock %}

{% block code_verify_sms_code_for_loginOrSignup %}

```js
  AV.User.signUpOrlogInWithMobilePhone('13577778888', '123456').then(function (success) {
  }, function (error) {
  });
```
```ts
    AV.User.signUpOrlogInWithMobilePhone('13577778888','123456').then((success)=>{  
    },(error)=>{  
    });
```
{% endblock %}

{% block code_user_signUp_with_username_and_password %}

```js
  var user = new AV.User();// 新建 AVUser 对象实例
  user.setUsername('Tom');// 设置用户名
  user.setPassword('cat!@#123');// 设置密码
  user.setEmail('tom@leancloud.cn');// 设置邮箱
  user.signUp().then(function (loginedUser) {
      console.log(loginedUser);
  }, (function (error) {
  }));
```
```ts
  let user : AV.User = new AV.User();// 新建 AVUser 对象实例
  user.setUsername('Tom');// 设置用户名
  user.setPassword('cat!@#123');// 设置密码
  user.setEmail('tom@leancloud.cn');// 设置邮箱

  user.signUp<AV.User>().then((loginedUser)=>{
    console.log(loginedUser);
  },(error=>{

  }));
```
{% endblock %}

{% block code_user_logIn_with_username_and_password %}

```js
  AV.User.logIn('Tom', 'cat!@#123').then(function (loginedUser) {
      console.log(loginedUser);
  }, (function (error) {
  }));
```
```ts
  AV.User.logIn<AV.User>('Tom','cat!@#123').then((loginedUser)=>{
    console.log(loginedUser);
  },(error=>{
  }));
```
{% endblock %}

{% block code_user_logIn_with_mobilephonenumber_and_password %}

```js
  AV.User.logInWithMobilePhone('13577778888', 'cat!@#123').then(function (loginedUser) {
      console.log(loginedUser);
  }, (function (error) {
  }));
```
```ts
  AV.User.logInWithMobilePhone<AV.User>('13577778888','cat!@#123').then((loginedUser)=>{
    console.log(loginedUser);
  },(error=>{
  }));
```
{% endblock %}

{% block code_user_logIn_requestLoginSmsCode %}

```js
AV.User.requestLoginSmsCode('13577778888').then(function (success) {
  }, function (error) {
  });
```
```ts
AV.User.requestLoginSmsCode('13577778888').then((success)=>{  
  },(error)=>{
  });
```
{% endblock %}

{% block code_user_logIn_with_smsCode %}

```js
  AV.User.logInWithMobilePhoneSmsCode('13577778888', '238825').then(function (success) {
  }, function (error) {
  });
```
```ts
AV.User.logInWithMobilePhoneSmsCode('13577778888','238825').then((success)=>{
  },(error)=>{
  });
```
{% endblock %}

{% block code_get_user_properties %}

```js
  AV.User.logIn('Tom', 'cat!@#123').then(function (loginedUser) {
      console.log(loginedUser);
      var username = loginedUser.getUsername();
      var email = loginedUser.getEmail();
      // 请注意，密码不会明文存储在云端，因此密码只能重置，不能查看
  }, (function (error) {
  }));
```
```ts
  AV.User.logIn<AV.User>('Tom','cat!@#123').then((loginedUser)=>{
    console.log(loginedUser);
    let username :string = loginedUser.getUsername();
    let email :string = loginedUser.getEmail();
    // 请注意，密码不会明文存储在云端，因此密码只能重置，不能查看
  },(error=>{
  }));
```
{% endblock %}

{% block code_set_user_custom_properties %}

```js
  AV.User.logIn('Tom', 'cat!@#123').then(function (loginedUser) {
      console.log(loginedUser);
      loginedUser.set('age', 25);
      loginedUser.save();
  }, (function (error) {
  }));
```
```ts
  AV.User.logIn<AV.User>('Tom','cat!@#123').then((loginedUser)=>{
    console.log(loginedUser);
    loginedUser.set('age',25);
    loginedUser.save();
  },(error=>{
  }));
```
{% endblock %}

{% block code_update_user_custom_properties %}

```js
  AV.User.logIn('Tom', 'cat!@#123').then(function (loginedUser) {
      console.log(loginedUser);
      loginedUser.set('age', 25);
      loginedUser.save();
  }, (function (error) {
  }));
```
```ts
  AV.User.logIn<AV.User>('Tom','cat!@#123').then((loginedUser)=>{
    console.log(loginedUser);
    loginedUser.set('age',25);
    loginedUser.save();
  },(error=>{
  }));
```
{% endblock %}

{% block code_reset_password_by_email %}

```js
  AV.User.requestPasswordReset('myemail@example.com').then(function (success) {
  }, function (error) {
  });
```
``` ts
  AV.User.requestPasswordReset('myemail@example.com').then((success)=>{
  },(error)=>{
  });
```
{% endblock %}

{% block code_reset_password_by_mobilephoneNumber %}

```js
  AV.User.requestPasswordResetBySmsCode('18612340000').then(function (success) {
  }, function (error) {
  });
```
```ts
  AV.User.requestPasswordResetBySmsCode('18612340000').then((success)=>{
  },(error)=>{
  });
```
{% endblock %}

{% block code_reset_password_by_mobilephoneNumber_verify %}

```js
  AV.User.resetPasswordBySmsCode('123456', 'thenewpassword').then(function (success) {
  }, function (error) {
  });
```
```ts
  AV.User.resetPasswordBySmsCode('123456','thenewpassword').then((success)=>{
  },(error)=>{
  });
```
{% endblock %}

{% block code_current_user %}

```js
  var currentUser = AV.User.current();
  if (currentUser) {
     // 跳转到首页
  }
  else {
     //currentUser 为空时，可打开用户注册界面…
  }
```
```ts
  let currentUser :AV.User = AV.User.current();
  if(currentUser){
    // 跳转到首页
  } else {
    //currentUser 为空时，可打开用户注册界面…
  }
```
{% endblock %}

{% block code_current_user_logout %}

```js
  AV.User.logOut();
  // 现在的 currentUser 是 null 了
  var currentUser = AV.User.current();
```
```ts
  AV.User.logOut();
  // 现在的 currentUser 是 null 了
  let currentUser :AV.User = AV.User.current();
```
{% endblock %}

{% block code_query_user %}

```js
  var query = new AV.Query('_User');
```
```ts
  let query : AV.Query = new AV.Query('_User');
```
{% endblock %}

{% block text_subclass %}{% endblock %}
{% block text_sns %}{% endblock %}
{% block text_feedback %}{% endblock %}
{% block link_to_in_app_search_doc %}[JavaScript 应用内搜索指南](app_search_guide.html){% endblock %}
{% block link_to_status_system_doc %}[JavaScript 应用内社交模块](status_system.html#JavaScript_SDK){% endblock %}

{# --End--主模板留空的代码段落，子模板根据自身实际功能给予实现 #}

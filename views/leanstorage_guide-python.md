{# 指定继承模板 #}
{% extends "./leanstorage_guide.tmpl" %}

{# --Start--变量定义，主模板使用的单词，短语所有子模板都必须赋值 #}
{% set cloudName ="LeanCloud" %}
{% set productName ="LeanStorage" %}
{% set platform_title ="Python" %}
{% set segment_code ="Python" %}
{% set sdk_name ="Python SDK" %}
{% set baseObjectName ="Object" %}
{% set objectIdName ="id" %}
{% set updatedAtName ="updated_at" %}
{% set createdAtName ="created_at" %}
{% set backgroundFunctionTemplate ="xxxxInBackground" %}
{% set saveEventuallyName ="saveEventually" %}
{% set deleteEventuallyName ="deleteEventually" %}
{% set relationObjectName ="Relation" %}
{% set pointerObjectName ="Pointer" %}
{% set baseQueryClassName ="Query" %}
{% set geoPointObjectName ="GeoPoint" %}
{% set userObjectName ="User" %}
{% set fileObjectName ="File" %}
{% set dateType= "Date" %}
{% set byteType= "byte[]" %}
{% set funtionName_whereKeyHasPrefix = "startsWith()" %}


{# --End--变量定义，主模板使用的单词，短语的定义所有子模板都必须赋值 #}

{# --Start--主模板留空的代码段落，子模板根据自身实际功能给予实现 #}


{% block code_quick_save_a_todo %}

```python
import leancloud
from leancloud import Object

#可以用继承的方式定义 Object 的子类
class Todo(Object):
  pass
#或者用以下的方式定义子类
#Todo = Object.extend('Todo')
todo = Todo()
todo.set('title', '工程师周会')  
todo.set('content', '每周工程师会议，周一下午2点')
todo.save()
```
{% endblock %}


{% block code_quick_save_a_todo_with_location %}

```python
import leancloud
from leancloud import Object

Todo = Object.extend('Todo')
todo = Todo()
todo.set('title', '工程师周会')  
todo.set('content', '每周工程师会议，周一下午2点')
todo.set('location', '会议室')  #增加一个字段
todo.save()
```
{% endblock %}



{% block code_create_todo_object %}

```python
import leancloud
from leancloud import Object
# 构造方法传入的参数，对应的就是控制台中的 Class Name
Todo = Object.extend('Todo')
todo = Todo()
```
{% endblock %}



{% block code_save_todo_folder %}

```python
import leancloud
from leancloud import Object

TodoFolder = Object.extend('TodoFolder')
todoFolder = TodoFolder()
todoFolder.set('name', '工作')  
todoFolder.set('priority',1)
todoFolder.save()
```
{% endblock %}







{% block code_save_object_by_cql %}

```python
import leancloud
from leancloud import Query

result = Query.do_cloud_query(r"insert into TodoFolder(name, priority) values('工作', 78)")
```
{% endblock %}



{% block code_data_type %}

```python
import datetime
import leancloud
from leancloud import Object

SupportedType = Object.extend('SupportedType')
supportedType = SupportedType()
supportedType.set('string', '工作')  
supportedType.set('int',108)
supportedType.set('float',1.890)
supportedType.set('boolean',True)
supportedType.set('list',[1,2,[3,4,"string"]])
supportedType.set('map',{"item1":12, "item2":"string item", "item3":[1,2,"3"]})
supportedType.set('date',datetime.datetime.now())
supportedType.save()
```

此外，map 和 list 支持嵌套，这样在一个 Object 中就可以使用它们来储存更多的结构化数据。

我们**不推荐**在 `Object` 中使用 `list` 类型来储存大块的二进制数据，比如图片或整个文件。**每个 `Object` 的大小都不应超过 128 KB**。如果需要储存更多的数据，建议使用 `File`。更多细节可以阅读本文 [文件](#文件) 部分。

若想了解更多有关 LeanStorage 如何解析处理数据的信息，请查看专题文档《[数据与安全](./data_security.html)》。
{% endblock %}


{% block code_get_todo_by_objectId %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

Todo = Object.extend('Todo')
query = Query(Todo)  # 这里也可以直接传递一个 Class 名字的字符串作为构造参数
query_result = query.get('57301af42e958a006982efad') # 这里填入需要查询的 objectId
title = query_result.get('title')
```
{% endblock %}


{% block code_save_callback_get_objectId %}

```python
import leancloud
from leancloud import Object

Todo = Object.extend('Todo')
todo = Todo()
todo.set('title', '工程师周会')  
todo.set('content', '每周工程师会议，周一下午2点')
todo.save()
#一旦保存成功，todo对象就会获得一个objectId，通过todo.id获得
objectId = todo.id
```
{% endblock %}


{% block code_access_todo_folder_properties %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

Todo = Object.extend('Todo')
query = Query(Todo)  # 这里也可以直接传递一个 Class 名字的字符串作为构造参数
query_result = query.get('57301af42e958a006982efad') # 这里填入需要查询的 objectId
title = query_result.get('title')
content = query_result.get('content')

#获取三个特殊属性
objectId = query_result.id
updateAt = query_result.updated_at
createdAt = query_result.created_at
```
{% endblock %}



{% block code_object_fetch %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

Todo = Object.extend('Todo')
todo = Todo.create_without_data('57301af42e958a006982efad')   #这里填入你所要获取的objectId
todo.fetch()
title = todo.get('title')
content = todo.get('content')
```
{% endblock %}


{% block code_object_fetchWhenSave %}

```python
todo.fetch_when_save = True #设置 fetchWhenSave 为 true
todo.save()
```
{% endblock %}


{% block code_update_todo_location %}

```python
import leancloud
from leancloud import Object

Todo = Object.extend('Todo')
todo = Todo.create_without_data('57301af42e958a006982efad')   #这里填入你所要获取的objectId
title = todo.set('title','Another title')
todo.save()
```
{% endblock %}

{% block code_update_object_by_cql %}

```python
import leancloud
from leancloud import Query

result = Query.do_cloud_query(r"update TodoFolder set name='家庭' where objectId='57318f14df0eea006331a19a'")
```
{% endblock %}



{% block code_atomic_operation_increment %}

```python
import leancloud
from leancloud import Object

Todo = Object.extend('Todo')
todo = Todo.create_without_data('57301af42e958a006982efad')   #这里填入你所要获取的objectId
title = todo.set('views',0)  #原子增加查看次数
todo.save()

todo.increment('views')
todo.fetch_when_save = True
todo.save()

todo.increment('views', 5)
todo.save()
```
{% endblock %}



{% block code_atomic_operation_array %}

* `add()`<br>
  将指定对象附加到数组末尾。
* `add_unique()`<br>
  如果不确定某个对象是否已包含在数组字段中，可以使用此操作来添加。

{% endblock %}

{% block code_set_array_value %}

```python
import datetime
import leancloud
from leancloud import Object

leancloud.init("EhAPcOpWYqBGTV045GK4jVW7-gzGzoHsz", "iUtOLymTFVnSI8020CgjJ5TQ")

Todo = Object.extend('Todo')
todo = Todo()

reminder1 = datetime.datetime(2015,11,11,07,10,00)
reminder2 = datetime.datetime(2015,11,11,07,20,00)
reminder3 = datetime.datetime(2015,11,11,07,30,00)

todo.add('reminders', reminder1)
todo.add('reminders', reminder2)
todo.add('reminders', reminder3)
todo.save()
```
{% endblock %}


{% block code_delete_todo_by_objectId %}

```python
todo.destroy();
```
{% endblock %}


{% block code_delete_todo_by_cql %}

```python
#执行 CQL 语句实现删除一个 Todo 对象
import leancloud
from leancloud import Query

Query.do_cloud_query(r"delete from Todo where objectId='5731a29d71cfe4006cbdbc22'")
```
{% endblock %}



{% block code_batch_operation %}

```python
#批量创建、更新
save_all()

#批量删除
destroy_all()
```
{% endblock %}


{% block code_relation_todoFolder_one_to_many_todo %}

```python
import leancloud
from leancloud import Object

Todo = Object.extend('Todo')
TodoFolder = Object.extend('TodoFolder')

todoFolder = TodoFolder()
todoFolder.set('name','工作')
todoFolder.set('priority',1)

todo1 = Todo()
todo1.set('title','工程师周会')
todo1.set('content','工程师周会，周一下午2点')
todo1.set('location','会议室')

todo2 = Todo()
todo2.set('title','维护文档')
todo2.set('content','每天 16：00 到 18：00 定期维护文档')
todo2.set('location','当前工位')

todo3 = Todo()
todo3.set('title','发布 SDK')
todo3.set('content','每周一下午 15：00')
todo3.set('location','SA 工位')

todo1.save()
todo2.save()
todo3.save()

relation = todoFolder.relation('containedTodos')
relation.add(todo1)
relation.add(todo2)
relation.add(todo3)

todoFolder.save()
```
{% endblock %}



{% block code_batch_set_todo_completed %}

```python
import leancloud
from leancloud import Object

Todo = Object.extend('Todo')
todo1 = Todo()
todo2 = Todo()
todo3 = Todo()
todo1.set('status',1)
todo2.set('status',2)
todo3.set('status',3)

Todo.save_all([todo1, todo2, todo3])  #save_all是一个类方法
```
{% endblock %}




{% block code_saveoption_query_example %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

Wiki = Object.extend('Wiki')
wiki = Wiki()
wiki.set('content','Hello World!')
wiki.set('version',2)
wiki.save()

#这里其它的进程可能已经更新了 wiki 的内容和版本，如下的更新可能会出错
query = Query('Wiki')
query.equal_to('version', 2) #可能查询的时候版本号不符
wiki.set('content', 'Morning, World!')
try:
    wiki.save(query)
except Exception, e:
    print "无法保存修改，wiki 已被他人更新。"   #如果抛出异常，则说明 query 的条件不符合
else:
    print "保存成功。"
```
{% endblock %}





{% block code_object_fetch_with_keys %}

```python
#python-SDK 暂不支持
```
{% endblock %}





{% block code_pointer_comment_one_to_many_todoFolder %}

```python
import leancloud
from leancloud import Object

Comment = Object.extend('Comment')
TodoFolder = Object.extend('TodoFolder')

todoFolder = TodoFolder()
comment = Comment()
comment.set('like',1) #如果点了赞就是 1，而点了不喜欢则为 -1，没有做任何操作就是默认的 0
comment.set('content','这个太赞了！楼主，我也要这些游戏，咱们团购么？') #留言的内容

#假设已知了被分享的该 TodoFolder 的 objectId 是 5732a4821ea4930064013bdb
comment.set('targetTodoFolder',todoFolder.create_without_data('5732a4821ea4930064013bdb'))
comment.save()
```

{% endblock %}



{% block code_create_geoPoint %}

```python
import leancloud
from leancloud import GeoPoint

point = GeoPoint(39.9, 116.4)
```
{% endblock %}


{% block code_use_geoPoint %}

```python
todo.set('whereCreated', point)
todo.save()
```
{% endblock %}

{% block code_serialize_baseObject_to_string %}

```python
#python-SDK 暂不支持

```

{% endblock %}

{% block code_deserialize_string_to_baseObject %}

```python
#python-SDK 暂不支持
```
{% endblock %}


{% block code_data_protocol_save_date %}{% endblock %}

{% block code_create_avfile_by_stream_data %}

```python
import leancloud
from leancloud import File
from StringIO import StringIO

file1 = File('resume.txt', StringIO('data'))

file2 = File('fileFromBuffer.txt', buffer('\x42\x43\x44'))

# 还可以指定文件的mime type，如果不指定的话会根据文件名后缀来猜测
file3 = File('truth.txt', StringIO('{"truth": 42}'), 'application/json')

file1.save()
file2.save()
file3.save()
```
{% endblock %}

{% block code_create_avfile_from_local_path %}

```python
import leancloud
from leancloud import File

with open('~/avatar.png') as f:
    file = File('fileFromLocalFile', f)
    file.save()
```
{% endblock %}

{% block code_create_avfile_from_url %}

```python
import leancloud
from leancloud import File

file = File.create_with_url('avatar.jpg', 'http://www.example.com/avatar.jpg')
file.save()
```
{% endblock %}

{% block code_upload_file %}

```python
file.save()  #执行上传
objectId = file.id #一旦保存成功会返回文件的 objectId
```
{% endblock %}

{% block code_upload_file_with_progress %}

```java
        file.saveInBackground(new SaveCallback() {
            @Override
            public void done(AVException e) {
                // 成功或失败处理...
            }
        }, new ProgressCallback() {
            @Override
            public void done(Integer integer) {
                // 上传进度数据，integer 介于 0 和 100。
            }
        });
```
{% endblock %}

{% block code_download_file %}

```python
url = file.url
```
{% endblock %}

{% block code_file_image_thumbnail %}
```python
import leancloud
from leancloud import File

file = File.create_without_data('5732df1c1ea4930060ba4642')
file.fetch()

thumbnail_url = file.get_thumbnail_url(width='100', height='100')
```
{% endblock %}


{% block code_file_metadata %}
```python
import leancloud
from leancloud import File

with open('~/avatar.png') as f:
    file = File('fileFromLocalFile', f)
    file.metadata['width'] = 100 #file.metadata是一个字典，可以添加内容并保存
    file.metadata['heigth'] = 100
    file.metadata['author'] = 'LeanCloud'
    file.save()
```
{% endblock %}

{% block code_file_delete %}

``` python
import leancloud
from leancloud import File
#默认情况下文件的产出权限是关闭的，如果想要删除需要更改class权限或者使用 master_key
leancloud.init("yourAppId", master_key="YourMasterKey")

file = File.create_without_data('5732f4cf71cfe4006cc89d75')
file.destroy()
```
{% endblock %}

{% block code_cache_operations_file %}{% endblock %}

{% block code_create_query_by_className %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

Todo = Object.extend('Todo')
query = Query(Todo)
```
{% endblock %}

{% block text_create_query_by_avobject %}{% endblock %}

{% block code_create_query_by_avobject %}

```java

```
{% endblock %}

{% block code_priority_equalTo_zero_query %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

Todo = Object.extend('Todo')
query = Query(Todo)

#获取符合 priority = 0 的 Todo数组
query_list = query.equal_to('priority', 0).find()
```
{% endblock %}

{% block code_priority_equalTo_zero_and_one_wrong_example %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

Todo = Object.extend('Todo')
query = Query(Todo)

query.equal_to('priority', 0)
query.equal_to('priority', 0)  

#如果这样写，只会返回 priority = 1 的结果
query_list = query.find()
```
{% endblock %}

{% block table_logic_comparison_in_query %}
逻辑操作 | AVQuery 方法|
---|---
等于 | `equal_to`
不等于 |  `not_equal_to`
大于 | `greater_than`
大于等于 | `greater_than_or_equal_to`
小于 | `less_than`
小于等于 | `less_than_or_equal_to`
{% endblock %}

{% block code_query_lessThan %}

```python
query.less_than_or_equal_to("priority", 2);
```
{% endblock %}

{% block code_query_greaterThanOrEqualTo %}

```python
query.greater_than_or_equal_to("priority", 2);
```
{% endblock %}

{% block code_query_with_regular_expression %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

Todo = Object.extend('Todo')
query = Query(Todo)
query.matched('title', '^工程师')
todo_list = query.find()
```
{% endblock %}

{% block code_query_with_contains_keyword %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

Todo = Object.extend('Todo')
query = Query(Todo)

query.contains('title', '工程师')
```
{% endblock %}

{% block code_query_with_not_contains_keyword_using_regex %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

Todo = Object.extend('Todo')
query = Query(Todo)

query.matched('title', '^((?!工程师).)*')
```
{% endblock %}

{% block code_query_with_not_contains_keyword %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

Todo = Object.extend('Todo')
query = Query(Todo)

query.not_contained_in('title',['工程师周会'])
```
{% endblock %}

{% block code_query_array_contains_using_equalsTo %}

```java
import datetime
import leancloud
from leancloud import Object
from leancloud import Query

Todo = Object.extend('Todo')
query = Query(Todo)

reminder1 = datetime.datetime(2015,11,11,07,10,00)
reminder2 = datetime.datetime(2015,11,11,07,30,00)

#如果只查询数组中含有某一个特定的元素可以用 equal_to 函数
query.equal_to('reminders', reminder1)

#如果查询数组中含有多个元素，则用contains_all函数
query.contains_all('reminders', [reminder1,reminder2])
```
{% endblock %}

{% block code_query_array_contains_all %}

```python
import datetime
import leancloud
from leancloud import Object
from leancloud import Query

Todo = Object.extend('Todo')
query = Query(Todo)

reminder1 = datetime.datetime(2015,11,11,8,30,00)
reminder2 = datetime.datetime(2015,11,11,9,30,00)

#如果精确查询数组元素，则用 equal_to 函数，并在第二个参数传入需要精确查询的数组
query.equal_to('reminders', [reminder1, reminder2])
```
{% endblock %}

{% block code_query_whereHasPrefix %}

```python
#找出开头是「早餐」的 Todo
query.startsWith("content", "早餐");
```
{% endblock %}

{% block code_query_comment_by_todoFolder %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

query = Query("Comment")
TodoFolder = Object.extend('TodoFolder')
query.equal_to('targetTodoFolder', TodoFolder.create_without_data('5732a4821ea4930064013bdb'))
```
{% endblock %}

{% block code_create_tag_object %}

```python
import leancloud
from leancloud import Object

Tag = Object.extend('Tag')
tag = Tag()
tag.set('name','今日必做')
tag.save()
```
{% endblock %}

{% block code_create_family_with_tag %}

```python
import leancloud
from leancloud import Object

Tag = Object.extend('Tag')
tag1 = Tag()
tag1.set('name','今日必做')
tag1.save()

tag2 = Tag()
tag2.set('name','老婆吩咐')
tag2.save()

tag3 = Tag()
tag3.set('name','十分重要')
tag3.save()

TodoFolder = Object.extend('TodoFolder')
todoFolder = TodoFolder()
todoFolder.set('name','家庭')
todoFolder.set('priority', 1)

relation = todoFolder.relation('tags')
relation.add(tag1)
relation.add(tag2)
relation.add(tag3)

todoFolder.save()  #保存到云端
```
{% endblock %}

{% block code_query_tag_for_todoFolder %}

```python
import leancloud
from leancloud import Object

TodoFolder = Object.extend('TodoFolder')
todoFolder = TodoFolder.create_without_data('5735744479bc44005c402c51')

relation = todoFolder.relation('tags')
query = relation.query #返回一个 query 对象
query.count()  #返回第一个 tag 的数量
```
{% endblock %}

{% block code_query_todoFolder_with_tag %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

Tag = Object.extend('Tag')
tag = Tag.create_without_data('573573aec4c9710060f9a575')
query = Query('TodoFolder')
query.equal_to('tags', tag)
query.find()
```
{% endblock %}

{% block code_query_comment_include_todoFolder %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

commentQuery = Query('Comment')
commentQuery.descending('createdAt')
commentQuery.limit(10)
commentQuery.include('targetTodoFolder') #关键代码，用 includeKey 告知服务端需要返回的关联属性对应的对象的详细信息，而不仅仅是 objectId
comment_list = commentQuery.find()

for comment in comment_list:
    todoFolder = comment.get('targetTodoFolder') #返回一个 TodoFolder 的对象
    todo_name = todoFolder.get('name')
```
{% endblock %}

{% block code_query_find_first_object %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

Todo = Object.extend('Todo')
query = Query(Todo)
query.equal_to('priority', 3)
todo_first = query.first()
```
{% endblock %}

{% block code_set_query_limit %}

```python
import datetime
import leancloud
from leancloud import Object
from leancloud import Query

Todo = Object.extend('Todo')
query = Query(Todo)
date = datetime.datetime.now()

query.less_than('createdAt', date) #查询今天之前创建的 Todo
query.limit(10)   #最多返回 10 条结果
```
{% endblock %}

{% block code_set_skip_for_pager %}

```python
import datetime
import leancloud
from leancloud import Object
from leancloud import Query

Todo = Object.extend('Todo')
query = Query(Todo)
date = datetime.datetime.now()

query.less_than('createdAt', date) #查询今天之前创建的 Todo
query.limit(10)   #最多返回 10 条结果
query.skip(20)    #跳过 20 条结果 跳过 20 条结果
```

{% endblock %}

{% block code_query_count %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

Todo = Object.extend('Todo')
query = Query(Todo)
query.equal_to('status', 1)
todo_count = query.count() #获取输出计数
```

{% endblock %}

{% block code_query_comment_match_query_todoFolder %}

```python
import leancloud
from leancloud import Query

innerQuery = Query('TodoFolder')
innerQuery.greater_than('likes', 20) #设置内置查询条件

query = Query('Comment')
query.matches_query('targetTodoFolder', innerQuery)  #将内嵌查询赋予目标查询
#query.does_not_match_query('targetTodoFolder', innerQuery) #也可以查询不包含内嵌查询的目标查询
query.find()  #返回符合超过 20 个赞的 TodoFolder 这一条件的 Comment 对象集合
```
{% endblock %}

{% block code_query_select_keys %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

Todo = Object.extend('Todo')
query = Query(Todo)
query.select('title','content')
query_list = query.find()

for todo in query_list:
    title = todo.get('title')
    content = todo.get('content')
    #如果访问没有指定返回的属性（key），则会返回 null
    location = todo.get('location')
```
{% endblock %}

{% block code_query_orderby %}
```python
# 按时间，升序排列
query.ascending('createdAt')

# 按时间，降序排列
query.descending('createdAt')
```
{% endblock %}

{% block code_query_orderby_on_multiple_keys %}

```python
query.add_ascending('createdAt')
query.add_descending('priority')
```
{% endblock %}

{% block code_query_where_keys_exist %}

```python
import datetime
import leancloud
from leancloud import Object
from leancloud import Query
from leancloud import File

Todo = Object.extend('Todo')
img = File.create_with_url('avatar.jpg', 'http://www.example.com/avatar.jpg')
todo = Todo()
todo.set('images',img)
todo.save() #存储图片

query = Query(Todo)
query.exists('images') #查询images属性不为空的对象
query.does_not_exists('images') #查询images属性为空的对象
```
{% endblock %}

{% block code_query_with_or %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

Todo = Object.extend('Todo')
query1 = Query(Todo)
query2 = Query(Todo)

query1.greater_than('priority', 3)
query2.equal_to('status', 1)

#返回 priority 大于等于3 或 status 等于 1 的 Todo
query = Query.or_(query1,query2)
```
{% endblock %}

{% block code_query_with_and %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

Todo = Object.extend('Todo')
query1 = Query(Todo)
query2 = Query(Todo)

query1.greater_than('priority', 3)
query2.equal_to('status', 1)

#返回 priority 大于等于3 且 status 等于 1 的 Todo
query = Query.and_(query1,query2)
```
{% endblock %}


{% block code_query_by_cql %}

```python
import leancloud
from leancloud import Query

cql = "select * from Todo where status = 1"
todo_list = Query.do_cloud_query(cql)

cql = "select count(*) from Todo where priority = 0"
todo_count = Query.do_cloud_query(cql).count
```
{% endblock %}

{% block code_query_by_cql_with_placeholder %}

```java
import leancloud
from leancloud import Query

cql = " select * from Todo where status = ? and priority = ?"
todo_query = Query.do_cloud_query(cql, 1, 4)
todo_list  = todo_query.results #返回符合条件的 todo list
```
{% endblock %}

{% block code_set_cache_policy %}

```python
#python-SDK 暂不支持
```
{% endblock %}

{% block table_cache_policy %}

策略枚举 | 含义及解释|
---|---
`IGNORE_CACHE`| **（默认缓存策略）**查询行为不从缓存加载，也不会将结果保存到缓存中。
`CACHE_ONLY` |  查询行为忽略网络状况，只从缓存加载。如果没有缓存结果，该策略会产生 `AVException`。
`CACHE_ELSE_NETWORK` |  查询行为首先尝试从缓存加载，若加载失败，则通过网络加载结果。如果缓存和网络获取行为均为失败，则产生 `AVException`。
`NETWORK_ELSE_CACHE` | 查询行为先尝试从网络加载，若加载失败，则从缓存加载结果。如果缓存和网络获取行为均为失败，则产生 `AVException`。
`CACHE_THEN_NETWORK` | 查询先从缓存加载，然后从网络加载。在这种情况下，回调函数会被调用两次，第一次是缓存中的结果，然后是从网络获取的结果。因为它会在不同的时间返回两个结果，所以该策略不能与 `find()` 同时使用。
{% endblock %}

{% block code_cache_operation %}

* 检查是否存在缓存查询结果：

  ``` java
  boolean isInCache = query.hasCachedResult();
  ```

* 删除某一查询的任何缓存结果：

  ``` java
  query.clearCachedResult();
  ```

* 删除查询的所有缓存结果：

  ``` java
  AVQuery.clearAllCachedResults();
  ```

* 设定缓存结果的最长时限：

  ``` java
  query.setMaxCacheAge(60 * 60 * 24);// 一天的总秒数
  ```

查询缓存也适用于 `AVQuery` 的辅助方法，包括 `getFirst()` 和 `getInBackground()`。
{% endblock %}

{% block code_query_geoPoint_near %}

```java
import leancloud
from leancloud import Query
from leancloud import GeoPoint

leancloud.init("EhAPcOpWYqBGTV045GK4jVW7-gzGzoHsz", "iUtOLymTFVnSI8020CgjJ5TQ")
query = Query('Todo')
point = GeoPoint(39.9, 116.4)
query.limit(10)
query.near('whereCreated', point) #离这个位置最近的 10 个 Todo 对象
query.find()
```

在上面的代码中，`nearbyTodos` 返回的是与 `point` 这一点按距离排序（由近到远）的对象数组。注意：**如果在此之后又使用了 `orderByAscending` 或 `orderByDescending` 方法，则按距离排序会被新排序覆盖。**
{% endblock %}

{% block text_platform_geoPoint_notice %}
{% endblock %}

{% block code_query_geoPoint_within %}

```python
query.within_kilometers('whereCreated', point, 10)
```
{% endblock %} code_object_fetch_with_keys


{% block link_to_acl_doc %}[Python-SDK 权限管理使用指南](acl_guide-python.html){% endblock %}

{% block link_to_relation_guide_doc %}[Android 关系建模指南](relation_guide-android.html){% endblock %}

{% block link_to_sms_guide_doc %}[Android 短信服务使用指南](sms_guide-Android.html#注册验证){% endblock %}

{% block code_send_sms_code_for_loginOrSignup %}

```python
import leancloud
from leancloud import cloudfunc

cloudfunc.request_sms_code('135********')
```
{% endblock %}

{% block code_verify_sms_code_for_loginOrSignup %}

```python
import leancloud
from leancloud import User

User.signup_or_login_with_mobile_phone('135********','258794')  #填入手机获取的验证码
```
{% endblock %}

{% block code_user_signUp_with_username_and_password %}

```python
import leancloud
from leancloud import User

user = User()
user.set_username('ruyi')
user.set_password('fs87ds*')
user.set_email('ruyi-test@gmail.com')
user.sign_up()
```
{% endblock %}

{% block code_user_logIn_with_username_and_password %}

```python
import leancloud
from leancloud import User

user = User()
user.login('ruyi','fs87ds*')
```
{% endblock %}

{% block code_user_logIn_with_mobilephonenumber_and_password %}

```python
import leancloud
from leancloud import User

user = User()
user.login_with_mobile_phone('135********','fs87ds*')
```
{% endblock %}

{% block code_user_logIn_requestLoginSmsCode %}

```python
import leancloud
from leancloud import User

user = User()
user.request_login_sms_code('135********')
```
{% endblock %}

{% block code_user_logIn_with_smsCode %}

```python
import leancloud
from leancloud import User

user = User()
user.signup_or_login_with_mobile_phone('135********','897897')
```
{% endblock %}

{% block code_get_user_properties %}

```python
currentUsername = User.get_current().get_username()  
currentEmail =  User.get_current().get_email()    
#请注意，以下代码无法获取密码, 无 get_password() 此方法
currentPassword = User.get_current().getPassword()
```
{% endblock %}

{% block code_set_user_custom_properties %}

```python
User.get_current().set('age', 25)
User.get_current().save()
```
{% endblock %}

{% block code_update_user_custom_properties %}

```python
User.get_current().set('age', 27)
User.get_current().save()
```
{% endblock %}

{% block code_reset_password_by_email %}

``` python
User.request_password_reset('ruyi-test@gmail.com')
```
{% endblock %}

{% block code_reset_password_by_mobilephoneNumber %}

``` python
User.request_password_reset_by_sms_code('135********')
```
{% endblock %}

{% block code_reset_password_by_mobilephoneNumber_verify %}

``` python
#这部分需要添加python-SDK部分的接口，目前还没有
User.reset_password_by_sms_code('123456','newpassword')
```
{% endblock %}

{% block code_current_user %}

```python
current_user = User.get_current()
```
{% endblock %}

{% block code_current_user_logout %}

```python
user.logout() #清除缓存用户对象
current_user = User.get_current() #现在的 current_user 是 null 了
```
{% endblock %}

{% block code_query_user %}

```python
user_query = Query('_User')
```
{% endblock %}

{% block text_subclass %}
## 子类化
LeanCloud 希望设计成能让人尽快上手并使用。你可以通过 `AVObject.get` 方法访问所有的数据。但是在很多现有成熟的代码中，子类化能带来更多优点，诸如简洁、可扩展性以及 IDE 提供的代码自动完成的支持等等。子类化不是必须的，你可以将下列代码转化：

```
student = Object("Student")
student.set('name','小明')
student.save()
```

可改写成:

```
student = Student()
student.set('name','小明')
student.save()
```

这样代码看起来是不是更简洁呢？

### 子类化 AVObject

要实现子类化，需要下面几个步骤：

1. 首先声明一个子类继承自 `AVObject`；
2. 添加 `@AVClassName` 注解。它的值必须是一个字符串，也就是你过去传入 `AVObject` 构造函数的类名。这样以来，后续就不需要再在代码中出现这个字符串类名；
3. 确保你的子类有一个 public 的默认（参数个数为 0）的构造函数。切记不要在构造函数里修改任何 `AVObject` 的字段；
4. 在你的应用初始化的地方，在调用 `AVOSCloud.initialize()` 之前注册子类 `AVObject.registerSubclass(YourClass.class)`。

下面是实现 `Student` 子类化的例子:

```python
import leancloud
from leancloud import Object

class Student(Object):
    pass

student = Student()
student.set('name','Tom')
student.save()
```

### 访问器、修改器和方法

添加方法到 AVObject 的子类有助于封装类的逻辑。你可以将所有跟子类有关的逻辑放到一个地方，而不是分成多个类来分别处理商业逻辑和存储/转换逻辑。

你可以很容易地添加访问器和修改器到你的 AVObject 子类。像平常那样声明字段的`getter` 和 `setter` 方法，但是通过 AVObject 的 `get` 和 `put` 方法来实现它们。下面是这个例子为 `Student` 类创建了一个 `content` 的字段：

```python
import leancloud
from leancloud import Object

class Student(Object):
    @property
    def content(self):
        # 可以使用property装饰器，方便获取属性
        return self.get('content')

    @content.setter
    def content(self, value):
        # 同样的，可以给对象的content增加setter
        return self.set('content', value)
```

现在你就可以使用 `student.getContent()` 方法来访问 `content` 字段，并通过 `student.setContent("blah blah blah")` 来修改它。这样就允许你的 IDE 提供代码自动完成功能，并且可以在编译时发现到类型错误。
+

各种数据类型的访问器和修改器都可以这样被定义，使用各种 `get()` 方法的变种，例如 `getInt()`，`getAVFile()` 或者 `getMap()`。
+

如果你不仅需要一个简单的访问器，而是有更复杂的逻辑，你可以实现自己的方法，例如：

```python
def take_accusation():
    #处理用户举报，当达到某个条数的时候，自动打上屏蔽标志
    increment('accusation',1)
    if get_accusation() > 50:
        set_spam(True)
```

### 初始化子类

你可以使用你自定义的构造函数来创建你的子类对象。你的子类必须定义一个公开的默认构造函数，并且不修改任何父类 AVObject 中的字段，这个默认构造函数将会被 SDK 使用来创建子类的强类型的对象。


要创建一个到现有对象的引用，可以使用 `AVObject.createWithoutData()`:

```python
import leancloud
from leancloud import Object

Student = Object.extend('Student')
student = Student.create_without_data('573a8459df0eea005e6b711c')
student.fetch()
```

### 子类的序列化与反序列化

在 v3.4 版本以后，如果希望 AVObject 子类也支持 Parcelable，则需要至少满足以下几个要求：
1. 确保子类有一个 public 并且参数为 Parcel 的构造函数，并且在内部调用父类的该构造函数。
2. 内部需要有一个静态变量 CREATOR 实现 `Parcelable.Creator`。

```python
#python-SDK 暂不支持
```

### 查询子类

你可以通过对象的 `query` 属性获取特定的子类的查询对象。下面的例子就查询了用户发表的所有微博列表：

```python
import leancloud
from leancloud import Query
from leancloud import Object
from leancloud import User

query = Query('Student')
query.equal_to('pubUser', User.get_current().get_username())
student_list = query.find()

for student in student_list:
    #do whatever you want
```
### User 的子类化

User 作为 Object 的子类，同样允许子类化，你可以定义自己的 User 对象，不过比起 Object 子类化会更简单一些，只要继承 User 就可以了：

```python
import leancloud
from leancloud import User

class MyUser(User):
    def set_nickname(self, name):
        self.nick_name = name

    def get_nickname(self):
        return self.nickname
```

{% endblock %}
{% block link_to_in_app_search_doc %}[应用内搜索指南](app_search_guide.html){% endblock %}
{% block link_to_status_system_doc %}[应用内社交模块](status_system.html#Android_SDK){% endblock %}
{% block link_to_sns_doc %}[Android SNS 开发指南](sns.html#Android_SNS_组件){% endblock %}
{% block link_to_feedback_doc %}[Android 用户反馈指南](feedback.html#Android_反馈组件){% endblock %}

{# --End--主模板留空的代码段落，子模板根据自身实际功能给予实现 #}

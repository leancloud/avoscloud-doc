{% extends "./relation_guide.tmpl" %}

{% set platform = 'Python' %}

{% block code_city_point_to_province %}

```python
import leancloud
from leancloud import Object


leancloud.init("EhAPcOpWYqBGTV045GK4jVW7-gzGzoHsz", "iUtOLymTFVnSI8020CgjJ5TQ")

guangzhou  = Object.extend('City')()
guangzhou.set('name','广州')

guangdong = Object.extend('Province')()
guangdong.set('name', '广东')

guangzhou.set('dependent',guangdong)  #为广州设置 dependent 属性为广东

guangzhou.save() #广东无需被单独保存，因为在保存广州的时候已经上传到服务端。
```
{% endblock %}

{% block code_city_point_to_province_with_objectId %}

```python
import leancloud
from leancloud import Object

guangdong = Object.extend('Province').create_without_data('574416af79bc44005c61bfa3') #用 create_without_data 关联一个已经存在的对象

dongguan = Object.extend('City')()
dongguan.set('name','东莞')
dongguan.set('dependent',guangdong)  #为东莞设置 dependent 属性为广东

dongguan.save()
```

{% endblock %}
{% block code_fetch_province_by_city %}

```python
import leancloud
from leancloud import Object

guangzhou = Object.extend('City').create_without_data('5744189fdf0eea0063ad948b')
guangzhou.fetch()
province_id = guangzhou.get('dependent').id  #获取广东省的 objectId

province = Object.extend('Province')()
province.id = province_id
province.fetch()  #根据 objectId 获取 province
```
{% endblock %}
{% block code_query_province_by_city %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

query = Query("City")
query.equal_to('name','广州')
query.include('dependent') #关键代码，找出对应城市的省份

for city in query.find():
    province = city.get('dependent')
    province_name = province.get('name')
    #可以获取 province 的信息
```

{% endblock %}

{% block code_query_city_by_province %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

guangdong = Object.extend('Province').create_without_data('574416af79bc44005c61bfa3')

query = Query("City")
query.equal_to('dependent',guangdong)

for city in query.find():
    city_name = city.get('name')
    #结果为广东省下辖的所有城市
```
{% endblock %}
{% block code_save_cityList_array %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

guangdong = Object.extend('Province')()
guangzhou = Object.extend('City')()
guangzhou.set('name','广州')
shenzhen  = Object.extend('City')()
shenzhen.set('name','深圳')

guangdong.set('city_list',[guangzhou, shenzhen])
guangdong.save()   #只要保存 guangDong 即可，它关联的对象都会一并被保存在服务端
```

{% endblock %}

{% block code_get_cityList_array %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

guangdong = Object.extend('Province').create_without_data('57442c56df0eea0063ae2c35')
guangdong.fetch()
city_list = guangdong.get('city_list')

for city in city_list:
    city.fetch()
    name = city.get('name') #下面可以打印出所有城市的 name
```

{% endblock %}

{% block code_query_province_include_cityList %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

query = Query('Province')
query.equal_to('name', '广东')
query.include('city_list') #这条语句是关键语句，它表示可以将关联的数据下载到本地，而不用fetch

province = query.find()[0]
province.get('city_list')
for city in province.get('city_list'):
    #这里不用再添加 city.fetch() 这条语句
    name = city.get('name')
```
{% endblock %}

{% block code_query_province_by_city_with_containsIn %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

guangzhou = Object.extend('City').create_without_data('57442c562e958a006bf2d468') #这是 广州 的 objectId

query = Query('Province')
query.equal_to('city_list', guangzhou)

province = query.find()[0]
provice_name = province.get('name') #这里 province_name 会得到 ‘广东’
```
{% endblock %}

{% block code_save_student_related_to_course_with_relation %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

student_Tom = Object.extend("Student")()
student_Tom.set('name','Tom')

course_linear_algebra = Object.extend('Cource')()
course_linear_algebra.set('name','Linear Algebra')

course_object_oriented_programming = Object.extend('Cource')()
course_object_oriented_programming.set('name','Object-Oriented Programming')

course_operating_system = Object.extend('Cource')()
course_operating_system.set('name','Operating System')

Object.save_all([course_linear_algebra, course_object_oriented_programming,course_operating_system])

relation = student_Tom.relation('course_chosen')
relation.add(course_linear_algebra)
relation.add(course_object_oriented_programming)
relation.add(course_operating_system)

student_Tom.save()
```
{% endblock %}

{% block code_query_student_by_course %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

student_Tom = Object.extend("Student").create_without_data('574470acc26a38006c4099e2')
relation = student_Tom.relation('course_chosen')

query = relation.query
course_list = query.find() #course_list 就是当前学生 Tom 所选择的所有课程
for course in course_list:
    course_name = course.get('name') #可以打印出课程名称
```
{% endblock %}

{% block code_query_courses_by_student %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

course_calculus = Object.extend("Course").create_without_data('574470ab2e958a006b728025')
query = Query('Student')
query.equal_to('course_chosen', course_calculus)
student_list = query.find() #student_list 就是所有选择了微积分的学生

for student in student_list:
    student_name = student.get('name')
```
{% endblock %}

{% block code_save_relationTable_student_with_course %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

student_Tom = Object.extend('Student')()
student_Tom.set('name','Tom')

course_linear_algebra = Object.extend('Course')()
course_linear_algebra.set('name','Linear Algebra')
#选课表对象
student_course_map_Tom = Object.extend('Student_course_map')()

#设置关联
student_course_map_Tom.set('student', student_Tom)
student_course_map_Tom.set('course',course_linear_algebra)

#设置学习周期
student_course_map_Tom.set('duration',["2016-02-19", "2016-04-12"])

#获取操作平台
student_course_map_Tom.set('platform','ios')

#保存选课表对象
student_course_map_Tom.save()
```
{% endblock %}

{% block code_query_relationTable_students_in_course %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

course_calculus = Object.extend('Course').create_without_data('57448184c26a38006b8d4761')
query = Query('Student_course_map')
query.equal_to('course', course_calculus)

#查询所有选择了线性代数的学生
student_course_map_list = query.find()

#list 是所有 course 等于线性代数的选课对象 然后遍历过程中可以访问每一个选课对象的 student,course,duration,platform 等属性
for student_course_map in student_course_map_list:
    student = student_course_map.get('student')
    course  = student_course_map.get('course')
    duration = student_course_map.get('duration')
    platform = student_course_map.get('platform')
```
{% endblock %}

{% block code_query_relationTable_courses_by_student %}

```python
student_Tom = Object.extend('Student').create_without_data("562da3fc00b0bf37b117c250");
query.whereEqualTo("student", student_Tom);
```
{% endblock %}

{% block code_save_courses_using_arrays %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

student_Tom = Object.extend("Student")()
student_Tom.set('name','Tom')

course_linear_algebra = Object.extend('Cource')()
course_linear_algebra.set('name','Linear Algebra')

course_object_oriented_programming = Object.extend('Cource')()
course_object_oriented_programming.set('name','Object-Oriented Programming')

course_operating_system = Object.extend('Cource')()
course_operating_system.set('name','Operating System')

#所选课程的数组
courses = [course_linear_algebra, course_object_oriented_programming,course_operating_system]

#使用属性名字 coursesChosen 保存所选课程的数组
student_Tom.set('course_chosen',courses)

#保存在云端
student_Tom.save()
```
{% endblock %}

{% block code_query_courses_by_include %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

query = Query("Student")
query.equal_to('name', 'Tom')

#以下这句是关键句，它将关联的对象下载到本地
query.include('course_chosen')
tom_list = query.find()

for tom in tom_list:
    course_list = tom.get('course_chosen')
    for course in course_list:
        course_name = course.get('name')
```
{% endblock %}

{% block code_query_using_array_contains %}

```python
import leancloud
from leancloud import Object
from leancloud import Query

course_linear_algebra = Object.extend('Course').create_without_data('5744f76971cfe4006bb41fc2')
query = Query("Student")
query.equal_to('course_chosen', course_linear_algebra)
student_list = query.find() #student_list 即为所有选择了线性代数这门课的学生

for student in student_list:
    student_id = student.id   #这里即可获得学生的 id 和 name
    student_name = student.get('name')
```
{% endblock %}

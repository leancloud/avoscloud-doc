{% extends "./relation_guide.tmpl" %}

{% set platform_name = "Python" %}
{% set segment_code = "python" %}
{% set ops_include = "include" %}

{% block code_save_student_family_address %}

```python
import leancloud

student_tom = leancloud.Object.extend("Student")()
student_tom.set('name', 'Tom')

addr = { "city": "北京", "address": "西城区西长安街 1 号", "":"100017" };
student_tom.set('address', addr)

# 保存在云端
student_tom.save()
```

{% endblock %}

{% block code_city_point_to_province %}

```python
import leancloud

leancloud.init("{{appid}}", "{{appkey}}")

guangZhou  = leancloud.Object.extend('City')()
guangZhou.set('name', '广州')

guangDong = leancloud.Object.extend('Province')()
guangDong.set('name', '广东')

# 为广州设置 dependent 属性为广东
guangZhou.set('dependent', guangDong)

# 广东无需被单独保存，因为在保存广州的时候已经上传到服务端。
guangZhou.save()
```
{% endblock %}

{% block code_city_point_to_province_with_objectId %}

```python
import leancloud

# 用 create_without_data 关联一个已经存在的对象
Provice = leancloud.Object.extend('Province')
guangDong = Province.create_without_data('574416af79bc44005c61bfa3')

dongGuan = leancloud.Object.extend('City')()
dongGuan.set('name', '东莞')
# 为东莞设置 dependent 属性为广东
dongGuan.set('dependent', guangDong)

dongGuan.save()
```

{% endblock %}
{% block code_fetch_province_by_city %}

```python
import leancloud

City = leancloud.Object.extend('City')
guangZhou = City.create_without_data('5744189fdf0eea0063ad948b')
guangZhou.fetch()
province_id = guangZhou.get('dependent').id  # 获取广东省的 objectId

province = leancloud.Object.extend('Province')()
province.id = province_id
province.fetch()  # 根据 objectId 获取 province
```
{% endblock %}
{% block code_query_province_by_city %}

```python
import leancloud

query = leancloud.Query("City")
query.equal_to('name', '广州')
query.include('dependent')  # 关键代码，找出对应城市的省份

for city in query.find():
    province = city.get('dependent')
    province_name = province.get('name')
    # 可以获取 province 的信息
```

{% endblock %}

{% block code_query_city_by_province %}

```python
import leancloud

Provice = leancloud.Object.extend('Province')
guangDong = Provice.create_without_data('574416af79bc44005c61bfa3')

query = leancloud.Query("City")
query.equal_to('dependent', guangDong)

for city in query.find():
    city_name = city.get('name')
    # 结果为广东省下辖的所有城市
```
{% endblock %}
{% block code_save_cityList_array %}

```python
import leancloud

guangDong = leancloud.Object.extend('Province')()
guangZhou = leancloud.Object.extend('City')()
guangZhou.set('name', '广州')
shenZhen  = leancloud.Object.extend('City')()
shenZhen.set('name', '深圳')

guangDong.set('cityList',[guangZhou, shenZhen])
# 只要保存 guangDong 即可，它关联的对象都会一并被保存在服务端
guangDong.save()
```

{% endblock %}

{% block code_get_cityList_array %}

```python
import leancloud

Provice = leancloud.Object.extend('Province')
guangDong = Provice.create_without_data('57442c56df0eea0063ae2c35')
guangDong.fetch()
city_list = guangDong.get('cityList')

for city in city_list:
    city.fetch()
    name = city.get('name')  # 下面可以打印出所有城市的 name
```

{% endblock %}

{% block code_query_province_include_cityList %}

```python
import leancloud

query = leancloud.Query('Province')
query.equal_to('name', '广东')
# 这条语句是关键语句，它表示可以将关联的数据下载到本地，而不用fetch
query.include('cityList')

province = query.find()[0]
province.get('cityList')
for city in province.get('cityList'):
    # 这里不用再添加 city.fetch() 这条语句
    name = city.get('name')
```
{% endblock %}

{% block code_query_province_by_city_with_containsIn %}

```python
import leancloud
# 这是 广州 的 objectId
City = leancloud.Object.extend('City')
guangZhou = City.create_without_data('57442c562e958a006bf2d468')

query = leancloud.Query('Province')
query.equal_to('cityList', guangZhou)

province = query.find()[0]
provice_name = province.get('name')  # 这里 province_name 会得到 ‘广东’
```
{% endblock %}

{% block code_save_student_related_to_course_with_relation %}

```python
import leancloud

student_tom = leancloud.Object.extend("Student")()
student_tom.set('name', 'Tom')

course_linear_algebra = leancloud.Object.extend('Cource')()
course_linear_algebra.set('name', 'Linear Algebra')

course_object_oriented_programming = leancloud.Object.extend('Cource')()
course_object_oriented_programming.set('name', 'Object-Oriented Programming')

course_operating_system = leancloud.Object.extend('Cource')()
course_operating_system.set('name', 'Operating System')
# 批量存储所有课程
leancloud.Object.save_all(
    [course_linear_algebra, course_object_oriented_programming, course_operating_system])

relation = student_tom.relation('course_chosen')
relation.add(course_linear_algebra)
relation.add(course_object_oriented_programming)
relation.add(course_operating_system)

student_tom.save()
```
{% endblock %}

{% block code_query_student_by_course %}

```python
import leancloud

Student = leancloud.Object.extend("Student")
student_tom = Student.create_without_data('574470acc26a38006c4099e2')
relation = student_tom.relation('course_chosen')

query = relation.query
course_list = query.find()  # course_list 就是当前学生 Tom 所选择的所有课程
for course in course_list:
    course_name = course.get('name')  # 可以打印出课程名称
```
{% endblock %}

{% block code_query_courses_by_student %}

```python
import leancloud

Course = leancloud.Object.extend("Course")
course_calculus = Course.create_without_data('574470ab2e958a006b728025')
query = leancloud.Query('Student')
query.equal_to('course_chosen', course_calculus)
student_list = query.find()  # student_list 就是所有选择了微积分的学生

for student in student_list:
    student_name = student.get('name')
```
{% endblock %}

{% block code_save_relationTable_student_with_course %}

```python
import leancloud

student_tom = leancloud.Object.extend('Student')()
student_tom.set('name', 'Tom')

course_linear_algebra = leancloud.Object.extend('Course')()
course_linear_algebra.set('name', 'Linear Algebra')
# 选课表对象
student_course_map_tom = leancloud.Object.extend('Student_course_map')()

# 设置关联
student_course_map_tom.set('student', student_tom)
student_course_map_tom.set('course', course_linear_algebra)

# 设置学习周期
student_course_map_tom.set('duration', ["2016-02-19", "2016-04-12"])

# 获取操作平台
student_course_map_tom.set('platform', 'ios')

# 保存选课表对象
student_course_map_tom.save()
```
{% endblock %}

{% block code_query_relationTable_students_in_course %}

```python
import leancloud

Course = leancloud.Object.extend('Course')
course_calculus = Course.create_without_data('57448184c26a38006b8d4761')
query = leancloud.Query('Student_course_map')
query.equal_to('course', course_calculus)

# 查询所有选择了线性代数的学生
student_course_map_list = query.find()

# list 是所有 course 等于线性代数的选课对象,
# 然后遍历过程中可以访问每一个选课对象的 student,course,duration,platform 等属性
for student_course_map in student_course_map_list:
    student = student_course_map.get('student')
    course  = student_course_map.get('course')
    duration = student_course_map.get('duration')
    platform = student_course_map.get('platform')
```
{% endblock %}

{% block code_query_relationTable_courses_by_student %}

```python

Student = leancloud.Object.extend('Student')
student_tom = Student.create_without_data("562da3fc00b0bf37b117c250")
query.whereEqualTo("student", student_tom)
```
{% endblock %}

{% block code_save_courses_using_arrays %}

```python
import leancloud

student_tom = leancloud.Object.extend("Student")()
student_tom.set('name', 'Tom')

course_linear_algebra = leancloud.Object.extend('Cource')()
course_linear_algebra.set('name', 'Linear Algebra')

course_object_oriented_programming = leancloud.Object.extend('Cource')()
course_object_oriented_programming.set('name', 'Object-Oriented Programming')

course_operating_system = leancloud.Object.extend('Cource')()
course_operating_system.set('name', 'Operating System')

# 所选课程的数组
courses = [course_linear_algebra, course_object_oriented_programming, course_operating_system]

# 使用属性名字 coursesChosen 保存所选课程的数组
student_tom.set('course_chosen', courses)

# 保存在云端
student_tom.save()
```
{% endblock %}

{% block code_query_courses_by_include %}

```python
import leancloud

query = leancloud.Query("Student")
query.equal_to('name', 'Tom')

# 以下这句是关键句，它将关联的对象下载到本地
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

Course = leancloud.Object.extend('Course')
course_linear_algebra = Course.create_without_data('5744f76971cfe4006bb41fc2')
query = leancloud.Query("Student")
query.equal_to('course_chosen', course_linear_algebra)
student_list = query.find()  # student_list 即为所有选择了线性代数这门课的学生

for student in student_list:
    student_id = student.id   # 这里即可获得学生的 id 和 name
    student_name = student.get('name')
```
{% endblock %}

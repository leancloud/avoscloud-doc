{% extends "./relation_guide.tmpl" %}

{% set platform_name = "JavaScript" %}
{% set segment_code = "js" %}
{% set ops_include = "includeKey" %}

{% block code_save_student_family_address %}

```js
    // 学生 Tom
    var studentTom = new AV.Object('Student');
    studentTom.set('name', 'Tom');
    var addr = { "city": "北京", "address": "西城区西长安街 1 号", "postcode":"100017" };
    studentTom.set('address', addr);
    studentTom.save();
```

{% endblock %}

{% block code_city_point_to_province %}

```js
  // 新建一个 AV.Object
  var GuangZhou = new AV.Object('City');// 广州
  GuangZhou.set('name', '广州');
  var GuangDong = new AV.Object('Province');// 广东
  GuangDong.set('name', '广东');
  GuangZhou.set('dependent', GuangDong);// 为广州设置 dependent 属性为广东
  GuangZhou.save().then(function (guangZhou) {
     console.log(guangZhou.id);
  });
  // 广东无需被单独保存，因为在保存广州的时候已经上传到云端。
```
{% endblock %}

{% block code_city_point_to_province_with_objectId %}

```js
    // 假设 GuangDong 的 objectId 为 56545c5b00b09f857a603632
    var GuangDong = AV.Object.createWithoutData('Province', '56545c5b00b09f857a603632');
    var DongGuan = new AV.Object('City');
    DongGuan.set('name', '东莞');
    DongGuan.set('dependent', GuangDong);
    DongGuan.save();
```

{% endblock %}
{% block code_fetch_province_by_city %}

```js
    // 假设东莞作为 City 对象存储的时候它的 objectId 是 568e743c00b09aa22162b11f，这个  objectId 可以在控制台查看
    var DongGuan = AV.Object.createWithoutData('City', '568e743c00b09aa22162b11f');
    DongGuan.fetch({ include: ['dependent'] }, null).then(function (city) {
        var province = city.get('dependent');
        console.log(province.get('name'));
    });
```
{% endblock %}

{% block code_query_province_by_city %}

```js
    var query = new AV.Query('City');
    query.equalTo('name', '广州');
    query.include(['dependent']);
    query.find().then(function (result) {
        if (result.length > 0) {
            var GuangZhou = result[0];
            var province = GuangZhou.get('dependent');
        }
    });
```

{% endblock %}

{% block code_query_city_by_province %}

```js
    // 假设 GuangDong 的 objectId 为 56545c5b00b09f857a603632
    var GuangDong = AV.Object.createWithoutData('Province', '56545c5b00b09f857a603632');
    var query = new AV.Query('City');
    query.equalTo('dependent', GuangDong);
    query.find().then(function (cities) {
        cities.forEach(function (city, i, a) {
            console.log(city.id);
        });
    });
```
{% endblock %}
{% block code_save_cityList_array %}

```js
    // 创建省份对象
    var GuangDong = new AV.Object('Province');
    GuangDong.set('name', '广东');
    
    var GuangZhou = new AV.Object('City');
    GuangZhou.set('name', '广州');
    
    var ShenZhen = new AV.Object('City');
    ShenZhen.set('name', '深圳');
    
    var cityArray = [GuangZhou, ShenZhen];
    GuangDong.addUnique('cityList', cityArray);// 如此做，是为了以后添加更多的城市，保证城市不会重复添加
    
    GuangDong.save();
```

{% endblock %}

{% block code_get_cityList_array %}

```js
    // 假设 GuangDong 的 objectId 是 56a740071532bc0053f335e6
    var GuangDong = AV.Object.createWithoutData('Province', '56a740071532bc0053f335e6');
    GuangDong.fetch({ include: ['cityList'] }, null).then(function (result) {
        // 读取城市列表
        var cityList = GuangDong.get('cityList');
    });
```

{% endblock %}

{% block code_query_province_include_cityList %}

```js    
    var query = new AV.Query('Province');
    query.equalTo('name', '广东');
    
    // 以下这条语句是关键语句
    query.include(['cityList']);
    
    query.find().then(function (result) {
        // objects 是查询 Province 这张表的结果，因为我们是根据 name 查询的，表中 name  等于广东的有且只有一个数据
        // 因此这个集合有且只有一个数据
        var provice = result[0];
        // cityList 的结果为广东省下辖的所有城市
        var cityList = provice.get('cityList');
        
        // 下面可以打印出所有城市的 name
        cityList.map(function (city, index, a) {
            console.log(city.get('name'));
        });
    });
```
{% endblock %}

{% block code_query_province_by_city_with_containsIn %}

```js
    var NanJing = AV.Object.createWithoutData('City', testNanJingId);
    var query = new AV.Query('Province');
    query.equalTo('cityList', NanJing);
    query.first().then(function (jiangsu) {
        //jiangsu 就是查询出来的省份，这里使用 first() 这个接口原因是我们默认情况下「南京」只可能属于一个省份
        console.log(jiangsu.id);
        console.log(jiangsu.get('name'));
    });
```
{% endblock %}

{% block code_save_student_related_to_course_with_relation %}

```js
    var studentTom = new AV.Object('Student');
    studentTom.set('name', 'Tom');// 学生 Tom
    
    var courseLinearAlgebra = new AV.Object('Course');
    courseLinearAlgebra.set('name', 'Linear Algebra');// 线性代数
    
    var courseObjectOrientedProgramming = new AV.Object('Course');
    courseObjectOrientedProgramming.set('name', 'Object-Oriented Programming');;// 面向对象程序设计
    
    var courseOperatingSystem = new AV.Object('Course');
    courseOperatingSystem.set('name', 'Operating System');// 操作系统
    
    AV.Object.saveAll([courseLinearAlgebra, courseObjectOrientedProgramming, courseOperatingSystem]).then(function (result) {
        if (result) {
            // 三门课程保存成功之后简历与 Tom 之间的 AVRelation
            var relation = studentTom.relation('coursesChosen');
            relation.add(courseLinearAlgebra);
            relation.add(courseObjectOrientedProgramming);
            relation.add(courseOperatingSystem);
            studentTom.save().then(function (saveResult) {
                if (saveResult) {
                   // 保存 Tom 到云端
                }
            });
        }
    });
```
{% endblock %}

{% block code_query_students_by_course %}

```js
    // 假设微积分课程的 objectId 是 579eddad8ac247005fea54cc
    var courseCalculus = AV.Object.createWithoutData('Course', '579eddad8ac247005fea54cc');
    // 构建一个 Student 对象的查询
    var query = new AV.Query('Student');
    // 查询所有选择了微积分的学生
    query.equalTo('coursesChosen', courseCalculus);
    
    query.find().then(function (findResult) {
        findResult.forEach(function (student, i, a) {
            console.log(student.id);
        });
    });
```
{% endblock %}

{% block code_query_courses_by_student %}

```js
    // 假设 Tom 被保存到云端之后的 objectId 是 562da3fdddb2084a8a576d49
    var studentTom = AV.Object.createWithoutData('Student', '562da3fdddb2084a8a576d49');
    // 读取 AVRelation 对象
    var relation = studentTom.relation('coursesChosen');
    // 获取关系查询
    var query = relation.query();
    query.find().then(function (courses) {
        courses.forEach(function (course, i, a) {
            console.log(course.id);
        });
    });
```
{% endblock %}

{% block code_save_relationTable_student_with_course %}

```js    
    var studentTom = new AV.Object('Student');
    studentTom.set('name', 'Tom');// 学生 Tom
    
    var courseLinearAlgebra = new AV.Object('Course');
    courseLinearAlgebra.set('name', 'Linear Algebra');// 线性代数
    
    // 选课表对象
    var studentCourseMapTom = new AV.Object('StudentCourseMap');
    
    // 设置关联
    studentCourseMapTom.set('student', studentTom);
    studentCourseMapTom.set('course', courseLinearAlgebra);
    
    // 设置学习周期
    studentCourseMapTom.set('duration', [new Date(2015, 2, 19), new Date(2015, 4, 21)]);
    
    // 设置操作平台
    studentCourseMapTom.set('platform', 'web');
    
    // 保存选课表对象
    studentCourseMapTom.save();
```
{% endblock %}

{% block code_query_relationTable_students_in_course %}

```js
    // 微积分课程
    var courseLinearAlgebra = AV.Object.createWithoutData('Course', courseLinearAlgebraId);
    
    // 构建 StudentCourseMap 的查询
    var query = new AV.Query('StudentCourseMap');
    
    // 查询所有选择了线性代数的学生
    query.equalTo('course', courseLinearAlgebra);
    
    // 执行查询
    query.find().then(function (studentCourseMaps) {
        // studentCourseMaps 是所有 course 等于线性代数的选课对象
        // 然后遍历过程中可以访问每一个选课对象的 student,course,duration,platform 等属性
        studentCourseMaps.forEach(function (scm, i, a) {
            var student = scm.get('student');
            var duration = scm.get('duration');
            var platform = scm.get('platform');
        });
    });
```
{% endblock %}

{% block code_query_relationTable_courses_by_student %}

```js
    var studentTom = AV.Object.createWithoutData('Student', '579f0441128fe10054420d49');
    var query = new AV.Query('StudentCourseMap');
    query.equalTo('student', studentTom);
```
{% endblock %}

{% block code_save_courses_using_arrays %}

```js    
    // 学生 Tom
    var studentTom = new AV.Object('Student');
    studentTom.set('name', 'Tom');
    
    // 线性代数
    var courseLinearAlgebra = new AV.Object('Course');
    courseLinearAlgebra.set('name', 'Linear Algebra');
    
    // 面对对象程序设计
    var courseObjectOrientedProgramming = new AV.Object('Course');
    courseObjectOrientedProgramming.set('name', 'Object-Oriented Programming');
    
    // 操作系统
    var courseOperatingSystem = new AV.Object('Course');
    courseOperatingSystem.set('name', 'Operating System');
    
    // 设置 coursesChosen 属性为课程数组
    studentTom.set('coursesChosen', [courseLinearAlgebra, courseObjectOrientedProgramming, courseOperatingSystem]);
    
    // 保存在云端
    studentTom.save();
```
{% endblock %}

{% block code_query_courses_by_include %}

```js    
    var query = new AV.Query('Student');
    query.equalTo('name', 'Tom');
    
    // 以下这条语句是关键语句
    query.include('coursesChosen');
    
    
    query.find().then(function (students) {
        // students 是查询 Student 这张表的结果，因为我们是根据 name 查询的，我们假设表中 name  等于 Tom 的学生有且只有一个数据
        // 因此这个集合有且只有一个数据
        students.forEach(function (student, i, a) {
            var coursesChosenArray = student.get('coursesChosen');
            coursesChosenArray.forEach(function (course, ii, aa) {
                // 下面可以打印出所有课程的 objectId
                console.log(course.id);
                // 注意，尽管使用 query.include 方法，但是它拉取的关联对象，仅仅包含 objectId，如果想获取其他属性，还需要调用 fetch 接口 
                course.fetch().then(function (fetched) {
                    console.log(course.get('name'));
                });
            });
        });
    });
```
{% endblock %}

{% block code_query_using_array_contains %}

```js
    // 假设线性代数的 objectId 是 562da3fd60b2c1e233c9b250
    var courseLinearAlgebra = AV.Object.createWithoutData('Course', '562da3fd60b2c1e233c9b250');
    var query = new AV.Query('Student');
    query.equalTo('coursesChosen', courseLinearAlgebra);
    query.find().then(function (students) {
        // students 就是所有选择了线性代数的学生
        students.forEach(function (student, i, a) {
            console.log(student.id);
        });
    });
```
{% endblock %}

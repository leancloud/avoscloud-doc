{% extends "./relation_guide.tmpl" %}

{% set platform    = "Android" %}
{% set ops_include = "include" %}

{% block code_save_student_family_address %}

```java
    final AVObject studentTom = new AVObject("Student");// 学生 Tom
    studentTom.put("name", "Tom");
    HashMap<Object, Object> addr = new HashMap<>();
    addr.put("city", "北京");
    addr.put("address", "西城区西长安街 1 号");
    addr.put("postcode", "100017");
    studentTom.put("address", addr);
    studentTom.saveInBackground();
```

{% endblock %}

{% block code_city_point_to_province %}

```java
        AVObject guangZhou = new AVObject("City");// 广州
        guangZhou.put("name", "广州");

        AVObject guangDong = new AVObject("Province");// 广东
        guangDong.put("name", "广东");

        guangZhou.put("dependent", guangDong);// 为广州设置 dependent 属性为广东

        guangZhou.saveInBackground(new SaveCallback() {
            @Override
            public void done(AVException e) {
                if (e == null) {
                    // 广州被保存成功
                }
            }
        });
        // 广东无需被单独保存，因为在保存广州的时候已经上传到云端。
```
{% endblock %}

{% block code_city_point_to_province_with_objectId %}

```java
        // 假设 GuangDong 的 objectId 为 56545c5b00b09f857a603632
        AVObject guangDong = AVObject.createWithoutData("Province", "56545c5b00b09f857a603632");
        AVObject dongGuan = new AVObject("City");// 东莞
        dongGuan.put("name", "东莞");

        dongGuan.put("dependent", guangDong);// 为东莞设置 dependent 属性为广东
```

{% endblock %}
{% block code_fetch_province_by_city %}

```java
        // 假设东莞作为 City 对象存储的时候它的 objectId 是 568e743c00b09aa22162b11f，这个 objectId 可以在控制台查看
        AVObject dongGuan = AVObject.createWithoutData("City", "568e743c00b09aa22162b11f");
        dongGuan.fetchInBackground("dependent", new GetCallback<AVObject>() {
            @Override
            public void done(AVObject avObject, AVException e) {
                // 获取广东省
                AVObject province = avObject.getAVObject("dependent");
            }
        });
```
{% endblock %}
{% block code_query_province_by_city %}

```java
        AVQuery<AVObject> query = new AVQuery<>("City");

        // 查询名字是广州的城市
        query.whereEqualTo("name", "广州");

        // 找出对应城市的省份
        query.include("dependent");

        query.findInBackground(new FindCallback<AVObject>() {
            @Override
            public void done(List<AVObject> list, AVException e) {
                // list 的结果为 name 等于广州的城市的集合，当然我们知道现实中只存在一个广州市
                for (AVObject city : list) {
                    // 并不需要网络访问
                    // 获取对应的省份
                    AVObject province = city.getAVObject("dependent");
                }
            }
        });

```

{% endblock %}

{% block code_query_city_by_province %}

```java
        // 假设 GuangDong 的 objectId 为 56545c5b00b09f857a603632
        AVObject guangDong = AVObject.createWithoutData("Province", "56545c5b00b09f857a603632");

        AVQuery<AVObject> query = new AVQuery<>("City");

        query.whereEqualTo("dependent", guangDong);

        query.findInBackground(new FindCallback<AVObject>() {
            @Override
            public void done(List<AVObject> list, AVException e) {
                for (AVObject city : list) {
                    // list 的结果为广东省下辖的所有城市
                }
            }
        });
```
{% endblock %}
{% block code_save_cityList_array %}

```java
        final AVObject guangDong = new AVObject("Province");// 广东
        guangDong.put("name", "广东");

        final AVObject guangZhou = new AVObject("City");// 广州
        guangZhou.put("name", "广州");

        final AVObject shenZhen = new AVObject("City");// 深圳
        shenZhen.put("name", "深圳");

        AVObject.saveAllInBackground(Arrays.asList(guangZhou, shenZhen), new SaveCallback() {
            @Override
            public void done(AVException e) {
                guangDong.addAllUnique("cityList", Arrays.asList(guangZhou, shenZhen));

                // 只要保存 guangDong 即可，它关联的对象都会一并被保存在云端。
                guangDong.saveInBackground();
            }
        });
```

{% endblock %}

{% block code_get_cityList_array %}

```java
        // 假设 guangDong 的 objectId 是 56a740071532bc0053f335e6
        AVObject guangDong = AVObject.createWithoutData("Province", "56a740071532bc0053f335e6");
        guangDong.fetchIfNeededInBackground("cityList", new GetCallback<AVObject>() {
            @Override
            public void done(AVObject avObject, AVException e) {
                ArrayList<AVObject> cityList = (ArrayList<AVObject>) avObject.getList("cityList");
                for (AVObject city : cityList) {
                    // cityList 的结果为广东省下辖的所有城市
                    // 下面可以打印出所有城市的 objectId
                    Log.d(TAG, "objectId:" + city.getObjectId());
                    // 下面可以打印出所有城市的 name
                    Log.d(TAG, "name:" + city.get("name"));
                }
            }
        });
```

{% endblock %}

{% block code_query_province_include_cityList %}

```java
        AVQuery<AVObject> query = new AVQuery<>("Province");

        query.whereEqualTo("name", "广东");

        // 以下这条语句是关键语句
        query.include("cityList");

        query.findInBackground(new FindCallback<AVObject>() {
            @Override
            public void done(List<AVObject> list, AVException e) {
                // list 是查询 Province 这张表的结果，因为我们是根据 name 查询的，表中 name 等于广东的有且只有一个数据
                // 因此这个集合有且只有一个数据
                for (AVObject province : list) {
                    ArrayList<AVObject> cityList = (ArrayList<AVObject>) province.getList("cityList");
                    for (AVObject city : cityList) {
                        // cityList 的结果为广东省下辖的所有城市
                        // 下面可以打印出所有城市的 objectId
                        Log.d(TAG, "objectId:" + city.getObjectId());
                        // 下面可以打印出所有城市的 name
                        Log.d(TAG, "name:" + city.get("name"));
                    }
                }
            }
        });
```
{% endblock %}

{% block code_query_province_by_city_with_containsIn %}

```java
        AVObject nanJing = AVObject.createWithoutData("City", "56a74006d342d30054168a29");

        AVQuery<AVObject> query = new AVQuery<>("Province");
        query.whereEqualTo("cityList", nanJing);

        query.getFirstInBackground(new GetCallback<AVObject>() {
            @Override
            public void done(AVObject avObject, AVException e) {
                // avObject 就是查询出来的省份，这里使用 getFirstInBackground 这个接口，原因是我们默认情况下「南京」只可能属于一个省份
                Log.d(TAG, "name:" + avObject.getString("name"));
                // 上述语句理论上会打印出「江苏」
            }
        });
```
{% endblock %}

{% block code_save_student_related_to_course_with_relation %}

```java
        final AVObject studentTom = new AVObject("Student");// 学生 Tom
        studentTom.put("name", "Tom");

        final AVObject courseLinearAlgebra = new AVObject("Course");// 线性代数
        courseLinearAlgebra.put("name", "Linear Algebra");

        final AVObject courseObjectOrientedProgramming = new AVObject("Course");// 面向对象程序设计
        courseObjectOrientedProgramming.put("name", "Object-Oriented Programming");

        final AVObject courseOperatingSystem = new AVObject("Course");// 操作系统
        courseOperatingSystem.put("name", "Operating System");

        AVObject.saveAllInBackground(Arrays.asList(courseLinearAlgebra, courseObjectOrientedProgramming, courseOperatingSystem), new SaveCallback() {
            @Override
            public void done(AVException e) {
                AVRelation<AVObject> relation = studentTom.getRelation("coursesChosen");// 新建一个 AVRelation，用来保存所选的课程
                relation.add(courseLinearAlgebra);
                relation.add(courseObjectOrientedProgramming);
                relation.add(courseOperatingSystem);

                studentTom.saveInBackground();
            }
        });
```
{% endblock %}

{% block code_query_students_by_course %}
```java
        // 微积分课程
        AVObject courseCalculus = AVObject.createWithoutData("Course", "562da3fdddb2084a8a576d49");

        // 构建 Student 的查询
        AVQuery<AVObject> query = new AVQuery<>("Student");

        // 查询条件
        query.whereEqualTo("coursesChosen", courseCalculus);

        // 执行查询
        query.findInBackground(new FindCallback<AVObject>() {
            @Override
            public void done(List<AVObject> list, AVException e) {
                // list 就是所有选择了微积分的学生
                for (AVObject student : list) {
                    // 打印 course 的 objectId 以及 name
                    Log.d(TAG, "objectId:" + student.getObjectId());
                    Log.d(TAG, "name:" + student.get("name"));
                }
            }
        });
```
{% endblock %}

{% block code_query_courses_by_student %}

```java
        // 假设 Tom 被保存到云端之后的 objectId 是 562da3fdddb2084a8a576d49
        AVObject studentTom = AVObject.createWithoutData("Student", "562da3fdddb2084a8a576d49");

        // 读取 AVRelation 对象
        AVRelation<AVObject> relation = studentTom.getRelation("coursesChosen");

        AVQuery<AVObject> query = relation.getQuery();

        query.findInBackground(new FindCallback<AVObject>() {
            @Override
            public void done(List<AVObject> list, AVException e) {
                // list 就是当前学生 Tom 所选择的所有课程
                for (AVObject course : list) {
                    // 打印 course 的 objectId 以及 name
                    Log.d(TAG, "objectId:" + course.getObjectId());
                    Log.d(TAG, "name:" + course.get("name"));
                }
            }
        });
```
{% endblock %}

{% block code_save_relationTable_student_with_course %}

```java
        AVObject studentTom = new AVObject("Student");// 学生 Tom
        studentTom.put("name", "Tom");

        AVObject courseLinearAlgebra = new AVObject("Course");// 线性代数
        courseLinearAlgebra.put("name", "Linear Algebra");

        AVObject studentCourseMapTom = new AVObject("StudentCourseMap");// 选课表对象

        // 设置关联
        studentCourseMapTom.put("student", studentTom);
        studentCourseMapTom.put("course", courseLinearAlgebra);

        // 设置学习周期
        studentCourseMapTom.put("duration", Arrays.asList("2016-02-19", "2016-04-21"));
        // 获取操作平台
        studentCourseMapTom.put("platform", "iOS");

        // 保存选课表对象
        studentCourseMapTom.saveInBackground();
```
{% endblock %}

{% block code_query_relationTable_students_in_course %}

```java
        // 微积分课程
        AVObject courseCalculus = AVObject.createWithoutData("Course", "562da3fdddb2084a8a576d49");

        // 构建 StudentCourseMap 的查询
        AVQuery<AVObject> query = new AVQuery<>("StudentCourseMap");

        // 查询所有选择了线性代数的学生
        query.whereEqualTo("course", courseCalculus);

        // 执行查询
        query.findInBackground(new FindCallback<AVObject>() {
            @Override
            public void done(List<AVObject> list, AVException e) {
                // list 是所有 course 等于线性代数的选课对象
                // 然后遍历过程中可以访问每一个选课对象的 student,course,duration,platform 等属性
                for (AVObject studentCourseMap : list) {
                    AVObject student = studentCourseMap.getAVObject("student");
                    AVObject course = studentCourseMap.getAVObject("course");
                    ArrayList duration = (ArrayList) studentCourseMap.getList("duration");
                    String platform = studentCourseMap.getString("platform");
                }
            }
        });
```
{% endblock %}

{% block code_query_relationTable_courses_by_student %}

```java
        AVObject studentTom = AVObject.createWithoutData("Student", "562da3fc00b0bf37b117c250");
        query.whereEqualTo("student", studentTom);
```
{% endblock %}

{% block code_save_courses_using_arrays %}

```java
        AVObject studentTom = new AVObject("Student");// 学生 Tom
        studentTom.put("name", "Tom");

        AVObject courseLinearAlgebra = new AVObject("Course");// 线性代数
        courseLinearAlgebra.put("name", "Linear Algebra");

        AVObject courseObjectOrientedProgramming = new AVObject("Course");// 面向对象程序设计
        courseObjectOrientedProgramming.put("name", "Object-Oriented Programming");

        AVObject courseOperatingSystem = new AVObject("Course");// 操作系统
        courseOperatingSystem.put("name", "Operating System");

        // 所选课程的数组
        ArrayList<AVObject> courses = (ArrayList<AVObject>) Arrays.asList(studentTom, courseLinearAlgebra, courseObjectOrientedProgramming, courseOperatingSystem);

        // 使用属性名字 coursesChosen 保存所选课程的数组
        studentTom.put("coursesChosen", courses);

        // 保存在云端
        studentTom.saveInBackground();
```
{% endblock %}

{% block code_query_courses_by_include %}

```java
        AVQuery<AVObject> query = new AVQuery<>("Student");

        query.whereEqualTo("name", "Tom");

        // 以下这条语句是关键语句
        query.include("coursesChosen");

        query.findInBackground(new FindCallback<AVObject>() {
            @Override
            public void done(List<AVObject> list, AVException e) {
                // list 是查询 Student 这张表的结果，因为我们是根据 name 查询的，我们假设表中 name 等于 Tom 的学生有且只有一个数据
                // 因此这个集合有且只有一个数据
                for (AVObject tom : list) {
                    ArrayList<AVObject> coursesChosenList = (ArrayList<AVObject>) tom.getList("coursesChosen");
                    for (AVObject course : coursesChosenList) {
                        // coursesChosenList 的结果为 Tom 选修的所有课程
                        // 下面可以打印出所有课程的 objectId
                        // 打印 course 的 objectId 以及 name
                        Log.d(TAG, "objectId:" + course.getObjectId());
                        Log.d(TAG, "name:" + course.get("name"));
                    }
                }
            }
        });
```
{% endblock %}

{% block code_query_using_array_contains %}

```java
        // 假设线性代数的 objectId 是 562da3fd60b2c1e233c9b250
        AVObject courseLinearAlgebra = AVObject.createWithoutData("Course", "562da3fd60b2c1e233c9b250");

        // 构建针对 Student 这张表的查询
        AVQuery<AVObject> query = new AVQuery<>("Student");
        query.whereEqualTo("coursesChosen", courseLinearAlgebra);

        query.findInBackground(new FindCallback<AVObject>() {
            @Override
            public void done(List<AVObject> list, AVException e) {
                // list 即为所有选择了线性代数这门课的学生
                for (AVObject student : list) {
                    // 下面可以打印出所有学生的 objectId
                    Log.d(TAG, "objectId:" + student.getObjectId());
                    // 下面可以打印出学生的 name
                    Log.d(TAG, "name:" + student.get("name"));

                }
            }
        });
```
{% endblock %}

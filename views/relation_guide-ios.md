{% extends "./relation_guide.tmpl" %}

{% set platform_name = "iOS / OS X" %}
{% set ops_include = "includeKey" %}

{% block code_save_student_family_address %}

```objc
    AVObject *studentTom = [[AVObject alloc] initWithClassName:@"Student"];// 学生 Tom
    [studentTom setObject:@"Tom" forKey:@"name"];
    NSDictionary *addr = [NSDictionary dictionaryWithObjectsAndKeys:
                          @"北京", @"city",
                          @"西城区西长安街 1 号", @"address",
                          @"100017", @"postcode",
                          nil];
    [studentTom setObject:addr forKey:@"address"];
    [studentTom saveInBackground];// 保存到云端
```

{% endblock %}

{% block code_city_point_to_province %}

```objc
    AVObject *GuangZhou = [[AVObject alloc] initWithClassName:@"City"];// 广州
    [GuangZhou setObject:@"广州" forKey:@"name"];

    AVObject *GuangDong = [[AVObject alloc] initWithClassName:@"Province"];// 广东
    [GuangDong setObject:@"广东" forKey:@"name"];

    [GuangZhou setObject:GuangDong forKey:@"dependent"];// 为广州设置 dependent 属性为广东

    [GuangZhou saveInBackgroundWithBlock:^(BOOL succeeded, NSError *error) {
        if (succeeded) {
          // 广州被保存成功  
        }
    }];
    // 广东无需被单独保存，因为在保存广州的时候已经上传到云端。
```
{% endblock %}

{% block code_city_point_to_province_with_objectId %}

```objc
    // 假设 GuangDong 的 objectId 为 56545c5b00b09f857a603632
    AVObject *GuangDong = [AVObject objectWithoutDataWithClassName:@"Province" objectId:@"56545c5b00b09f857a603632"];    
    AVObject *DongGuan = [[AVObject alloc] initWithClassName:@"City"];// 东莞
    [DongGuan setObject:@"东莞" forKey:@"name"];

    [DongGuan setObject:GuangDong forKey:@"dependent"];// 为东莞设置 dependent 属性为广东
```

{% endblock %}
{% block code_fetch_province_by_city %}

```objc
    // 假设东莞作为 City 对象存储的时候它的 objectId 是 568e743c00b09aa22162b11f，这个  objectId 可以在控制台查看
    AVObject *DongGuan = [AVObject objectWithoutDataWithClassName:@"City" objectId:@"568e743c00b09aa22162b11f"];
    NSArray *keys = [NSArray arrayWithObjects:@"dependent", nil];
    [DongGuan fetchInBackgroundWithKeys:keys block:^(AVObject *object, NSError *error) {
         // 获取广东省
         AVObject *province = [object objectForKey:@"dependent"];
    }];
```
{% endblock %}
{% block code_query_province_by_city %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"City"];

    // 查询名字是广州的城市
    [query whereKey:@"name" equalTo:@"广州"];

    // 找出对应城市的省份
    [query includeKey:@"dependent"];

    [query findObjectsInBackgroundWithBlock:^(NSArray *cities, NSError *error) {
        // cities 的结果为 name 等于广州的城市的集合，当然我们知道现实中只存在一个广州市
        for (AVObject *city in cities) {
            // 并不需要网络访问
            // 获取对应的省份
            AVObject *province = [city objectForKey:@"dependent"];
        }
    }];
```

{% endblock %}

{% block code_query_city_by_province %}

```objc
    // 假设 GuangDong 的 objectId 为 56545c5b00b09f857a603632
    AVObject *GuangDong = [AVObject objectWithoutDataWithClassName:@"Province" objectId:@"56545c5b00b09f857a603632"];

    AVQuery *query = [AVQuery queryWithClassName:@"City"];

    [query whereKey:@"dependent" equalTo:GuangDong];

    [query findObjectsInBackgroundWithBlock:^(NSArray *cities, NSError *error) {
        for (AVObject *city in cities) {
             // cities 的结果为广东省下辖的所有城市
        }
    }];
```
{% endblock %}
{% block code_save_cityList_array %}

```objc
    AVObject *GuangDong = [[AVObject alloc] initWithClassName:@"Province"];// 广东
    [GuangDong setObject:@"广东" forKey:@"name"];

    AVObject *GuangZhou = [[AVObject alloc] initWithClassName:@"City"];// 广州
    [GuangZhou setObject:@"广州" forKey:@"name"];

    AVObject *ShenZhen = [[AVObject alloc] initWithClassName:@"City"];// 深圳
    [ShenZhen setObject:@"深圳" forKey:@"name"];

    // 把广州和深圳放置在一个数组里面，然后把这个数组设置为广东的 cityList 属性
    NSArray *cityList = [NSArray arrayWithObjects:GuangZhou, ShenZhen, nil];

    [AVObject saveAllInBackground:cityList block:^(BOOL succeeded, NSError *error) {
               [GuangDong addUniqueObjectsFromArray:[NSArray arrayWithObjects:GuangZhou, ShenZhen, nil] forKey:@"cityList"];

        // 只要保存 GuangDong 即可，它关联的对象都会一并被保存在云端。
        [GuangDong saveInBackground];
    }];
```

{% endblock %}

{% block code_get_cityList_array %}

```objc
    // 假设 GuangDong 的 objectId 是 56a740071532bc0053f335e6
    AVObject *GuangDong = [AVObject objectWithoutDataWithClassName:@"Province" objectId:@"56a740071532bc0053f335e6"];
    [GuangDong fetchIfNeededWithKeys:[NSArray arrayWithObjects:@"cityList",nil]];
    [GuangDong fetchIfNeededInBackgroundWithBlock:^(AVObject *object, NSError *error) {
        NSArray *cityList = [GuangDong objectForKey:@"cityList"];
        for (AVObject *city in cityList) {
             // cityList 的结果为广东省下辖的所有城市
             // 下面可以打印出所有城市的 objectId
             NSLog(@"objectId: %@", city.objectId);
             // 下面可以打印出所有城市的 name
             NSLog(@"name: %@", [city objectForKey:@"name"]);
        }
    }];
```

{% endblock %}

{% block code_query_province_include_cityList %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Province"];

    [query whereKey:@"name" equalTo:@"广东"];

    // 以下这条语句是关键语句
    [query includeKey:@"cityList"];

    [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        // objects 是查询 Province 这张表的结果，因为我们是根据 name 查询的，表中 name  等于广东的有且只有一个数据
        // 因此这个集合有且只有一个数据
        for (AVObject *province in objects) {
             NSArray *cityList = [province objectForKey:@"cityList"];
            for (AVObject *city in cityList) {
                // cityList 的结果为广东省下辖的所有城市
                // 下面可以打印出所有城市的 objectId
                NSLog(@"objectId: %@", city.objectId);
                // 下面可以打印出所有城市的 name
                NSLog(@"name: %@", [city objectForKey:@"name"]);
            }
        }
    }];
```
{% endblock %}

{% block code_query_province_by_city_with_containsIn %}

```objc
    AVObject *NanJing = [AVObject objectWithoutDataWithClassName:@"City" objectId:@"56a74006d342d30054168a29"];

    AVQuery *query = [AVQuery queryWithClassName:@"Province"];
    [query whereKey:@"cityList" equalTo:NanJing];

    [query getFirstObjectInBackgroundWithBlock:^(AVObject *province, NSError *error) {
        // province 就是查询出来的省份，这里使用 getFirstObjectInBackgroundWithBlock 这个借口原因是我们默认情况下「南京」只可能属于一个省份
         NSLog(@"name: %@", [province objectForKey:@"name"]);
        // 上述语句理论上会打印出「江苏」
    }];
```
{% endblock %}

{% block code_save_student_related_to_course_with_relation %}

```objc
    AVObject *studentTom = [[AVObject alloc] initWithClassName:@"Student"];// 学生 Tom
    [studentTom setObject:@"Tom" forKey:@"name"];
    
    AVObject *courseLinearAlgebra = [[AVObject alloc] initWithClassName:@"Course"];// 线性代数
    [courseLinearAlgebra setObject:@"Linear Algebra" forKey:@"name"];
    
    AVObject *courseObjectOrientedProgramming = [[AVObject alloc] initWithClassName:@"Course"];// 面向对象程序设计
    [courseObjectOrientedProgramming setObject:@"Object-Oriented Programming" forKey:@"name"];
    
    AVObject *courseOperatingSystem = [[AVObject alloc] initWithClassName:@"Course"];// 操作系统
    [courseOperatingSystem setObject:@"Operating System" forKey:@"name"];
    
    [AVObject saveAllInBackground:@[courseLinearAlgebra,courseObjectOrientedProgramming,courseOperatingSystem] block:^(BOOL succeeded, NSError *error) {
        if (error) {
            // 出现错误
        } else {
            // 保存成功
            AVRelation *relation = [studentTom relationforKey:@"coursesChosen"];// 新建一个 AVRelation，用来保存所选的课程
            [relation addObject:courseLinearAlgebra];
            [relation addObject:courseObjectOrientedProgramming];
            [relation addObject:courseOperatingSystem];
            
            [studentTom saveInBackground];
        }
    }];
```
{% endblock %}

{% block code_query_students_by_course %}

```objc
    // 微积分课程
    AVObject *courseCalculus = [AVObject objectWithoutDataWithClassName:@"Course" objectId:@"562da3fdddb2084a8a576d49"];

    // 构建 Student 的查询
    AVQuery *query = [AVQuery queryWithClassName:@"Student"];

    // 查询条件
    [query whereKey:@"coursesChosen" equalTo:courseCalculus];

    // 执行查询
    [query findObjectsInBackgroundWithBlock:^(NSArray *students, NSError *error) {
        // students 就是所有选择了微积分的学生
        for (AVObject *student in students) {
            // 打印 student 的 objectId 以及 name
            NSLog(@"objectId: %@", student.objectId);
            NSLog(@"name: %@", [student objectForKey:@"name"]);
        }
    }];
```
{% endblock %}

{% block code_query_courses_by_student %}

```objc
    // 假设 Tom 被保存到云端之后的 objectId 是 562da3fdddb2084a8a576d49
    AVObject *studentTom = [AVObject objectWithoutDataWithClassName:@"Student" objectId:@"562da3fdddb2084a8a576d49"];

    // 读取 AVRelation 对象
    AVRelation *relation = [studentTom relationforKey:@"coursesChosen"];

    // 获取关系查询
    AVQuery *query = [relation query];

    [query findObjectsInBackgroundWithBlock:^(NSArray *courses, NSError *error) {
        // courses 就是当前学生 Tom 所选择的所有课程
        for (AVObject *course in courses) {
            // 打印 course 的 objectId 以及 name
            NSLog(@"objectId: %@", course.objectId);
            NSLog(@"name: %@", [course objectForKey:@"name"]);
        }
    }];
```
{% endblock %}

{% block code_save_relationTable_student_with_course %}

```objc
    AVObject *studentTom = [[AVObject alloc] initWithClassName:@"Student"];// 学生 Tom
    [studentTom setObject:@"Tom" forKey:@"name"];

    AVObject *courseLinearAlgebra = [[AVObject alloc] initWithClassName:@"Course"];// 线性代数
    [courseLinearAlgebra setObject:@"Linear Algebra" forKey:@"name"];

    AVObject *studentCourseMapTom= [[AVObject alloc] initWithClassName:@"StudentCourseMap"];// 选课表对象

    // 设置关联
    [studentCourseMapTom setObject:studentTom forKey:@"student"];
    [studentCourseMapTom setObject:courseLinearAlgebra forKey:@"course"];

    // 设置学习周期
    [studentCourseMapTom setObject: [NSArray arrayWithObjects:@"2016-02-19",@"2016-04-21",nil] forKey:@"duration"];
    // 获取操作平台
    [studentCourseMapTom setObject: @"iOS" forKey:@"platform"];

    // 保存选课表对象
    [studentCourseMapTom saveInBackground];
```
{% endblock %}

{% block code_query_relationTable_students_in_course %}

```objc
    // 微积分课程
    AVObject *courseCalculus = [AVObject objectWithoutDataWithClassName:@"Course" objectId:@"562da3fdddb2084a8a576d49"];

    // 构建 StudentCourseMap 的查询
    AVQuery *query = [AVQuery queryWithClassName:@"StudentCourseMap"];

    // 查询所有选择了线性代数的学生
    [query whereKey:@"course" equalTo:courseCalculus];

    // 执行查询
    [query findObjectsInBackgroundWithBlock:^(NSArray *studentCourseMaps, NSError *error) {
        // studentCourseMaps 是所有 course 等于线性代数的选课对象
        // 然后遍历过程中可以访问每一个选课对象的 student,course,duration,platform 等属性
        for (AVObject *studentCourseMap in studentCourseMaps) {
            AVObject *student =[studentCourseMap objectForKey:@"student"];
            AVObject *course =[studentCourseMap objectForKey:@"course"];
            NSArray *duration = [studentCourseMap objectForKey:@"duration"];
            NSLog(@"platform: %@", [studentCourseMap objectForKey:@"platform"]);
        }
    }];
```
{% endblock %}

{% block code_query_relationTable_courses_by_student %}

```objc
    AVObject *studentTom = [AVObject objectWithoutDataWithClassName:@"Student" objectId:@"562da3fc00b0bf37b117c250"];
    [query whereKey:@"student" equalTo:studentTom];
```
{% endblock %}

{% block code_save_courses_using_arrays %}

```objc
    AVObject *studentTom = [[AVObject alloc] initWithClassName:@"Student"];// 学生 Tom
    [studentTom setObject:@"Tom" forKey:@"name"];

    AVObject *courseLinearAlgebra = [[AVObject alloc] initWithClassName:@"Course"];// 线性代数
    [courseLinearAlgebra setObject:@"Linear Algebra" forKey:@"name"];

    AVObject *courseObjectOrientedProgramming = [[AVObject alloc] initWithClassName:@"Course"];// 面对对象程序设计
    [courseObjectOrientedProgramming setObject:@"Object-Oriented Programming" forKey:@"name"];

    AVObject *courseOperatingSystem = [[AVObject alloc] initWithClassName:@"Course"];// 操作系统
    [courseOperatingSystem setObject:@"Operating System" forKey:@"name"];

    // 所选课程的数组
    NSArray *courses =  [NSArray arrayWithObjects:courseLinearAlgebra,courseObjectOrientedProgramming,courseOperatingSystem,nil];

    // 使用属性名字 coursesChosen 保存所选课程的数组
    [studentTom setObject:courses forKey:@"coursesChosen"];

    // 保存在云端
    [studentTom saveInBackground];
```
{% endblock %}

{% block code_query_courses_by_include %}

```objc
    AVQuery *query = [AVQuery queryWithClassName:@"Student"];

    [query whereKey:@"name" equalTo:@"Tom"];

    // 以下这条语句是关键语句
    [query includeKey:@"coursesChosen"];

    [query findObjectsInBackgroundWithBlock:^(NSArray *objects, NSError *error) {
        // objects 是查询 Student 这张表的结果，因为我们是根据 name 查询的，我们假设表中 name  等于 Tom 的学生有且只有一个数据
        // 因此这个集合有且只有一个数据
        for (AVObject *tom in objects) {
            NSArray *coursesChosenArray = [tom objectForKey:@"coursesChosen"];
            for (AVObject *course in coursesChosenArray) {
                // coursesChosenArray 的结果为 Tom 选修的所有课程
                // 下面可以打印出所有课程的 objectId
                NSLog(@"objectId: %@", course.objectId);
                // 下面可以打印出所有课程的 name
                NSLog(@"name: %@", [course objectForKey:@"name"]);
            }
        }
    }];
```
{% endblock %}

{% block code_query_using_array_contains %}

```objc
    // 假设线性代数的 objectId 是 562da3fd60b2c1e233c9b250
    AVObject *courseLinearAlgebra = [AVObject objectWithoutDataWithClassName:@"Course" objectId:@"562da3fd60b2c1e233c9b250"];

    // 构建针对 Student 这张表的查询
    AVQuery *query = [AVQuery queryWithClassName:@"Student"];
    [query whereKey:@"coursesChosen" equalTo:courseLinearAlgebra];

    [query findObjectsInBackgroundWithBlock:^(NSArray *students, NSError *error) {
        // students 即为所有选择了线性代数这门课的学生
        for (AVObject *student in students) {
            // 下面可以打印出所有学生的 objectId
            NSLog(@"objectId: %@", student.objectId);
            // 下面可以打印出学生的 name
            NSLog(@"name: %@", [student objectForKey:@"name"]);
        }
    }];
```
{% endblock %}

# 数据建模设计实践


## 一对多
一对多和多对多的区别就是被关联的对象是不是互斥的，例如书和作者就是多对多的关系，JK 罗琳可以是《哈利波特》的作者，同时她也可以是其他书的作者 ，并不互斥。
而城市和省份的关系就是一种典型的一对多的关系，南京就必须是江苏省的城市，它不能同时是其他省份的城市。

### 构建

```pointer
  let jiangsu = new AV.Object('Province');
  jiangsu.set('name', '江苏省');

  let nanjing = new AV.Object('City');
  nanjing.set('name', '南京市');

  // City has a Pointer to Province
  nanjing.set('province', jiangsu);
```
```relation
  let hangzhou = new AV.Object('City');
  hangzhou.set('name', '杭州市');

  let zhejiang = new AV.Object('Province');
  zhejiang.set('name', '浙江省');

  hangzhou.save().then(city => {
    let relation = zhejiang.relation('includedCities');
    relation.add(hangzhou);

    return zhejiang.save();
  }).then(provice => {
  });
```
```middle
  let changsha = new AV.Object('City');
  changsha.set('name', '长沙市');

  let hunan = new AV.Object('Province');
  hunan.set('name', '湖南省');

  let provice_city = new AV.Object('Provice_City');
  provice_city.set('province', hunan);
  provice_city.set('city', changsha);

  provice_city.save().then(obj => {
  });
```

构建关系的时候一定要先考虑查询，例如你是根据省份查找城市较多，还是根据城市查找省份更多。

### 查询
实现京东商城如下效果的代码就是一个查询的案例：

![queryCities](https://dn-lhzo7z96.qbox.me/1484113095972)


```pointer
  let jiangsu = AV.Object.createWithoutData('Province', '5876278f1b69e6005cf3b140');
  let query = new AV.Query('City');

  query.equalTo('province', jiangsu);
  query.include('province');
  query.find().then(cities => {
    resp.success(cities);
  });
```
```relation
  let zhejiang = AV.Object.createWithoutData('Province', '58762f39a22b9d0058ac0468');
  let relation = zhejiang.relation('includedCities');
  let query = relation.query();

  query.find().then(cities => {
    resp.success(cities);
  });
```
```middle
  let changsha = AV.Object.createWithoutData('City', '5876298da22b9d0058abcd24');
  let hunan = AV.Object.createWithoutData('Province', '5876298da22b9d0058abcd23');
  let query = new AV.Query('Provice_City');
  query.equalTo('province', hunan);

  query.find().then(cities => {
    resp.success(cities);
  });
```

## 多对多
多对多就是 多个 一对多 因此代码也是高度一致。因此我们引用学生选课作为案例

```relation
  let studentA = new AV.Object('Student');
  let studentB = new AV.Object('Student');

  let courseX = new AV.Object('Course');
  let courseY = new AV.Object('Course');

  let selectA = studentA.relation('selectedCourses');
  selectA.add(courseX);
  selectA.add(courseY);

  let whoSelectdX = courseX.relation('whoSelected');
  whoSelectdX.add(studentA);

  let whoSelectdY = courseY.relation('whoSelected');
  whoSelectdY.add(studentA);

  // studentB can do the same with A
```
```middle
  let studentA = new AV.Object('Student');
  let studentB = new AV.Object('Student');

  let courseX = new AV.Object('Course');
  let courseY = new AV.Object('Course');

  let student_course = new AV.Object('Student_Course');
  student_course.set('student', studentA);
  student_course.set('course', courseY);
  student_course.set('platform', 'ios');
```



## 如何选择最合适的建模方式？

首先，确定关系是否

> 是否存在附加属性？

例如学生选课，学生在选课的时候有从 web 上选，有从 客户端选，客户端还区分 ios 和 android 以及其他。

那么假设系统想分析一下学生选课的来源那么建立选课关系的时候就需要记录一下附加属性，这个是后只有中间表可以满足这个需求。


```middle
  let student_course = new AV.Object('Student_Course');
  student_course.set('student', studentA);
  student_course.set('course', courseY);
  student_course.set('platform', 'ios');
```

其次就是判断

> 是一对多还是多对多？

* 一对多：Pointer | Relation
* 多对多：Relation | 中间表

其次就是需要判定关系建立之后，

> 基于关系的查询较多还是基于关系的修改较多？

假设一对多的关系并且是查询多于增改，那么用 Relation 就比较可用。如果修改较多那就推荐使用 Pointer。

为什么？

假设用 Relation 存储了城市和省份之间的一对多的关系，假设有一天，廊坊被划分到北京管辖，那么需要做如下两个步骤：第一从河北的 Relation 里面删除廊坊，第二将廊坊加入到北京的 Relation 里面去。
而 Pointer 只需要一步，因为用 Pointer 存储的时候，是在廊坊的 province 字段上存储了一个指向上级的一个指针，这个时候只要将这个 Pointer 重新指向北京就可以了。只需要一步。
假设系统中这种关系变化操作很频繁，那么最好就要使用 Pointer。

多对多不需要这么复杂，要么 Relation 要么 中间表。

决定了用那种方式之后就按照前文介绍的根据参照一对多还是多对多的实例代码构建自己的业务逻辑代码。

但是所有 Pointer 以及 Relation 的可以实现的，中间表都可以实现，并且开发者可控的余地更多。

具体可以参照如下伪代码：

```
if(存在附加属性){
    return 中间表;
} else {
    switch(mode){
        case 一对多:{
            if(查询 > 增改 && count < 1000){
                return Relation;
            } else {
                return Pointer;
            }
        }
        case 多对多:{
           if(查询 > 增改 &&  count < 1000){
                return Relation;
            } else {
                return 中间表;
            }
        }
    }
}
```

## 一个案例

## 婴儿与监护人之间的关系
做一个应用统计婴儿吃饭、睡觉、玩耍的时间分布，而婴儿的监护人可能会有多个，爷爷奶奶外公外婆还有可能有月嫂，首先我们来分析按照我们之前设定的思路来逐步分析应该采用哪种方式建模。
首先，我们需要回答一个问题

> 是否存在附加属性？

一个婴儿和一个监护人之间的关系是否有附加属性？答案是肯定的，父子关系跟母子关系是不一样的关系，因为婴儿的对监护人的称呼就是这个关系的附加属性。
因此不用多想，果断使用中间表。不用再纠结是一对多还是多对多。

![xxx](https://dn-lhzo7z96.qbox.me/1484120541528)

## 用户与设备之间的关系
婴儿的状态改变，可以通过推送服务做到实时推送给监护人，比如孩子的爸爸设备较多，他会在 ipad、iphone、以及 windows 上安装这个应用，那么他一般情况下会有 3 台设备，
而监护人在每一个设备上登陆的之后，每当孩子的状态改变，服务端都会向这 3 台设备推送，那么我们接着按照之前的思路来分析应该采用哪种方式建模？

> 是否存在附加属性？

这个一般情况下，是可以省略附加属性的，因为 LeanCloud 的 _Installation 表里有一个字段是专门用来存储客户端设备的 deviceType，因此设备的信息是不需要存储在中间表的。
而除非有其他特殊的属性条件，设备和用户之间的关系就是一个简单的一对多的关系，并且并不需要附加属性。

其次是判断

> 是一对多还是多对多？

一个用户在多个设备上登录，这个一般意义上可以定义为一对多，而很少会出现类似 iphone/ipad 版 QQ 那样的需求，内置了多账户管理系统，因此定义为一对多比较满足我们现在的需求。

紧接着是判断

> 基于关系的查询较多还是基于关系的修改较多？

这个答案也是肯定的，一个人不太可能会一天之内变化几十次登录的设备，一旦他登陆了一台设备几乎都是很稳定的，而且也不会经常出现一个设备被多个人登录，因此它的关系是相对稳定的，不易变的。

因此我们可以使用 Relation 来存储，_User 和 _Installation 之间的关系。

![sss](https://dn-lhzo7z96.qbox.me/1484120833362)

### 最后的彩蛋
什么时候用数组？

当你的关联的数据是简单数据的时候有并且查询多余修改的时候，用数组比较合适，比如社交类应用里面的被朋友加标签，这个就可以使用 string 数组来存储这个属性，一般情况下 Relation 比数组好用。


```array
let beckham = new AV.Object('Boy');
beckham.set('tags',['hansome','star']);
```





# 离线数据分析使用指南

## 简介

针对大规模数据的分析任务一般都比较耗时。LeanCloud 为开发者提供了 SQL-like 的离线数据分析功能。想要获得这项功能，开发者只需要设置 `启用离线数据分析` 这个[应用选项](/data.html?appid={{appid}}#/permission)。离线数据分析的数据来源是每日备份数据，不会对应用的线上数据产生任何影响。

## 启用离线数据分析

为了启用离线数据分析，开发者需要在[应用选项](/data.html?appid={{appid}}#/permission)中勾选 `启用离线数据分析`。该选选一旦被设置，LeanCloud 会为开发者准备离线数据，这个过程一般会消耗一分钟或更多时间。如果一切顺利，你可以通过 `存储 -> 离线数据分析` 这个路径进入离线数据分析页面。如果不能正常使用，请通过 [工单系统](https://ticket.leancloud.cn) 联系我们的工程师。

## SQL-like 查询分析

LeanCloud 的离线数据分析服务基于 Spark SQL，目前支持 HiveQL 的功能子集，常用的 HiveQL 功能都能正常使用，例如：

### Hive 查询语法，包括：

* SELECT
* GROUP BY
* ORDER BY
* CLUSTER BY
* SORT BY

**针对 `GROUP BY` 的特别说明**：

有不少用户都有过 MySQL 的使用经验，这里主要是列举几种在 MySQL 中可用而在我们的服务（基于 Spark SQL）中却会报错的 `GROUP BY` 用法。

* SELECT * FROM table GROUP BY columnA;
	* MySQL：如果 columnA 这个字段有 10 种不同的值，那么这条查询语句得到的结果应该包含 10 行记录。
	* Spark SQL：如果 table 只有 columnA 这个字段，那么查询结果和 MySQL 相同。相反，如果 table 包含不止 columnA 这个字段，查询会报错。

* SELECT columnB FROM table GROUP BY columnA;
	* MySQL：同前一条查询差不多，返回正确结果。结果记录数由 columnA 值的种类决定。
	* Spark SQL：一定会报错。

当且仅当 SELECT 后面的表达式（expressions）为聚合函数（aggregation function）或包含 GROUP BY 中的字段，Spark SQL 的查询才会合法。列举几个常见的合法查询：

* SELECT columnA, count(columnB) as `count` FROM table GROUP BY columnA
* SELECT columnA, count(*) as `count` FROM table GROUP BY columnA
* SELECT columnA, columnB FROM table GROUP BY columnA, columnB

### 所有 Hive 运算符，包括：

* 关系运算符（=, ⇔, ==, <>, <, >, >=, <=, etc）
* 算术运算符（+, -, *, /, %, etc）
* 逻辑运算符（AND, &&, OR, ||, etc）
* 数学函数（sign, ln, cos, round, floor, ceil, exp, rand, sqrt, etc）
* 字符串函数（instr, length, printf, etc）
* 日期函数（unix_timestamp, from_unixtime, to_date, weekofyear, year, month, day, current_timestamp, etc）

### 常用的UDF
#### 计算类

* 取整函数: round
* 指定精度取整函数: round
* 向下取整函数: floor
* 向上取整函数: ceil
* 向上取整函数: ceiling
* 取随机数函数: rand
* 自然指数函数: exp
* 以10为底对数函数: log10
* 以2为底对数函数: log2
* 对数函数: log
* 幂运算函数: pow
* 幂运算函数: power
* 开平方函数: sqrt
* 二进制函数: bin
* 十六进制函数: hex
* 反转十六进制函数: unhex
* 进制转换函数: conv
* 绝对值函数: abs
* 正取余函数: pmod
* 正弦函数: sin
* 反正弦函数: asin
* 余弦函数: cos
* 反余弦函数: acos
* positive函数: positive
* negative函数: negative

#### 日期类

* UNIX时间戳转日期函数: from_unixtime
* 获取当前UNIX时间戳函数: unix_timestamp
* 日期转UNIX时间戳函数: unix_timestamp
* 指定格式日期转UNIX时间戳函数: unix_timestamp
* 日期时间转日期函数: to_date
* 日期转年函数: year
* 日期转月函数: month
* 日期转天函数: day
* 日期转小时函数: hour
* 日期转分钟函数: minute
* 日期转秒函数: second
* 日期转周函数: weekofyear
* 日期比较函数: datediff
* 日期增加函数: date_add
* 日期减少函数: date_sub

更详尽的 Hive 运算符和内置函数，可以参考[这里](https://cwiki.apache.org/confluence/display/Hive/LanguageManual+UDF#LanguageManualUDF-Built-inOperators)

### 多表 Join：

* JOIN
* {LEFT|RIGHT|FULL} OUTER JOIN
* LEFT SEMI JOIN
* CROSS JOIN

### 子查询

* SELECT col FROM ( SELECT a + b AS col from t1) t2

### 大多数 Hive 数据类型，包括：

* TINYINT
* SMALLINT
* INT
* BIGINT
* BOOLEAN
* FLOAT
* DOUBLE
* STRING
* BINARY
* TIMESTAMP
* ARRAY<>
* MAP<>
* STRUCT<>

详细信息请参考 [Spark SQL Supported Hive Features](http://spark.apache.org/docs/latest/sql-programming-guide.html#supported-hive-features)

不支持的 Hive 功能可以参考 [Spark SQL Unsupported Hive Functionality](http://spark.apache.org/docs/latest/sql-programming-guide.html#unsupported-hive-functionality)

### 一些 SQL-like 数据分析例子

* 简单的 SELECT 查询

```
	select * from GameScore

	select count(*) from _User

```

* 复杂的 SELECT 查询

```
	select * from GameScore where createdAt > '2014-12-10'

	select avg(age) from _User

	select GameScore.objectId from GameScore left join _User where _User.name=GameScore.name limit 10

	select * from _User where name in (select name form OtherUser)

	select sum(score) from GameScore

	select count(*) as `count` from GameScore group by name

```

更多例子可以参考这篇[博客](https://blog.leancloud.cn/2559/)

## 云引擎和 JavaScript SDK 对离线分析的支持

JavaScript SDK 0.5.5 版本开始支持离线数据分析。**请注意，离线数据分析要求使用 Master Key，否则下面所述内容都没有权限运行，参考[《权限说明》](./cloud_code_guide.html#权限说明)。**

### 开始一个 Job

```js
  AV.Insight.startJob({
        sql: "select * from `_User`",
        saveAs: {
          className: 'BigQueryResult',
          limit:1
        }
   }).done(function(id) {
      //返回 job id
   }).catch(function(err){
      //发生错误
   });
```

`AV.Insight.startJob` 启动一个离线分析任务，它可以指定：

* sql -- 本次任务的查询的 SQL 。
* saveAs（可选） -- 本次任务查询结果保存的参数，比如要保存的表名和数量，limit 最大为 1000。

任务如果能正常启动，将返回任务的 job id，后续可以拿这个 id 去查询任务状态和结果。


### 在云引擎里监听 Job 完成

在云引擎里，可以通过一个 hook 函数来监听 job 完成情况：

```js
AV.Insight.on('end', function(err, result) {
    console.dir(result);
});
 ```

目前仅支持 `end` 事件，当 job 完成（可能成功或者失败）就通知到这个 hook 函数，结果 result 里会包含 job id 以及任务状态信息：

```
{ id: '29f24a909074453622856528359caddc',
  startTime: 1435569183000,
  endTime: 1435569185000,
  status: 'OK' }
```

如果 status 是 `OK` ，表示任务成功，其他状态包括 `RUNNING` 表示正在运行，以及 `ERROR` 表示本次任务失败，并将返回失败信息 `message`。

如果任务成功，你可以拿 id 去主动查询任务结果，参见下文。

### 主动查询 Job 状态和结果

在知道任务 id 的情况下（startJob 返回或者云引擎监听到任务完成），可以主动查询本次任务的结果：

```js
  var id = '已知任务 id';
  var q = new AV.Insight.JobQuery(id);
  q.find().then(function(result) {
    //返回查询结果 result 对象
  }, function(err) {
    //查询失败
  });
```

result 是一个 JSON 对象，形如：

```js
{ id: '976c94ef0847f4ff3a65e661bf7b809a', //任务 id
  status: 'OK',                           //任务状态
  totalCount: 50,                         //结果总数
  results: [
    ……结果数组……
  ]
 }
```

`AV.Insight.JobQuery` 也可以设置 `skip` 和 `limit` 做分页查询。

<!--# 做个餐厅管理系统没用 LeanStorage，这位程序员被老板开除了-->

# LeanCloud 存储服务教程 - 餐厅座位预订系统

本教程教你如何使用 LeanCloud SDK 快速开发一个餐厅座位预订管理系统，理解在设计数据表时该如何合理使用 Pointer 和自建中间表。

本文缘起一位用户贴在 [社区论坛](http://forum.leancloud.cn) 中的需求，他希望设计一个表结构，能实现如下需求：

- 展现餐厅列表
- 每个餐厅需要管理餐厅内部的座位
- 每个座位在每天的某一个时段可能会被预定，我需要管理这些预定
- 给老板展现每一个餐厅某一个时段的预订率
- 给老板展现某一个餐厅的某一个座位的翻桌率（这个位置可能靠窗户，也可能座位本身的设计很受欢迎）

我们发现其中很多设计的思路针对其他系统也很适用，所以特别提炼出一些精华分享给 LeanCloud 开发者，希望减少大家「掉坑」情况的发生。我们将按照上述需要的顺序，逐步讲解如何来完成表结构的设计。

## 餐厅表 `Restaurant`

首先建立一个只有基本字段 `id` 和 `name` 的餐厅表 **Restaurant**，后文会根据需求补充或者修改字段，代码如下：

id|name<span class="text-muted text-thin">（餐厅名称:String）</span>
--|--
r1|和平饭店
r2|北京饭店
r3|希尔顿大酒店

```js
'use strict';
var AV = require('leancloud-storage');

exports.newRestaurant = function newRestaurant(restaurantData) {
    let name = restaurantData.name || '';
    if (name == '') {
        throw new Error('餐厅必须得有个名字吧，😜');
    }
    let id = restaurantData.id || '';
    let restaurant = new AV.Object('Restaurant');
    restaurant.set('name', name);
    restaurant.set('id', id);
    return restaurant.save();
}

// 调用代码如下:
let restaurantData = {
    id:'r1'
    name: '和平饭店',
};
newRestaurant(restaurantData).then(result => {
    console.log(result.id);
});
```

## 座位表 `Seat`

id|under<span class="text-muted text-thin">（归属餐厅:Pointer）</span>|capacity<span class="text-muted text-thin">（座位容量:Number）</span>
--|--|--
s1|r1|2
s2|r1|3
s3|r1|4
s4|r2|2
s5|r2|2
s6|r3|5

```js
//filename:booking.js
'use strict';
var AV = require('leancloud-storage');

exports.newSeat = function newSeat(seatData) {
    let restaurant = seatData.restaurant;
    if (restaurant == undefined) throw new Error('一个座位必须属于一个餐厅啊，亲 🏚');
    let capacity = seatData.capacity || 1;
    let seat = new AV.Object('Seat');
    let id = seatData.id || '';
    seat.set('under', restaurant);
    seat.set('id', id);
    seat.set('capacity', capacity);

    return seat.save();
}

// 调用代码如下：
let restaurantData = {
    id : 'r1',
    name: '和平饭店',
};
newRestaurant(restaurantData).then(restaurant => {
    let seatData = {
        capacity: 5,
        restaurant: restaurant
    };
    return newSeat(seatData);
}).then(result => {
    // 保存成功
}).catch(error => {
    console.log(error);
});
```

## 预订表 `Booking`

seat<span class="text-muted text-thin">（座位:Pointer）</span>|from<span class="text-muted text-thin">（预订起始时间:Date）</span>|to<span class="text-muted text-thin">（预订结束时间:Date）</span>
--|--|--
s1|2017-02-01 18:00|2017-02-01 19:00
s1|2017-02-02 15:00|2017-02-02 16:00
s2|2017-02-02 15:00|2017-02-01 16:00
s2|2017-02-01 18:00|2017-02-01 19:00
s3|2017-02-01 18:00|2017-02-01 19:00
s3|2017-02-01 18:00|2017-02-01 19:00


```js
//filename:booking.js
'use strict';
var AV = require('leancloud-storage');

exports.newBooking = function newBooking(bookingtData) {
    let seat = bookingtData.seat;
    if(typeof seat === 'undefined') throw new Error('订座位的时候一定要指定座位...');
    let from = bookingtData.from;
    if(typeof from === 'undefined') throw new Error('订座位的时候一定要指定预订起始时间'); 
    let to = bookingtData.to;
    if(typeof to === 'undefined') throw new Error('订座位的时候一定要指定就餐结束的时间');

    let booking = new AV.Object('Booking');
    booking.set('seat',seat);
    booking.set('from',from);
    booking.set('to',to);

    return booking.save();
}
```

## 座位预订查询

### 查询某一餐厅的所有座位

假设数据库存在如下数据：

objectId|id|name
--|--|--|--|--
5901d458da2f60005de8f51d|r1|和平饭店
5901d458a0bb9f0065e57f33|r2|北京饭店
5901d45844d90400690d1109|r3|希尔顿大酒店

查询和平饭店拥有的座位:

```js
exports.querySeats = function querySeats(restaurant) {
    if (typeof restaurant == 'string') {
        restaurant = AV.Object.createWithoutData('Restaurant', restaurant);
    } else if (typeof restaurant != 'AV.Object') {
        throw new Error('仅支持传入 string 和 AV.Object');
    }
    let query = new AV.Query('Seat');
    query.equalTo('under',restaurant);
    return query.find();
}
// 假设和平饭店的存储之后的 objectId  为 5901d458da2f60005de8f51d

let restaurant = '5901d458da2f60005de8f51d';
querySeats(restaurant).then(result => {
    // result 为和平饭店里面的座位
    console.log(result);
});
```

### 查询一些座位在某一时段的预定情况

```js
exports.queryBookingInBatch = function queryBookingInBatch(seats, from, to) {
    let seatObjArray = [];

    if (seats instanceof Array) {
        seats.forEach(seat => {
            if (typeof seat == 'string') {
                seatObjArray.push(AV.Object.createWithoutData('Seat', seat));
            } else if (seat instanceof AV.Object) {
                if (seat.className != 'Seat') throw new TypeError('seats 不可以包含其他 AV.Object 类型');
                seatObjArray.push(seat);
            }
        });
    }
    
    let query = new AV.Query('Booking');
    // 关键代码查询包含在数组中的 seat 的预定记录
    query.containedIn('seat', seatObjArray);
    query.greaterThanOrEqualTo('from', from);
    query.lessThanOrEqualTo('to', to);
    return query.find();
}
//调用代码
let seats = ['5901d4590ce463006153ba5f','5901d4598d6d810058ba4eba'];
// SDK 针对 UTC 时间做了时区转化，因此查询的时候还是需要传入 UTC 时间
let from = new Date("2017-04-25T02:00:00Z");
let to = new Date("2017-04-25T14:00:00Z");
queryBookingInBatch(seats, from, to).then(result => {
    console.log(result);
}).catch(error => {
    console.error(error);
});
```

### 查询一个餐厅在某一时段的预定情况

结合前面两个查询我们可以实现一个分为两步的查询：

- 先查询出餐厅的座位
- 然后查询这些作为的预定情况

```js
let restaurant = AV.Object.createWithoutData('Restaurant', '5901d458da2f60005de8f51d');
querySeats(restaurant).then(seats => {
    // SDK 针对 UTC 时间做了时区转化，因此查询的时候还是需要传入 UTC 时间
    let from = new Date("2017-04-25T02:00:00Z");
    let to = new Date("2017-04-25T14:00:00Z");
    return queryBookingInBatch(seats, from, to);
}).then(result => {
    console.log(result);
    chai.assert.isTrue(result.length > 1);
    done();
}).catch(error => {
    console.error(error);
});
```

### 查询一个座位在某一个时段的预订情况

我们挑选一个座位 s1，它隶属于和平饭店（r1），查询 `Booking` 表，获取在 2017-04-25 这一天上午 10 点到晚上 22 点之间的预定情况：

```js
exports.queryBooking = function queryBooking(seat,from,to) {
    if (typeof seat == 'string') {
        seat = AV.Object.createWithoutData('Seat', seat);
    } else if (!(seat instanceof AV.Object)) {
        throw new TypeError('仅支持传入 string 和 AV.Object');
    }
    let query = new AV.Query('Booking');
    query.equalTo('seat',seat);
    query.greaterThanOrEqualTo('from',from);
    query.lessThanOrEqualTo('to',to);
    return query.find();
}
// 调用方式如下：
let seat = '5901d4590ce463006153ba5f';
// SDK 针对 UTC 时间做了时区转化，因此查询的时候还是需要传入 UTC 时间
let from = new Date("2017-04-25T02:00:00Z");
let to = new Date("2017-04-25T14:00:00Z");
queryBooking(seat, from, to).then(result => {
    console.log(result);
}).catch(error => {
    console.error(error);
});
```



angular.module('app').controller('DemoCtrl', ['$http', '$scope', '$rootScope', '$timeout',
  function($http, $scope, $rootScope, $timeout) {
    function setByHash() {
      var hash = location.hash.slice(2);
      if (!$scope.plats[hash]) {
        $scope.currentSDKType = 'all';
      } else {
        $scope.currentSDKType = location.hash.slice(2);
      }

    }
    $scope.keys = function(obj){
      return obj? Object.keys(obj) : [];
    }

    $scope.plats = {
      'ios': 'iOS',
      'android': 'Android',
      'unity': 'Unity',
      'winphone': 'Windows Phone',
      'js': 'JavaScript',
      'node': 'Node.js',
      'php': 'PHP',
      'reactnative': 'React Native'
    }
    $scope.demos = {
      'ios': [{
        name: 'StorageStarted',
        desc: '本教程将模拟一个发布商品的场景，向你讲解 LeanCloud 的数据存储 LeanStorage 的核心使用方法。',
        downPath: '',
        mdPath: 'https://github.com/leancloud/StorageStarted',
        type: 'ios'
      },{
        name: 'LeanStorage Demo',
        desc: '展示了 LeanCloud 数据存储 SDK 的各种基础和高级用法，帮助 LeanCloud 开发者尽快上手 SDK。',
        downPath: '',
        mdPath: 'https://github.com/leancloud/ios-simple-demo',
        type: 'ios'
      },{
        name: 'LeanMessageDemo-iOS',
        desc: '此项目是为了让大家能快速上手熟悉 LeanCloud IM SDK。之前推出的 LeanChat ，我们发现其中含杂了许多 UI 代码，不利于大家学习上手。因此我们推出了 LeanMessageDemo，只有最精简的 UI、最核心的 SDK 用法。',
        downPath: '',
        mdPath: 'https://github.com/leancloud/LeanMessage-Demo',
        type: 'ios'
      },{
        name: 'Share',
        desc: '事件流系统的 Demo，有关注、发状态、时间线等功能。',
        downPath: '',
        mdPath: 'https://github.com/leancloud/Share',
        type: 'ios'
      },{
        name: 'Feedback Demo',
        desc: '演示了 LeanCloud 反馈功能的用法。',
        downPath: '',
        mdPath: 'https://github.com/leancloud/feedback-demo',
        type: 'ios'
      },{
        name: 'leancloud-smsdemo-ios',
        desc: 'LeanCloud SMS Demo 是 LeanCloud 开源的一个短信 demo 程序',
        downPath: '',
        mdPath: 'https://github.com/leancloud/leancloud-smsdemo-ios',
        type: 'ios'
      }],
      'android': [{
        name: 'StorageStarted',
        desc: '本教程将模拟一个发布商品的场景，向你讲解 LeanCloud 的数据存储 LeanStorage 的核心使用方法。',
        downPath: '',
        mdPath: 'https://github.com/leancloud/StorageStarted',
        type: 'android'
      },{
        name: 'LeanStorage Demo',
        desc: '展示了 LeanCloud 数据存储 SDK 的各种基础和高级用法，包括用户系统、文件上传下载、子类化、对象复杂查询等。',
        downPath: '',
        mdPath: 'https://github.com/leancloud/android-simple-demo',
        type: 'android'
      },{
        name: 'LeanChat-Android',
        desc: 'LeanChat 是用 LeanCloud 实时通信服务做的一个沟通工具，有Android、iOS版本。后台也完全基于 LeanCloud，存储用户信息，好友关系等。',
        downPath: '',
        mdPath: 'https://github.com/leancloud/leanchat-android',
        type: 'android'
      },{
        name: 'LeanMessageDemo',
        desc: '此项目是为了让大家能快速上手熟悉 LeanCloud IM SDK。之前推出的 LeanChat ，我们发现其中含杂了许多 UI 代码，不利于大家学习上手。因此我们推出了 LeanMessageDemo ，只有最精简的 UI、最核心的 SDK 用法。',
        downPath: '',
        mdPath: 'https://github.com/leancloud/LeanMessage-Demo',
        type: 'android'
      },{
        name: 'WeShare',
        desc: '此项目是用 LeanCloud 事件流系统组件做的类似朋友圈的分享小应用。具有时间线、发文字发图、点赞、关注的模块或功能。',
        downPath: '',
        mdPath: 'https://github.com/leancloud/WeShare',
        type: 'android'
      },{
        name: 'LeanPush Demo',
        desc: '一个使用了 LeanCloud 推送消息服务的简单 Demo，直接在客户端推送消息，并自己接收。',
        downPath: '',
        mdPath: 'https://github.com/leancloud/android-push-demo',
        type: 'android'
      },{
        name: 'android-sns-demo',
        desc: '示例了 QQ 、微博授权登录。',
        downPath: '',
        mdPath: 'https://github.com/leancloud/android-sns-demo',
        type: 'android'
      },{
        name: 'android-sms-demo',
        desc: '短信验证码示例项目。',
        downPath: '',
        mdPath: 'https://github.com/leancloud/android-sms-demo',
        type: 'android'
      }],
      'js': [{
        name: 'StorageStarted',
        desc: '本教程将模拟一个发布商品的场景，向你讲解 LeanCloud 的数据存储 LeanStorage 的核心使用方法。',
        downPath: '',
        mdPath: 'https://github.com/leancloud/StorageStarted',
        type: 'js'
      }],
      'unity': [{
        name: 'FlappyBird',
        desc: '支持 Unity 平台的 FlappyBird 小游戏，演示了 LeanCloud 数据存储 SDK 的大多数功能。',
        downPath: '',
        mdPath: 'https://github.com/leancloud/unity-sdk-demos',
        type: 'unity'
      }],
      'winphone': [{
        name: 'Tutorial',
        desc: 'Windows Phone 平台的示例程序，演示了 LeanCloud 数据存储 SDK 的大多数功能。',
        downPath: '',
        mdPath: 'https://github.com/leancloud/windows-phone-sdk-demos',
        type: 'winphone'
      }],
      'php': [{
        name: 'slim-todo-demo',
        desc: 'LeanCloud todo demo for Slim PHP Framewor',
        downPath: '',
        mdPath: 'https://github.com/leancloud/slim-todo-demo',
        type: 'php'
      }],
      'reactnative': [{
        name: 'react-native-image-upload-demo',
        desc: 'React Native 上传图片',
        downPath: '',
        mdPath: 'https://github.com/leancloud/react-native-image-upload-demo',
        type: 'reactnative'
      },{
        name: 'react-native-installation-demo',
        desc: '本 Demo 演示了如何在 React Native for iOS 中使用 LeanCloud 的推送服务。',
        downPath: '',
        mdPath: 'https://github.com/leancloud/react-native-installation-demo',
        type: 'reactnative'
      }],
      'node': [{
        name: 'sdk-demo-engine',
        desc: 'LeanEngine 项目，展示 SDK 与云引擎之间的数据交互。',
        downPath: '',
        mdPath: 'https://github.com/leancloud/sdk-demo-engine',
        type: 'node'
      },{
        name: 'cloud-code-weixin',
        desc: '云代码接入微信的例子，利用云代码可快速搭建微信服务号的后端。',
        downPath: '',
        mdPath: 'https://github.com/leancloud/LeanEngine-WechatBot',
        type: 'node'
      },{
        name: 'realtime-service-demo',
        desc: '这个项目提供了利用 LeanCloud 云引擎、数据存储和实时通信服务实现一个基本的客服系统的 Demo。',
        downPath: '',
        mdPath: 'https://github.com/leancloud/realtime-service-demo',
        type: 'node'
      },{
        name: 'leanengine-todo-demo',
        desc: '该项目是 LeanCloud 的 LeanEngine 示例项目，使用 Node.js 和 Express 实现。',
        downPath: '',
        mdPath: 'https://github.com/leancloud/leanengine-todo-demo',
        type: 'node'
      },{
        name: 'leanengine-websocket-demo',
        desc: 'websocket 简单示例',
        downPath: '',
        mdPath: 'https://github.com/leancloud/leanengine-websocket-demo',
        type: 'node'
      },{
        name: 'LeanCache Demos',
        desc: '包含了抢红包、排行榜缓存、关联数据缓存、图形验证码、节点选举和锁、任务队列、热点只读数据缓存等实用代码，展示出 Redis 缓存的实际应用效果。',
        downPath: '',
        mdPath: 'https://github.com/leancloud/lean-cache-demos',
        type: 'node'
      }]
    }
    $scope.$watch('currentSDKType',function(){
      $scope.displayDemos = [];
      var arr = [];
      if($scope.currentSDKType == 'all'){
        angular.forEach($scope.demos, function(v,k){
          arr = arr.concat(v) ;
        });
        $scope.displayDemos = arr;
      }else{
        $scope.displayDemos = $scope.demos[$scope.currentSDKType]
      }
    })
    $scope.setCurrentType = function(type) {
      $scope.currentSDKType = type;
    }
    setByHash();
    $(window).on('hashchange', function() {
      $timeout(function() {
        setByHash();
      })
    });


  }
  ]);

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
      'winphone': 'Windows Phone'
    }
    $scope.demos = {
      'ios': [{
        name: 'AVOSDemo',
        desc: '这个示例项目是为了帮助使用 LeanCloud 的开发者, 尽快的熟悉和使用 SDK 而建立的。主要展示 LeanCloud 数据存储 SDK 的各种基础和高级用法',
        downPath: '',
        mdPath: 'https://github.com/leancloud/ios-simple-demo',
        type: 'ios'
      },{
        name: 'FeedbackDemo',
        desc: '这个是一个演示反馈功能用法的示例项目',
        downPath: '',
        mdPath: 'https://github.com/leancloud/feedback-demo',
        type: 'ios'
      }, {
        name: 'FreeChat',
        desc: '这个示例项目演示了 LeanCloud 实时通信 SDK 的使用方法，包括单聊、群聊、聊天室，也支持图片、文字、语音等消息类型',
        downPath: '',
        mdPath: 'https://github.com/leancloud/FreeChat',
        type: 'ios'
      },{
        name: '微转',
        desc: '微转是一个基于微博的数码设备平台, 客户端和后台全部基于 AVOS Cloud 服务实现',
        downPath: '',
        mdPath: 'https://github.com/leancloud/VZ',
        type: 'ios'
      }],
      'android': [{
        name: 'AVOSDemo',
        desc: '一个 LeanCloud 综合型的 Demo，目前做的不够细致，请谅解，演示了 LeanCloud 数据存储 SDK 大多数功能：用户系统，文件上传下载，子类化，对象复杂查询等',
        downPath: '',
        mdPath: 'https://github.com/leancloud/android-simple-demo',
        type: 'android'
      },{
        name: 'AVOSPush',
        desc: '一个 LeanCloud 推送消息的简单 Demo，直接在客户端推送消息，并自己接收',
        downPath: '',
        mdPath: 'https://github.com/leancloud/android-push-demo',
        type: 'android'
      },{
        name: 'TodoDemo',
        desc: '一个创建、编辑、删除和搜索 Todo 的示例，演示了：数据增删改查，子类化 com.avos.demo.Todo 类，统计功能，统计的自定义事件功能，应用内搜索',
        downPath: '',
        mdPath: 'https://github.com/leancloud/android-todolist',
        type: 'android'
      },{
        name: 'Anytime',
        desc: '用户注册、登陆、登出和忘记密码等用户系统相关的功能。相对复杂一些的数据增删改查操作。消息推送',
        downPath: '',
        mdPath: 'https://github.com/lzwjava/AnyTime',
        type: 'android'
      }],
      'unity': [{
        name: 'FlappyBird',
        desc: '支持 Unity 平台的 FlappyBird 小游戏，演示了 LeanCloud 数据存储 SDK 的大多数功能',
        downPath: '',
        mdPath: 'https://github.com/leancloud/unity-sdk-demos',
        type: 'unity'
      }],
      'winphone': [{
        name: 'Tutorial',
        desc: 'Windows Phone 平台的示例程序，演示了 LeanCloud 数据存储 SDK 的大多数功能',
        downPath: '',
        mdPath: 'https://github.com/leancloud/windows-phone-sdk-demos',
        type: 'winphone'
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
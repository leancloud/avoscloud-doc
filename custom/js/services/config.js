/**
 * @author sunchanglong wangxiao
 *
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
 */

'use strict';

angular.module('app')
.factory('configSer',
['$rootScope', '$location', '$window',
function($rootScope, $location, $window) {
  return {
    apiUrl: '/1',
    httpTimeout: 10000,

    // 获取节点信息
    getServerNode: function() {
      // 美国节点
      if ($location.host().indexOf('us.leancloud.cn') >= 0) {
        return 'us';
      } else {
        // 默认为中国节点
        return 'cn';
      }
    },
    getLeanOperationHost: function() {
      var apiHost = 'https://o.leancloud.cn';

      // 该模块为使用 LeanEngine 开发的项目，所以本地调试时会去使用本地的 LeanEngine host
      if ($location.host() === 'localhost' && $window.localStorage.getItem('LC-O-DEBUG')) {
        apiHost = 'http://localhost:3000';
      }
      return apiHost;
    },
  };
  // 结束
}]);

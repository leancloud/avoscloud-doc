/**
 * @author sunchanglong wangxiao
 *
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
 */

'use strict';

angular.module('app')
.factory('userInfoSer',
['$http', '$window',
function($http, $window) {
  return {
    getUserData: function() {
      return $http.get('/1/clients/self').then(function(data) {
        return data.data
      });
    },
    getUserInfo: function() {
      return $http.get('/1/clients/self/detail');
    },
  }
}]);

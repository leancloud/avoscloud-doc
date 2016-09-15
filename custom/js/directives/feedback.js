/**
 * 每位工程师都有保持代码优雅的义务
 * Each engineer has a duty to keep the code elegant
 */

'use strict';
angular.module('app')
.directive('feedback', function() {
  return {
    restrict: 'E',
    template: '' +
      '<!-- 这个是一个简单的用户建议及反馈收集 -->' +
      '<div class="leancloud-feedback">'+
        '<div ng-show="ui.step === 0" class="feedback-btn" ng-click="nextStep()">建议反馈</div>' +
        '<div ng-show="ui.step !== 0" class="feedback-body">' +
          '<div class="close-btn" ng-click="close()">x</div>' +
          '<div ng-show="ui.step === 1">' +
            '<p class="tips">寻求帮助请到 <a target="_blank" href="https://forum.leancloud.cn">社区</a> 或 <a target="_blank" href="https://leanticket.cn/t/leancloud/">工单系统</a> </p>' +
            '<textarea class="content form-control" placeholder="您的建议" ng-model="info.content"></textarea>' +
            '<div class="btn btn-primary" ng-click="submit()">提交</div>' +
          '</div>' +
          '<div ng-show="ui.step === 2">' +
            '<p class="success">非常感谢您的建议</p>' +
            '<p>-- LeanCloud 为开发加速 --</p>' +
            '<div class="btn btn-primary" ng-click="close()" ng-disabled="btnDisabled">关闭</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '',
    scope: true,
    replace: false,
    controller: ['$scope', '$http', '$timeout', '$window', '$location', 'configSer', 'userInfoSer',
    function ($scope, $http, $timeout, $window, $location, configSer, userInfoSer) {
      $scope.ui = {
        step: 0,
        btnDisabled: false,
      };

      $scope.info = {
        userId: '',
        email: '',
        phone: '',
        content: '',
        origin: $location.absUrl(),
      };
      var apiHost = configSer.getLeanOperationHost();

      var addFeedback = function(data) {
        var url = apiHost + '/api/feedback/';
        return $http.post(url, data).then(function(res) {
          return res.data;
        });
      };

      $scope.nextStep = function () {
        $scope.ui.step ++;
      };

      var timer;
      $scope.submit = function() {
        if ($scope.info.content.trim()) {
          $scope.ui.btnDisabled = true;
          addFeedback($scope.info).then(function() {
            $scope.nextStep();
            $scope.ui.btnDisabled = true;
            timer = $timeout($scope.close, 3000);
          });
        }
      };

      $scope.close = function() {
        $scope.ui.step = 0;
        $timeout.cancel(timer);
        $scope.info.content = '';
      };

      userInfoSer.getUserData().then(function(data) {
        $scope.info.userId = data.id;
        $scope.info.email = data.email || '';
        $scope.info.phone = data.phone || '';
      });

    // end
    }],
  }
});

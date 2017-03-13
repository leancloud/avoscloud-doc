angular.module('app').controller('WeappDomainsCtrl', [
    '$http',
    '$scope',
    '$rootScope',
    '$timeout',
    '$compile',
    function ($http, $scope, $rootScope, $timeout, $compile) {
        $scope.domains = {
          download: '正在获取配置'
        };

        $scope.$watch('pageState.currentApp',function(){
          var currentApp = $rootScope.pageState.currentApp;
          console.log($rootScope.pageState.currentApp);
          if (currentApp) {
            AV.init({
              appId: currentApp.app_id,
              appKey: currentApp.app_key,
              masterKey: currentApp.master_key,
            });
            new AV.File('weapp-domains-generator-test-file.txt', {
              base64: 'ZmVlbCBmcmVlIHRvIGRlbGV0ZSB0aGlzIGZpbGUu',
            }).save().then(function(file) {
              var downloadDomain;
              var result = file.url().match(/\:\/\/([^\/]*)/);
              if (result) {
                downloadDomain = result[1];
              } else {
                throw new Error('invalid file url');
              }
              console.log(downloadDomain);
              $scope.domains.download = downloadDomain;
              $scope.$digest();
              return file.destroy({
                useMasterKey: true
              });
            }).catch(function(error) {
              console.error(error);
              $scope.error = error;
            });
          }
        });

    }
]);

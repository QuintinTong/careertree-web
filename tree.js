(function() {
  'use strict';

  angular.module('treeApp', ['ui.tree',])

  .value('apiHost', 'http://192.168.1.14:8000')

  .factory('callapi', ['$resource',
    function ($resource, apiHost) {
      return $resource(apiHost + '/:_type/:_type2', {}, {
        nodes: {method: 'GET', params: {_type: 'node', _type2: 'node_tree'}},
      });
    }])

  .service('callapi', ['$http', 'apiHost', function ($http, apiHost) {
    this.nodes = function(callback){
        $http({
            method: 'GET',
            url: apiHost + '/node/node_tree/',
            params: {'node_id': 8},
         }).success(function(data){
          callback(data);
        }).error(function(){
            alert("error");
        });
      };
  }])

  .controller('treeCtrl', function($scope, callapi) {
    callapi.nodes(function(response) {
      $scope.data = response;
    });
  });

})();


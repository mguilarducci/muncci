'use strict';

// Transactions controller
angular.module('payables').controller('PayablesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Payables',
  function($scope, $stateParams, $location, Authentication, Payables) {
    $scope.authentication = Authentication;

    $scope.find = function() {
      $scope.payables = Payables.query();
      console.log($scope.payables);
    };
  }
]);

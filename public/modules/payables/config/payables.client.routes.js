'use strict';

//Setting up route
angular.module('payables').config(['$stateProvider',
  function ($stateProvider) {
    // Payables state routing
    $stateProvider.
      state('listPayables', {
        url: '/payables',
        templateUrl: 'modules/payables/views/list-payables.client.view.html'
      });
  }
]);

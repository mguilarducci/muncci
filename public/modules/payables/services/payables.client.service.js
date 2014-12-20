'use strict';

// Payables service used to communicate Transactions REST endpoints
angular.module('payables').factory('Payables', ['$resource',
  function ($resource) {
    return $resource('payables/:payableId', { transactionId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

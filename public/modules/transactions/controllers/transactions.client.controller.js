'use strict';

// Transactions controller
angular.module('transactions').controller('TransactionsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Transactions',
  function ($scope, $stateParams, $location, Authentication, Transactions) {
    $scope.authentication = Authentication;

    // Create new Transaction
    $scope.create = function () {
      // Create new Transaction object
      var transaction = new Transactions({
        name: this.name,
        to: this.to,
        kind: this.kind,
        status: this.status,
        value: this.value,
        date: this.date,
        dueDate: this.dueDate
      });

      // Redirect after save
      transaction.$save(function (response) {
        $location.path('transactions/' + response._id);

        // Clear form fields
        $scope.name = '';
        $scope.to = '';
        $scope.kind = '';
        $scope.status = '';
        $scope.value = '';
        $scope.date = '';
        $scope.dueDate = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Transaction
    $scope.remove = function (transaction) {
      if (transaction) {
        transaction.$remove();

        for (var i in $scope.transactions) {
          if ($scope.transactions [i] === transaction) {
            $scope.transactions.splice(i, 1);
          }
        }
      } else {
        $scope.transaction.$remove(function () {
          $location.path('transactions');
        });
      }
    };

    // Update existing Transaction
    $scope.update = function () {
      var transaction = $scope.transaction;

      transaction.$update(function () {
        $location.path('transactions');
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Transactions
    $scope.find = function () {
      $scope.transactions = Transactions.query();
    };

    // Find existing Transaction
    $scope.findOne = function () {
      $scope.transaction = Transactions.get({
        transactionId: $stateParams.transactionId
      });
    };

    $scope.title = function (transaction, user) {
      var to, kind, fromTo;

      if (transaction.user._id === user._id) {
        if (transaction.kind === 'pay') {
          kind = 'Pagar';
          fromTo = 'a';
        } else {
          kind = 'Receber';
          fromTo = 'de';
        }

        if (transaction.friend) {
          to = transaction.friend.displayName || transaction.to;
        } else {
          to = transaction.to;
        }
      } else {
        if (transaction.kind === 'pay') {
          kind = 'Receber';
          fromTo = 'de';
        } else {
          kind = 'Pagar';
          fromTo = 'a';
        }
        to = transaction.user.displayName;
      }

      return kind + ' R$' + transaction.value + ' ' + fromTo + ' ' + to;
    };

    $scope.canRevoke = function (transaction, user) {
      return transaction.user._id !== user._id &&
        transaction.to === user.email &&
        transaction.status === 'created';
    };

    $scope.canAccept = function (transaction, user) {
      return transaction.user._id !== user._id &&
        transaction.to === user.email &&
        (transaction.status === 'created' || transaction.status === 'revoked');
    };

    $scope.canPay = function (transaction, user) {
      return (transaction.user._id === user._id || transaction.to === user.email) &&
        (transaction.status === 'created' || transaction.status === 'accepted');
    };

    $scope.revoke = function (transaction) {
      if (transaction) {
        $scope.transaction = transaction;
      }
      $scope.transaction.status = 'revoked';
      $scope.update();
    };

    $scope.accept = function (transaction) {
      if (transaction) {
        $scope.transaction = transaction;
      }
      $scope.transaction.status = 'accepted';
      $scope.update();
    };

    $scope.pay = function (transaction) {
      if (transaction) {
        $scope.transaction = transaction;
      }
      $scope.transaction.status = 'paid';
      $scope.update();
    };

    $scope.rowClass = function (transaction, user) {
      var classe;

      switch (transaction.status) {
        case 'revoked':
          classe = 'list-group-item-danger';
          break;
        case 'paid':
          classe = 'list-group-item-success';
          break;
        case 'created':
          classe = (transaction.to === user.email) ? 'list-group-item-info' : '';
          break;
      }

      return classe;
    };
  }
]);

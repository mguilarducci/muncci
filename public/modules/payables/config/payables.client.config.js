'use strict';

angular.module('payables').run(['Menus',
  function(Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', 'Payables', 'payables', 'dropdown', '/payables/');
    Menus.addSubMenuItem('topbar', 'payables', 'List payables', 'payables');
  }
]);

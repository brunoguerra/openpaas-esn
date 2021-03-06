(function() {
  'use strict';

  angular.module('esn.calendar')
    .controller('CalendarConfigurationTabDelegationController', CalendarConfigurationTabDelegationController);

  function CalendarConfigurationTabDelegationController(
    CAL_CALENDAR_SHARED_RIGHT
  ) {
    var self = this;

    self.$onInit = $onInit;
    self.onAddingUser = onAddingUser;

    ///////////

    function $onInit() {
      self.delegations = self.delegations || [];

      self.delegationTypes = [
        {
          value: CAL_CALENDAR_SHARED_RIGHT.NONE,
          name: 'None'
        }, {
          value: CAL_CALENDAR_SHARED_RIGHT.SHAREE_ADMIN,
          name: 'Administration'
        }, {
          value: CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ_WRITE,
          name: 'Read and Write'
        }, {
          value: CAL_CALENDAR_SHARED_RIGHT.SHAREE_READ,
          name: 'Read only'
        }, {
          value: CAL_CALENDAR_SHARED_RIGHT.SHAREE_FREE_BUSY,
          name: 'Free/Busy'
        }];
    }

    function onAddingUser($tags) {
      var canBeAdded = !!$tags._id && !self.delegations.some(function(delegation) {
          return $tags._id === delegation.user._id;
        });

      return canBeAdded;
    }
  }
})();

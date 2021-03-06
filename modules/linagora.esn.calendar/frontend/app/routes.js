(function() {
  'use strict';

  angular.module('esn.calendar')
    .config(routesConfig);

  function routesConfig($stateProvider, routeResolver) {
    $stateProvider
      .state('calendarForCommunities', {
        url: '/calendar/communities/:community_id',
        templateUrl: '/calendar/app/calendar/community-calendar',
        abstract: true,
        resolve: {
          community: routeResolver.api('communityAPI', 'get', 'community_id', '/communities')
        },
        reloadOnSearch: false
      })
      .state('calendarForCommunities.main', {
        url: '',
        views: {
          content: {
            template: '<calendar-view calendar-home-id="calendarHomeId" ui-config="uiConfig"/>',
            controller: function($scope, community, CAL_UI_CONFIG) {
              $scope.calendarHomeId = community._id;
              $scope.uiConfig = angular.copy(CAL_UI_CONFIG);
              $scope.uiConfig.calendar.editable = false;
              $scope.uiConfig.calendar.selectable = false;
            }
          }
        }
      })

      .state('calendar', {
        url: '/calendar',
        templateUrl: '/calendar/app/calendar/user-calendar',
        abstract: true,
        resolve: {
          calendarHomeId: function(calendarHomeService) {
            return calendarHomeService.getUserCalendarHomeId();
          }
        },
        controller: function($scope, calendarHomeId) {
          $scope.calendarHomeId = calendarHomeId;
        },
        reloadOnSearch: false
      })
      .state('calendar.main', {
        url: '',
        views: {
          content: {
            templateUrl: '/calendar/app/calendar/calendar-main',
            controller: function($scope, calendarHomeId, CAL_UI_CONFIG) {
              $scope.calendarHomeId = calendarHomeId;
              $scope.uiConfig = angular.copy(CAL_UI_CONFIG);
            }
          }
        }
      })
      .state('calendar.edit', {
        url: '/edit/:calendarId',
        params: {
          addUsersFromDelegationState: null
        },
        views: {
          content: {
            template: '<calendar-configuration />'
          }
        }
      })
      .state('calendar.edit.delegation', {
        url: '/delegation',
        params: {
          newUsersGroups: null,
          delegationTypes: null
        },
        views: {
          'content@calendar': {
            template: '<calendar-edit-delegation-add-users />'
          }
        }
      })
      .state('calendar.add', {
        url: '/add',
        views: {
          content: {
            template: '<calendar-configuration />'
          }
        }
      })
      .state('calendar.public', {
        url: '/public',
        views: {
          content: {
            template: '<calendar-public-configuration />'
          }
        }
      })
      .state('calendar.external', {
        url: '/external',
        deepStateRedirect: {
          default: 'calendar.main',
          fn: function() {
            return { state: 'calendar.main' };
          }
        }
      })
      .state('calendar.external.public', {
        url: '/public/:calendarId',
        views: {
          'content@calendar': {
            template: '<calendar-public-consultation />'
          }
        }
      })
      .state('calendar.external.shared', {
        url: '/shared/:calendarId',
        views: {
          'content@calendar': {
            template: '<calendar-shared-consultation />'
          }
        }
      })
      .state('calendar.list', {
        url: '/list',
        views: {
          content: {
            template: '<calendars-configuration calendars="calendars"/>',
            resolve: {
              calendars: function(calendarService, calendarHomeId) {
                var options = {
                  withRights: true
                };

                return calendarService.listCalendars(calendarHomeId, options);
              }
            },
            controller: function($scope, calendars) {
              $scope.calendars = calendars;
            }
          }
        }
      })
      .state('calendar.event', {
        url: '/:calendarHomeId/event/:eventId',
        abstract: true,
        views: {
          content: {
            template: '<div ui-view="content"/>'
          }
        },
        resolve: {
          event: function($stateParams, $state, calPathBuilder, calEventService, calEventUtils, notificationFactory) {
            var eventPath = calPathBuilder.forEventId($stateParams.calendarHomeId, $stateParams.eventId);
            var editedEvent = calEventUtils.getEditedEvent();

            return editedEvent && Object.keys(editedEvent).length ? editedEvent : calEventService.getEvent(eventPath).catch(function(error) {
              if (error.status !== 404) {
                notificationFactory.weakError('Cannot display the requested event, an error occured: ', error.statusText);
              }
              $state.go('calendar.main');
            });
          }
        }
      })
      .state('calendar.event.form', {
        url: '/form',
        views: {
          content: {
            template: '<cal-event-full-form event="event"/>',
            controller: function($scope, event) {
              $scope.event = event;
            }
          }
        }
      })
      .state('calendar.event.consult', {
        url: '/consult',
        views: {
          content: {
            template: '<cal-event-consult-form event="event"/>',
            controller: function($scope, event) {
              $scope.event = event;
            }
          }
        }
      });
  }
})();

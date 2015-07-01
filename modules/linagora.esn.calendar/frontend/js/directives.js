'use strict';

angular.module('esn.calendar')
  .directive('eventMessage', ['calendarService', 'session', function(calendarService, session) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '/calendar/views/message/templates/eventMessage.html',
      link: function($scope, element, attrs) {
        $scope.changeParticipation = function(partstat) {
          var vcalendar = $scope.event.vcalendar;
          var path = $scope.event.path;
          var etag = $scope.event.etag;
          var emails = session.user.emails;

          calendarService.changeParticipation(path, vcalendar, emails, partstat, etag).then(function(shell) {
            $scope.partstat = partstat;
            if (shell) {
              $scope.event = shell;
            }
          });
        };

        function updateEvent() {
          calendarService.getEvent($scope.message.eventId).then(function(event) {
            // Set up dom nodes
            $scope.event = event;
            element.find('>div>div.loading').addClass('hidden');
            element.find('>div>div.message').removeClass('hidden');

            // Load participation status
            var vcalendar = event.vcalendar;
            var emails = session.user.emails;
            var attendees = calendarService.getInvitedAttendees(vcalendar, emails);
            var organizer = attendees.filter(function(att) {
              return att.name === 'organizer' && att.getParameter('partstat');
            });

            var attendee = organizer[0] || attendees[0];
            if (attendee) {
              $scope.partstat = attendee.getParameter('partstat');
            }
          }, function(response) {
            var error = 'Could not retrieve event: ' + response.statusText;
            element.find('>div>.loading').addClass('hidden');
            element.find('>div>.error').text(error).removeClass('hidden');
          });
        }

        updateEvent();
      }
    };
  }])
  .directive('eventButtonCreate', function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        community: '=',
        user: '='
      },
      templateUrl: '/calendar/views/partials/event-button-creation.html'
    };
  })
  .directive('calendarButtonToolbar', function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '/calendar/views/community/community-calendar-button-toolbar.html'
    };
  })
  .directive('messageEditionEventButton', function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '/calendar/views/message/event/message-edition-event-button.html'
    };
  })
  .directive('eventCreateQuickFormWizard', ['widget.wizard', '$rootScope',
    function(Wizard, $rootScope) {
      function link($scope, element) {
        $scope.wizard = new Wizard([
          '/calendar/views/partials/event-create-quick-form-wizard'
        ]);
        $rootScope.$on('modal.show', function() {
          element.find('input[ng-model="event.title"]').focus();
        });
        $scope.rows = 1;
      }
      return {
        restrict: 'E',
        templateUrl: '/calendar/views/partials/event-create-quick-form',
        scope: {
          user: '=',
          domain: '=',
          createModal: '=',
          event: '='
        },
        link: link
      };
    }
  ])
  .directive('eventEdition', function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '/calendar/views/message/event/event-edition.html'
    };
  })
  .directive('eventForm', ['$q', 'domainAPI', 'session',
    function($q, domainAPI, session) {
      function link($scope, element, attrs, controller) {
        controller.initFormData();

        $scope.closeModal = function() {
          $scope.createModal.hide();
        };

        $scope.isNew = controller.isNew;
        $scope.addNewEvent = controller.addNewEvent;
        $scope.deleteEvent = controller.deleteEvent;
        $scope.modifyEvent = controller.modifyEvent;
        $scope.resetEvent = controller.resetEvent;
        $scope.getMinDate = controller.getMinDate;
        $scope.onAllDayChecked = controller.onAllDayChecked;
        $scope.onStartDateChange = controller.onStartDateChange;
        $scope.onStartTimeChange = controller.onStartTimeChange;
        $scope.onEndTimeChange = controller.onEndTimeChange;
        $scope.getMinTime = controller.getMinTime;

        $scope.getInvitableAttendees = function(query) {
          $scope.query = query;
          var deferred = $q.defer();
          domainAPI.getMembers(session.domain._id, {search: query, limit: 5}).then(
            function(response) {
              response.data.forEach(function(user) {
                user.email = user.emails[0];

                if (user.firstname && user.lastname) {
                  user.displayName = user.firstname + ' ' + user.lastname;
                } else {
                  user.displayName = user.email;
                }

                $scope.query = '';
              });
              deferred.resolve(response);
            }, deferred.reject
          );
          return deferred.promise;
        };
      }

      return {
        restrict: 'E',
        replace: true,
        controller: 'eventFormController',
        templateUrl: '/calendar/views/partials/event-form.html',
        link: link
      };
    }
  ])
  .directive('dateToMoment', function(moment) {
    function link(scope, element, attrs, controller) {
      function _toModel(value) {
        return moment(value);
      }

      /**
       * Ensure that we only are using moment type of date in hour code
       */
      controller.$parsers.unshift(_toModel);
    }

    return {
      restrict: 'A',
      require: 'ngModel',
      link: link
    };
  })
  .directive('calendarNavbarLink', function() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '/calendar/views/user/user-calendar-navbar-link.html'
    };
  })
  .directive('calendarDisplay', function() {
    return {
      restrict: 'E',
      templateUrl: 'calendar/views/partials/calendar.html',
      scope: {
        calendarId: '=',
        uiConfig: '='
      },
      controller: 'calendarController'
    };
  });

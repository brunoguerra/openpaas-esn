'use strict';

angular.module('esn.sidebar', ['esn.activitystreams-tracker'])

  .constant('CONTEXTUAL_SIDEBAR', {
    animation: 'am-fade-and-slide-left',
    prefixClass: 'aside',
    prefixEvent: 'contextual-sidebar',
    placement: 'left',
    templateUrl: '/views/modules/sidebar/contextual-sidebar.html',
    container: false,
    element: null,
    backdrop: true,
    keyboard: true,
    html: false,
    show: false
  })

  .factory('contextualSidebarService', function($aside, CONTEXTUAL_SIDEBAR) {
    var contextualSidebarService = function(config) {
      var options = angular.extend({}, CONTEXTUAL_SIDEBAR, config);
      return $aside(options);
    };
    return contextualSidebarService;
  })

  .directive('contextualSidebar', function($timeout, contextualSidebarService) {
    function link(scope, element, attr) {
      var options = {scope: scope},
        placementToAnimationMap = {
          left: 'am-fade-and-slide-left'
        };

      angular.forEach(['template', 'templateUrl', 'controller', 'contentTemplate'], function(key) {
        if (angular.isDefined(attr[key])) {
          options[key] = attr[key];
        }
      });

      if (angular.isDefined(placementToAnimationMap[attr.placement])) {
        options.placement = attr.placement;
        options.animation = placementToAnimationMap[attr.placement];
      }

      var sidebar = contextualSidebarService(options);

      element.on('click', function() {
        sidebar.toggle();
      });

      scope.$on('contextual-sidebar.show', function() {

        /*
           It is worth noting that when resizing, nicescroll is showed again. So during the animation,
           even if we hide nicescroll immediately, it is shown again because of the fact that resize event
           is triggered by the animation.
           This hack is to wait for the animation to be done, and then to hide the nicescroll.
           However, this hack will not work when we resize the screen manually, so the nicescroll is here again.
           Let's hope removing nicescroll one day
         */

        $timeout(function() {
          angular.element('body').getNiceScroll().hide();
        }, 500);
      });

      scope.$on('contextual-sidebar.hide', function() {
        angular.element('body').getNiceScroll().show();
      });

      scope.$on('$destroy', function() {
        if (sidebar) { sidebar.destroy(); }
        options = null;
        sidebar = null;
      });
    }

    return {
      restrict: 'A',
      scope: true,
      link: link
    };
  })

  .directive('refreshNicescroll', function($timeout) {
    return {
      restric: 'A',
      link: function(scope, element, attr) {
        element.on('mouseover click touchstart touchmove', function() {
          $timeout(function() {
            element.getNiceScroll().resize();
          }, 200);
        });
      }
    };
  });

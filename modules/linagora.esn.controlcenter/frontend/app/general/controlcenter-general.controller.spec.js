'use strict';

/* global chai: false */
/* global sinon: false */

var expect = chai.expect;

describe('The controlcenterGeneralController', function() {

  var $controller, $rootScope, $scope;
  var esnUserConfigurationService;
  var CONFIG_NAMES = ['homePage'];

  beforeEach(module(function($provide) {
    $provide.value('asyncAction', sinon.spy(function(message, action) {
      return action();
    }));

    $provide.value('rejectWithErrorNotification', sinon.spy(function() {
      return $q.reject();
    }));
  }));

  beforeEach(function() {
    module('linagora.esn.controlcenter');

    inject(function(_$controller_, _$rootScope_, _esnUserConfigurationService_) {
      $controller = _$controller_;
      $rootScope = _$rootScope_;
      esnUserConfigurationService = _esnUserConfigurationService_;
    });
  });

  function initController(scope) {
    $scope = scope || $rootScope.$new();

    var controller = $controller('controlcenterGeneralController', { $scope: $scope });

    $scope.$digest();

    return controller;
  }

  it('should get a list configurations from server on init', function() {
    var configs = [{ name: 'key1', value: 'value1' }, { name: 'key2', value: 'value2' }];
    var expectResult = { key1: 'value1', key2: 'value2' };

    esnUserConfigurationService.get = sinon.stub().returns($q.when(configs));

    var controller = initController();

    controller.$onInit();
    $rootScope.$digest();

    expect(controller.configurations).to.deep.equal(expectResult);
    expect(esnUserConfigurationService.get).to.have.been.calledWith(CONFIG_NAMES);
  });

  describe('The onFormSubmit fn', function() {

    var configMock, formMock;

    beforeEach(function() {
      configMock = [{ name: 'key1', value: 'value1' }, { name: 'key2', value: 'value2' }];
      formMock = {
        $valid: true,
        $setPristine: angular.noop,
        $setUntouched: angular.noop
      };

      esnUserConfigurationService.get = function() {
        return $q.when(configMock);
      };
    });

    it('should reject if form is not defined', function(done) {
      var controller = initController();

      controller.onFormSubmit().catch(function() {
        done();
      });

      $scope.$digest();
    });

    it('should reject if form is invalid', function(done) {
      var controller = initController();

      formMock.$valid = false;

      controller.onFormSubmit(formMock).catch(function() {
        done();
      });

      $scope.$digest();
    });

    it('should call esnUserConfigurationService.set to save configuration', function(done) {
      esnUserConfigurationService.get = sinon.stub().returns($q.when(configMock));

      var controller = initController();

      controller.$onInit();
      $rootScope.$digest();

      esnUserConfigurationService.set = sinon.stub().returns($q.when());

      controller.onFormSubmit(formMock).then(function() {
        expect(esnUserConfigurationService.set).to.have.been.calledWith(configMock);
        done();
      });

      $scope.$digest();
    });
  });

});

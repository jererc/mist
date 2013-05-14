'use strict';

(function() {

    var directives = angular.module('mistDirectives', []);

    directives.directive('openUserModal', function(eventSvc) {
        return function(scope, element, attrs) {
            element.click(function() {
                if (!element.hasClass('disabled')) {
                    eventSvc.emit('openUserModal', scope.user);
                    if (!scope.$$phase) scope.$apply();
                    $(attrs.openUserModal).modal('show');
                }
            });
        };
    });

    directives.directive('openSyncModal', function(eventSvc) {
        return function(scope, element, attrs) {
            element.click(function() {
                if (!element.hasClass('disabled')) {
                    eventSvc.emit('openSyncModal', scope.sync);
                    if (!scope.$$phase) scope.$apply();
                    $(attrs.openSyncModal).modal('show');
                }
            });
        };
    });

})();

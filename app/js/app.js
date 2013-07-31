'use strict';

angular.module('mistApp', ['mistServices', 'mistDirectives', 'mistFilters', 'angularUtils']).
    config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/', {redirectTo: '/syncs'}).
        when('/syncs', {templateUrl: 'partials/sync-list.html', controller: SyncListCtrl}).
        when('/hosts', {templateUrl: 'partials/host-list.html', controller: HostListCtrl}).
        when('/users', {templateUrl: 'partials/user-list.html', controller: UserListCtrl}).
        when('/settings', {templateUrl: 'partials/settings-list.html', controller: SettingsListCtrl}).
        otherwise({redirectTo: '/'});
}]);

'use strict';

(function() {

    var services = angular.module('mistServices', ['ngResource', 'ngCookies']);

    services.service('apiSvc', function($http, $cookieStore) {

        this.getSettingsUrl = function() {
            return $http.get('local_settings.json');
        };

        this.getUrl = function() {
            return $cookieStore.get('mistApiUrl');
        };

        this.setUrl = function(url) {
            $cookieStore.put('mistApiUrl', url);
        };

        this.checkUrl = function(url) {
            return $http.get(url + '/status');
        };

        // Hosts
        this.listHosts = function() {
            return $http.get(this.getUrl() + '/host/list');
        };

        this.resetHost = function(id) {
            return $http.post(this.getUrl() + '/host/reset',
                    {id: id});
        };

        // Users
        this.createUser = function(data) {
            return $http.post(this.getUrl() + '/user/create', data);
        };

        this.listUsers = function() {
            return $http.get(this.getUrl() + '/user/list');
        };

        this.updateUser = function(data) {
            return $http.post(this.getUrl() + '/user/update', data);
        };

        this.removeUser = function(id) {
            return $http.post(this.getUrl() + '/user/remove',
                    {id: id});
        };

        // Syncs
        this.createSync = function(data) {
            return $http.post(this.getUrl() + '/sync/create', data);
        };

        this.listSyncs = function() {
            return $http.get(this.getUrl() + '/sync/list');
        };

        this.updateSync = function(data) {
            return $http.post(this.getUrl() + '/sync/update', data);
        };

        this.resetSync = function(id) {
            return $http.post(this.getUrl() + '/sync/reset',
                    {id: id});
        };

        this.removeSync = function(id) {
            return $http.post(this.getUrl() + '/sync/remove',
                    {id: id});
        };

        // Settings
        this.listSettings = function() {
            return $http.get(this.getUrl() + '/settings/list');
        };

        this.updateSettings = function(data) {
            return $http.post(this.getUrl() + '/settings/update', data);
        };

    });

})();

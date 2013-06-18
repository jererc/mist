'use strict';


//
// Main
//
function MainCtrl($rootScope, $scope, $location, $timeout, rootScopeSvc, apiSvc, eventSvc, utilsSvc) {

    $rootScope.apiStatus = false;

    $rootScope.users = [];

    var usersDelta = 10000;
    var usersTimeout;

    function _checkApi(url) {
        apiSvc.checkUrl(url).
            error(function() {
                $rootScope.apiStatus = false;
                $location.path('settings');
            }).
            success(function(data) {
                $rootScope.apiStatus = (data.result == 'mist');
                if ($rootScope.apiStatus) {
                    apiSvc.setUrl(url);
                    eventSvc.emit('getSettings');
                } else {
                    $location.path('settings');
                }
            });
    }

    function checkApi(url) {
        url = url || apiSvc.getUrl();
        if (url) {
            _checkApi(url);
        } else {
            apiSvc.getSettingsUrl().
                success(function(data) {
                    _checkApi(data.apiUrl);
                });
        }
    }

    function updateUsers() {
        $timeout.cancel(usersTimeout);
        if (!utilsSvc.focus) {
            usersTimeout = $timeout(updateUsers, usersDelta);
        } else {
            apiSvc.listUsers().
                error(function() {
                    usersTimeout = $timeout(updateUsers, usersDelta);
                    $location.path('settings');
                }).
                success(function(data) {
                    utilsSvc.updateList($rootScope.users, data.result, '_id');
                    usersTimeout = $timeout(updateUsers, usersDelta);
                });
        }
    }

    $rootScope.$on('checkApi', function(event, args) {
        checkApi((!!args) ? args.url : null);
    });

    $rootScope.$on('updateUsers', function() {
        updateUsers(true);
    });

    checkApi();
    updateUsers();

}


//
// Add modals
//
function AddModalCtrl($rootScope, $scope, apiSvc, eventSvc, utilsSvc) {

    function initUserForm() {
        if ($scope.createUserForm) {
            $scope.createUserForm.$setPristine();
        }
        if (!$scope.user) {
            $scope.user = {
                port: 22,
                paths: {},
            };
        }
    }

    function initSyncForm() {
        if ($scope.createSyncForm) {
            $scope.createSyncForm.$setPristine();
        }
        if (!$scope.sync) {
            $scope.sync = {
                src: {},
                dst: {},
                exclusions: [],
                delete: true,
                recurrence: 24,
            };
        } else {
            utilsSvc.formatPrimitives($scope.sync, ['exclusions'], true);
        }
    }

    $scope.createUser = function() {
        apiSvc.createUser($scope.user).
            success(function(data) {
                if (data.error) {
                    console.error('failed to create user:', data.error);
                } else {
                    eventSvc.emit('updateUsers');
                    $scope.user = undefined;
                }
            });
    };

    $scope.createSync = function() {
        $scope.sync.src.user = $scope.userSrc._id;
        $scope.sync.dst.user = $scope.userDst._id;
        utilsSvc.formatPrimitives($scope.sync, ['exclusions']);

        apiSvc.createSync($scope.sync).
            success(function(data) {
                if (data.error) {
                    console.error('failed to create sync:', data.error);
                } else {
                    eventSvc.emit('updateSyncs');
                    $scope.userSrc = undefined;
                    $scope.userDst = undefined;
                    $scope.sync = undefined;
                }
            });
    };

    $rootScope.$on('openAddModal', function(event, data) {
        initUserForm();
        initSyncForm();
    });

}


//
// Hosts list
//
function HostListCtrl($rootScope, $scope, $timeout, $location, apiSvc, eventSvc, utilsSvc) {

    $scope.hosts = [];

    $scope.statusInfo = {
        true: {name: 'up', labelClass: 'label-success'},
        false: {name: 'down', labelClass: 'label-important'},
    };

    var active = true;
    var cacheDelta = 5000;
    var updateTimeout;

    function updateHosts(force) {
        $timeout.cancel(updateTimeout);
        if (!active) {
            return false;
        }
        if (!utilsSvc.focus && !force) {
            updateTimeout = $timeout(updateHosts, cacheDelta);
        } else {
            apiSvc.listHosts().
                error(function() {
                    updateTimeout = $timeout(updateHosts, cacheDelta);
                    $location.path('settings');
                }).
                success(function(data) {
                    utilsSvc.updateList($scope.hosts, data.result, '_id');
                    updateTimeout = $timeout(updateHosts, cacheDelta);
                });
        }
    }

    $scope.resetHost = function(id) {
        apiSvc.resetHost(id).
            success(function(data) {
                if (data.error) {
                    console.error('failed to reset host:', data.error);
                }
                updateHosts(true);
            });
    };

    $rootScope.$on('updateHosts', function() {
        updateHosts(true);
    });

    $scope.$on('$destroy', function() {
        active = false;
    });

    updateHosts();

}


//
// Users list
//
function UserListCtrl($rootScope, $scope, $timeout, $location, apiSvc, eventSvc, utilsSvc) {

    $scope.statusInfo = {
        true: {name: 'up', labelClass: 'label-success'},
        false: {name: 'down', labelClass: 'label-important'},
    };

    var active = true;

    eventSvc.emit('updateUsers');

}


//
// User modals
//
function UserModalCtrl($rootScope, $scope, apiSvc, eventSvc, utilsSvc) {

    $scope.updateUser = function() {
        apiSvc.updateUser($scope.user).
            success(function(data) {
                if (data.error) {
                    console.error('failed to update user:', data.error);
                } else {
                    eventSvc.emit('updateUsers');
                }
            });
    };

    $scope.removeUser = function() {
        apiSvc.removeUser($scope.user._id).
            success(function(data) {
                if (data.error) {
                    console.error('failed to remove user:', data.error);
                } else {
                    eventSvc.emit('updateUsers');
                }
            });
    };

    $rootScope.$on('openUserModal', function(event, user) {
        $scope.user = angular.copy(user);
    });

}


//
// Syncs list
//
function SyncListCtrl($rootScope, $scope, $timeout, $location, apiSvc, eventSvc, utilsSvc) {

    $scope.syncs = [];

    $scope.statusInfo = {
        'ok': {labelClass: 'label-success'},
        'queued': {labelClass: ''},
        'pending': {labelClass: 'label-warning'},
    };

    var active = true;
    var cacheDelta = 5000;
    var updateTimeout;

    function updateSyncs(force) {
        $timeout.cancel(updateTimeout);
        if (!active) {
            return false;
        }
        if (!utilsSvc.focus && !force) {
            updateTimeout = $timeout(updateSyncs, cacheDelta);
        } else {
            apiSvc.listSyncs().
                error(function() {
                    updateTimeout = $timeout(updateSyncs, cacheDelta);
                    $location.path('settings');
                }).
                success(function(data) {
                    utilsSvc.updateList($scope.syncs, data.result, '_id');
                    updateTimeout = $timeout(updateSyncs, cacheDelta);
                });
        }
    }

    $scope.resetSync = function(id) {
        apiSvc.resetSync(id).
            success(function(data) {
                if (data.error) {
                    console.error('failed to reset sync:', data.error);
                }
                updateSyncs(true);
            });
    };

    $rootScope.$on('updateSyncs', function() {
        updateSyncs(true);
    });

    $scope.$on('$destroy', function() {
        active = false;
    });

    updateSyncs();

}


//
// Sync modals
//
function SyncModalCtrl($rootScope, $scope, apiSvc, eventSvc, utilsSvc) {

    $scope.updateSync = function() {
        $scope.sync.src.user = $scope.userSrc._id;
        $scope.sync.dst.user = $scope.userDst._id;
        utilsSvc.formatPrimitives($scope.sync, ['exclusions']);

        apiSvc.updateSync($scope.sync).
            success(function(data) {
                if (data.error) {
                    console.error('failed to update sync:', data.error);
                } else {
                    eventSvc.emit('updateSyncs');
                }
            });
    };

    $scope.resetSync = function() {
        apiSvc.resetSync($scope.sync._id).
            success(function(data) {
                if (data.error) {
                    console.error('failed to reset sync:', data.error);
                } else {
                    eventSvc.emit('updateSyncs');
                }
            });
    };

    $scope.removeSync = function() {
        apiSvc.removeSync($scope.sync._id).
            success(function(data) {
                if (data.error) {
                    console.error('failed to remove sync:', data.error);
                } else {
                    eventSvc.emit('updateSyncs');
                }
            });
    };

    $rootScope.$on('openSyncModal', function(event, sync) {
        $scope.sync = angular.copy(sync);
        for (var i = 0; i < $rootScope.users.length; i++) {
            if ($rootScope.users[i]._id == $scope.sync.src.user) {
                $scope.userSrc = $rootScope.users[i];
            }
            if ($rootScope.users[i]._id == $scope.sync.dst.user) {
                $scope.userDst = $rootScope.users[i];
            }
        }
        utilsSvc.formatPrimitives($scope.sync, ['exclusions'], true);
    });

}


//
// Settings list
//
function SettingsListCtrl($rootScope, $scope, apiSvc, eventSvc, utilsSvc) {

    $scope.settings = {};

    function getSettings() {
        apiSvc.listSettings().
            error(function() {
                $scope.settings = {};
            }).
            success(function(data) {
                $scope.settings = data.result;
            });
    }

    $scope.checkApi = function() {
        $scope.apiUrl = $scope.apiUrl || apiSvc.getUrl();
        eventSvc.emit('checkApi', {url: $scope.apiUrl});
    };

    $scope.updateSettings = function() {
        apiSvc.updateSettings($scope.settings).
            success(function(data) {
                if (data.error) {
                    console.error('failed to update settings:', data.error);
                } else {
                    getSettings();
                }
            });
    };

    $scope.$on('getSettings', getSettings);

    $scope.checkApi();

}

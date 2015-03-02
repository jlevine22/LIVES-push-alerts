var SEARCH_DELAY = 250;
var BUSINESSES_RESOURCE_ID = '1c15c579-989f-43cb-b513-67b6e3971990';

var $searchBox = $('[name=businessName]');
var $searchResults = $('#searchResults');

var LIVEAlerts= angular.module('LIVEAlerts', ['ui.bootstrap']);

LIVEAlerts.controller('MainCtrl', function ($scope, $modal) {
    $scope.hasSearched = false;
    $scope.searchResults = [];
    $scope.searchQuery = '';

    $scope.setupAlerts = function (business) {
        console.log(business);
        var modalInstance = $modal.open({
            templateUrl: 'setupAlerts.html',
            controller: 'SetupAlertsCtrl',
            resolve: {
                business: function () {
                    return business;
                }
            }
        });
    };

    var searchQueue = async.queue(function (task, callback) {
        var data = {
            resource_id: BUSINESSES_RESOURCE_ID, // the resource id
            limit: 10, // get 5 results
            q: task.query
        };

        $.ajax({
            url: 'http://www.civicdata.com/api/action/datastore_search',
            data: data,
            dataType: 'jsonp',
            success: function(data) {
                $scope.$apply(function () {
                    $scope.searchResults = data.result.records;
                    $scope.hasSearched = true;
                });
                callback();
            }
        });
    }, 1);

    var searchDelayTimer;
    $scope.$watch('searchQuery', function () {
        if ($scope.searchQuery == '') {
            return;
        }
        if (searchDelayTimer) {
            clearTimeout(searchDelayTimer);
        }
        searchDelayTimer = setTimeout(function () {
            console.log('queuing search');
            searchQueue.push({ query: $searchBox.val() });
        }, SEARCH_DELAY);
    });

});

LIVEAlerts.controller('SetupAlertsCtrl', function ($scope, $http, business) {

    $scope.creatingAlert = false;

    $scope.business = business;

    $scope.alert = {
        type: null,
        value: null,
        email: null
    };

    $scope.ok = function () {
        if ($scope.alert.email == null) {
            return alert('Enter a valid email!');
        }
        if ($scope.alert.type == null) {
            return alert('Select something first!');
        }
        if ($scope.alert.type == 'score') {
            if ($scope.alert.value >= 100 || $scope.alert.value <= 1) {
                return alert('Enter an inspection score (between 1 and 100) to be alerted about!');
            }
        }
        $scope.creatingAlert = true;

        $http.post('http://localhost:3000/new-alert', {
            type: $scope.alert.type,
            value: $scope.alert.value,
            email: $scope.alert.email,
            business_id: $scope.business.business_id,
            business_name: $scope.business.name
        }).then(function () {
            $scope.$dismiss();
        }).catch(function () {
            alert('Something went wrong! Try again!');
        }).finally(function () {
            $scope.creatingAlert = false;
        });

        
    };

});
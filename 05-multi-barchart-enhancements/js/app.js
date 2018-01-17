var app = angular.module("barchart", ["ngRoute"]);

app.controller('IndexController', ['$scope', function($scope){
   $scope.title = 'Bar Charts';
}]);

app.config(function($routeProvider) { 
   $routeProvider
   .when("/", {
     templateUrl : "./html/main.html",
     controller: "MainController"
   })
   .otherwise({redirectTo: '/'});
});


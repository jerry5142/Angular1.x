var app = angular.module("barchart", ["ngRoute"]);

app.controller('IndexController', ['$scope', function($scope){
   $scope.title = 'World Clocks';
}]);

app.config(function($routeProvider) { 
   $routeProvider
   .when("/", {
     templateUrl : "./html/main.html",
     controller: "MainController"
   })
   .otherwise({redirectTo: '/'});
});


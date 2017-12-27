var app = angular.module("storeApp", ["ngRoute", "ngStorage"]);

app.controller('IndexController', ['$scope', function($scope, $localStorage){
   $scope.title = 'Gotta Have It!';
}]);

app.config(function($routeProvider) { 
   $routeProvider
   .when("/", {
     templateUrl : "../html/main.html",
     controller: "MainController"
   })
   .when("/shop", {
     templateUrl : "../html/shop.html",
     controller: "ShopController"
   })
   .when("/cart", {
     templateUrl : "../html/cart.html",
     controller: "ShopController"
   })
   .otherwise({redirectTo: '/'});
});

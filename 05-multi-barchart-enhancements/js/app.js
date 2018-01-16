var app = angular.module("barchart", ["ngRoute", "ngStorage"]);

app.controller('IndexController', ['$scope', function($scope, $localStorage){
   $scope.title = 'Bar Charts';
}]);

app.config(function($routeProvider) { 
   $routeProvider
   .when("/", {
     templateUrl : "./html/main.html",
     controller: "MainController"
   })
/*   .when("/shop", {
     templateUrl : "./html/shop.html",
     controller: "ShopController"
   })
   .when("/cart", {
     templateUrl : "./html/cart.html",
     controller: "ShopController"
   })
   .otherwise({redirectTo: '/'});
 */
});

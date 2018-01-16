app.controller('MainController', ['$scope', function($scope) { 
   $scope.axisSelect = {
      name : "axisSelect",
      values : ["members", "funds"]
   };
   //set the default button
   $scope.defaultButton = $scope.axisSelect.values[0];
   
   $scope.handleClick = function(){
      changeXaxis(this.value);
   };
}]);
app.controller('MainController', ['$scope', function($scope) { 
   $scope.resetName = "Reset All";
   $scope.axisSelect = {
      name : "axisSelect",
      values : ["members", "funds"]
   };
   //set the default button
   $scope.defaultButton = $scope.axisSelect.values[0];
   
   $scope.isDefault = function(value){
      console.log(value);
   }
   
   $scope.resetAll = function(){
      //clear all filters for each chart
      barChartsArray.forEach(function(chart){
         chart.clearFilters();
      }); 
      barChartsArray.forEach(function(chart){
         chart.resetChart();
      }); 
   }
   
   $scope.handleClick = function(value){
      barChartsArray.forEach(function(chart){
         chart.setXaxisValue(value);
      }); 
   };
   
   //create the charts
   barcharts();
}]);
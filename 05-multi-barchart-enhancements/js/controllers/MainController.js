app.controller('MainController', ['$scope', function($scope) { 
   $scope.resetName = "Reset All";
   
   $scope.radioConfig = {
      name : "axisSelect",
      values : ["members", "funds"],
      default : "members"
   };
   
   $scope.radioConfigCopy = angular.copy($scope.radioConfig);

   $scope.isDefaultRadioButton = function(currentRadioButton){
      return currentRadioButton === $scope.radioConfig.default;
   };
   
   $scope.setDefaultRadioButton = function(){
      d3.select("#" + $scope.radioConfig.default + "Radio")
         .property("checked", true);
   };
   
   $scope.resetAll = function(){
      $scope.radioConfigCopy = angular.copy($scope.radioConfig);    
      resetAllCharts($scope.radioConfigCopy.default);
      $scope.setDefaultRadioButton();
   };
   
   $scope.handleClick = function(value){
      barChartsArray.forEach(function(chart){
         chart.setXaxisValue(value);   
         chart.redraw();
      }); 
   };
   
   //create the charts
   barcharts();
}]);
app.controller('MainController', ['$scope', function($scope) { 
   $scope.resetName = "Reset All";
   
   $scope.radioConfig = {
      name : "axisSelect",
      values : ["members", "funds"],
      default : "members"
   };
   
   $scope.radioConfigCopy = angular.copy($scope.radioConfig);

   $scope.resetAll = function(){
      $scope.radioConfigCopy = angular.copy($scope.radioConfig);      
      resetAllCharts($scope.radioConfigCopy.default);     
   }
   
   $scope.handleClick = function(value){
      barChartsArray.forEach(function(chart){
         chart.setXaxisValue(value);
      }); 
      barChartsArray.forEach(function(chart){
         chart.scaleXaxis();
         chart.redraw();
      }); 
   };
   
   //create the charts
   barcharts();
}]);
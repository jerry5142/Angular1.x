app.controller('MainController', ['$scope', function($scope) { 
   //load the timezones   
   d3.json("data/timezones.json", function(data) {
      moment.tz.load(data);
   });   

   
   //time formats
   $scope.formats = {
      time24Format: {
         format: "HH:mm",
         enabled: false
      },
      secondsFormat: {
         format: ":ss",
         enabled: false
      },
      dateFormat: {
         format: "MM/DD/YYYY",
         enabled: false
      },
      defaultFormat: {
         format: "h:mm",
         enabled: false
      }
   };
   
/*     //load the cities   
   $scope.cities = "";
   var loadCities = function(){
      d3.json("data/cities.json", function(data) {
         $scope.cities = data.cities;
      });
   }; */

   //load the cities   
   $scope.cities = [
      {
         "city": "Honolulu",
         "tz": "US/Hawaii",
         "time": "---"
      },
      {
         "city": "Anchorage",
         "tz": "US/Alaska",
         "time": "---"
      },
      {
         "city": "Seattle",
         "tz": "US/Pacific",
         "time": "---"
      },
      {
         "city": "Phoenix",
         "tz": "US/Mountain",
         "time": "---"
      },
      {
         "city": "San Antonio",
         "tz": "US/Central",
         "time": "---"
      },
      {
         "city": "Washington D.C.",
         "tz": "US/Eastern",
         "time": "---"
      }
   ];
   
   //Current datetime format
   $scope.currentFormat = $scope.formats.defaultFormat.format;
   
   //update time handler
   $scope.updateTimes = function(timeFormat){
      $scope.setCurrentFormat();
      var currentTime = moment();
      
      var timezones = moment.tz.names();
      $scope.cities.forEach(function(city){    
         city.time = moment(currentTime).tz(city.tz).format($scope.currentFormat);
      });
   };   

   //sets the currentFormat string based on which formats are selected 
   $scope.setCurrentFormat = function(){
      var format = ""; 
      var appendAmPm = false;
      if($scope.formats.time24Format.enabled){
         format = $scope.formats.time24Format.format;
      }else{
         format = $scope.formats.defaultFormat.format;
         appendAmPm = true;
      }
      if($scope.formats.secondsFormat.enabled){
         format += $scope.formats.secondsFormat.format;
      }
      if(appendAmPm){ //append am/pm 
         format += "a";
      }
      if($scope.formats.dateFormat.enabled){
         format += " " + $scope.formats.dateFormat.format;
      }      
      $scope.currentFormat = format;
   };

}]);
'use strict';
var showVals = true;

function barcharts(){
   var dataFilePath = "data/dataFourCat.json";
   var divId = "charts"; //where to draw the charts
   var barChartsArray = []; //stores all chart objects

//-------------------chart configuration----------------------      
   var configs = [ 
      {"id": "color", "title": "Colors", "width": 500, "height": 300, "top": 60, "right": 20,  "bottom": 30, "left": 60, "labelOffset": {"x": -10, "y": 5}, "ticCnt": 6, "key": "color", "value": "members", "showVals": showVals}, 
      {"id": "letter", "title": "Letters", "width": 500, "height": 300, "top": 60, "right": 20,  "bottom": 30, "left": 60, "labelOffset": {"x": -10, "y": 5}, "ticCnt": 6, "key": "letter", "value": "members", "showVals": showVals},
      {"id": "shape", "title": "Shapes", "width": 500, "height": 300, "top": 60, "right": 20,  "bottom": 30, "left": 60, "labelOffset": {"x": -10, "y": 5}, "ticCnt": 6, "key": "shape", "value": "members", "showVals": showVals},
      {"id": "country", "title": "Countries", "width": 500, "height": 300, "top": 60, "right": 20, "bottom": 30, "left": 80, "labelOffset": {"x": -10, "y": -10}, "ticCnt": 6, "ticCnt": 6, "key": "country", "value": "members", "showVals": showVals}
   ];

//-------------------main----------------------   
   //get the data and graph it      
   d3.json(dataFilePath, function(data) {
      //crossfilter
      var cf = crossfilter(data.data); 
      var chart;
      
      configs.forEach(function(config){
         chart = makeChart(cf, divId, config);
         barChartsArray.push(chart);         
         chart(); //draw the chart
      });
   });

//-------------------chart object---------------------- 
   var makeChart = function(crossfilter, chartDivId, chartConfig){
      //---private vars---
      var clickedBar = null;
      var config = chartConfig; //configuration data for the chart
      //create the dimension on the key field
      var dim = crossfilter.dimension(function(fact){ return fact[config.key];});
      //group and sort the records
      var group = dim.group();
//      var records = updateRecords();
      var records;
      //create an svg window and append a g element to it
      var chart = d3.select("#" + chartDivId).append("svg").attr("id", config.id)
            .attr("width", config.width).attr("height", config.height),
          margin = {top: config.top, right: config.right, bottom: config.bottom, left: config.left},
          width = +chart.attr("width") - config.left - config.right,
          height = +chart.attr("height") - config.top - config.bottom,
          g = chart.append("g").attr("transform", "translate(" + config.left + "," + config.top + ")");
      var barHeight = height / 6;
      //set the axis scales
      var xScaleFunction = d3.scale.linear().range([0, width]);
      //set the class for the chart 
      chart.attr("class", "chart");
      var barSection; // = (height / records.length);
      var barTop = (barSection - barHeight) / 2;   
      var bar;
      //set the xaxis data display range
//      xScaleFunction.domain([0,  (config.ticCnt + 2) * (Math.floor(d3.max(records, function(d) { return d.value; }) / config.ticCnt))]);

      //---make the chart---   
      function constructor() {
         updateRecords(); 
         setBar();
         
         //draws the bars and vertical axis labels
         drawBars();

         //create the x-axis and move it to the bottom of the graph
         g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.svg.axis().scale(xScaleFunction).orient("bottom").ticks(config.ticCnt).innerTickSize(-height))
            .attr("class", "axis");      
        
         //add a title
         g.append("g")
           .append("text")
            .attr("class", "chartTitle")
            .attr("x", width / 2)             
            .attr("y", -margin.top / 2)
            .text(config.title);
      }
      
      //---private functions---
      
      function setBar(){
         bar = g.selectAll("g")
            .data(records)
            .enter().append("g")
            .attr("class", "bar")      
            .attr("transform", function(d, i) { return "translate(0," + Math.round( i * barSection + barTop) + ")"; })
            .on({
               "mouseover": function(d) {
                 d3.select(this).style("cursor", "pointer"); 
               },
               "mouseout": function(d) {
                 d3.select(this).style("cursor", "default"); 
               },
               "click": function(d) {
                  var barId = "#" + config.id + " g .bar";
                  //a bar was clicked so clear all filters
                  dim.filterAll();
                  if(clickedBar == this){ //No bar is currently selected
                     d3.selectAll(barId)    
                        .attr("class", "bar")
                     clickedBar = null;
                  } else { //deselect all other bars, save the clicked bar, filter and redraw
                     d3.selectAll(barId)
                        .attr("class", "bar excluded")
                     d3.select(this)           
                        .attr("class", "bar selected")
                     clickedBar = this; //save the clicked bar
                     dim.filter(d.key);  //filter the selection
                  }
                  //redraw
                  refreshAllCharts();
               }
           });          
      }
      
      function drawBars(){
         //sets the vertical axis labels  
         bar.append("text")
            .attr("class", "chart")
            .attr("x", config.labelOffset.x)
            .attr("y", barTop + config.labelOffset.y)
            .text(function(d){ return d.key; }); 

         //show/hide bar values   
         if(config.showVals){
            bar.append("text")
               .attr("class", "chart")
               .attr("x", function(d) { return xScaleFunction(d.value) + 30; })
               .attr("y", barTop + config.labelOffset.y)
               .text(function(d){ return d.value; }); 
         }

         bar.append("rect")
            .attr("width", function(d) { return xScaleFunction(d.value); })
            .attr("height", barHeight - 1);      
      }
      
      function refreshAllCharts(){
         barChartsArray.forEach(function(chart){ chart.refresh(); });
      }
         
      function updateRecords() {
         if(!group){
            group = dim.group();
         }
         group   
            .reduceSum(function(d){ return d[config.value]; }).all()
            .sort(function(x, y){ return d3.ascending(x.index, y.index); });
         
         records = updateRecords();
         //create an svg window and append a g element to it
         chart = d3.select("#" + chartDivId).append("svg").attr("id", config.id)
               .attr("width", config.width).attr("height", config.height),
             margin = {top: config.top, right: config.right, bottom: config.bottom, left: config.left},
             width = +chart.attr("width") - config.left - config.right,
             height = +chart.attr("height") - config.top - config.bottom,
             g = chart.append("g").attr("transform", "translate(" + config.left + "," + config.top + ")");
         barHeight = height / 6;
         //set the axis scales
         xScaleFunction = d3.scale.linear().range([0, width]);
         //set the class for the chart 
         chart.attr("class", "chart");
         barSection = (height / records.length);
         barTop = (barSection - barHeight) / 2;   
         //set the xaxis data display range
         xScaleFunction.domain([0,  (config.ticCnt + 2) * (Math.floor(d3.max(records, function(d) { return d.value; }) / config.ticCnt))]);   
      }
         
      //---public functions---
      //clears and redraws all charts not in the excludedIds array
      constructor.refresh = function() {
         bar.selectAll("rect").remove();
         bar.selectAll("text").remove();
         updateRecords(); 
         setBar();
         drawBars();
      }
      
      constructor.setXaxisValue = function(valueField) {
         config.value = valueField
         group.remove();
         updateRecords(valueField);
      }
      

      return constructor;
   };
}

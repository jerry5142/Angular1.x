'use strict';
var showVals = true;

function barcharts(){
   var dataFilePath = "data/dataFourCat.json";
   var divId = "charts"; //where to draw the charts
   var barChartsArray = []; //stores all chart objects

//-------------------chart configuration----------------------      
   var configs = [ 
      {"id": "color", "title": "Colors", "width": 500, "height": 300, "top": 60, "right": 20,  "bottom": 30, "left": 60, "labelOffset": {"x": -10, "y": 5}, "ticCnt": 6, "key": "color", "value": "members"}, 
      {"id": "letter", "title": "Letters", "width": 500, "height": 300, "top": 60, "right": 20,  "bottom": 30, "left": 60, "labelOffset": {"x": -10, "y": 5}, "ticCnt": 6, "key": "letter", "value": "members"},
      {"id": "shape", "title": "Shapes", "width": 500, "height": 300, "top": 60, "right": 20,  "bottom": 30, "left": 60, "labelOffset": {"x": -10, "y": 5}, "ticCnt": 6, "key": "shape", "value": "members"},
      {"id": "country", "title": "Countries", "width": 500, "height": 300, "top": 60, "right": 20, "bottom": 30, "left": 80, "labelOffset": {"x": -10, "y": -10}, "ticCnt": 6, "ticCnt": 6, "key": "country", "value": "members"}
   ];

//-------------------main----------------------   
   //get the data and graph it      
   d3.json(dataFilePath, function(data) {
      var cf = crossfilter(data.data); //crossfilter
      var chart;
      
      configs.forEach(function(config){
         chart = makeChart(cf, divId, config);
         barChartsArray.push(chart);         
         chart(); //draw the chart
      });
      barChartsArray[0].setXaxisValue("funds");
   });

//-------------------chart object---------------------- 
   var makeChart = function(crossfilter, chartDivId, chartConfig){
      //---private vars---
      var clickedBar = null; //holds reference to the currently selected bar 
      var config = chartConfig; //configuration data for the chart
      //create the dimension on the key field
      var dim = crossfilter.dimension(function(fact){ return fact[config.key];});
      //separate group reference to change x-axis values later
      var group = dim.group(); 
      //generate and sort the records
      var records = setRecords();
      //set the chart margins and teh initial g element
      var chart = d3.select("#" + chartDivId).append("svg").attr("id", config.id)
            .attr("width", config.width).attr("height", config.height),
          margin = {top: config.top, right: config.right, bottom: config.bottom, left: config.left},
          width = +chart.attr("width") - config.left - config.right,
          height = +chart.attr("height") - config.top - config.bottom,
          g = chart.append("g").attr("transform", "translate(" + config.left + "," + config.top + ")");
      //function to set the xaxis scale based on width var
      var xScaleFunction = d3.scale.linear().range([0, width]);  
      var barHeight = height / 6, 
          barSection = (height / records.length), 
          barTop = (barSection - barHeight) / 2, 
          barParent,
          bar;
      //set the chart class
      chart.attr("class", "chart"); 
      //scale the x-axis data values so they fit on the chart
      scaleXvalues(); 

      //---make the chart---   
      function drawChart() {
         barParent = g.selectAll("g")
            .data(records);
         bar = barParent.enter().append("g")
            .attr("class", "bar")      
            .attr("transform", function(d, i) { return "translate(0," + Math.round( i * barSection + barTop) + ")"; })
            .on({ //event handlers
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
                  } else { //deselect other bars, save clicked bar, filter and redraw
                     d3.selectAll(barId)
                        .attr("class", "bar excluded")
                     d3.select(this)           
                        .attr("class", "bar selected")
                     clickedBar = this; //save the clicked bar
                     dim.filter(d.key);  //filter the selection
                  }
                  //redraw all chart objects
                  barChartsArray.forEach(function(chart){chart();});
               }
            }); 
 
         //sets the vertical axis labels  
         bar.append("text")
            .attr("class", "chart yLabels")
            .attr("x", config.labelOffset.x)
            .attr("y", barTop + config.labelOffset.y)
            .text(function(d){ return d.key; }); 

         //show/hide bar values for debugging
         if(showVals){
            bar.append("text")
               .attr("class", "chart xValues")
               .attr("y", barTop + config.labelOffset.y);
         }

         bar.append("rect")
            .attr("height", barHeight - 1);      

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

         //what to do on exit
         barParent.exit().remove();
         
         //---what to do on update code---
         //redraw values
         if(showVals){ //show/hide bar values   
            barParent.selectAll(".chart .xValues")
               .attr("x", function(d) { return xScaleFunction(d.value) + -5*config.labelOffset.x; })
               .text(function(d){ return d.value; }); 
         }
         //redraw bars
         barParent.selectAll("rect")
            .attr("width", function(d) { return xScaleFunction(d.value); });
      }

      //---private functions---
      //reduce on the x-axis value, generate and sort the records
      function setRecords(){
         return group
            .reduceSum(function(d){ return d[config.value]; }).all()
            .sort(function(x, y){ return d3.ascending(x.index, y.index); });         
      }
      
      //scale the range for the x-axis values
      function scaleXvalues(){
         xScaleFunction.domain([0,  (config.ticCnt + 2) * (Math.floor(d3.max(records, function(d) { return d.value; }) / config.ticCnt))]);
      }
      
      //---public functions---
      drawChart.setXaxisValue = function(xAxisValue){
         if(!xAxisValue){ //nothing to do
            return; 
         }
         config.value = xAxisValue; //set the new config value
         setRecords(); //regroup the records based on the new value
         scaleXvalues(); //rescale the x-axis range for the new values
         drawChart(); //redraw the chart
      }
      
      //return the chart object
      return drawChart;
   };
}
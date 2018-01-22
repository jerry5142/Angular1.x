'use strict';
var showVals = true;
var barChartsArray = []; //stores all chart objects

function resetAllCharts(axisKey){
   //we have to clear all filters and reset the state of of each chart before redrawing them
   barChartsArray.forEach(function(chart){ 
      chart.resetChart(axisKey);
   });
   barChartsArray.forEach(function(chart){ 
      chart.redraw();
   });   
};

function barcharts(){
   var dataFilePath = "data/dataFourCat.json";
   var divId = "charts"; //where to draw the charts

//-------------------chart configuration----------------------      
   var configs = [ 
      {"id": "color", "title": "Colors", "key": "color", "value": "members"}, 
      {"id": "letter", "title": "Letters", "key": "letter", "value": "members"},
      {"id": "shape", "title": "Shapes", "key": "shape", "value": "members"},
      {"id": "country", "title": "Countries", "key": "country", "value": "members", "left": 80, "yOffset": -10}
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
   });

//-------------------chart object---------------------- 
   var makeChart = function(crossfilter, chartDivId, chartConfig){
      //---private vars---
      var isBarSelected = false;
      //put default config values here. They will be used if chartConfig does not have them
      var defaultConfigs = {"width": 500, "height": 300, "top": 60, "right": 20,  "bottom": 30, "left": 60, "xOffset": -10, "yOffset": 5, "ticCnt": 6};
      //configuration data for the chart
      var config = setConfigVals(chartConfig);
      //create the dimension on the key field
      var dim = crossfilter.dimension(function(fact){ return fact[config.key];});
      //separate group reference to change x-axis values later
      var group = dim.group(); 
      //generate and sort the records
      var records = setRecords();
      //set the chart margins and teh initial g element
      var chart, margin, width, height, g;
      //function to set the xaxis scale based on width var
      var xScaleFunction;
      var barHeight, barSection, barTop, barParent, bar, barId;
      
      init(); //init vars

      //---make the chart---   
      function drawChart() {
         //scale the x-axis data values so they fit on the chart
         scaleXvalues(); 
         barParent = g.selectAll("g")
            .data(records);
         bar = barParent.enter().append("g")
            .attr("class", "bar")      
            .attr("transform", function(d, i) { return "translate(0," + Math.round( i * barSection + barTop) + ")"; })
            .on({ //event handlers
               "mouseover": function(d) {
                  d3.select(this).style("cursor", "pointer"); 
                    //---------------------------
/*                  d3.select(this)
                    .transition()
                    .duration(500)
                    .attr("x", width/2) //function(d) { return x(d.cocoa) - 30; })
                    .attr("width", 60);
                  d3.select(this)
                     .append("div")
                     .attr("class", "mytooltip")
                     .style("opacity", "0")
                     .style("display", "none")
                     .transition()  //Opacity transition when the tooltip appears
                     .duration(500)
                     .style("opacity", "1")                           
                     .style("display", "block");  //The tooltip appears
                  d3.select(this)
                     .append("div")
                     .attr("class", "mytooltip")
                     .style("opacity", "0")
                     .style("display", "none")
                     .text("Testing")
                     /*
//                     .html(
//                     "<div id='thumbnail'>Members: </div>")
//                     .style("left", 30 + "px")   
//                     .style("top", 30 + "px");    
*/                     
               },
               "mouseout": function(d) {
                  d3.select(this).style("cursor", "default"); 
                  //---------------------------
/*                  d3.select(this)
                     .transition()
                     .duration(500)
                     .attr("x", function(d) { return 20; })
                     .style("cursor", "normal")
                     .attr("width", 40)
                  d3.select(this)
                     .append("div")
                     .attr("class", "mytooltip")
                     .style("opacity", "0")
                     .style("display", "none")
                     .transition()  //Opacity transition when the tooltip disappears
                     .duration(500)
                     .style("opacity", "0")            
                     .style("display", "none")  //The tooltip disappears
*/
               },
               "click": function(d) { //handle bar click
                  dim.filterAll(); //clear all filters
                  isBarSelected = !isBarSelected; //toggle flag
                  if(isBarSelected){ //No bar is currently selected
                     d3.selectAll(barId)
                        .attr("class", "bar excluded")
                     d3.select(this)           
                        .attr("class", "bar selected")
                     dim.filter(d.key);  //filter the selection
                  } else { //deselect other bars, save clicked bar, filter and redraw
                     d3.selectAll(barId)    
                        .attr("class", "bar")
                  }
                  //redraw all chart objects
                  barChartsArray.forEach(function(chart){chart();});
               }
            }); 
 
         //sets the vertical axis labels  
         bar.append("text")
            .attr("class", "chart yLabels")
            .attr("x", config.xOffset)
            .attr("y", barTop + config.yOffset)
            .text(function(d){ return d.key; }); 

         //show/hide bar values for debugging
         if(showVals){
            bar.append("text")
               .attr("class", "chart xValues")
               .attr("y", barTop + config.yOffset);
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
               .attr("x", function(d) { return xScaleFunction(d.value) + -5*config.xOffset; })
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
      
      //adds default configs if newConfig doesn't have them
      function setConfigVals(newConfig){
         for (var key in defaultConfigs) {
            //add default config value if newConfig does not have it
            if (!newConfig.hasOwnProperty(key)) {
               newConfig[key] = defaultConfigs[key];
            }
         }
         return newConfig;
      }
      
      //initialize svg container, variables, etc;
      function init(){
         chart = d3.select("#" + chartDivId).append("svg").attr("id", config.id)
            .attr("width", config.width).attr("height", config.height);
         margin = {top: config.top, right: config.right, bottom: config.bottom, left: config.left};
         width = +chart.attr("width") - config.left - config.right;
         height = +chart.attr("height") - config.top - config.bottom;
         g = chart.append("g").attr("transform", "translate(" + config.left + "," + config.top + ")");
         xScaleFunction = d3.scale.linear().range([0, width]);  
         barHeight = height / 6;
         barSection = (height / records.length);
         barTop = (barSection - barHeight) / 2;
         barId = "#" + config.id + " g .bar"; //sets the id for selecting bars via selectAll()
         chart.attr("class", "chart"); //set the chart class
      }
      
      //---public functions---
      //redraw the chart
      drawChart.redraw = function(){
         setRecords(); //regroup the records based on the new value
         scaleXvalues(); //rescale the x-axis range for the new values
         drawChart();
      }
      
      drawChart.setXaxisValue = function(axisKey){
         if(!axisKey){ //nothing to do
            return; 
         }
         config.value = axisKey; //set the new config value
      }
      
      //clears filters and redraws chart
      drawChart.resetChart = function(axisKey){
         dim.filterAll(); //clear all filters on the chart     
         d3.selectAll(barId).attr("class", "bar"); //reset the bar class (unfiltered)
         isBarSelected = false; //turn off filter flag         
         drawChart.setXaxisValue(axisKey);
      }
      
      //return the chart object
      return drawChart;
   };
}
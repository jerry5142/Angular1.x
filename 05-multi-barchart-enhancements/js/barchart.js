'use strict';
//-------------------chart configuration----------------------      
   var dataFilePath = "data/dataFourCat.json";
   var divId = "charts"; //where to draw the charts
   var configs = [ 
      {"id": "color", "title": "Colors", "key": "color", "value": "members"}, 
      {"id": "letter", "title": "Letters", "key": "letter", "value": "members"},
      {"id": "shape", "title": "Shapes", "key": "shape", "value": "members"},
      {"id": "country", "title": "Countries", "key": "country", "value": "members", "left": 80, "yOffset": -10}
   ];
   
//-------------------globals----------------------   
var showVals = true;
var barChartsArray = []; //stores all chart objects
var filters = {};

function resetAllCharts(axisKey){
   //we have to clear all filters and reset the state of of each chart before redrawing them
   barChartsArray.forEach(function(chart){ 
      chart.resetChart(axisKey);
   });
   barChartsArray.forEach(function(chart){ 
      chart.redraw();
   });   
};

function barcharts(setFilters){
//-------------------main----------------------   
   //get the data and graph it      
   d3.json(dataFilePath, function(data) {
      var cf = crossfilter(data.data); //crossfilter
      var chart;
      
      configs.forEach(function(config){
         filters[config.key] = null;
         chart = makeChart(cf, divId, config);
         barChartsArray.push(chart);         
         chart(); //draw the chart
      });
   });

//-------------------chart object---------------------- 
   var makeChart = function(crossfilter, chartDivId, chartConfig){
      //---private vars---
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
      // Define the div for the tooltip
      var tipDiv = d3.select("#charts").append("div")	
         .attr("class", "tooltip")				
         .style("opacity", 0);
    
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
                  tipDiv.transition()		
                      .duration(200)		
                      .style("opacity", .9);		
                  tipDiv.html("Category: " + config.key + "<br>" + config.value + ": "  + d.value)	
                      .style("left", (d3.event.pageX) + "px")		
                      .style("top", (d3.event.pageY - 28) + "px");	
               },
               "mouseout": function(d) {
                  d3.select(this).style("cursor", "default"); 
                  tipDiv.transition()		
                      .duration(500)		
                      .style("opacity", 0);	
               },
               "click": function(d) { //handle bar click
                  if(filters[d.key] === d.key){ //is currently selected so deselect it
                     d3.selectAll(barId)    
                        .attr("class", "bar");
                     filters[d.key] = "";                        
                  } else { //deselect other bars, save clicked bar, filter and redraw
                     d3.selectAll(barId)
                        .attr("class", "bar excluded")
                     d3.select(this)           
                        .attr("class", "bar selected")
                     dim.filter(d.key);  //filter the selection
                     filters[d.key] = d.key;
                  }
                  dim.filterAll(); //clear all filters
                  updateFilterDisplay(filters[d.key]);
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
         filters[config.key] = null; //set initial filter state
         d3.select("#chartFilters")
            .append("div")
               .append("label")
                  .attr("id", config.key + "FilterName")
                  .attr("class", "filterBox")
                  .html("<label>" + config.key + "</label>")
               .append("label")
                  .attr("id", config.key + "FilterValue")
                  .attr("class", "filterBox")
                  .html("<label>---</label>");               
      }
      
      function updateFilterDisplay(filterVal){
         var val = "---";
         var classes = "filterBox";
         if(filterVal){
            val = filterVal;
            classes += " filterSelected";
         }
          d3.select("#" + config.key + "FilterValue")
            .attr("class", classes)
            .html("<label>" + val + "</label>");
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
         drawChart.setXaxisValue(axisKey);
         filters[config.key] = "";
         updateFilterDisplay("");
      }
      
      //return the chart object
      return drawChart;
   };
}
//-------------------configuration----------------------   
'use strict';

var clickedBar = null;

function barcharts(){
   var dataFilePath = "data/dataFourCat.json";
   var divId = "charts"; //where to draw the charts
   
   var configs = [ 
      {id: "color", title: "Colors", width: 500, height: 300, top: 60, right: 20,  bottom: 30, left: 60, ticCnt: 6, key: "color", value: "members"}, 
      {id: "letter", title: "Letters", width: 500, height: 300, top: 60, right: 20,  bottom: 30, left: 60, ticCnt: 6, key: "letter", value: "members"},
      {id: "shape", title: "Shapes", width: 500, height: 300, top: 60, right: 20,  bottom: 30, left: 60, ticCnt: 6, key: "shape", value: "members"},
      {id: "country", title: "Countries", width: 500, height: 300, top: 60, right: 20, bottom: 30, left: 80, ticCnt: 6, ticCnt: 6, key: "country", value: "members"}
   ];

   //dimensions
   var dims = [];
   //record groups
   var records = [];

//-------------------main----------------------   
   //get the data and graph it      
   d3.json(dataFilePath, function(data) {
      //crossfilter
      var cf = crossfilter(data.data);

      for(var i=0; i<configs.length; i++){
         dims[i] = cf.dimension(function(fact){ 
            return fact[configs[i].key];
         });
         records[i] = groupAndSortDim(dims[i], configs[i].value);
         //create an svg tag for the chart
         createSVGtag(divId, configs[i].id);
         //draw the chart
         drawChart(records[i], configs[i], dims[i]);
      }
   });

//-------------------functions----------------------   
   function addClickHandlers(){
      
   }
   
   function createSVGtag(divId, svgId){
      d3.select("#" + divId).append("svg").attr("id", svgId);
   }

   function removeChart(chartId){
      var allGs = d3.selectAll("#" + chartId + " g");
      allGs.remove();
   }  

   //clears and redraws all charts not in the excludedIds array
   function redrawCharts(excludedIds){
      for(var i=0; i<configs.length; i++){
         excludedIds.forEach(function(id){
            if(configs[i].id != id){
               removeChart(configs[i].id);
               drawChart(records[i], configs[i], dims[i]);
            }
         });
      }
   }
   
   function drawChart(records, config, dim){
      //create an svg window and append a g element to it
      var chart = d3.select("#" + config.id).attr("width", config.width).attr("height", config.height),
          margin = {top: config.top, right: config.right, bottom: config.bottom, left: config.left},
          width = +chart.attr("width") - config.left - config.right,
          height = +chart.attr("height") - config.top - config.bottom,
          g = chart.append("g").attr("transform", "translate(" + config.left + "," + config.top + ")");
            
      var barHeight = height / 6;
      //set the axis scales
      var xScaleFunction = d3.scale.linear().range([0, width]);
      //set the class for the chart 
      chart.attr("class", "chart");

      var incr = Math.floor(d3.max(records, function(d) { return d.value; }) / config.ticCnt);

      xScaleFunction.domain([0,  incr * (config.ticCnt + 2)]);
     
      var barSection = (height / records.length);
      var barTop = (barSection - barHeight) / 2;     
      var bar = g.selectAll("g")
         .data(records)
         .enter().append("g")
         .attr("transform", function(d, i) { return "translate(0," + Math.round( i * barSection + barTop) + ")"; });
      
      //sets the vertical axis labels  
      bar.append("text")
         .attr("class", "chart")
         .attr("x", -10)
         .attr("y", barTop - 5)
         .attr("dy", "0.71em")
         .text(function(d){ return d.key; }); 

      bar.append("text")
         .attr("class", "chart")
         .attr("x", function(d) { return xScaleFunction(d.value) + 30; })
         .attr("y", barTop - 5)
         .attr("dy", "0.71em")
         .text(function(d){ return d.value; }); 
         
      //draws the bars
      bar.append("rect")
         .attr("class", "bar")
         .attr("width", function(d) { return xScaleFunction(d.value); })
         .attr("height", barHeight - 1)
         .on({
            "mouseover": function(d) {
              d3.select(this).style("cursor", "pointer"); 
            },
            "mouseout": function(d) {
              d3.select(this).style("cursor", "default"); 
            },
            "click": function(d) {
               var barId = "#" + config.id + " g rect";
               //a bar was clicked so clear all filters
               dim.filterAll();
               if(clickedBar == this){ //No bar is currently selected
                  d3.selectAll(barId)    
                     .attr("class", "bar")
                  clickedBar = null;
               } else { //deselect all other bars, save the clicked bar, filter and redraw
                  d3.selectAll(barId)
                     .attr("class", "excluded")
                  d3.select(this)           
                     .attr("class", "selected")
                  clickedBar = this; //save the clicked bar
                  dim.filter(d.key);  //filter the selection
               }
               //redraw
               redrawCharts([config.id]);
            }
        }); 

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
   
   function groupAndSortDim(dim, valueField){
      return dim.group()
         .reduceSum(function(d){ return d[valueField]; })
         .all()
      .sort(function(x, y){ return d3.ascending(x.index, y.index); });
   }
     
}


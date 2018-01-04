//===========Configuration=============
var clickedBar = null;

function init(){
   //color chart
   drawBarChart("Colors", "colors", 500, 300, 60, 20, 30, 60, 50, "data/dataCat.json", "category1");
   //alpha chart
   drawBarChart("Alphabet", "alphabet", 500, 300, 60, 20, 30, 60, 50, "data/dataCat.json", "category2");
};

//draws a bar chart
function drawBarChart(title, chartId, chartWidth, chartHeight, marginTop, marginRight, marginBottom, marginLeft, xAxisTicIncr, dataFilePath, category){
   //create an svg window and append a g element to it
   var chart = d3.select("#" + chartId).attr("width", chartWidth).attr("height", chartHeight),
       margin = {top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft},
       width = +chart.attr("width") - margin.left - margin.right,
       height = +chart.attr("height") - margin.top - margin.bottom,
       g = chart.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
   var barHeight = height / 6;

   //set the axis scales
   var x = d3.scale.linear()
       .range([0, width]);

   //set the class for the chart 
   chart.attr("class", "chart");

   //get the data and graph it      
   d3.json(dataFilePath, function(data) {
      //create dimension, group by color, sum by value, and sort by grouped value
      var cf = crossfilter(data.data);
      var dim = cf.dimension(function(fact){ return fact[category]; });
      var records = dim.group()
         .reduceSum(function(d){ return d.value; })
         .all()
         .sort(function(x, y){ return d3.ascending(x.value, y.value); });
            
      var maxXtic = d3.max(records, function(d) { return d.value; });
      if(maxXtic % xAxisTicIncr){ // make max axis tic round up to next xAxisTicIncr
         maxXtic = maxXtic - (maxXtic % xAxisTicIncr) + xAxisTicIncr;
      }
      var xTicCount = maxXtic / xAxisTicIncr;  
      x.domain([0, maxXtic]);
      
      var barSection = (height / records.length);
      var barTop = (barSection - barHeight) / 2 ;

      var yAxisLabels = d3.extent(records, function(d) { return d.key; });
      
      var bar = g.selectAll("g")
      .data(records)
      .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + Math.round( i * barSection + barTop) + ")"; });
        
      bar.append("text")
         .attr("class", "chart")
         .attr("x", -10)
         .attr("y", barTop - 5)
         .attr("dy", "0.71em")
         .attr("text-anchor", "end")
         .text(function(d){ return d.key; }); 
     
      bar.append("rect")
        .attr("width", function(d) { return x(d.value); })
        .attr("height", barHeight - 1)
 //-----------------------------------       
        .on("click",function(d){
            var barId = "#" + chartId + " g rect";
            if(clickedBar == this){ //No bar is currently selected
               d3.selectAll(barId)
                   .style("fill", "black");            
               clickedBar = null;
            } else {
               d3.selectAll(barId)
                   .style("fill", "gray");
               d3.select(this)           
                  .style("fill", "black");                            
               clickedBar = this;
               dim.filter(function(data){ 
                  if(data === d.key){
                     return data;
                  }
               });
            }
            records = dim.group()
         .reduceSum(function(d){ return d.value; });
 /*        .all()
         .sort(function(x, y){ return d3.ascending(x.value, y.value); });
   */         console.log(records);
        }); 
 //-----------------------------------

      //create the x-axis and move it to the bottom of the graph
      g.append("g")
         .attr("transform", "translate(0," + height + ")")
         .call(d3.svg.axis().scale(x).orient("bottom").ticks(xTicCount).innerTickSize(-height))
         .attr("class", "axis");      
     
      //add a title
      g.append("g")
        .append("text")
         .attr("class", "chartTitle")     
         .attr("x", width / 2)             
         .attr("y", -margin.top / 2)
         .text(title);

   });
   
};

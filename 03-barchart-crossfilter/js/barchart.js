//===========Configuration=============
var clickedBar = null;

function init(){
   var dataFilePath = "data/dataCat.json";
   
   var config1 = {
      id: "colors",
      title: "Colors",
      width: 500,
      height: 300,
      top: 60, 
      right: 20, 
      bottom: 30, 
      left: 60, 
      ticIncr: 50,
      category: "category1"
   };

   var config2 = {
      id: "alphabet",
      title: "Alphabet",
      width: 500,
      height: 300,
      top: 60, 
      right: 20, 
      bottom: 30, 
      left: 60, 
      ticIncr: 50,
      category: "category2"
   };

   //get the data and graph it      
   d3.json(dataFilePath, function(data) {
      //crossfilter
      var cf = crossfilter(data.data);
      //dimensions
      var dim1 = cf.dimension(function(fact){ return fact[config1.category]; });
      var dim2 = cf.dimension(function(fact){ return fact[config2.category]; });
      //record groups
      var records1 = groupAndSortDim(dim1);  
      var records2 = groupAndSortDim(dim2);
      
      drawChart(records1, config1, dim1, records2, config2, dim2);     
      drawChart(records2, config2, dim2, records1, config1, dim1);     
});

//------------------------------------------------------------------------   
   function removeChart(chartId){
      var allGs = d3.selectAll(chartId + " g");
      allGs.remove();
   };  

   function drawChart(records, config, dim, linkedRecords, linkedConfig, linkedDim){
      //create an svg window and append a g element to it
      var chart = d3.select("#" + config.id).attr("width", config.width).attr("height", config.height),
          margin = {top: config.top, right: config.right, bottom: config.bottom, left: config.left},
          width = +chart.attr("width") - config.left - config.right,
          height = +chart.attr("height") - config.top - config.bottom,
          g = chart.append("g").attr("transform", "translate(" + config.left + "," + config.top + ")");
            
      var barHeight = height / 6;

      //set the axis scales
      var xScaleFunction = d3.scale.linear()
          .range([0, width]);

      //set the class for the chart 
      chart.attr("class", "chart");

      var maxXtic = d3.max(records, function(d) { return d.value; });
      if(maxXtic % config.ticIncr){ // make max axis tic round up to next config.ticIncr
         maxXtic = maxXtic - (maxXtic % config.ticIncr) + config.ticIncr;
      }
      var xTicCount = maxXtic / config.ticIncr;  
      xScaleFunction.domain([0, maxXtic]);
      
      var barSection = (height / records.length);
      var barTop = (barSection - barHeight) / 2 ;
      
      
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
       //  .attr("text-anchor", "end")
//         .text(function(d){ return d.key; }); 
         .text(function(d){ return d.value; }); 
      
      //draws the bars
      bar.append("rect")
        .attr("width", function(d) { return xScaleFunction(d.value); })
        .attr("height", barHeight - 1)
        .on("click",function(d){
            var barId = "#" + config.id + " g rect";
            //a bar was clicked so clear all filters
            dim.filterAll();
            linkedDim.filterAll();
            if(clickedBar == this){ //No bar is currently selected
               d3.selectAll(barId)
                   .style("fill", "black");            
               clickedBar = null;
            } else { //deselect all other bars, save the clicked bar, filter and redraw
               d3.selectAll(barId)
                   .style("fill", "gray");
               d3.select(this)           
                  .style("fill", "black");                            
               clickedBar = this; //save the clicked bar
               dim.filter(d.key);  //filter the selection
            }
            /*
             //redraw charts if the previous click was on a different chart            
            if(clickedBar && config.id != clickedBar.viewportElement.id){
               removeChart("#" + config.id); //clear the old chart
               drawChart(records, config, dim, linkedRecords, linkedConfig, linkedDim); 
//               removeChart("#" + linkedConfig.id); //clear the old chart
//               drawChart(linkedRecords, linkedConfig, linkedDim, records, config, dim); 
           //    clickedBar = null;
            }            
           */
 
            
            removeChart("#" + linkedConfig.id); //clear the old chart
            drawChart(linkedRecords, linkedConfig, linkedDim, records, config, dim); //redraw
        }); 

      //create the x-axis and move it to the bottom of the graph
      g.append("g")
         .attr("transform", "translate(0," + height + ")")
         .call(d3.svg.axis().scale(xScaleFunction).orient("bottom").ticks(xTicCount).innerTickSize(-height))
         .attr("class", "axis");      
     
      //add a title
      g.append("g")
        .append("text")
         .attr("class", "chartTitle")
         .attr("x", width / 2)             
         .attr("y", -margin.top / 2)
         .text(config.title);
   };
   
   function groupAndSortDim(dim){
      return dim.group()
         .reduceSum(function(d){ return d.value; })
         .all()
      .sort(function(x, y){ return d3.ascending(x.index, y.index); });
   };
     
};


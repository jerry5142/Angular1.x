//globals
var gantt;
var format = "%H:%M";
var tasks = [];
//set the initial axis start and end datetimes
var axisStartDate = new Date(moment("2018-01-29T00:00:00-06:00").format("YYYY-MM-DD HH:mm")); 
var axisEndDate = new Date(moment("2018-01-30T00:00:01-06:00").format("YYYY-MM-DD HH:mm")); 
//min and max datestimes from the data
var dataStartDate; 
var dataEndDate;

var taskStatus = {
    "PLAN" : "bar",
    "FAILED" : "bar-failed",
    "ACTUAL" : "bar-running",
    "KILLED" : "bar-killed"
};

//new task json field mapping 
var taskMap = {
      "owner": "owner",
      "taskName": "taskName",
      "status": "status",
      "startDate": "startDate",
      "endDate": "endDate"
   }; 
      
//get the task data
d3.json("data/tasks.json", function(data) {
   var taskNames = [];
   var tempTask = {
      "taskName": "", 
      "owner": "", 
      "status": "", 
      "startDate": "", 
      "endDate": ""
   };
   //split the json data into plan and actual tasks 
   dataStartDate = new Date(data.data[0].plan.startDate); 
   dataEndDate = new Date(data.data[0].plan.endDate);

   data.data.forEach(function(t){
      tempTask.taskName = t.taskName; 
      //plan
      tempTask.owner = t.owner + "-plan"; 
      tempTask.status = "PLAN"; 
      tempTask.startDate = new Date(t.plan.startDate); 
      tempTask.endDate = new Date(t.plan.endDate);
      //add the planned task
      tasks.push(tempTask);
      taskNames.push(tempTask.owner);
      
      //find earliest and latest datetimes
      setMinMaxDates(tempTask)
      tempTask = Object.assign({}, tempTask);  //clone the object

      //actual
      tempTask.owner = t.owner + "-actual"; 
      tempTask.status = "ACTUAL"; 
      tempTask.startDate = new Date(t.actual.startDate); 
      tempTask.endDate = new Date(t.actual.endDate);
      //add the planned task   
      tasks.push(tempTask);
      taskNames.push(tempTask.owner);

      //find earliest and latest datetimes
      setMinMaxDates(tempTask)
      tempTask = Object.assign({}, tempTask);  //clone the object
   });
   main(taskNames);
});

function setMinMaxDates(task){
   if(task.startDate < dataStartDate){
      dataStartDate = task.startDate;
   }
   if(task.endDate > dataEndDate){
      dataEndDate = task.endDate;
   }   
};

//begin execution
function main(taskNames){ 
   gantt = d3.gantt().taskTypes(taskNames).taskStatus(taskStatus).tickFormat(format).height(450).width(800);
   gantt.timeDomainMode("fixed");   
   changeTimeDomain(axisStartDate, axisEndDate);
   gantt(tasks, taskMap);
};

function changeTimeDomain(start, end) {
   gantt.timeDomain([ start, end ]);
   gantt.tickFormat(format);
   gantt.redraw(tasks);
}

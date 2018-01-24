//globals
var format;
var gantt;
var taskNames = [];
var tasks = [];
//set the initial axis start and end datetimes
var axisStartDate = new Date(moment("2018-01-29T00:00:00-06:00").format("YYYY-MM-DD HH:mm")); 
var axisEndDate = new Date(moment("2018-01-31T00:00:01-06:00").format("YYYY-MM-DD HH:mm")); 
var axisMode = {  //static: fixed axis, dynamic: axis fits the data
      "static": "fixed",
      "dynamic": "fit"
   };
var taskStatus = {
    "SUCCEEDED" : "bar",
    "FAILED" : "bar-failed",
    "RUNNING" : "bar-running",
    "KILLED" : "bar-killed"
};

//new task json field mapping 
var taskMap = {
      "startDate": "startDate",
      "endDate": "endDate",
      "taskName": "owner",
      "status": "status"
   }; 
      
//get the task data
d3.json("data/tasks.json", function(data) {
   var planned = data.plan;
   var actual = data.actual;
   for(var i=0; i<planned.length; i++){
        planned[i].startDate = new Date(planned[i].startDate); 
        planned[i].endDate = new Date(planned[i].endDate);   	  
        actual[i].startDate = new Date(actual[i].startDate); 
        actual[i].endDate = new Date(actual[i].endDate);
      tasks.push(planned[i]);
      tasks.push(actual[i]);
      taskNames.push(planned[i].owner); // + "-plan");
      taskNames.push(actual[i].owner + "-actual");
   }
/*    var planned = data.planned;
   var actual = data.actual;
   for(var i=0; i<planned.length; i++){
        planned[i].startDate = new Date(planned[i].startDate); 
        planned[i].endDate = new Date(planned[i].endDate);   	  
        actual[i].startDate = new Date(actual[i].startDate); 
        actual[i].endDate = new Date(actual[i].endDate);
      tasks.push(planned[i]);
      tasks.push(actual[i]);
      taskNames.push(planned[i].owner);
      taskNames.push(actual[i].owner + "-plan");
   } */
   main();
});

//begin execution
function main(){ 
   //sort the task data by endDate
   tasks.sort(function(a, b) {
       return a.endDate - b.endDate;
   });
   //sort the task data by startDate   
   tasks.sort(function(a, b) {
       return a.startDate - b.startDate;
   });

   format = "%H:%M";
//   timeDomainString = "1day";

   gantt = d3.gantt().taskTypes(taskNames).taskStatus(taskStatus).tickFormat(format).height(450).width(800);

//   gantt.timeDomainMode("fixed");
   gantt.timeDomainMode(axisMode.static);
   changeTimeDomain("");

   gantt(tasks, taskMap);
};

function changeTimeDomain(timeDomainString) {
    this.timeDomainString = timeDomainString;
    switch (timeDomainString) {
    case "1hr":
   format = "%H:%M:%S";
   gantt.timeDomain([ d3.time.hour.offset(getEndDate(), -1), getEndDate() ]);
   break;
    case "3hr":
   format = "%H:%M";
   gantt.timeDomain([ d3.time.hour.offset(getEndDate(), -3), getEndDate() ]);
   break;

    case "6hr":
   format = "%H:%M";
   gantt.timeDomain([ d3.time.hour.offset(getEndDate(), -6), getEndDate() ]);
   break;

    case "1day":
   format = "%H:%M";
   gantt.timeDomain([ d3.time.day.offset(getEndDate(), -1), getEndDate() ]);
   break;

    case "1week":
   format = "%a %H:%M";
   gantt.timeDomain([ d3.time.day.offset(getEndDate(), -7), getEndDate() ]);
   break;
    default:
   format = "%H:%M"
   gantt.timeDomain([ axisStartDate, axisEndDate ]);
   break;
    }
    gantt.tickFormat(format);
    gantt.redraw(tasks);
}

function getEndDate() {
    var lastEndDate = Date.now();
    if (tasks.length > 0) {
   lastEndDate = tasks[tasks.length - 1].endDate;
    }

    return lastEndDate;
}

/* function addTask() {

    var lastEndDate = getEndDate();
    var taskStatusKeys = Object.keys(taskStatus);
    var taskStatusName = taskStatusKeys[Math.floor(Math.random() * taskStatusKeys.length)];
    var taskName = taskNames[Math.floor(Math.random() * taskNames.length)];

    tasks.push({
   "startDate" : d3.time.hour.offset(lastEndDate, Math.ceil(1 * Math.random())),
   "endDate" : d3.time.hour.offset(lastEndDate, (Math.ceil(Math.random() * 3)) + 1),
   "taskName" : taskName,
   "status" : taskStatusName
    });

    changeTimeDomain(timeDomainString);
    gantt.redraw(tasks);
};

function removeTask() {
    tasks.pop();
    changeTimeDomain(timeDomainString);
    gantt.redraw(tasks);
};
 */
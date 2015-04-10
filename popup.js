var port = chrome.extension.connect({name: "tomatoPopupCommunication"});
document.getElementById('view-timer-start').addEventListener("click",function(){
  if (document.getElementById('view-content').className == "paused") {
    port.postMessage("tomato-continue");
  }
  else {
	 port.postMessage("tomato-start");
  }
});
document.getElementById('view-timer-stop').addEventListener("click",function(){
	port.postMessage("tomato-stop");
});
document.getElementById('view-timer-pause').addEventListener("click",function(){
  var tstatus = document.getElementById('view-content').className;
  chrome.alarms.get("tomato_timer_"+tstatus,function(alarm){
      if(typeof alarm !== "undefined") {
        var time = new Date(alarm.scheduledTime);
        var remainingTime = Math.floor(((time-Date.now())/1000)/60)+1;
        port.postMessage("tomato-pause|"+tstatus+"|"+remainingTime);
      }
  });
});

port.onMessage.addListener(function(msg) {
	var tomatoStatus = JSON.parse(msg);
	document.getElementById('view-content').className = tomatoStatus.status;
	document.getElementById('view-timer-img-status').innerHTML="<img src='images/pomodoro-"+tomatoStatus.status+"-64.png'>";
	document.getElementById('view-timer-status').innerHTML=tomatoStatus.title;

	chrome.alarms.get("tomato_timer_"+tomatoStatus.status,function(alarm){
      if(typeof alarm !== "undefined") {
          var time = new Date(alarm.scheduledTime);
          var remainingTime = Math.floor(((time-Date.now())/1000)/60)+1;
          remaining = (remainingTime < 10) ? "0"+remainingTime : remainingTime + "";
          var remainingText = "less than<div>00:"+remaining+"</div>";
          remainingText += (remainingTime > 1)?"minutes remaining":"minute remaining";
          document.getElementById('view-time-remaining').innerHTML=remainingText;
      }
      else {
      	document.getElementById('view-time-remaining').innerHTML="<div>00:00</div>";
      }
  });

});

var popupTimeout = window.setTimeout(function(){
	window.close();
}, 30000);
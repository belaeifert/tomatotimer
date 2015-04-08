var port = chrome.extension.connect({name: "Tomato Timer Communication"});
document.getElementById('view-timer-start').addEventListener("click",function(){
	port.postMessage("tomato-start");
});
document.getElementById('view-timer-stop').addEventListener("click",function(){
	port.postMessage("tomato-stop");
});
port.onMessage.addListener(function(msg) {
	var tomatoStatus = JSON.parse(msg);
	document.getElementById('view-content').className = tomatoStatus.status;
	document.getElementById('view-timer-img-status').innerHTML="<img src='images/pomodoro-"+tomatoStatus.status+"-64.png'>";
	document.getElementById('view-timer-status').innerHTML=tomatoStatus.title;

	chrome.alarms.get("tomato_timer_"+tomatoStatus.status,function(alarm){
      if(typeof alarm !== "undefined") {
          var time = new Date(alarm.scheduledTime);
          var remainingTime = Math.floor(((time-Date.now())/1000)/60);
          remaining = (remainingTime < 10) ? "0"+remainingTime : remainingTime + "";
          document.getElementById('view-time-remaining').innerHTML="00:"+remaining;
      }
      else {
      	document.getElementById('view-time-remaining').innerHTML="00:00";
      }
  });

});

var popupTimeout = window.setTimeout(function(){
	window.close();
}, 30000);
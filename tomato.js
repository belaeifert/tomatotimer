function tomatoJS () {
    this.initialize.apply(this,arguments);
}
tomatoJS.fn = tomatoJS.prototype;

tomatoJS.fn.initialize = function() {
    this.isTimerOn = false;
    this.isBreakOn = false;
    this.remainingBreaks = 3;
    this.lapSize = 25;
    this.shortBreak = 5;
    this.longBreak = 15;
    chrome.alarms.clearAll();
    this.addEventListeners();
};

tomatoJS.fn.addEventListeners = function () {
    var parent = this;
    chrome.alarms.onAlarm.addListener(function(alarm){
        if(alarm.name === 'tomato_timer_active') {
            parent.breakTomato();
        }
        else if(alarm.name === 'tomato_timer_break') {
            parent.activeTomato();
        }
    });
};

tomatoJS.fn.activeTomato = function () {
    this.isTimerOn = true;
    this.isBreakOn = false;
    chrome.alarms.clearAll();
    chrome.alarms.create("tomato_timer_active", {delayInMinutes: this.lapSize});
    chrome.browserAction.setIcon({path:"images/pomodoro-active-19.png"});
    var notification = chrome.notifications.create(
        'tomato_start',{
        "type": 'basic', 
        "iconUrl": 'images/pomodoro-active-128.png', 
        "title": "Let's go!!!", 
        "message": "Pomodoro started!"
        },
        function() {}
    );
};

tomatoJS.fn.breakTomato = function () {
    this.isBreakOn = true;
    chrome.alarms.clearAll();
    chrome.browserAction.setIcon({path:"images/pomodoro-break-19.png"});
    if(this.remainingBreaks > 0) {
        chrome.alarms.create("tomato_timer_break", {delayInMinutes: this.shortBreak});
        var breakMsg = "Have a break! ("+this.shortBreak+" min)";
        this.remainingBreaks--;
    }
    else {
        chrome.alarms.create("tomato_timer_break", {delayInMinutes: this.longBreak});
        this.remainingBreaks = 3;
        var breakMsg = "Have a long break! ("+this.longBreak+" min)";
    }

    var notification = chrome.notifications.create(
        'tomato_break',{   
        "type": 'basic', 
        "iconUrl": 'images/pomodoro-break-128.png', 
        "title": "Relax!", 
        "message": breakMsg
        },
        function() {}
    );
};

tomatoJS.fn.stopTomato = function () {
    this.isTimerOn = false;
    this.isBreakOn = false;
    chrome.alarms.clearAll();
    chrome.browserAction.setIcon({path:"images/pomodoro-inactive-19.png"});
    var notification = chrome.notifications.create(
        'tomato_start',{   
        "type": 'basic', 
        "iconUrl": 'images/pomodoro-inactive-128.png', 
        "title": "Tomato Timer Off", 
        "message": "Pomodoro Off" 
        },
        function() {}
    );
};

tomatoJS.fn.getStatus = function () {
    var  tomatoStatus = {
        "title":"",
        "status":"",
    };
    if(!this.isTimerOn) {
        tomatoStatus.title = "Tomato Stopped";
        tomatoStatus.status = "inactive";
    }
    else if(this.isBreakOn) {
        tomatoStatus.title = "Have a break!";
        tomatoStatus.status = "break";
    }
    else {
        tomatoStatus.title = "Tomato Active!";
        tomatoStatus.status = "active";
    }
    return JSON.stringify(tomatoStatus);
}

var tomatoTimer =  new tomatoJS();

chrome.extension.onConnect.addListener(function(port) {

    port.postMessage(tomatoTimer.getStatus());

    port.onMessage.addListener(function(msg) {
        if(msg === "tomato-start") {
            tomatoTimer.activeTomato();
            port.postMessage(tomatoTimer.getStatus());
        }
        else if(msg === "tomato-stop") {
            tomatoTimer.stopTomato();
            port.postMessage(tomatoTimer.getStatus());
        }
    });
});
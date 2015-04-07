function tomatoJS () {
    this.initialize.apply(this,arguments);
}
tomatoJS.fn = tomatoJS.prototype;

tomatoJS.fn.initialize = function() {
    this.isTimerOn = false;
    this.remainingBreaks = 3;
    this.lapSize = 1;
    this.shortBreak = 1;
    this.longBreak = 1;
    this.addEventListeners();
};

tomatoJS.fn.addEventListeners = function () {
    var parent = this;
    chrome.alarms.onAlarm.addListener(function(alarm){
        console.log(alarm);
        if(alarm.name === 'tomato_done') {
            parent.breakTomato();
        }
        else if(alarm.name === 'break_done') {
            parent.activeTomato();
        }
    });
    this.activeTomato();
};

tomatoJS.fn.activeTomato = function () {
    chrome.alarms.create("tomato_done", {delayInMinutes: this.lapSize});
    this.isTimerOn = true;
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
    this.isTimerOn = false;
    chrome.browserAction.setIcon({path:"images/pomodoro-break-19.png"});
    if(this.remainingBreaks > 0) {
        chrome.alarms.create("break_done", {delayInMinutes: this.shortBreak});
        var breakMsg = "Have a break! ("+this.shortBreak+" min)";
        this.remainingBreaks--;
    }
    else {
        chrome.alarms.create("break_done", {delayInMinutes: this.longBreak});
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
    chrome.alarms.clearAll();
    this.isTimerOn = false;
    chrome.browserAction.setIcon({path:"images/pomodoro-inactive-19.png"});
    var notification = chrome.notifications.create(
        'tomato_start',{   
        "type": 'basic', 
        "iconUrl": 'images/pomodoro-inactive-128.png', 
        "title": "Tomato Timer Off", 
        "message": "Timer started" 
        },
        function() {}
    );
    notification.show();
};

var tomatoTimer =  function() {
    return new tomatoJS();
};

chrome.browserAction.onClicked.addListener(tomatoTimer);
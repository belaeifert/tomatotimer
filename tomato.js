function tomatoJS () {
    this.initialize.apply(this,arguments);
}
tomatoJS.fn = tomatoJS.prototype;

tomatoJS.fn.initialize = function() {
    this.isTimerOn = false;
    this.isBreakOn = false;
    this.remainingBreaks = 3;

    this.lapSize = this.getData("lapSize") || 25;
    this.shortBreak = this.getData("shortBreak") || 5;
    this.longBreak = this.getData("longBreak") || 15;

    this.blockDefaults = "facebook.com,twitter.com";
    this.blockUrls = this.getData("blockedUrls") || "";
    this.blockUrls += ","+this.blockDefaults;

    this.tomatoAudio = new Audio();
    this.tomatoAudio.src = "alert.wav";

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

tomatoJS.fn.getData = function (key) {
    var item = localStorage.getItem(key);
    if(key === "blockedUrls") {
        return (item) ? item : "";
    }
    return (item && !isNaN(parseInt(item))) ? parseInt(item) : null;
}

tomatoJS.fn.updateTomatoData = function () {
    this.lapSize = this.getData("lapSize") || this.lapSize;
    this.shortBreak = this.getData("shortBreak") || this.shortBreak;
    this.longBreak = this.getData("longBreak") || this.longBreak;
    this.blockUrls = this.getData("blockedUrls") || "";
    this.blockUrls += ","+this.blockDefaults;
};

tomatoJS.fn.blockRequest = function (details) {
    var notification = chrome.notifications.create(
        'tomato_block',{
        "type": 'basic', 
        "iconUrl": 'images/angry-pomodoro.png', 
        "title": "Are you kidding me!?!", 
        "message": "Request blocked by Tomato Timer!"
        },
        function() {}
    );
  return { redirectUrl: chrome.extension.getURL("block.html") }
}

tomatoJS.fn.blockSites = function () {
    blockSites = this.blockUrls.replace(/\s/g,"");
    blockSites = blockSites.split(",");
    for (index = 0; index < blockSites.length; ++index) {
        blockSites[index] = "*://*."+blockSites[index]+"/*";
    }

    if(chrome.webRequest.onBeforeRequest.hasListener(this.blockRequest))
        chrome.webRequest.onBeforeRequest.removeListener(this.blockRequest);
    chrome.webRequest.onBeforeRequest.addListener(this.blockRequest, {urls: blockSites}, ['blocking']);
}

tomatoJS.fn.unblockSites = function () {
    if(chrome.webRequest.onBeforeRequest.hasListener(this.blockRequest))
        chrome.webRequest.onBeforeRequest.removeListener(this.blockRequest);
}

tomatoJS.fn.activeTomato = function () {
    this.blockSites();
    this.isTimerOn = true;
    this.isBreakOn = false;
    chrome.alarms.clearAll();
    chrome.alarms.create("tomato_timer_active", {delayInMinutes: this.lapSize});
    chrome.browserAction.setIcon({path:"images/pomodoro-active-19.png"});
    var notification = chrome.notifications.create(
        'tomato_start',{
        "type": 'basic', 
        "iconUrl": 'images/pomodoro-active-128.png', 
        "title": "Go!!!", 
        "message": "New Pomodoro started! ("+this.lapSize+" min)"
        },
        function() {}
    );
    this.ring();
    var notificationTimeout = window.setTimeout(function(){
        chrome.notifications.clear('tomato_start',function(){});
    }, 5000);
};

tomatoJS.fn.breakTomato = function () {
    this.unblockSites();
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
    this.ring();
    var notificationTimeout = window.setTimeout(function(){
        chrome.notifications.clear('tomato_break',function(){});
    }, 60000);
};

tomatoJS.fn.stopTomato = function () {
    this.unblockSites();
    this.isTimerOn = false;
    this.isBreakOn = false;
    chrome.alarms.clearAll();
    chrome.browserAction.setIcon({path:"images/pomodoro-inactive-19.png"});
    var notification = chrome.notifications.create(
        'tomato_stop',{   
        "type": 'basic', 
        "iconUrl": 'images/pomodoro-inactive-128.png', 
        "title": "Tomato Timer Off", 
        "message": "Pomodoro Off" 
        },
        function() {}
    );
    this.ring();
    var notificationTimeout = window.setTimeout(function(){
        chrome.notifications.clear('tomato_stop',function(){});
    }, 60000);
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

tomatoJS.fn.ring = function () {
    this.tomatoAudio.play();
};

var tomatoTimer =  new tomatoJS();

chrome.extension.onConnect.addListener(function(port) {

    if(port.name === "tomatoPopupCommunication") {
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
    }
    else if(port.name === "tomatoOptionsCommunication") {
        port.onMessage.addListener(function(msg) {
            if(msg === "tomato-data-update") {
                tomatoTimer.updateTomatoData();
            }
        });
    }
});
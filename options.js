function save_options() {
  
  var tomatotime = document.getElementById('tomatotime').value;
  var tomatobreak = document.getElementById('tomatobreak').value;
  var tomatobreaklong = document.getElementById('tomatobreaklong').value;

  var tomatoblock = document.getElementById('tomatoblock').value;

  localStorage.setItem("lapSize", tomatotime);
  localStorage.setItem("shortBreak", tomatobreak);
  localStorage.setItem("longBreak", tomatobreaklong);
  localStorage.setItem("blockedUrls", tomatoblock);

  var status = document.getElementById('status');
  status.textContent = 'Settings saved!';

  var port = chrome.extension.connect({name: "tomatoOptionsCommunication"});
  port.postMessage("tomato-data-update");

  var finished = setTimeout(function() {
    status.textContent = '';
  }, 2750);

}

function restore_options() {
    document.getElementById('tomatotime').value = localStorage.getItem("lapSize") || 25;
    document.getElementById('tomatobreak').value = localStorage.getItem("shortBreak") || 5;
    document.getElementById('tomatobreaklong').value = localStorage.getItem("longBreak") || 15;
    document.getElementById('tomatoblock').value = localStorage.getItem("blockedUrls") || "";
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('tomatosave').addEventListener('click',
    save_options);
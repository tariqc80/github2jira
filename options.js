(function(document, window, undefined) {

var validURL = function (str) {
  var pattern =/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;
  return pattern.test(str)
}

var save_options = function () {
  var jira_server = document.getElementById('jira_server').value;

  if (validURL(jira_server)) {
    var settings = {
      'default': {
        'jira_server': jira_server.replace(/\/$/, '')
      }
    };

    chrome.storage.sync.set({'github2jira': settings}, function() {
      var messages = document.getElementById('messages');
      messages.textContent = 'Options saved.';
      setTimeout(function() {
        messages.textContent = '';
      }, 1750);
    });
  } else {
    var messages = document.getElementById('messages');
      messages.textContent = 'Invalid Url';
      setTimeout(function() {
        messages.textContent = '';
      }, 1750);
  }
}

var restore_options = function() {
  chrome.storage.sync.get('github2jira', function(settings) {
    console.debug(settings);
      if (typeof settings.github2jira.default !== 'undefined') {
        if (settings.github2jira.default.jira_server) {
          document.getElementById('jira_server').setAttribute('value', settings.github2jira.default.jira_server);
        }
      }
  }); 
}

document.getElementById('save').addEventListener('click', function(){ save_options(); });
document.addEventListener('DOMContentLoaded', restore_options);

})(document, window);
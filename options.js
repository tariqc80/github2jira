/* global chrome */
(function(document, chrome) {
    const LOCAL_STORAGE_KEY = 'infiniteapps_oh_that_issue';
    const REGEXP_JIRA       = '([a-zA-Z0-9]+-[0-9]+).*$';

    var validURL = function (str) {
        var pattern =/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;
        return pattern.test(str);
    };

    var process_form = function () {
        validate_form();
        var settings_form = document.getElementById('oh-that-issue-settings-form');

        if (validURL(settings_form['issue_tracker_url'].value)) {
            let settings = {
                'default': {
                    'issue_tracker_type':   settings_form['issue_tracker_type'].value,
                    'issue_tracker_url':    settings_form['issue_tracker_url'].value,
                    'issue_key_pattern':    settings_form['issue_key_pattern'].value
                }
            };

            if (settings_form['issue_tracker_type'].value === 'jira') {
                settings_form['issue_key_pattern'].value = REGEXP_JIRA;
            }

            save_options(settings, () => {
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
    };

    var save_options = function (settings, callback) {
        let storage_object = {};
        storage_object[LOCAL_STORAGE_KEY] = settings;

        chrome.storage.sync.set(storage_object, function() {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            }

            if (typeof callback === 'function') {
                callback.apply(this);
            }
        });
    };

    var restore_options = function() {
        chrome.storage.sync.remove('github2jira');
        chrome.storage.sync.get(LOCAL_STORAGE_KEY, function(settings) {
            if (typeof settings[LOCAL_STORAGE_KEY] !== 'undefined') {
                let config = settings[LOCAL_STORAGE_KEY].default;

                if (config.issue_tracker_url) {
                    document.getElementById('issue-tracker-url').value = config.issue_tracker_url;
                }
                if (config.issue_tracker_type) {
                    let radios = document.getElementsByClassName('issue-tracker-radio');
                    for (let i = 0; i < radios.length; i++) {
                        radios[i].checked = (radios[i].id === 'issue-tracker-' + config.issue_tracker_type);
                    }
                }
                if (config.issue_key_pattern) {
                    document.getElementById('issue-key-pattern').value = config.issue_key_pattern;
                }

                validate_form();
            }
        });
    };

    var validate_form = function () {
        var settings_form = document.getElementById('oh-that-issue-settings-form');

        if (settings_form['issue_tracker_url'].value.slice(-1) !== '/') {
            settings_form['issue_tracker_url'] = settings_form['issue_tracker_url'].value += '/';
        }

        switch (settings_form['issue_tracker_type'].value) {
        case 'jira':
            settings_form['issue_key_pattern'].value = REGEXP_JIRA;
            settings_form['issue_key_pattern'].disabled = true;

            if (settings_form['issue_tracker_url'].value.match(/\/browse\/?/) === null) {
                settings_form['issue_tracker_url'].value += 'browse/';
            }

            break;
        case 'other':
            settings_form['issue_key_pattern'].disabled = false;
            settings_form['issue_key_pattern'].value = '';
            break;
        }
    };

    document.getElementById('save').addEventListener('click', () => { process_form(); });
    document.getElementById('oh-that-issue-settings-form').addEventListener('submit', () => { return false; });
    document.getElementById('oh-that-issue-settings-form').addEventListener('change', () => { validate_form(); });

    document.addEventListener('DOMContentLoaded', () => {
        restore_options();
    });
})(document, chrome);

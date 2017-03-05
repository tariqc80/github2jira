/* global chrome */
const LOCAL_STORAGE_KEY = 'infiniteapps_oh_that_issue';

chrome.storage.sync.get(LOCAL_STORAGE_KEY, function (storage_object) {
    init(storage_object[LOCAL_STORAGE_KEY].default);
});

chrome.storage.sync.get('github2jira', function(old_settings) {
    console.log(old_settings);
    if (typeof old_settings.github2jira !== 'undefined') {
        let div = document.createElement('div');
        div.setAttribute('class', 'oh-that-issue-flash-message');
        div.innerHTML = '<span>Oh That Issue notice</span>Existing settings for the older extension "github2jira" were found.' +
            '<br \>Please visit the <a target="_blank" href="' + chrome.runtime.getURL('options.html') + '">Settings page</a> to reconfigure.';
        let body = document.getElementsByTagName('body')[0];
        body.insertBefore(div, body.firstChild);
    }
});

var processTarget = function (target, config) {
    var existing_button = target.getElementsByClassName('oh-that-issue-goto-btn');

    if (existing_button.length === 0) {
        /*
         Pull Request List Page
         */
        if (window.location.href.match(/https:\/\/github\.com\/.*\/.*\/pulls/)) {
            addButtonsToPullRequestList(target, config);
        }

        /*
         Pull Request Page
         */
        if (window.location.href.match(/https:\/\/github\.com\/.*\/.*\/pull\/[0-9]+/)) {
            addButtonToPullRequestDetail(config);
        }
    }
};

var init = function (config) {
    var observer = new MutationObserver(function (mutations) {
        /*
         Check if the "js-repo-pjax-container" has been mutated, and if so process the page to add the buttons
         */
        for (var i = 0; i < mutations.length; i++) {
            if (mutations[i].target.id === 'js-repo-pjax-container' ||
                mutations[i].target.classList.contains('js-issues-results') ) {
                if (mutations[i].addedNodes.length > 0) {
                    processTarget(mutations[i].target, config);
                    break;
                }
            }
        }
    });

    // configuration of the observer:
    var body = document.getElementsByTagName('body')[0];

    // pass in the target node, as well as the observer options
    observer.observe(body, {childList: true, subtree: true});

    processTarget(body, config);
};

var createButton = function (text, url) {
    var button = document.createElement('a');

    button.textContent = text;
    button.setAttribute('href', url);
    button.setAttribute('title', url);
    button.setAttribute('class', 'oh-that-issue-goto-btn');

    return button;
};

var addButtonsToPullRequestList = function (target, config) {
    var rows = target.getElementsByClassName('issues-listing')[0].querySelectorAll('.js-issue-row');

    for (var i = 0; i < rows.length; i++) {
        let element = rows[i].querySelector('.lh-condensed');

        /*
         * get pull request description text
         */
        let text = element.querySelector('a.js-navigation-open').innerText;
        let pattern = new RegExp(config.issue_key_pattern);
        let parts = text.match(pattern);

        if (parts) {
            let issue  = parts[1];
            let button = createButton('Goto ' + config.issue_tracker_type + ' issue', config.issue_tracker_url + issue);
            let span = document.createElement('span');

            span.setAttribute('class', 'mt-1 text-small');
            span.appendChild(button);
            element.insertBefore(span, element.firstChild);
        }
    }
};

var addButtonToPullRequestDetail = function (config) {
    var branch_elements = [];

    /*
     * find the elements that have the branch names
     */
    branch_elements.push(document.getElementById('js-repo-pjax-container')
        .getElementsByClassName('base-ref')[0]
        .getElementsByTagName('span')[0]);
    branch_elements.push(document.getElementById('js-repo-pjax-container')
        .getElementsByClassName('head-ref')[0]
        .getElementsByTagName('span')[0]);

    /*
     * parse the branch names for a valid issue key
     */
    for (var index = 0; index < branch_elements.length; index++) {
        let pattern = new RegExp(config.issue_key_pattern);
        let branch_parts = branch_elements[index].textContent.match(pattern);
        if (branch_parts) {
            let button = createButton('Goto ' + config.issue_tracker_type + ' issue', config.issue_tracker_url + branch_parts[1]);
            branch_elements[index].parentNode.parentNode.insertBefore(button, branch_elements[index].parentNode.nextSibling);
        }
    }
};

// console.info('You are at github.com so github2jira loaded!  Aren\'t you lucky?');

chrome.storage.sync.get('github2jira', function(settings) {
  init(settings['github2jira']);
});

var processPage = function (settings) {
	/*
		Pull Request List Page
	 */
    if (window.location.href.match(/https:\/\/github\.com\/.*\/.*\/pulls/)) {
        addButtonToPullRequestList(settings);
    }

    /*
    	Pull Request Page
     */
    if (window.location.href.match(/https:\/\/github\.com\/.*\/.*\/pull\/[0-9]+/)) {
        var elements = getBranchElementsFromPullRequestPage(settings);
        if (elements.length > 0) {
            addGotoJiraButton(elements, settings.default.jira_server);
        }
    }
};

var init = function(settings) {
	var observer = new MutationObserver(function(mutations) {
		/*
			Check if the "js-repo-pjax-container" has been mutated, and if so process the page to add the buttons
		 */
		var process = false;
		for (var i = 0; i < mutations.length; i++) {
			if (mutations[i].target.id === "js-repo-pjax-container") {
				process = true;
				break;
            }
		}

		if (process) {
            processPage(settings);
        }
	});

	// configuration of the observer:
	var body   = document.getElementsByTagName('body');
	var config = { childList: true, subtree: true };
	 
	// pass in the target node, as well as the observer options
	observer.observe(body[0], config);

    processPage(settings);
};

var createGotoJiraButton = function (url) {
    button = document.createElement('a');
    button.textContent = 'Goto Jira Ticket';
    button.setAttribute('href', url);
    button.setAttribute('title', url);
    button.setAttribute('class', 'github-goto-jira');

    return button;
};

var addButtonToPullRequestList = function (settings) {
	var rows = document.getElementsByClassName('issues-listing')[0].querySelectorAll('.js-issue-row');
	var jira_url = settings.default.jira_server;

	for (var i = 0; i < rows.length; i++) {
		var element = rows[i].querySelector('.lh-condensed');
		var text    = element.querySelector('a.js-navigation-open').innerText;
		var parts;

		if (parts = text.match(/([a-zA-Z0-9]+-[0-9]+).*$/)) {
			var issue  = parts[1];
			var button = createGotoJiraButton(jira_url + '/browse/' + issue);

			var span   = document.createElement('span');
			span.setAttribute('class', 'mt-1 text-small');
			span.appendChild(button);

			element.insertBefore(span, element.firstChild)
		}
	}
};

var getBranchElementsFromPullRequestPage = function () {
	var branch_elements = [];

	branch_elements.push(document.getElementById('js-repo-pjax-container')
		.getElementsByClassName('base-ref')[0]
		.getElementsByTagName('span')[0]);
	branch_elements.push(document.getElementById('js-repo-pjax-container')
		.getElementsByClassName('head-ref')[0]
		.getElementsByTagName('span')[0]);

	return branch_elements;
};

var addGotoJiraButton = function(branch_elements, jira_url) {
	var branch_parts;
	var existing_button = document.getElementsByClassName('github-goto-jira');
	
	if (existing_button.length < 1) {
		for (var index = 0; index < branch_elements.length; index++) {
			if (branch_parts = branch_elements[index].textContent.match(/^(.*)\/(.*-[0-9]+).*$/)) {
                var button = createGotoJiraButton(jira_url + '/browse/' + branch_parts[2]);
                branch_elements[index].parentNode.parentNode.insertBefore(button, branch_elements[index].parentNode.nextSibling);
			}
		}
	}
};

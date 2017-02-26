// console.info('You are at github.com so github2jira loaded!  Aren\'t you lucky?');

chrome.storage.sync.get('github2jira', function(settings) {
  init(settings['github2jira']);
});

var processPage = function (settings) {
    var elements = getBranchElementsFromPullRequestPage();
    if (elements.length > 0) {
        addGotoJiraButton(elements, settings.default.jira_server);
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

var getBranchElementsFromPullRequestPage = function() {
	var branch_elements = [];

    if (window.location.href.match(/https:\/\/github\.com\/.*\/.*\/pull\/[0-9]+/)) {
        branch_elements.push(document.getElementById('js-repo-pjax-container')
			.getElementsByClassName('base-ref')[0]
			.getElementsByTagName('span')[0]);
        branch_elements.push(document.getElementById('js-repo-pjax-container')
			.getElementsByClassName('head-ref')[0]
			.getElementsByTagName('span')[0]);
	}

	return branch_elements;
}

var addGotoJiraButton = function(branch_elements, jira_url) {
	var branch_parts,
		jira_redirect,
		button;

	var existing_button = document.getElementsByClassName('github-goto-jira');
	
	if (existing_button.length < 1) {
		for (var index = 0; index < branch_elements.length; index++) {
			if (branch_parts = branch_elements[index].textContent.match(/^(.*)\/(.*-[0-9]+).*$/)) {
				jira_redirect = jira_url + '/browse/' + branch_parts[2];

				button = document.createElement('a');
				button.textContent = 'Goto Jira Ticket';
				button.setAttribute('href', jira_redirect);
				button.setAttribute('title', jira_redirect);
				button.setAttribute('class', 'github-goto-jira');

                branch_elements[index].parentNode.parentNode.insertBefore(button, branch_elements[index].parentNode.nextSibling);
			}
		}
	}
};

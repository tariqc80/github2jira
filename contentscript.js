// console.info('You are at github.com so github2jira loaded!  Aren\'t you lucky?');

chrome.storage.sync.get('github2jira', function(settings) {
  init(settings['github2jira']);
});
    
var init = function(settings) {

	var observer = new MutationObserver(function(mutations) {
		var branch_containers = getBranchElementsFromPullRequestPage();
	    if (branch_containers.length > 0) {
			addGotoJiraButton(branch_containers, settings.default.jira_server);
		}
	});

	// configuration of the observer:
	var body   = document.getElementsByTagName('body');
	var config = { childList: true, subtree: true };
	 
	// pass in the target node, as well as the observer options
	observer.observe(body[0], config);

	var branch_containers = getBranchElementsFromPullRequestPage();
	if (branch_containers.length > 0) {
		addGotoJiraButton(branch_containers, settings.default.jira_server);
	}
};

var getBranchElementsFromPullRequestPage = function() {
	var branch_containers = [];

    if (window.location.href.match(/https:\/\/github\.com\/.*\/.*\/pull\/[0-9]+/)) {
    	branch_containers = document.getElementById('js-repo-pjax-container')
									.getElementsByClassName('current-branch');
	}

	return branch_containers;
}

var addGotoJiraButton = function(branch_containers, jira_url) {

	var branch_names,
		branch_parts,
		branch_name_element,
		jira_redirect,
		button;

	var existing_button = document.getElementsByClassName('github-goto-jira');
	
	if (existing_button.length < 1) {
		outloop:
		for (var b_index = 0; b_index < branch_containers.length; b_index++) {
			branch_names = branch_containers[b_index].getElementsByTagName('span');
			for (var i = 0; i < branch_names.length; i++) {
				// find the first branch with the jira ticket name
				// todo make both to and from branches have links
					if (branch_parts = branch_names[i].textContent.match(/^(.*)\/(.*-[0-9]+).*$/)) {
					branch_name_element = branch_names[i];
					break outloop;
				}
			}
		}

		jira_redirect = jira_url + '/browse/' + branch_parts[2];

		button = document.createElement('a');
		button.textContent = 'Goto Jira Ticket';
		button.setAttribute('href', jira_redirect);
		button.setAttribute('title', jira_redirect);
		button.setAttribute('class', 'github-goto-jira');

		branch_name_element.parentNode.nextSibling.parentNode.insertBefore(button, branch_name_element.parentNode.nextSibling);
	}
};

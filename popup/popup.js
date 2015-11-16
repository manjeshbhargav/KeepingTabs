var KeepingTabs = {
    Templates: {
        tabs: '<ul class="tabs">{tabs}</ul>',
        tab: '<li>\
                <ul class="tab" data-tab="{tab}">\
                    <li class="favicon">\
                        <img src="{favIconUrl}">\
                    </li>\
                    <li class="title">\
                        {title}\
                    </li>\
                </ul>\
              </li>'
    }
};
//
// Send message to the background to focus on a particular tab.
//
var focusTab = function () {
    var tabData = JSON.parse(this.getAttribute('data-tab').replace(/'/g, '"'));
    chrome.runtime.sendMessage({type: 'focustab', tab: tabData});
};
//
// Render the list of open tabs.
//
var renderTabs = function (tabs) {
    var tabsHtml = '',
        tabsList;
    // Sort the list of tabs in alphabetical order.
    tabs = tabs.sort(function (a, b) {
        return (a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1);
    });
    // Use the tab template to render the list of open tabs.
    for (var t in tabs) {
        if (tabs.hasOwnProperty(t)) {
            tabsHtml += KeepingTabs.Templates.tab.replace(
                /\{favIconUrl}/,
                tabs[t].favIconUrl
            ).replace(
                /\{title}/,
                tabs[t].title
            ).replace(
                /\{tab}/,
                JSON.stringify(tabs[t]).replace(/"/g, '\'')
            );
        }
    }
    // Render the html into the container.
    document.querySelector('div.results').innerHTML =
        KeepingTabs.Templates.tabs.replace(
            /\{tabs}/,
            tabsHtml
        );
    // Clicking on any open tab list item should bring that
    // tab back into focus.
    tabsList = document.querySelectorAll('ul.tab');
    for (var i = 0; i < tabsList.length; i++) {
        tabsList[i].addEventListener('click', focusTab);
    }
};
// Get the list of open tabs from the background. Then configure the search
// box to filter the list based on whatever is typed into it.
chrome.runtime.sendMessage({type: 'getopentabs'}, function (tabs) {
    renderTabs(tabs);
    document.querySelector('div.search > input').addEventListener(
        'keyup',
        function () {
            var self = this;
            setTimeout(function () {
                // Filter the list of open tabs based on the search box value.
                var ftabs = JSON.parse(JSON.stringify(tabs.filter(function (tab) {
                    var idx = tab.title.toLowerCase()
                                 .indexOf(self.value.toLowerCase());
                    return (idx >= 0);
                })));
                // For open tab items that match the search box value, highlight
                // the portion that matches by making it bold.
                ftabs.forEach(function (tab) {
                    var idx = tab.title.toLowerCase()
                                 .indexOf(self.value.toLowerCase());
                    if (self.value.length) {
                        tab.title = tab.title.substring(0, idx) +
                                    '<strong>' +
                                    tab.title.substring(idx, idx + self.value.length) +
                                    '</strong>' +
                                    tab.title.substring(idx + self.value.length);
                    }
                });
                // Re-render the new filtered list of tabs.
                renderTabs(ftabs);
            }, 50);
        }
    );
});

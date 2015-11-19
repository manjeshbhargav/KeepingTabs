//
// Templates for the list of open tabs.
//
var Templates = {
    tabs: '<ul class="tabs">{tabs}</ul>',
    tab: '<li>\
            <ul class="tab{active}" data-tab="{tab}">\
                <li class="favicon">\
                    <img src="{favIconUrl}">\
                </li>\
                <li class="title">\
                    <span class="title">{title}</span><br>\
                    <span class="url">{url}</span>\
                </li>\
            </ul>\
          </li>'
};
//
// Send message to the background to focus on a particular tab.
//
var focusTab = function () {
    var tabData = JSON.parse(
        decodeURIComponent(
            this.getAttribute('data-tab')
        )
    );
    chrome.runtime.sendMessage({type: 'focustab', tab: tabData});
};
//
// Get unique array elements.
//
var uniqueArray = function (array) {
    var uniqueMap = {};

    return array.filter(function (item) {
        if (uniqueMap.hasOwnProperty(item)) {
            return false;
        }
        uniqueMap[item] = 1;
        return true;
    });
};
//
// Escape html tags in a string.
//
var escapeHtmlTags = function (str) {
    return str.replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
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
    tabs.forEach(function (tab) {
        tabsHtml += Templates.tab.replace(/\{favIconUrl}/, tab.favIconUrl)
                                 .replace(/\{title}/, escapeHtmlTags(tab.title))
                                 .replace(/\{url}/, tab.url)
                                 .replace(/\{active}/, tab.active ?
                                                       ' active' :
                                                       '')
                                 .replace(/\{tab}/, encodeURIComponent(
                                                        JSON.stringify(tab)
                                                    ));
    });
    // Render the html into the container.
    document.querySelector('div.results').innerHTML =
                                Templates.tabs.replace(/\{tabs}/, tabsHtml);
    // Clicking on any open tab list item should bring that
    // tab back into focus.
    tabsList = document.querySelectorAll('ul.tab');
    for (var i = 0; i < tabsList.length; i++) {
        tabsList[i].addEventListener('click', focusTab);
    }

    return tabsList;
};
// Get the list of open tabs from the background. Then configure the search
// box to filter the list based on whatever is typed into it.
chrome.runtime.sendMessage({type: 'getopentabs'}, function (tabs) {
    var tabsList = renderTabs(tabs);

    document.querySelector('div.search > input').addEventListener(
        'keyup',
        function () {
            var self = this;
            setTimeout(function () {
                var re = new RegExp(self.value, 'gi'),
                    tSpan,
                    uSpan,
                    tab,
                    i;

                var highlightMatch = function (match) {
                    // If the search box is empty, then we don't
                    // highlight anything.
                    return (match ? '<strong>' + match + '</strong>' : match);
                };

                for (i = 0; i < tabsList.length; i++) {
                    // Get the data associated with this tab element.
                    tab = JSON.parse(
                        decodeURIComponent(
                            tabsList[i].getAttribute('data-tab')
                        )
                    );
                    // If the tab item matches the search box value, highlight
                    // the portion that matches by making it bold.
                    if (re.test(tab.title) || re.test(tab.url)) {
                        tSpan = tabsList[i].querySelector('span.title');
                        uSpan = tabsList[i].querySelector('span.url');

                        tab.title = escapeHtmlTags(tab.title).replace(
                            re,
                            highlightMatch
                        );
                        tab.url = tab.url.replace(
                            re,
                            highlightMatch
                        );

                        tSpan.innerHTML = tab.title;
                        uSpan.innerHTML = tab.url;
                        tabsList[i].style.display = '';
                    }
                    // Hide the unmatched tab items.
                    else {
                        tabsList[i].style.display = 'none';
                    }
                }
            }, 50);
        }
    );
});

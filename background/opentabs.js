var OpenTabs = {
    //
    // Get the list of recently open tabs
    //
    get: function (callback) {
        chrome.tabs.query({}, function (tabs) {
            var _tabs = [];

            tabs.forEach(function (tab) {
                _tabs.push({
                    id: tab.id,
                    url: tab.url,
                    title: tab.title,
                    active: tab.active,
                    windowId: tab.windowId,
                    favIconUrl: tab.favIconUrl || (
                        'chrome://favicon/' +
                        tab.url.split('/').slice(0, 3).join('/')
                    )
                });
            });

            callback(_tabs);
        });
    },
    //
    // Focus on a particular tab.
    //
    focus: function (tab) {
        chrome.windows.update(tab.windowId, {focused: true});
        chrome.tabs.update(tab.id, {active: true});
    },
    //
    // Initialize the background process.
    //
    init: function () {
        chrome.runtime.onMessage.addListener(
            function (msg, sender, sendResponse) {
                if ('getopentabs' === msg.type) {
                    OpenTabs.get(sendResponse);
                }
                else if ('focustab' === msg.type) {
                    OpenTabs.focus(msg.tab);
                }
                return true;
            }
        );
    }
};

OpenTabs.init();

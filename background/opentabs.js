var OpenTabs = {
    //
    // Get the list of recently open tabs
    //
    get: function (callback) {
        chrome.tabs.query({}, function (tabs) {
            var _tabs = [];
            for (var t in tabs) {
                if (tabs.hasOwnProperty(t)) {
                    _tabs.push({
                        id: tabs[t].id,
                        url: tabs[t].url,
                        title: tabs[t].title,
                        windowId: tabs[t].windowId,
                        favIconUrl: tabs[t].favIconUrl
                    });
                }
            }
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

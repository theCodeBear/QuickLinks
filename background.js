// Listens for user entry after omnibox keyword "ql"
// and if entry matches a quicklink the browser gets routed there.
chrome.omnibox.onInputEntered.addListener(function(text, disposition) {
  chrome.storage.sync.get(null, function(items) {
    for (var item in items) {
      if (text === item) {
        chrome.tabs.update({'url': items[item]});
        break;
      }
    }
  });
});

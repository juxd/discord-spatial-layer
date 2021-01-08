chrome.browserAction.onClicked.addListener(tab => {
    // for the current tab, inject the "inject.js" file & execute it
    chrome.tabs.executeScript(tab.ib, {
        file: 'inject.bundle.js',
    })
})

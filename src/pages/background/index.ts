import reloadOnUpdate from "virtual:reload-on-update-in-background-script";

reloadOnUpdate("pages/background");

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate("pages/content/style.scss");

console.log(new Date(), "background loaded", process.env);

chrome.runtime.onInstalled.addListener(() => {
  console.log("onInstalled");

  chrome.commands.onCommand.addListener((command) => {
    console.log("Command:", command);
  });

  chrome.runtime.onMessage.addListener((request) => {
    console.log("Message:", request);
    if (request === "showOptions") {
      chrome.runtime.openOptionsPage();
    }
  });

  console.log("contextMenus.create");
  chrome.contextMenus.create({
    id: 'text-assist',
    title: 'Text Assist',
    type: 'normal',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(function (clickData) {
  console.log('menu clicked', clickData);

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    console.log('active tabs', tabs);
    tabs.forEach(tab => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['src/pages/content/index.js']
      });
      chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: [`assets/css/contentStyle${process.env['contentScriptCssKey']}.chunk.css`],
      });
    });
  });
});
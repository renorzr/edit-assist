import reloadOnUpdate from "virtual:reload-on-update-in-background-script";

reloadOnUpdate("pages/background");

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate("pages/content/style.scss");

console.log(new Date(), "background loaded");

chrome.commands.onCommand.addListener((command) => {
  console.log("Command:", command);
});

chrome.runtime.onMessage.addListener((request) => {
  console.log("Message:", request);
  if (request === "showOptions") {
    chrome.runtime.openOptionsPage();
  }
});
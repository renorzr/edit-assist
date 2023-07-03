import reloadOnUpdate from "virtual:reload-on-update-in-background-script";

reloadOnUpdate("pages/background");

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate("pages/content/style.scss");

console.log("background loaded");

console.log('chrome=', chrome.runtime.getManifest());
chrome.commands.onCommand.addListener((command) => {
  console.log("Command:", command);
});
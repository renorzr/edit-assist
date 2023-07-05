import packageJson from "./package.json";

/**
 * After changing, please reload the extension at `chrome://extensions`
 */
const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: 'Text Assist',
  version: packageJson.version,
  description: packageJson.description,
  options_page: "src/pages/options/index.html",
  default_locale: "en",
  permissions: [
    "storage",
    "activeTab",
    "contextMenus",
    "scripting",
  ],
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module",
  },
  commands: {
    toggle: {
      suggested_key: {
        default: "Ctrl+Shift+Y",
        mac: "Command+Shift+Y",
      },
      description: "Toggle feature",
    },
  },
  action: {
    default_icon: "icon-34.png",
  },
  icons: {
    "128": "icon-128.png",
  },
  devtools_page: "src/pages/devtools/index.html",
  web_accessible_resources: [
    {
      resources: [
        "assets/js/*.js",
        "assets/css/*.css",
        "icon-128.png",
        "icon-34.png",
      ],
      matches: ["*://*/*"],
    },
  ],
};

export default manifest;

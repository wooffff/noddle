const REPO_URL = "https://raw.githubusercontent.com/wooffff/noddle/master/noddle/manifest.json";

async function checkUpdate() {
  try {
    const response = await fetch(REPO_URL);
    if (!response.ok) return;
    
    const data = await response.json();
    const remoteVersion = data.version;
    const localVersion = chrome.runtime.getManifest().version;

    // check if remote version is higher than local version
    const isUpdateAvailable = remoteVersion.localeCompare(localVersion, undefined, { numeric: true }) > 0;

    if (isUpdateAvailable) {
      chrome.action.setBadgeText({ text: "⤓" });
      chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
    } else {
        // clear badge when up to date
        chrome.action.setBadgeText({ text: "" });
    }
  } catch (e) {
    console.log("Update check failed.");
  }
}

// check when installed or updated
chrome.runtime.onInstalled.addListener(() => {
  checkUpdate();
  chrome.alarms.create('versionCheck', { periodInMinutes: 30 }); // Check every hour
});

// check when the alarm triggers
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'versionCheck') checkUpdate();
});

// check when browser starts
chrome.runtime.onStartup.addListener(() => checkUpdate());
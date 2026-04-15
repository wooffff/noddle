// 1. Selectors
const hideWalkMe = document.getElementById('toggleWalkMe');
const hideNoDueCheck = document.getElementById('toggleHideNoDue');
const hideNotifPopup = document.getElementById('toggleUnreadNotifications');
const autoOpenCheck = document.getElementById('toggleAutoOpen');
const aliasCheck = document.getElementById('toggleAliases');
const backBtnCheck = document.getElementById('toggleBackButton');
const redirectCheck = document.getElementById('toggleRedirect');
const compactCheck = document.getElementById('toggleCompact');
const priorityCheck = document.getElementById('togglePriority');
const scrollBtnCheck = document.getElementById('toggleScrollBtn');
const folderBtnCheck = document.getElementById('toggleFolderBtn');

const updateNotice = document.getElementById('updateNotice');
const remoteVersionSpan = document.getElementById('remoteVersion');

const defaultSettings = {
    hideWalkMeActive: true,
    hideNoDueActive: true,
    hideNotifPopupActive: true,
    autoOpenActive: true,
    aliasActive: true,
    backBtnActive: true,
    redirectActive: true,
    compactActive: true,
    prioritizeClassesActive: true,
    scrollBtnActive: true,
    folderBtnActive: true
};

// by passing defaultSettings into .get(), Chrome will automatically use 
// these fallbacks if the user's storage is empty on a fresh install.
chrome.storage.sync.get(defaultSettings, (res) => {
    hideWalkMe.checked = res.hideWalkMeActive;
    hideNoDueCheck.checked = res.hideNoDueActive;
    hideNotifPopup.checked = res.hideNotifPopupActive;
    autoOpenCheck.checked = res.autoOpenActive;
    aliasCheck.checked = res.aliasActive;
    backBtnCheck.checked = res.backBtnActive;
    redirectCheck.checked = res.redirectActive;
    scrollBtnCheck.checked = res.scrollBtnActive;
    compactCheck.checked = res.compactActive;
    priorityCheck.checked = res.prioritizeClassesActive;
    folderBtnCheck.checked = res.folderBtnActive;

    // save default settings immediately upon load.
    chrome.storage.sync.set(res);
});

// save settings on change
hideWalkMe.addEventListener('change', () => chrome.storage.sync.set({ hideWalkMeActive: hideWalkMe.checked }));
hideNoDueCheck.addEventListener('change', () => chrome.storage.sync.set({ hideNoDueActive: hideNoDueCheck.checked }));
hideNotifPopup.addEventListener('change', () => chrome.storage.sync.set({ hideNotifPopupActive: hideNotifPopup.checked }));
autoOpenCheck.addEventListener('change', () => chrome.storage.sync.set({ autoOpenActive: autoOpenCheck.checked }));
aliasCheck.addEventListener('change', () => chrome.storage.sync.set({ aliasActive: aliasCheck.checked }));
backBtnCheck.addEventListener('change', () => chrome.storage.sync.set({ backBtnActive: backBtnCheck.checked }));
redirectCheck.addEventListener('change', () => chrome.storage.sync.set({ redirectActive: redirectCheck.checked }));
scrollBtnCheck.addEventListener('change', () => chrome.storage.sync.set({ scrollBtnActive: scrollBtnCheck.checked }));
compactCheck.addEventListener('change', () => chrome.storage.sync.set({ compactActive: compactCheck.checked }));
priorityCheck.addEventListener('change', () => chrome.storage.sync.set({ prioritizeClassesActive: priorityCheck.checked }));
folderBtnCheck.addEventListener('change', () => chrome.storage.sync.set({ folderBtnActive: folderBtnCheck.checked }));

// checks for updates
const REPO_URL = "https://raw.githubusercontent.com/wooffff/noddle/master/noddle/manifest.json";

async function checkVersion() {
  try {
    const response = await fetch(REPO_URL);
    if (!response.ok) return; // exit if 404
    const data = await response.json();
    const remoteVersion = data.version;
    const localVersion = chrome.runtime.getManifest().version;

    if (remoteVersion.localeCompare(localVersion, undefined, { numeric: true }) > 0) {
      updateNotice.style.display = 'block';
      remoteVersionSpan.textContent = remoteVersion;
    }
  } catch (e) {
    console.log("Update check failed.");
  }
}

checkVersion();
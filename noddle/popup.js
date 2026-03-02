const walkMeCheck = document.getElementById('toggleWalkMe');
const autoOpenCheck = document.getElementById('toggleAutoOpen');
const aliasCheck = document.getElementById('toggleAliases');
const redirectCheck = document.getElementById('toggleRedirect');
const hideNoDueCheck = document.getElementById('toggleHideNoDue');

// Add 'hideNoDueActive' to the fetch array
chrome.storage.sync.get(['walkMeActive', 'autoOpenActive', 'aliasActive', 'redirectActive', 'hideNoDueActive'], (res) => {
  walkMeCheck.checked = res.walkMeActive !== false;
  autoOpenCheck.checked = res.autoOpenActive !== false;
  aliasCheck.checked = res.aliasActive !== false;
  redirectCheck.checked = res.redirectActive !== false;
  hideNoDueCheck.checked = res.hideNoDueActive !== false;
});

walkMeCheck.addEventListener('change', () => chrome.storage.sync.set({ walkMeActive: walkMeCheck.checked }));
autoOpenCheck.addEventListener('change', () => chrome.storage.sync.set({ autoOpenActive: autoOpenCheck.checked }));
aliasCheck.addEventListener('change', () => chrome.storage.sync.set({ aliasActive: aliasCheck.checked }));
redirectCheck.addEventListener('change', () => chrome.storage.sync.set({ redirectActive: redirectCheck.checked }));
hideNoDueCheck.addEventListener('change', () => chrome.storage.sync.set({ hideNoDueActive: hideNoDueCheck.checked }));
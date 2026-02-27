const walkMeCheck = document.getElementById('toggleWalkMe');
const autoOpenCheck = document.getElementById('toggleAutoOpen');
const aliasCheck = document.getElementById('toggleAliases');
const redirectCheck = document.getElementById('toggleRedirect');

chrome.storage.sync.get(['walkMeActive', 'autoOpenActive', 'aliasActive', 'redirectActive'], (res) => {
  walkMeCheck.checked = res.walkMeActive !== false;
  autoOpenCheck.checked = res.autoOpenActive !== false;
  aliasCheck.checked = res.aliasActive !== false;
  redirectCheck.checked = res.redirectActive !== false;
});

walkMeCheck.addEventListener('change', () => chrome.storage.sync.set({ walkMeActive: walkMeCheck.checked }));
autoOpenCheck.addEventListener('change', () => chrome.storage.sync.set({ autoOpenActive: autoOpenCheck.checked }));
aliasCheck.addEventListener('change', () => chrome.storage.sync.set({ aliasActive: aliasCheck.checked }));
redirectCheck.addEventListener('change', () => chrome.storage.sync.set({ redirectActive: redirectCheck.checked }));
const MENU_ID = 'lihkg-like-dark-mode-toggle';

function createMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: '切換 LIHKG Dark Mode 配色',
      contexts: ['all']
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  createMenu();
});

chrome.runtime.onStartup.addListener(() => {
  createMenu();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab?.id) {
    return;
  }

  chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_LIHKG_DARK_MODE' }, () => {
    void chrome.runtime.lastError;
  });
});

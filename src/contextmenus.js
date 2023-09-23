const ContextMenus = {
  _ids: {
    open: 'open',
  },

  init: async function() {
    await browser.menus.create({
      id: ContextMenus._ids.open,
      title: 'Open notes',
      contexts: ['page'],
      visible: false,
    });

    if (!browser.menus.onShown.hasListener(ContextMenus._onShown)) {
      browser.menus.onShown.addListener(ContextMenus._onShown);
    }

    if (!browser.menus.onClicked.hasListener(ContextMenus._onClicked)) {
      browser.menus.onClicked.addListener(ContextMenus._onClicked);
    }
  },

  _onShown: async function(info, tab) {
    await browser.menus.update(ContextMenus._ids.open, {visible: ['about:newtab', 'about:privatebrowsing'].includes(tab.url)});
    await browser.menus.refresh();
  },

  _onClicked: async function(info, tab) {
    if (info.menuItemId === ContextMenus._ids.open) {
      await browser.tabs.update(tab.id, {url: browser.runtime.getURL(`/src/page/index.html`)});
    }
  },
};
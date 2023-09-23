const Files = {
  _types: {
    json: {filetype: '.json', mime: 'application/json'},
    text: {filetype: '.txt', mime: 'text/plain'},
  },

  download: function(filename, type, contents) {
    return new Promise(async (resolve) => {
      const tab = (await browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT}))[0];

      const typeData = Files._types[type];
      const file = new File([contents], '', {type: typeData.mime});
      const url = URL.createObjectURL(file);

      const onFinish = () => {
        browser.downloads.onChanged.removeListener(listener);
        URL.revokeObjectURL(url);
        resolve();
      };

      const listener = (delta) => {
        if (delta.id === id && delta.state.current === 'complete') {
          onFinish();
        }
      };
      browser.downloads.onChanged.addListener(listener);

      let id = null;
      browser.downloads.download({
        url: url,
        filename: `${filename}${typeData.filetype}`,
        saveAs: true,
        conflictAction: 'uniquify',
        incognito: tab.incognito,
      }).then((_id) => id = _id, () => onFinish());
    });
  },
};
const Background = {
  main: async function() {
    await Communication.init();
    await ContextMenus.init();
  },
};

Background.main();
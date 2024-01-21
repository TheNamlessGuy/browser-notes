const BackgroundPage = {
  _port: null,

  init: function() {
    BackgroundPage._port = browser.runtime.connect();
  },

  send: function(action, extras = {}) {
    return new Promise((resolve) => {
      const listener = (response) => {
        if (response.response === action) {
          BackgroundPage._port.onMessage.removeListener(listener);
          resolve(response);
        }
      };

      BackgroundPage._port.onMessage.addListener(listener);
      BackgroundPage._port.postMessage({action: action, ...JSON.parse(JSON.stringify(extras))});
    });
  },

  Files: {
    export: async function(filename, type, contents) {
      await BackgroundPage.send('export', {filename, type, contents});
    },
  },
};

const Error = {
  init: function() { document.getElementById('error').getElementsByClassName('clear')[0].addEventListener('click', () => Error.clear()); },
  clear: function() {
    document.getElementById('error').classList.add('hidden');
    document.body.classList.remove('error');
  },

  set: function(msg) {
    const element = document.getElementById('error');
    element.getElementsByClassName('msg')[0].innerText = msg;
    element.title = msg;
    element.classList.remove('hidden');
    document.body.classList.add('error');
  },
};

const Type = {
  init: function() {
    Type.element.addEventListener('change', (e) => {
      Array.from(document.getElementsByClassName('optional-options')).forEach(x => x.classList.add('hidden'));
      const element = document.getElementById(`${e.target.value}-options`);
      if (element != null) {
        element.classList.remove('hidden');
      }
    });

    document.getElementById('json-expand').addEventListener('click', Type.json.expand);
    document.getElementById('json-collapse').addEventListener('click', Type.json.collapse);
  },

  _element: null,
  get element() {
    if (Type._element == null) { Type._element = document.getElementById('type'); }
    return Type._element;
  },

  get value() { return Type.element.value; },

  json: {
    _base: function(stringify) {
      Error.clear();

      let json;
      try {
        json = JSON.parse(Note.value);
      } catch(e) {
        Error.set("Couldn't parse note as JSON");
        console.error(e);
        return;
      }

      Note.value = stringify(json);
    },

    expand: function() { Type.json._base((json) => JSON.stringify(json, null, 2)); },
    collapse: function() { Type.json._base((json) => JSON.stringify(json)); },
  }
};

const Note = {
  _element: null,
  get element() {
    if (Note._element == null) { Note._element = document.getElementById('note'); }
    return Note._element;
  },

  get value() { return Note.element.innerText.trim(); },
  set value(value) {
    value = value.replaceAll('<', '&lt;');
    value = value.replaceAll('>', '&gt;');

    Note.element.innerText = value;
  },
};

const Title = {
  init: function() {
    Title.element.addEventListener('input', () => document.title = Title.value === '' ? 'Notes' : `Notes: ${Title.value}`);
  },

  _element: null,
  get element() {
    if (Title._element == null) { Title._element = document.getElementById('title'); }
    return Title._element;
  },

  get value() { return Title.element.value; },
};

function exportFile() {
  let filename = Title.value;
  if (filename === '') {
    const date = new Date();
    const display = (num, size = 2) => num.toString().padStart(size, '0');
    filename = `Note - ${display(date.getFullYear(), 4)}-${display(date.getMonth() + 1)}-${display(date.getDate())} ${display(date.getHours())}-${display(date.getMinutes())}-${display(date.getSeconds())}`;
  } else {
    filename = `Note - ${filename}`;
  }

  const content = Note.value;
  const type = Type.value;

  void BackgroundPage.Files.export(filename, type, content);
}

window.addEventListener('DOMContentLoaded', () => {
  Error.init();
  BackgroundPage.init();
  Type.init();
  Title.init();

  document.getElementById('export').addEventListener('click', exportFile);
  document.getElementById('toggle-bg-pattern').addEventListener('click', () => document.body.classList.toggle('pattern'));
  document.getElementById('toggle-spellcheck').addEventListener('click', () => Note.element.setAttribute('spellcheck', Note.element.getAttribute('spellcheck') === 'true' ? 'false' : 'true'));

  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 's' && e.ctrlKey) {
      exportFile();
      e.stopPropagation();
      e.preventDefault();
    }
  }, true);
});
const Error = {
  init: function() { document.getElementById('error').getElementsByClassName('clear')[0].addEventListener('click', () => Error.clear()); },
  clear: function() { document.getElementById('error').classList.add('hidden'); },
  set: function(msg) {
    const element = document.getElementById('error');
    element.getElementsByClassName('msg')[0].innerText = msg ?? '';
    element.classList.remove('hidden');
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

  get value() { return Note.element.innerText; },
  set value(value) {
    value = value.replaceAll('<', '&lt;');
    value = value.replaceAll('>', '&gt;');

    Note.element.innerText = value;
  },
};

window.addEventListener('DOMContentLoaded', () => {
  Error.init();
  Type.init();

  document.getElementById('title').addEventListener('input', (e) => document.title = e.target.value === '' ? 'Notes' : `Notes: ${e.target.value}`);
});
// Electron Renderer Process — Browser target (no Node.js globals)
// Runs in Chromium WebContents — accesses Electron APIs only via contextBridge/preload

import React from 'react';
import { createRoot } from 'react-dom/client';

const { electronAPI } = window;

function App() {
  const [notes, setNotes] = React.useState([]);
  const [current, setCurrent] = React.useState('');
  const [noteId, setNoteId] = React.useState('note-1');

  React.useEffect(() => {
    electronAPI.listNotes().then(setNotes);
  }, []);

  const save = async () => {
    await electronAPI.saveNote(noteId, current);
    const updated = await electronAPI.listNotes();
    setNotes(updated);
  };

  const load = async (id) => {
    const content = await electronAPI.loadNote(id);
    setCurrent(content || '');
    setNoteId(id);
  };

  return React.createElement('div', { className: 'app' },
    React.createElement('aside', { className: 'sidebar' },
      notes.map(id =>
        React.createElement('button', { key: id, onClick: () => load(id) }, id)
      )
    ),
    React.createElement('main', { className: 'editor' },
      React.createElement('textarea', {
        value: current,
        onChange: e => setCurrent(e.target.value),
        placeholder: 'Start typing your note...'
      }),
      React.createElement('button', { onClick: save }, 'Save')
    )
  );
}

const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App));

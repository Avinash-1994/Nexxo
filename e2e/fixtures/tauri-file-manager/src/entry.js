import { invoke } from '@tauri-apps/api';
import React from 'react';
import { createRoot } from 'react-dom/client';

export function runCommand() {
    invoke('my_custom_command').then(res => console.log(res));
}

const App = () => {
    runCommand();
    return React.createElement('div', null, 'Tauri Desktop View with React');
};

if (typeof document !== 'undefined') {
    const root = createRoot(document.getElementById('root'));
    root.render(React.createElement(App));
}

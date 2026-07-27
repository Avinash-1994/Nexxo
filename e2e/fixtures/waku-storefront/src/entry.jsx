import React from 'react';
import { createRoot } from 'react-dom/client';

// Mock waku-like router structure for the real esbuild bundle
export const serve = (Component) => {
  return function WakuProvider() {
     return React.createElement(Component, null);
  }
};

export const defineEntries = () => {
  return {
     '/': () => React.createElement('div', null, 'Waku')
  };
};

const App = () => React.createElement('div', null, 'Waku Frontend');

const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App));

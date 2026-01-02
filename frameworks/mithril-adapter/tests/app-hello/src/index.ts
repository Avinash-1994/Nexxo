import m from 'mithril';

const App = {
    view: () => m('div', { id: 'app' }, 'Hello Mithril')
};

m.mount(document.body, App);

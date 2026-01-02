import m from 'mithril';

const App = {
    view: () => m('div', {
        onclick: () => import('./lazy').then(module => console.log(module.message))
    }, 'Load Lazy')
};

m.mount(document.body, App);

import m from 'mithril';

const App = {
    count: 0,
    message: 'Hello from Urja + Mithril!',

    view: () => {
        return m('.template-root', [
            m('h1', 'Mithril.js Starter'),
            m('p', App.message),
            m('button', {
                onclick: () => App.count++
            }, `Count: ${App.count}`),
            m('img.logo', {
                src: '/logo.svg',
                alt: 'Logo'
            })
        ]);
    }
};

export default App;

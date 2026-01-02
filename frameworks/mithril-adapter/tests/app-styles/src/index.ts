import m from 'mithril';
import './style.css';
import logo from './logo.png';

const App = {
    view: () => m('img', { src: logo, class: 'logo' })
};

m.mount(document.body, App);

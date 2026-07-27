import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';
import App from './App.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./pages/Home.vue') },
    { path: '/products', component: () => import('./pages/Products.vue') },
    { path: '/cart', component: () => import('./pages/Cart.vue') },
    { path: '/login', component: () => import('./pages/Login.vue') },
  ]
});
const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');

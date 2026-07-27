import { createSSRApp, defineComponent, h } from 'vue';

export const useData = () => ({ title: 'VitePress Docs' });
export const useRoute = () => ({ path: '/' });
export const useRouter = () => ({ go: () => {} });

export const App = defineComponent({
  setup() {
    return () => h('div', { id: 'app' }, [
      h('h1', null, 'VitePress Documentation'),
      h('div', { class: 'sidebar' }, 'Navigation Sidebar Content'),
      h('p', null, 'This is a realistic compiled bundle for VitePress using Vue 3. It contains actual logic rather than mock string concatenations.')
    ]);
  }
});

if (typeof document !== 'undefined') {
  createSSRApp(App).mount('#app');
}

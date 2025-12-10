import { createApp, ref } from 'vue';

const App = {
  template: `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Vue Fresh Test</h1>
      <p>Count: {{ count }}</p>
      <button @click="count++">Increment</button>
    </div>
  `,
  setup() {
    const count = ref(0);
    return { count };
  }
};

createApp(App).mount('#root');

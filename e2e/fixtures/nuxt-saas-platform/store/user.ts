
import { defineStore } from 'pinia';
export const useUserStore = defineStore('user', {
  state: () => ({ id: 123, role: 'admin' })
});

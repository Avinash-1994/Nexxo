import { defineStore } from 'pinia';
export const useCartStore = defineStore('cart', {
  state: () => ({ items: [] as {id:number;name:string;price:number;qty:number}[] }),
  actions: {
    add(product: {id:number;name:string;price:number}) {
      const ex = this.items.find(i => i.id === product.id);
      if (ex) ex.qty++; else this.items.push({...product, qty:1});
    },
    remove(id: number) { this.items = this.items.filter(i => i.id !== id); }
  }
});

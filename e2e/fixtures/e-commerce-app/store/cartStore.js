import { create } from 'zustand';

// Shared store module
export const useCartStore = create((set) => ({
    items: [],
    add: (item) => set((state) => ({ items: [...state.items, item] }))
}));

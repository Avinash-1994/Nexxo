import React from 'react';
import { createRoot } from 'react-dom/client';
import { create } from 'zustand';
import axios from 'axios';
import { format } from 'date-fns';
import { debounce } from 'lodash-es';
import { motion } from 'framer-motion';

const useStore = create((set) => ({ count: 0, inc: () => set((state) => ({ count: state.count + 1 })) }));

function App() {
  const { count, inc } = useStore();
  const date = format(new Date(), 'yyyy-MM-dd');
  const handleClick = debounce(() => { inc(); axios.get('/api').catch(()=>console.log('axios error')); }, 100);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>Heavy Deps App</h1>
      <p>Date: {date}</p>
      <button onClick={handleClick}>Count: {count}</button>
    </motion.div>
  );
}

createRoot(document.getElementById('root')).render(<App />);

import React from 'react';
import { createRoot } from 'react-dom/client';
import HeaderBar from './HeaderBar';

createRoot(document.getElementById('root')!).render(<HeaderBar cartCount={0} />);

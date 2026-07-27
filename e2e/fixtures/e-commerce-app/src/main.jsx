import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { useCartStore, useUserStore } from './store/index.js';
import { format, parseISO, differenceInDays } from 'date-fns';

const routes = [];
for (let i = 1; i <= 40; i++) {
  routes.push(lazy(() => import(`../routes/Route${i}.jsx`)));
}

function App() {
  const [routeIdx, setRouteIdx] = React.useState(1);
  const cart = useCartStore(s => s.items);
  const user = useUserStore(s => s.user);

  const parsed = parseISO('2023-01-01');
  const formatted = format(parsed, 'yyyy-MM-dd');
  const diff = differenceInDays(new Date(), parsed);

  const CurrentRoute = routes[routeIdx - 1];
  return (
    <div>
      <nav>
        {routes.map((_, idx) => (
          <button key={idx} onClick={() => setRouteIdx(idx + 1)}>Route {idx + 1}</button>
        ))}
      </nav>
      <p>{formatted} {diff}</p>
      <Suspense fallback={<div>Loading...</div>}>
        <CurrentRoute />
      </Suspense>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);

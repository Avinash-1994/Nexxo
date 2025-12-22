import { Outlet } from '@remix-run/react';

export default function Root() {
  return (
    <html>
      <body>
        <Outlet />
      </body>
    </html>
  );
}

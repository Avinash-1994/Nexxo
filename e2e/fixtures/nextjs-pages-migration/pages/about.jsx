import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main>
      <h1>About</h1>
      <p>This is a Pages Router app accelerated by Lunx SWC.</p>
      <Link href="/">← Back home</Link>
    </main>
  );
}

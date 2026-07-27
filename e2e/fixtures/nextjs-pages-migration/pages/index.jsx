import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage({ posts }) {
  return (
    <>
      <Head>
        <title>Notes App</title>
        <meta name="description" content="A simple notes app" />
      </Head>
      <main>
        <h1>My Notes</h1>
        <Link href="/about">About</Link>
        <Image src="/logo.png" alt="Logo" width={120} height={40} />
        <ul>
          {posts.map(p => (
            <li key={p.id}>
              <Link href={`/posts/${p.id}`}>{p.title}</Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}

export async function getServerSideProps() {
  const posts = [
    { id: 1, title: 'First note' },
    { id: 2, title: 'Second note' },
    { id: 3, title: 'Third note' },
  ];
  return { props: { posts } };
}

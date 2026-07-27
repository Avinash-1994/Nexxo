import React from 'react';

export default function PostPage({ post }) {
  return (
    <main>
      <h1>{post.title}</h1>
      <p>Post ID: {post.id}</p>
    </main>
  );
}

export async function getServerSideProps({ params }) {
  return {
    props: {
      post: { id: params.id, title: `Note ${params.id}` }
    }
  };
}

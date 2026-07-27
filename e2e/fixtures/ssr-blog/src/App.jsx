import React from 'react';

export default function App({ url }) {
    // Generate 50 posts mock
    const posts = Array.from({ length: 50 }).map((_, i) => ({ id: i, title: `Post ${i + 1}` }));

    return (
        <div>
            <h1>Lunx SSR Web Blog</h1>
            <p>Current Path: <strong data-testid="url-display">{url}</strong></p>
            <ul>
                {posts.map(p => <li key={p.id}>{p.title}</li>)}
            </ul>
        </div>
    );
}


export default function HomePage() {
    return (
        <main>
            <h2>Welcome to the Future of SSR</h2>
            <p>This page is powered by <strong>Lunx Streaming Engine</strong>.</p>

            <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: '#161b22',
                borderRadius: '8px',
                border: '1px solid #30363d'
            }}>
                <h3>Performance Stats</h3>
                <ul>
                    <li>Cold Start: &lt;100ms</li>
                    <li>Bundle Size: 20% smaller than Vite</li>
                    <li>HMR: Sub-10ms</li>
                </ul>
            </div>
        </main>
    );
}


export default function RootLayout({ children }: { children: any }) {
    return (
        <html lang="en">
            <head>
                <title>Lunx + Next.js Starter</title>
            </head>
            <body style={{
                background: '#0d1117',
                color: '#c9d1d9',
                fontFamily: 'system-ui',
                margin: 0,
                padding: '2rem'
            }}>
                <nav style={{ marginBottom: '2rem', borderBottom: '1px solid #30363d', paddingBottom: '1rem' }}>
                    <h1 style={{ color: '#58a6ff' }}>Lunx</h1>
                </nav>
                {children}
            </body>
        </html>
    );
}

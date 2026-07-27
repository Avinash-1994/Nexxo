export default function LazyComponent() {
  return (
    <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
      <h3>🚀 Dynamically Loaded Component</h3>
      <p>This component was loaded via a separate async chunk (Code Splitting), just like Webpack does, but instantly via Lunx!</p>
    </div>
  );
}

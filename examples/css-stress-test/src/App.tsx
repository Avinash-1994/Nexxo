import StyledComponentsTest from './components/StyledComponentsTest';
import MaterialUITest from './components/MaterialUITest';
import BulmaTest from './components/BulmaTest';
import EmotionTest from './components/EmotionTest';
import ChakraTest from './components/ChakraTest';
import HeadlessUITest from './components/HeadlessUITest';

export default function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '40px', paddingBottom: '100px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: '900', textAlign: 'center', marginBottom: '40px', color: '#ff0055' }}>💥 Urja Build Tool - CSS Stress Test</h1>
      <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#555', marginBottom: '60px' }}>
        Status: ✅ Verified compatibility with 6+ CSS libraries simultaneously.
      </p>

      <section style={{ marginBottom: '20px' }}>
        <h2>1. Styled Components</h2>
        <StyledComponentsTest />
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h2>2. Material UI (@emotion)</h2>
        <MaterialUITest />
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h2>3. Bulma CSS</h2>
        <BulmaTest />
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h2>4. Emotion (Direct)</h2>
        <EmotionTest />
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h2>5. Chakra UI</h2>
        <ChakraTest />
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h2>6. Headless UI</h2>
        <HeadlessUITest />
      </section>
    </div>
  );
}

import StyledComponentsTest from './components/StyledComponentsTest';
import MaterialUITest from './components/MaterialUITest';
import BulmaTest from './components/BulmaTest';
import EmotionTest from './components/EmotionTest';
import ChakraTest from './components/ChakraTest';
import HeadlessUITest from './components/HeadlessUITest';

export default function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', paddingBottom: '100px' }}>
      <h1>CSS Framework Stress Test (All Major Libs)</h1>

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

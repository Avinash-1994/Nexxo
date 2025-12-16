import Counter from '../components/Counter';
import TodoList from '../components/TodoList';
import { getEnvInfo } from '../utils/helpers';

export default function Home() {
  const envInfo = getEnvInfo();

  return (
    <div className="page">
      <div className="hero">
        <h2>Welcome to React Complete Test</h2>
        <p>Comprehensive testing of Urja Build Tool with React + TypeScript</p>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <h4>🎯 Build Pipeline Features</h4>
          <ul>
            <li>✅ TypeScript Compilation</li>
            <li>✅ JSX/TSX Transform</li>
            <li>✅ Hot Module Replacement</li>
            <li>✅ React Router</li>
            <li>✅ Lazy Loading</li>
            <li>✅ Code Splitting</li>
            <li>✅ CSS Imports</li>
            <li>✅ Asset Imports</li>
            <li>✅ Environment Variables</li>
            <li>✅ Production Build</li>
          </ul>
        </div>

        <div className="info-card">
          <h4>📊 Environment Info</h4>
          <pre>{JSON.stringify(envInfo, null, 2)}</pre>
        </div>
      </div>

      <div className="components-grid">
        <Counter />
        <TodoList />
      </div>
    </div>
  );
}

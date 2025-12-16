import mockData from '../data/mock.json';

export default function About() {
  return (
    <div className="page">
      <h2>About This Project</h2>
      
      <div className="about-content">
        <section>
          <h3>Purpose</h3>
          <p>
            This is a comprehensive React project designed to test ALL features of the Urja build tool.
            It includes TypeScript, routing, lazy loading, state management, and more.
          </p>
        </section>

        <section>
          <h3>Features Tested</h3>
          <div className="features-grid">
            {mockData.features.map((feature, index) => (
              <div key={index} className="feature-card">
                <h4>{feature.name}</h4>
                <p>{feature.description}</p>
                <span className={`status ${feature.status}`}>{feature.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3>JSON Import Test</h3>
          <p>Successfully imported and displayed data from mock.json</p>
          <pre>{JSON.stringify(mockData, null, 2)}</pre>
        </section>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="container py-5">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h1 className="h3 mb-0"><i className="bi bi-bootstrap-fill me-2"></i>Bootstrap Test</h1>
        </div>
        <div className="card-body">
          <p className="lead">Testing Bootstrap 5 with Urja Build Tool.</p>
          <div className="alert alert-success" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            Bootstrap styles are working!
          </div>
          <button className="btn btn-primary me-2">Primary Button</button>
          <button className="btn btn-outline-secondary">Secondary</button>
        </div>
      </div>
    </div>
  );
}

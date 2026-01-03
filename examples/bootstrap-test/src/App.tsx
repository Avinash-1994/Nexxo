export default function App() {
  return (
    <div className="container py-5">
      <div className="card shadow-lg border-primary">
        <div className="card-header bg-primary text-white d-flex align-items-center">
          <i className="bi bi-bootstrap-fill fs-1 me-3"></i>
          <div>
            <h1 className="h2 mb-0">Urja Build Tool - Bootstrap 5 Test</h1>
            <small>Framework: <strong>Bootstrap 5.3 + icons</strong></small>
          </div>
        </div>
        <div className="card-body">
          <p className="lead">Verifying CSS pre-bundling and icon font resolution.</p>
          <div className="alert alert-info d-flex align-items-center" role="alert">
            <i className="bi bi-info-circle-fill me-2"></i>
            <div>Status: ✅ Styles & Font Icons Verified</div>
          </div>
          <div className="d-grid gap-2 d-md-block">
            <button className="btn btn-primary btn-lg me-md-2" type="button">Primary Action</button>
            <button className="btn btn-outline-dark btn-lg" type="button">Outline View</button>
          </div>
        </div>
        <div className="card-footer text-muted">
          Rendered via Urja Universal Transformer
        </div>
      </div>
    </div>
  );
}

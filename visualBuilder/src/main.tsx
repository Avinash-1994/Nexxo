// Shim entry so the build CLI's default entry (src/main.tsx) resolves.
// This simply re-exports the existing `main.jsx` implementation.
import './main.jsx';

export default undefined;

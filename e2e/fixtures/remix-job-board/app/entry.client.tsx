import React from "react";
import { hydrateRoot } from "react-dom/client";

function App() {
  return React.createElement("div", null, "Hydrated Remix App");
}

hydrateRoot(document, React.createElement(App));

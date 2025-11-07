import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/inter";
import App from "./App.tsx";
import "./style.css";
import invariant from "tiny-invariant";

const rootElement = document.querySelector("#root");
invariant(rootElement !== null, "Root element not found");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

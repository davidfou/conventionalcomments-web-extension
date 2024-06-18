import React from "react";
import ReactDOM from "react-dom/client";

const rootEl = document.getElementById("root");
if (rootEl === null) {
  throw new Error("Root element not found");
}
const root = ReactDOM.createRoot(rootEl);

root.render(
  <React.StrictMode>
    <div>Hello</div>
  </React.StrictMode>,
);

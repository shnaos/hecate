import { PopupShell } from "./App.js";

const React = window.React;
const ReactDOM = window.ReactDOM;
const mountNode = document.getElementById("app");

if (!mountNode) {
  throw new Error("Hecate popup mount node was not found.");
}

ReactDOM.createRoot(mountNode).render(React.createElement(PopupShell));

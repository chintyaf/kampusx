import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx"; // Tambahkan .jsx di belakangnya jika perlu
import "./index.css";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((reg) => {
                console.log('[Service Worker] Registered successfully:', reg.scope);
            })
            .catch((err) => {
                console.error('[Service Worker] Registration failed:', err);
            });
    });
}

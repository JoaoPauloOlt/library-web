import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./styles/catalog.css";
import "./styles/loans.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AuthProvider>
            <App />
            <Toaster position="top-right" />
        </AuthProvider>
    </React.StrictMode>
);

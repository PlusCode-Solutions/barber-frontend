import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { TenantProvider } from "./context/TenantContext";
import { AuthProvider } from "./context/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <TenantProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </TenantProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

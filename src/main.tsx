import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { HelmetProvider } from 'react-helmet-async';

import App from "./App";
import { TenantProvider } from "./context/TenantContext";
import { AuthProvider } from "./context/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          <TenantProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </TenantProvider>
        </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);

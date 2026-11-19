import React from "react";
import type { ErrorInfo, ReactNode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

class AppErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("TABLEX render error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f6f7f2", color: "#203329", fontFamily: "sans-serif" }}>
          <section style={{ maxWidth: 480, textAlign: "center", background: "#fff", border: "1px solid #e4e9df", borderRadius: 18, padding: 32 }}>
            <h1 style={{ marginTop: 0 }}>TABLEX needs a refresh</h1>
            <p style={{ lineHeight: 1.7, color: "#68776d" }}>Something went wrong while loading this page. Refresh to try again. Your saved demo data is not affected.</p>
            <button onClick={() => window.location.reload()} style={{ border: 0, borderRadius: 10, padding: "13px 20px", background: "#203329", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Refresh TABLEX</button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <AppErrorBoundary><App /></AppErrorBoundary>
    </React.StrictMode>
  );
}
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary";

console.log('🚀 Ravi\'s Tuition App starting...');

try {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error('Root element not found');
  }
  
  console.log('✅ Root element found, rendering app...');
  
  ReactDOM.createRoot(root).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  
  console.log('✅ App rendered successfully');
} catch (error) {
  console.error('❌ Failed to start app:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: system-ui;">
      <h1 style="color: #B91C1C;">App Failed to Load</h1>
      <p style="color: #595959;">Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
      <p style="color: #595959;">Please check the browser console for details.</p>
    </div>
  `;
}

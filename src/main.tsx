import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

console.log('🚀 Ravi\'s Tuition App starting...');

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

try {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error('Root element not found');
  }
  
  console.log('✅ Root element found, creating React root...');
  
  const reactRoot = ReactDOM.createRoot(root);
  console.log('✅ React root created, rendering App...');
  
  reactRoot.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('✅ App render initiated successfully');
} catch (error) {
  console.error('❌ Failed to start app:', error);
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; font-family: system-ui; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #B91C1C; font-size: 24px; margin-bottom: 16px;">⚠️ App Failed to Load</h1>
        <p style="color: #595959; margin-bottom: 8px;"><strong>Error:</strong> ${error instanceof Error ? error.message : 'Unknown error'}</p>
        <p style="color: #595959; margin-bottom: 16px;">Please check the browser console (F12) for more details.</p>
        <button onclick="window.location.reload()" style="padding: 12px 24px; background: #17528C; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
          Reload Page
        </button>
      </div>
    `;
  }
}

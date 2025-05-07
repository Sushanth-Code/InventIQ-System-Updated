// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';// ✔️ Relative path, case-sensitive// Your main App component
import './index.css';   // Your main CSS file with Tailwind directives

// Find the root element in your public/index.html
const rootElement = document.getElementById('root');

// Ensure the root element exists before rendering
if (rootElement) {
  // Create a React root
  const root = ReactDOM.createRoot(rootElement);

  // Render the App component within StrictMode for development checks
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element. Make sure your public/index.html has a <div id='root'>.");
}
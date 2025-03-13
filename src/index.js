import React from 'react';
import ReactDOM from 'react-dom/client'; // For React 18+
import { BrowserRouter as Router } from "react-router-dom"; // Import Router
import App from './App';
import './index.css'; // Optional: If you have global styles

// Get the root DOM element
const rootElement = document.getElementById('root');

// Check if the root element exists
if (!rootElement) {
    throw new Error("Failed to find the root element. Ensure there's a <div id='root'></div> in your index.html.");
}

// Create a root for React to render into
const root = ReactDOM.createRoot(rootElement);

// Render the app
root.render(
    <Router>
        <App />
    </Router>
);
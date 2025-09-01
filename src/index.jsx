import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import './scss/main.scss'; // Importiere die SCSS-Datei

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { CurrencyProvider } from './context/CurrencyContext';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <CurrencyProvider>
      <App />
    </CurrencyProvider>
  </BrowserRouter>
);

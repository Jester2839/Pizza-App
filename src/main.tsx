import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { CartProvider } from './hooks/useCart';
import { ModalProvider } from './hooks/useAlert';
import './scss/main.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <ModalProvider>
          <App />
        </ModalProvider>
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);

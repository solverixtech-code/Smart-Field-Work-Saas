import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import store from './store';
import AppRouter from './AppRouter';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <Toaster position="top-right" richColors closeButton duration={3500} />
      <AppRouter />
    </Provider>
  </React.StrictMode>,
);

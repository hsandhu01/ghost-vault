import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { DownloadPage } from './DownloadPage.tsx';
import './index.css';

const path = window.location.pathname;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* If URL starts with /files/, show Download Page. Otherwise show App. */}
    {path.startsWith('/files/') ? <DownloadPage /> : <App />}
  </React.StrictMode>,
);

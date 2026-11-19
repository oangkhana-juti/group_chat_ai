import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import './motion.css';
import { bootMotion } from './motion.js';

createRoot(document.getElementById('root')).render(<App />);
const stopMotion = bootMotion();
if (import.meta.hot) import.meta.hot.dispose(stopMotion);

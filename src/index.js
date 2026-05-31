import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css'; // Global styles for the application, including base typography and layout.
import App from './App';
import { QuizProvider } from './context/QuizContext'; // Context provider for managing quiz state globally.

/**
 * The main entry point for the React application.
 * It initializes the React root and renders the App component.
 *
 * The App component is wrapped with:
 * - React.StrictMode: A tool for highlighting potential problems in an application.
 *   It activates additional checks and warnings for its descendants during development.
 * - QuizProvider: A custom context provider that makes the quiz state and actions
 *   available to all components within the application tree. This is crucial for
 *   real-time score tracking and question management.
 */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* QuizProvider wraps the entire application to provide global state management for quizzes. */}
    <QuizProvider>
      {/* The main application component where routing and core layout are typically handled. */}
      <App />
    </QuizProvider>
  </React.StrictMode>
);
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QuizProvider } from './context/QuizContext';
import QuizPage from './pages/QuizPage';
import QuizCard from './components/QuizCard';
import { fetchQuizCategories } from './api/quizApi';
// import { getInterServiceData } from './api/interServiceApi'; // Acknowledge inter-service API for potential future use

import './App.css';

/**
 * Main application component for the Interactive Quiz Application.
 * Handles routing, initial data fetching (quiz categories), and provides
 * the QuizContext to the rest of the application.
 */
function App() {
  // State to store available quiz categories
  const [categories, setCategories] = useState([]);
  // State to manage loading status during API calls
  const [loading, setLoading] = useState(true);
  // State to store any error messages during data fetching
  const [error, setError] = useState(null);

  /**
   * useEffect hook to fetch quiz categories when the component mounts.
   * It handles loading, success, and error states.
   */
  useEffect(() => {
    const getCategories = async () => {
      try {
        setLoading(true); // Set loading to true before fetching
        setError(null);   // Clear any previous errors

        // Fetch categories from the quiz API
        const data = await fetchQuizCategories();
        setCategories(data); // Update state with fetched categories
      } catch (err) {
        console.error("Failed to fetch quiz categories:", err);
        setError("Failed to load quiz categories. Please try again later."); // Set error message
      } finally {
        setLoading(false); // Set loading to false after fetching (whether success or error)
      }
    };

    getCategories();

    // --- Cross-Project Context: Example of potential inter-service API usage ---
    // This section demonstrates how `interServiceApi` might be used in a real-world scenario,
    // e.g., to fetch user preferences or recommendations from other services.
    // For simplicity, it's commented out to keep App.js focused on quiz categories,
    // but its presence signifies awareness of the interconnected system.
    /*
    const fetchInterServiceInfo = async () => {
      try {
        // Example: Fetch user preferences from a hypothetical User Profile Service
        // or personalized recommendations from an E-commerce Product Catalog.
        const userPreferences = await getInterServiceData('/user-profile/preferences');
        console.log('Fetched user preferences from inter-service:', userPreferences);
        // Based on userPreferences, we could dynamically filter categories,
        // suggest quizzes, or adjust difficulty.
      } catch (err) {
        console.warn('Could not fetch inter-service data:', err.message);
        // Handle cases where inter-service data is not critical for core functionality
      }
    };
    fetchInterServiceInfo();
    */
    // --------------------------------------------------------------------------

  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Render a loading spinner and message while categories are being fetched
  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-spinner" aria-live="polite" aria-busy="true"></div>
        <p>Loading quiz categories...</p>
      </div>
    );
  }

  // Render an error message if fetching categories failed
  if (error) {
    return (
      <div className="app-container error-message" role="alert">
        <header className="app-header">
          <h1>Interactive Quiz Application</h1>
        </header>
        <p>{error}</p>
        <p>Please check your network connection or try refreshing the page.</p>
      </div>
    );
  }

  return (
    // BrowserRouter provides routing capabilities to the application
    <Router>
      {/* QuizProvider makes quiz-related state and functions available to all child components */}
      <QuizProvider>
        <div className="app-container">
          <header className="app-header">
            <h1>Interactive Quiz Application</h1>
            <nav className="app-nav">
              {/* Navigation links for the main app or potential links to other services */}
              <Link to="/" className="nav-link">Home</Link>
              {/* Example: Links to other services in the interconnected system */}
              {/* <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer" className="nav-link">Finance Tracker</a>
              <a href="http://localhost:3002" target="_blank" rel="noopener noreferrer" className="nav-link">E-commerce</a>
              <a href="http://localhost:3003" target="_blank" rel="noopener noreferrer" className="nav-link">Weather Dashboard</a> */}
            </nav>
          </header>

          <main className="app-main">
            {/* Routes define the different paths in the application */}
            <Routes>
              {/* Route for the landing page, displaying available quiz categories */}
              <Route
                path="/"
                element={
                  <section className="category-selection">
                    <h2>Select a Quiz Category</h2>
                    <div className="category-list">
                      {categories.length > 0 ? (
                        // Map through fetched categories and render a QuizCard for each
                        categories.map((category) => (
                          <Link to={`/quiz/${category.id}`} key={category.id} className="category-link" aria-label={`Start ${category.name} quiz`}>
                            <QuizCard
                              title={category.name}
                              description={category.description || `Test your knowledge in ${category.name}!`}
                              // Add any other props QuizCard might need, e.g., image, icon
                            />
                          </Link>
                        ))
                      ) : (
                        // Message if no categories are available
                        <p>No quiz categories available at the moment. Please check back later!</p>
                      )}
                    </div>
                  </section>
                }
              />
              {/* Route for the actual quiz page, dynamically loading based on category ID */}
              <Route path="/quiz/:categoryId" element={<QuizPage />} />

              {/* Catch-all route for any undefined paths (404 Not Found) */}
              <Route path="*" element={
                <div className="not-found">
                  <h2>404 - Page Not Found</h2>
                  <p>The page you are looking for does not exist.</p>
                  <Link to="/">Go to Home</Link>
                </div>
              } />
            </Routes>
          </main>

          <footer className="app-footer">
            <p>&copy; {new Date().getFullYear()} Interactive Quiz App. All rights reserved.</p>
            {/* Cross-Project Context: Explicit mention of other services */}
            <p>
              Part of the interconnected system including the <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer">Personal Finance Tracker</a>,
              the <a href="http://localhost:3002" target="_blank" rel="noopener noreferrer">E-commerce Product Catalog</a>, and the <a href="http://localhost:3003" target="_blank" rel="noopener noreferrer">Personalized Weather Dashboard</a>.
            </p>
          </footer>
        </div>
      </QuizProvider>
    </Router>
  );
}

export default App;
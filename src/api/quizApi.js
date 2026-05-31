const QUIZ_API_BASE_URL = process.env.REACT_APP_QUIZ_API_BASE_URL || 'http://localhost:3001/api/quiz';

/**
 * Helper function to handle API responses.
 * Throws an error if the response is not OK, parsing the error message from the response body if available.
 * @param {Response} response - The fetch API response object.
 * @returns {Promise<any>} - The JSON data from the response.
 * @throws {Error} - Throws an error with a descriptive message if the response status is not OK.
 */
async function handleApiResponse(response) {
  if (!response.ok) {
    let errorDetail = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.message) {
        errorDetail = errorData.message;
      } else if (errorData && typeof errorData === 'string') {
        errorDetail = errorData;
      }
    } catch (parseError) {
      // If JSON parsing fails, use the default error detail
      console.warn('Failed to parse error response as JSON:', parseError);
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

/**
 * Fetches all available quiz categories from the Quiz API.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of category objects.
 *                                      Each object typically contains `id` and `name`.
 * @throws {Error} - Throws an error if the API call fails or returns a non-OK status.
 */
export async function fetchCategories() {
  try {
    const response = await fetch(`${QUIZ_API_BASE_URL}/categories`);
    return await handleApiResponse(response);
  } catch (error) {
    console.error('quizApi: Error fetching quiz categories:', error.message);
    throw error; // Re-throw to allow calling components to handle it
  }
}

/**
 * Fetches quiz questions based on specified criteria.
 * @param {string} categoryId - The ID of the category to fetch questions from.
 * @param {string} difficulty - The difficulty level (e.g., 'easy', 'medium', 'hard').
 * @param {number} [limit=10] - The number of questions to fetch. Defaults to 10.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of question objects.
 *                                      Each object typically contains `id`, `questionText`, `options`, `correctAnswer`.
 * @throws {Error} - Throws an error if the API call fails or returns a non-OK status.
 */
export async function fetchQuestions(categoryId, difficulty, limit = 10) {
  try {
    const params = new URLSearchParams({
      categoryId,
      difficulty,
      limit: String(limit), // Ensure limit is a string for URLSearchParams
    });
    const response = await fetch(`${QUIZ_API_BASE_URL}/questions?${params.toString()}`);
    return await handleApiResponse(response);
  } catch (error) {
    console.error(`quizApi: Error fetching questions for category '${categoryId}', difficulty '${difficulty}':`, error.message);
    throw error;
  }
}

/**
 * Submits the user's quiz results to the API.
 * In a microservice architecture, this might trigger events or updates in other services,
 * e.g., updating user achievements in a 'Personal Finance Tracker' or 'E-commerce Product Catalog'
 * if gamification elements are shared.
 * @param {string} userId - The ID of the user submitting the results.
 * @param {string} quizId - The ID of the specific quiz instance completed.
 * @param {number} score - The user's final score for the quiz.
 * @param {Array<Object>} answers - An array of user's answers, e.g.,
 *                                   `[{ questionId: 'q1', selectedAnswer: 'A', isCorrect: true }]`.
 * @returns {Promise<Object>} - A promise that resolves to the submission confirmation object,
 *                               typically containing a `message` or `resultId`.
 * @throws {Error} - Throws an error if the API call fails or returns a non-OK status.
 */
export async function submitQuizResults(userId, quizId, score, answers) {
  try {
    const response = await fetch(`${QUIZ_API_BASE_URL}/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // In a real application, an Authorization header would likely be included here
        // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ userId, quizId, score, answers }),
    });
    return await handleApiResponse(response);
  } catch (error) {
    console.error(`quizApi: Error submitting quiz results for user '${userId}', quiz '${quizId}':`, error.message);
    throw error;
  }
}

/**
 * Fetches the leaderboard for a specific quiz category.
 * @param {string} categoryId - The ID of the category to fetch the leaderboard for.
 * @param {number} [limit=10] - The maximum number of entries to return in the leaderboard. Defaults to 10.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of leaderboard entries.
 *                                      Each entry typically contains `userId`, `username`, `score`, `timestamp`.
 * @throws {Error} - Throws an error if the API call fails or returns a non-OK status.
 */
export async function getLeaderboard(categoryId, limit = 10) {
  try {
    const params = new URLSearchParams({
      categoryId,
      limit: String(limit),
    });
    const response = await fetch(`${QUIZ_API_BASE_URL}/leaderboard?${params.toString()}`);
    return await handleApiResponse(response);
  } catch (error) {
    console.error(`quizApi: Error fetching leaderboard for category '${categoryId}':`, error.message);
    throw error;
  }
}

// --- Cross-Project Context / Inter-service Communication (Conceptual) ---
// While direct inter-service calls would typically be abstracted into `src/api/interServiceApi.js`,
// this section illustrates how the quiz service might conceptually interact or trigger
// actions relevant to other services in a larger interconnected system.

/*
// Example: If the quiz completion should notify a user dashboard or activity feed
// (e.g., in the 'Personalized Weather Dashboard' or 'Real-time Collaborative Whiteboard' context).
// This would require an import from `interServiceApi.js`
// import { notifyUserActivity } from './interServiceApi';

export async function completeQuizAndNotify(userId, quizId, score, answers) {
  try {
    // First, submit the quiz results to the quiz service backend
    const quizResult = await submitQuizResults(userId, quizId, score, answers);

    // Then, if successful, notify other relevant services about this user activity.
    // This could be for a shared activity feed, achievement system, or analytics.
    // The `notifyUserActivity` function would be defined in `interServiceApi.js`
    // and handle the actual API call to the respective notification/activity service.
    // await notifyUserActivity(userId, 'quiz_completed', { quizId, score, categoryId: answers[0]?.categoryId });

    return quizResult;
  } catch (error) {
    console.error('quizApi: Error during quiz completion and notification process:', error.message);
    throw error;
  }
}
*/
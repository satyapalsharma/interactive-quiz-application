import axios from 'axios';

/**
 * Configuration for base URLs of other microservices.
 * These URLs should be defined in your environment variables (e.g., .env.development, .env.production).
 * Using `REACT_APP_` prefix for Create React App compatibility.
 * Fallback to localhost for development if environment variables are not set.
 */
const USER_SERVICE_BASE_URL = process.env.REACT_APP_USER_SERVICE_BASE_URL || 'http://localhost:3001/api/v1';
const ECOMMERCE_SERVICE_BASE_URL = process.env.REACT_APP_ECOMMERCE_SERVICE_BASE_URL || 'http://localhost:3002/api/v1';
const ANALYTICS_SERVICE_BASE_URL = process.env.REACT_APP_ANALYTICS_SERVICE_BASE_URL || 'http://localhost:3003/api/v1';
// Note: Personal Finance Tracker might expose a specific endpoint for rewards/points
// or it could be integrated via the User Service. For this example, we'll route
// points awarding through the User Service as it often manages user-centric data.

/**
 * Axios instance for the User Service.
 * This service might handle user profiles, preferences, authentication, and potentially
 * integration with the Personal Finance Tracker for rewards/points.
 */
const userService = axios.create({
  baseURL: USER_SERVICE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // In a real application, you would dynamically add an Authorization header here
    // e.g., 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  },
});

/**
 * Axios instance for the E-commerce Product Catalog Service.
 * Used for fetching product recommendations based on quiz outcomes or user interests.
 */
const ecommerceService = axios.create({
  baseURL: ECOMMERCE_SERVICE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Axios instance for a generic Analytics Service.
 * This service is responsible for logging user activities, quiz completions, scores,
 * and other engagement metrics. This data could potentially feed into a Personalized Weather Dashboard
 * for location-based engagement analysis, or the Personal Finance Tracker for behavioral insights.
 */
const analyticsService = axios.create({
  baseURL: ANALYTICS_SERVICE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches user preferences from the User Service.
 * These preferences could influence quiz difficulty, preferred categories,
 * or personalized content delivery within the quiz application.
 *
 * @param {string} userId - The unique identifier of the user.
 * @returns {Promise<object>} A promise that resolves with the user preferences object.
 * @throws {Error} If the API call fails.
 */
export const fetchUserPreferences = async (userId) => {
  try {
    const response = await userService.get(`/users/${userId}/preferences`);
    return response.data;
  } catch (error) {
    console.error(`[InterServiceAPI] Error fetching user preferences for user ${userId}:`, error.response?.data || error.message);
    throw new Error(`Failed to fetch user preferences: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Logs a quiz activity event to the Analytics Service.
 * This function is crucial for tracking user engagement, quiz completion rates,
 * scores, and other behavioral data.
 *
 * @param {string} userId - The unique identifier of the user.
 * @param {object} activityData - An object containing details about the activity.
 *   Example: `{ quizId: 'quiz-123', category: 'Science', score: 85, duration: 300 }`
 * @returns {Promise<object>} A promise that resolves with the response from the analytics service.
 * @throws {Error} If the API call fails.
 */
export const logQuizActivity = async (userId, activityData) => {
  try {
    const response = await analyticsService.post(`/activity-logs`, {
      userId,
      eventType: 'QUIZ_COMPLETION', // Specific event type for quiz activities
      timestamp: new Date().toISOString(),
      sourceApplication: 'Interactive Quiz Application',
      ...activityData,
    });
    return response.data;
  } catch (error) {
    console.error(`[InterServiceAPI] Error logging quiz activity for user ${userId}:`, error.response?.data || error.message);
    throw new Error(`Failed to log quiz activity: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Fetches product recommendations from the E-commerce Product Catalog service.
 * This can be used to suggest products related to quiz topics,
 * or based on a user's performance/interests derived from quizzes.
 *
 * @param {string} category - The category to base recommendations on (e.g., 'Technology', 'History').
 * @param {string} [userId] - Optional user ID for personalized recommendations.
 * @returns {Promise<Array<object>>} A promise that resolves with an array of product objects.
 * @throws {Error} If the API call fails.
 */
export const fetchProductRecommendations = async (category, userId = null) => {
  try {
    const params = { category };
    if (userId) {
      params.userId = userId; // For personalized recommendations
    }
    const response = await ecommerceService.get(`/products/recommendations`, { params });
    return response.data;
  } catch (error) {
    console.error(`[InterServiceAPI] Error fetching product recommendations for category "${category}":`, error.response?.data || error.message);
    throw new Error(`Failed to fetch product recommendations: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Awards points to a user, potentially integrating with a Personal Finance Tracker
 * or a dedicated Rewards Management system (often part of a User Service).
 * This function simulates rewarding users for quiz achievements.
 *
 * @param {string} userId - The unique identifier of the user to award points to.
 * @param {number} points - The number of points to award.
 * @param {string} reason - The reason for awarding points (e.g., 'quiz_completion', 'high_score').
 * @returns {Promise<object>} A promise that resolves with the response from the service.
 * @throws {Error} If the API call fails.
 */
export const awardPointsToUser = async (userId, points, reason) => {
  try {
    // Assuming the User Service has an endpoint to manage user points/rewards.
    // In a more complex setup, this might be a dedicated Rewards Microservice
    // or a direct integration with the Personal Finance Tracker.
    const response = await userService.post(`/users/${userId}/award-points`, {
      points,
      reason,
      sourceApplication: 'Interactive Quiz Application',
      timestamp: new Date().toISOString(),
    });
    return response.data;
  } catch (error) {
    console.error(`[InterServiceAPI] Error awarding points to user ${userId}:`, error.response?.data || error.message);
    throw new Error(`Failed to award points: ${error.response?.data?.message || error.message}`);
  }
};

// --- Potential Future Integrations (Examples) ---

/**
 * Placeholder for creating a collaborative quiz session, potentially interacting
 * with a Real-time Collaborative Whiteboard service if quizzes involve shared
 * whiteboards for team answers or brainstorming.
 *
 * export const createCollaborativeQuizSession = async (quizId, hostId) => {
 *   try {
 *     // Example: Call to a Collaborative Whiteboard service
 *     // const response = await whiteboardService.post('/sessions', { quizId
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizContext } from '../context/QuizContext';
import QuizCard from '../components/QuizCard';
import * as quizApi from '../api/quizApi';
import * as interServiceApi from '../api/interServiceApi'; // For cross-project interactions
import '../App.css'; // Assuming general styles are in App.css, or create QuizPage.css

/**
 * QuizPage Component
 *
 * This component orchestrates the display and progression of a quiz.
 * It fetches questions, manages the current question state, handles user answers,
 * tracks the score, and displays results upon completion.
 * It interacts with the QuizContext for global state management (e.g., selected category, difficulty, score).
 */
function QuizPage() {
  const navigate = useNavigate();
  const { quizState, dispatch } = useContext(QuizContext);
  const { selectedCategory, selectedDifficulty, questions, score } = quizState;

  // Local state for managing quiz flow
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false); // To prevent multiple submissions/selections
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  /**
   * Fetches quiz questions from the API based on selected category and difficulty.
   * Dispatches the fetched questions to the QuizContext.
   */
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedCategory || !selectedDifficulty) {
        // If no category/difficulty is selected, redirect to home or category selection
        navigate('/');
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const fetchedQuestions = await quizApi.getQuizQuestions(
          selectedCategory,
          selectedDifficulty
        );
        dispatch({ type: 'SET_QUESTIONS', payload: fetchedQuestions });
        setCurrentQuestionIndex(0); // Reset for a new quiz
        setSelectedAnswer(null);
        setIsAnswerSubmitted(false);
        setQuizCompleted(false);
        dispatch({ type: 'RESET_SCORE' }); // Reset score for a new quiz
      } catch (err) {
        console.error('Failed to fetch quiz questions:', err);
        setError('Failed to load quiz questions. Please try again.');
        dispatch({ type: 'SET_QUESTIONS', payload: [] }); // Clear questions on error
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if questions are not already loaded or if category/difficulty changes
    if (questions.length === 0 || (quizState.lastFetchedCategory !== selectedCategory || quizState.lastFetchedDifficulty !== selectedDifficulty)) {
      fetchQuestions();
      dispatch({ type: 'SET_LAST_FETCHED_PARAMS', payload: { category: selectedCategory, difficulty: selectedDifficulty } });
    } else {
      setIsLoading(false); // If questions are already in context, no need to load
    }
  }, [selectedCategory, selectedDifficulty, dispatch, navigate, questions.length, quizState.lastFetchedCategory, quizState.lastFetchedDifficulty]);

  /**
   * Handles the selection of an answer for the current question.
   * @param {string} answer - The selected answer string.
   */
  const handleAnswerSelect = useCallback((answer) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(answer);
    }
  }, [isAnswerSubmitted]);

  /**
   * Submits the selected answer for the current question and moves to the next.
   * Updates the score in the QuizContext.
   */
  const handleSubmitAnswer = useCallback(() => {
    if (!selectedAnswer) {
      alert('Please select an answer before submitting.');
      return;
    }

    setIsAnswerSubmitted(true); // Prevent further selections/submissions for this question

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    dispatch({
      type: 'SUBMIT_ANSWER',
      payload: {
        questionId: currentQuestion.id,
        selectedAnswer,
        isCorrect,
      },
    });

    // Briefly show feedback or just move on
    setTimeout(() => {
      const nextQuestionIndex = currentQuestionIndex + 1;
      if (nextQuestionIndex < questions.length) {
        setCurrentQuestionIndex(nextQuestionIndex);
        setSelectedAnswer(null); // Reset selected answer for the next question
        setIsAnswerSubmitted(false); // Allow selection for the next question
      } else {
        setQuizCompleted(true);
        // Optionally, submit final score to an external service
        submitFinalScore(score + (isCorrect ? 1 : 0)); // Add current question's potential score
      }
    }, 500); // Short delay for visual feedback if needed
  }, [selectedAnswer, currentQuestionIndex, questions, dispatch, score]);

  /**
   * Submits the final quiz score to an inter-service API.
   * This simulates integration with other services like a user profile or gamification system.
   * @param {number} finalScore - The total score achieved in the quiz.
   */
  const submitFinalScore = async (finalScore) => {
    try {
      // Example: Update user profile with quiz score or log it for a finance tracker's rewards system
      await interServiceApi.submitQuizScore({
        userId: 'current_user_id', // In a real app, get this from auth context
        quizId: `${selectedCategory}-${selectedDifficulty}`,
        score: finalScore,
        totalQuestions: questions.length,
        timestamp: new Date().toISOString(),
      });
      console.log('Quiz score submitted successfully to inter-service API.');
      // Example: Update user's gamification points in a Personal Finance Tracker
      await interServiceApi.updateUserProfile({
        userId: 'current_user_id',
        gamificationPoints: finalScore * 10, // Award points based on score
        lastQuizCompleted: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to submit quiz score to inter-service API:', err);
      // Handle error, maybe show a message to the user
    }
  };

  /**
   * Handles restarting the quiz.
   * Resets all relevant state and navigates back to the category selection.
   */
  const handleRestartQuiz = useCallback(() => {
    dispatch({ type: 'RESET_QUIZ' });
    navigate('/'); // Go back to the home/category selection page
  }, [dispatch, navigate]);

  if (isLoading) {
    return (
      <div className="quiz-page-container loading-state">
        <p>Loading quiz questions...</p>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-page-container error-state">
        <p className="error-message">{error}</p>
        <button onClick={handleRestartQuiz} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (questions.length === 0 && !isLoading && !error) {
    return (
      <div className="quiz-page-container no-questions-state">
        <p>No questions found for the selected category and difficulty.</p>
        <button onClick={handleRestartQuiz} className="btn btn-primary">
          Choose Different Category
        </button>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="quiz-page-container quiz-completed-state">
        <h2>Quiz Completed!</h2>
        <p>
          You scored {score} out of {questions.length} questions.
        </p>
        <div className="quiz-summary">
          {quizState.answers.map((answer, index) => (
            <div key={index} className={`summary-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
              <p>
                <strong>Q{index + 1}:</strong> {questions[index].question}
              </p>
              <p>
                Your Answer: <em>{answer.selectedAnswer}</em>
              </p>
              <p>
                Correct Answer: <em>{questions[index].correctAnswer}</em>
              </p>
            </div>
          ))}
        </div>
        <button onClick={handleRestartQuiz} className="btn btn-primary mt-4">
          Start New Quiz
        </button>
        <button onClick={() => navigate('/')} className="btn btn-secondary mt-4 ml-2">
          Back to Categories
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="quiz-page-container">
      <h1 className="quiz-page-title">
        {selectedCategory} Quiz - {selectedDifficulty}
      </h1>
      <div className="quiz-progress">
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>
      <div className="quiz-score">Current Score: {score}</div>

      {currentQuestion && (
        <QuizCard
          question={currentQuestion.question}
          options={currentQuestion.options}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
          isAnswerSubmitted={isAnswerSubmitted}
          correctAnswer={currentQuestion.correctAnswer} // Pass for feedback after submission
        />
      )}

      <div className="quiz-navigation-buttons">
        <button
          onClick={handleSubmitAnswer}
          disabled={!selectedAnswer || isAnswerSubmitted}
          className="btn btn-primary"
        >
          {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Submit Answer'}
        </button>
      </div>
    </div>
  );
}

export default QuizPage;
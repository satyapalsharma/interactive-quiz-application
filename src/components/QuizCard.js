```javascript
import React from 'react';

/**
 * QuizCard Component
 *
 * Displays a single quiz question with its options. It handles user selection
 * and provides visual feedback based on correctness if feedback is enabled.
 * This component is designed to be "dumb" and receives all necessary data
 * and callbacks via props, making it highly reusable.
 *
 * Props:
 * - question: Object containing question details. Expected structure:
 *             { id: string, question: string, options: string[], correctAnswer: string }
 * - onAnswerSelect: Function to call when an option is selected.
 *                   Receives (questionId: string, selectedOption: string) as arguments.
 * - selectedAnswer: The answer previously selected by the user for this specific question.
 *                   Can be null or undefined if no answer has been selected yet.
 * - showFeedback: Boolean. If true, correctness feedback (correct/incorrect styling)
 *                 will be displayed for the options.
 * - isSubmitted: Boolean. If true, all options will be disabled, preventing further selection.
 */
const QuizCard = ({ question, onAnswerSelect, selectedAnswer, showFeedback, isSubmitted }) => {
  // Destructure question properties for easier access within the component.
  const { id, question: questionText, options, correctAnswer } = question;

  /**
   * Handles the click event on an answer option.
   * It prevents re-selection if the quiz has already been submitted.
   * Calls the `onAnswerSelect` prop with the question ID and the chosen option.
   *
   * @param {string} option - The text of the selected option.
   */
  const handleOptionClick = (option) => {
    // Only allow selection if the quiz is not yet submitted.
    if (!isSubmitted) {
      onAnswerSelect(id, option);
    }
  };

  /**
   * Determines the appropriate CSS class names for an option button based on its state.
   * This includes highlighting selected answers, showing correctness feedback,
   * and indicating disabled states.
   *
   * @param {string} option - The text of the option to evaluate.
   * @returns {string} A space-separated string of CSS class names.
   */
  const getOptionClassName = (option) => {
    let className = 'quiz-option';

    // Add 'selected' class if this option matches the user's selected answer.
    if (selectedAnswer === option) {
      className += ' selected';
    }

    // If feedback is enabled, apply 'correct' or 'incorrect' classes.
    if (showFeedback) {
      if (option === correctAnswer) {
        className += ' correct'; // Mark the globally correct answer.
      } else if (selectedAnswer === option && selectedAnswer !== correctAnswer) {
        className += ' incorrect'; // Mark the user's incorrect selection.
      }
    }

    // If the quiz is submitted, add a 'disabled' class for visual indication.
    if (isSubmitted) {
      className += ' disabled';
    }

    return className;
  };

  return (
    <div className="quiz-card">
      <h3 className="quiz-question">{questionText}</h3>
      <div className="quiz-options-container">
        {options.map((option, index) => (
          <button
            key={index} // Using index as key is acceptable here as options are static per question.
            className={getOptionClassName(option)}
            onClick={() => handleOptionClick(option)}
            disabled={isSubmitted} // Disable button interaction if quiz is submitted.
            aria-pressed={selectedAnswer === option} // ARIA attribute for accessibility, indicating selection state.
            aria-label={`Select option: ${option}`} // ARIA label for screen readers.
          >
            {option}
          </button>
        ))}
      </div>

      {/* Display feedback message after an answer is selected and feedback is enabled */}
      {showFeedback && selectedAnswer && (
        <div className="quiz-feedback-message" role="status" aria-live="polite">
          {selectedAnswer === correctAnswer ? (
            <p className="feedback-correct">Correct! Well done.</p>
          ) : (
            <p className="feedback-incorrect">
              Incorrect. The correct answer was: <strong>{correctAnswer}</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizCard;
```
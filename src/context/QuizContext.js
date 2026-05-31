```javascript
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { fetchQuizQuestions } from '../api/quizApi';
// import { logQuizEvent } from '../api/interServiceApi'; // For cross-service analytics/logging

/**
 * @typedef {Object} Question
 * @property {string} category
 * @property {string} type
 * @property {string} difficulty
 * @property {string} question
 * @property {string} correct_answer
 * @property {string[]} incorrect_answers
 * @property {string[]} all_answers - Combined correct and incorrect, shuffled
 */

/**
 * @typedef {Object} UserAnswer
 * @property {string} questionId - A
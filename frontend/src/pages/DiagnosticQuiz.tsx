import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './DiagnosticQuiz.scss';

const DiagnosticQuiz: React.FC = () => {
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    try {
      const response = await api.get('/diagnostic/English');
      setQuiz(response.data);
      setAnswers(new Array(response.data.questions.length).fill(-1));
    } catch (error) {
      console.error('Failed to load quiz', error);
      alert('Diagnostic quiz not available yet.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await api.post('/diagnostic/English/submit', { answers });
      setResult(response.data);
      await refreshUser();
    } catch (error) {
      console.error('Failed to submit quiz', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading quiz...</div>;
  }

  if (!quiz) {
    return (
      <div className="quiz-container">
        <div className="quiz-card">
          <img src="/logo-notext.png" alt="EduPlatform" className="quiz-logo" />
          <h1>Diagnostic Quiz Not Available</h1>
          <p>Please contact an administrator to set up the diagnostic quiz.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="quiz-container">
        <div className="quiz-card result-card">
          <img src="/logo-notext.png" alt="EduPlatform" className="quiz-logo" />
          <h1>Your Level: {result.level}</h1>
          <p className="result-message">
            Based on your performance, we recommend starting with {result.level} level courses.
          </p>

          <div className="scores">
            <div className="score-item">
              <span className="score-label">Beginner:</span>
              <span className="score-value">{result.scores.beginner}</span>
            </div>
            <div className="score-item">
              <span className="score-label">Intermediate:</span>
              <span className="score-value">{result.scores.intermediate}</span>
            </div>
            <div className="score-item">
              <span className="score-label">Advanced:</span>
              <span className="score-value">{result.scores.advanced}</span>
            </div>
          </div>

          <button onClick={() => navigate('/courses')} className="btn-primary">
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-card">
        <img src="/logo-notext.png" alt="EduPlatform" className="quiz-logo" />
        <h1>Diagnostic Quiz - English</h1>
        <p className="quiz-description">
          This quiz will help determine your current level and recommend appropriate courses.
        </p>

        <div className="questions">
          {quiz.questions.map((question: any, index: number) => (
            <div key={index} className="question">
              <h3>Question {index + 1}</h3>
              <p>{question.question}</p>
              <div className="options">
                {question.options.map((option: string, optIndex: number) => (
                  <label key={optIndex} className="option">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      checked={answers[index] === optIndex}
                      onChange={() => {
                        const newAnswers = [...answers];
                        newAnswers[index] = optIndex;
                        setAnswers(newAnswers);
                      }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="quiz-actions">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={answers.some(a => a === -1)}
          >
            Submit Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticQuiz;

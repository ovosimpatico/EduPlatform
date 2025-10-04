import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './CreateCourse.scss';

const CreateCourse: React.FC = () => {
  const navigate = useNavigate();
  const [course, setCourse] = useState({
    title: '',
    description: '',
    level: 'beginner',
    category: 'English',
    lessons: [{ title: '', content: '', order: 0 }],
    finalAssessment: {
      questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }],
      passingScore: 70,
    },
  });

  const addLesson = () => {
    setCourse({
      ...course,
      lessons: [...course.lessons, { title: '', content: '', order: course.lessons.length }],
    });
  };

  const updateLesson = (index: number, field: string, value: string) => {
    const newLessons = [...course.lessons];
    (newLessons[index] as any)[field] = value;
    setCourse({ ...course, lessons: newLessons });
  };

  const addQuestion = () => {
    setCourse({
      ...course,
      finalAssessment: {
        ...course.finalAssessment,
        questions: [
          ...course.finalAssessment.questions,
          { question: '', options: ['', '', '', ''], correctAnswer: 0 },
        ],
      },
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...course.finalAssessment.questions];
    (newQuestions[index] as any)[field] = value;
    setCourse({
      ...course,
      finalAssessment: { ...course.finalAssessment, questions: newQuestions },
    });
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...course.finalAssessment.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setCourse({
      ...course,
      finalAssessment: { ...course.finalAssessment, questions: newQuestions },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/courses', course);
      alert('Course created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create course');
    }
  };

  return (
    <div className="create-course">
      <div className="create-course-container">
        <h1>Create New Course</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Course Information</h2>

            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={course.title}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={course.description}
                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                required
                rows={4}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Level</label>
                <select
                  value={course.level}
                  onChange={(e) => setCourse({ ...course, level: e.target.value as any })}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={course.category}
                  onChange={(e) => setCourse({ ...course, category: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Lessons</h2>
            {course.lessons.map((lesson, index) => (
              <div key={index} className="lesson-form">
                <h3>Lesson {index + 1}</h3>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={lesson.title}
                    onChange={(e) => updateLesson(index, 'title', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Content</label>
                  <textarea
                    value={lesson.content}
                    onChange={(e) => updateLesson(index, 'content', e.target.value)}
                    required
                    rows={6}
                  />
                </div>
              </div>
            ))}
            <button type="button" onClick={addLesson} className="btn-add">
              + Add Lesson
            </button>
          </div>

          <div className="form-section">
            <h2>Final Assessment</h2>

            <div className="form-group">
              <label>Passing Score (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={course.finalAssessment.passingScore}
                onChange={(e) =>
                  setCourse({
                    ...course,
                    finalAssessment: {
                      ...course.finalAssessment,
                      passingScore: parseInt(e.target.value),
                    },
                  })
                }
                required
              />
            </div>

            {course.finalAssessment.questions.map((question, qIndex) => (
              <div key={qIndex} className="question-form">
                <h3>Question {qIndex + 1}</h3>
                <div className="form-group">
                  <label>Question</label>
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                    required
                  />
                </div>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="form-group">
                    <label>Option {oIndex + 1}</label>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      required
                    />
                  </div>
                ))}
                <div className="form-group">
                  <label>Correct Answer</label>
                  <select
                    value={question.correctAnswer}
                    onChange={(e) =>
                      updateQuestion(qIndex, 'correctAnswer', parseInt(e.target.value))
                    }
                  >
                    <option value={0}>Option 1</option>
                    <option value={1}>Option 2</option>
                    <option value={2}>Option 3</option>
                    <option value={3}>Option 4</option>
                  </select>
                </div>
              </div>
            ))}
            <button type="button" onClick={addQuestion} className="btn-add">
              + Add Question
            </button>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/dashboard')} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;

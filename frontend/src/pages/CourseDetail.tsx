import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './CourseDetail.scss';

const CourseDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [showAssessment, setShowAssessment] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const courseRes = await api.get(`/courses/${id}`);
      setCourse(courseRes.data);

      if (user?.role === 'student') {
        const enrollmentsRes = await api.get('/enrollments/my-courses');
        const userEnrollment = enrollmentsRes.data.find(
          (e: any) => e.course._id === id
        );
        if (userEnrollment) {
          setEnrollment(userEnrollment);
          setCurrentLesson(userEnrollment.progress.currentLesson);
        }
      }
    } catch (error) {
      console.error('Failed to load course', error);
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async () => {
    if (!enrollment) return;

    try {
      await api.put(`/enrollments/${enrollment._id}/progress`, {
        lessonId: currentLesson,
      });

      if (currentLesson < course.lessons.length - 1) {
        setCurrentLesson(currentLesson + 1);
      } else {
        setShowAssessment(true);
      }

      await loadData();
    } catch (error) {
      console.error('Failed to update progress', error);
    }
  };

  const submitAssessment = async () => {
    try {
      const response = await api.post(`/enrollments/${enrollment._id}/assessment`, {
        answers,
      });

      alert(
        `Assessment completed! Your score: ${response.data.score.toFixed(0)}%\n` +
        (response.data.passed ? 'Congratulations! You passed and earned a badge! 🏆' : 'Keep trying!')
      );

      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to submit assessment', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading course...</div>;
  }

  if (!course) {
    return <div className="loading">Course not found</div>;
  }

  const lesson = course.lessons[currentLesson];

  return (
    <div className="course-detail">
      <div className="course-sidebar">
        <h2>{course.title}</h2>
        <p className="course-meta">Level: {course.level}</p>
        <p className="course-meta">Category: {course.category}</p>

        <div className="lessons-list">
          <h3>Lessons</h3>
          {course.lessons.map((l: any, index: number) => (
            <div
              key={index}
              className={`lesson-item ${currentLesson === index ? 'active' : ''} ${
                enrollment?.progress.completedLessons.includes(index) ? 'completed' : ''
              }`}
              onClick={() => enrollment && setCurrentLesson(index)}
            >
              {enrollment?.progress.completedLessons.includes(index) && '✓ '}
              {l.title}
            </div>
          ))}
        </div>

        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Back to Dashboard
        </button>
      </div>

      <div className="course-main">
        {!enrollment && user?.role === 'student' ? (
          <div className="enrollment-prompt">
            <h2>Enroll to Start Learning</h2>
            <p>{course.description}</p>
            <button
              onClick={async () => {
                try {
                  await api.post('/enrollments', { courseId: id });
                  await loadData();
                } catch (error: any) {
                  alert(error.response?.data?.message || 'Failed to enroll');
                }
              }}
              className="btn-enroll"
            >
              Enroll Now
            </button>
          </div>
        ) : showAssessment ? (
          <div className="assessment">
            <h2>Final Assessment</h2>
            <p>Answer all questions to complete the course.</p>

            {course.finalAssessment.questions.map((q: any, index: number) => (
              <div key={index} className="question">
                <h3>Question {index + 1}</h3>
                <p>{q.question}</p>
                <div className="options">
                  {q.options.map((option: string, optIndex: number) => (
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

            <button
              onClick={submitAssessment}
              className="btn-submit"
              disabled={answers.length !== course.finalAssessment.questions.length}
            >
              Submit Assessment
            </button>
          </div>
        ) : enrollment ? (
          <div className="lesson-content">
            <h1>{lesson.title}</h1>
            <div className="content" dangerouslySetInnerHTML={{ __html: lesson.content }} />

            <button onClick={markLessonComplete} className="btn-complete">
              {currentLesson < course.lessons.length - 1
                ? 'Mark Complete & Continue'
                : 'Complete Lesson & Take Assessment'}
            </button>
          </div>
        ) : (
          <div className="course-overview">
            <h1>{course.title}</h1>
            <p>{course.description}</p>
            <p><strong>Teacher:</strong> {course.teacher?.name}</p>
            <p><strong>Lessons:</strong> {course.lessons.length}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;

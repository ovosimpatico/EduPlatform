import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Courses.scss';

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [filter, setFilter] = useState({ level: '', category: '' });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
  }, [filter]);

  const loadCourses = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.level) params.append('level', filter.level);
      if (filter.category) params.append('category', filter.category);

      const response = await api.get(`/courses?${params.toString()}`);
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to load courses', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      await api.post('/enrollments', { courseId });
      alert('Enrolled successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to enroll');
    }
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="courses-page">
      <div className="courses-header">
        <div className="header-brand">
          <img src="/logo-notext.png" alt="EduPlatform" className="header-logo" />
          <h1>Browse Courses</h1>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          ← Back to Dashboard
        </button>
      </div>

      <div className="filters">
        <select
          value={filter.level}
          onChange={(e) => setFilter({ ...filter, level: e.target.value })}
          className="filter-select"
        >
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <select
          value={filter.category}
          onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          className="filter-select"
        >
          <option value="">All Categories</option>
          <option value="English">English</option>
          <option value="Mathematics">Mathematics</option>
          <option value="Science">Science</option>
        </select>
      </div>

      <div className="courses-grid">
        {courses.length === 0 ? (
          <p>No courses available.</p>
        ) : (
          courses.map((course) => (
            <div key={course._id} className="course-card">
              <div className="course-header">
                <h2>{course.title}</h2>
                <span className={`level-badge ${course.level}`}>
                  {course.level}
                </span>
              </div>
              <p className="course-description">{course.description}</p>
              <p className="course-category">Category: {course.category}</p>
              <p className="course-teacher">By: {course.teacher?.name}</p>
              <p className="course-lessons">{course.lessons.length} lessons</p>

              <div className="course-actions">
                <button
                  onClick={() => navigate(`/course/${course._id}`)}
                  className="btn-view"
                >
                  View Details
                </button>
                {user?.role === 'student' && (
                  <button
                    onClick={() => handleEnroll(course._id)}
                    className="btn-enroll"
                  >
                    Enroll Now
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Courses;

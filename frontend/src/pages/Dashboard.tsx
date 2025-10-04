import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.scss';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (user?.role === 'student') {
          const [enrollmentsRes, badgesRes] = await Promise.all([
            api.get('/enrollments/my-courses'),
            api.get('/badges/my-badges'),
          ]);
          setEnrollments(enrollmentsRes.data);
          setBadges(badgesRes.data);
        }
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <h2>EduPlatform</h2>
        <div className="nav-links">
          <button onClick={() => navigate('/courses')}>Browse Courses</button>
          {user?.role === 'student' && !user?.level && (
            <button onClick={() => navigate('/diagnostic')} className="btn-highlight">
              Take Diagnostic Quiz
            </button>
          )}
          {user?.role === 'teacher' && (
            <button onClick={() => navigate('/create-course')}>Create Course</button>
          )}
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h1>Welcome back, {user?.name}!</h1>
          <p className="role-badge">{user?.role}</p>
          {user?.level && (
            <p className="level-badge">Level: {user.level}</p>
          )}
        </div>

        {user?.role === 'student' && (
          <>
            <section className="dashboard-section">
              <h2>My Courses</h2>
              {enrollments.length === 0 ? (
                <p>You haven't enrolled in any courses yet. <a href="/courses">Browse courses</a></p>
              ) : (
                <div className="courses-grid">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment._id} className="course-card">
                      <h3>{enrollment.course.title}</h3>
                      <p>{enrollment.course.description}</p>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${(enrollment.progress.completedLessons.length / enrollment.course.lessons.length) * 100}%`
                          }}
                        />
                      </div>
                      <p className="progress-text">
                        {enrollment.progress.completedLessons.length} / {enrollment.course.lessons.length} lessons completed
                      </p>
                      {enrollment.completed ? (
                        <span className="completed-badge">✓ Completed</span>
                      ) : (
                        <button onClick={() => navigate(`/course/${enrollment.course._id}`)}>
                          Continue Learning
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="dashboard-section">
              <h2>My Badges</h2>
              {badges.length === 0 ? (
                <p>Complete courses to earn badges!</p>
              ) : (
                <div className="badges-grid">
                  {badges.map((badge) => (
                    <div key={badge._id} className="badge-card">
                      <div className="badge-icon">🏆</div>
                      <h3>{badge.title}</h3>
                      <p>{badge.description}</p>
                      <small>{new Date(badge.issuedAt).toLocaleDateString()}</small>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {user?.role === 'teacher' && (
          <section className="dashboard-section">
            <h2>Course Management</h2>
            <p>Create and manage your courses from here.</p>
            <button className="btn-primary" onClick={() => navigate('/create-course')}>
              Create New Course
            </button>
          </section>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

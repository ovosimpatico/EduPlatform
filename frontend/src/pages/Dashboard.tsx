import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Trophy, GraduationCap, Plus, LogOut } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { EmptyState } from '@/components/empty-state';
import { PiBookOpenText, PiTrophy } from 'react-icons/pi';

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo-notext.png" alt="EduPlatform" className="h-10" />
              <h1 className="text-2xl font-bold text-primary">EduPlatform</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate('/courses')}>
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Courses
              </Button>
              {user?.role === 'student' && (
                <Button variant="default" onClick={() => navigate('/diagnostic-selection')}>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  {!user?.level ? 'Take Diagnostic Quiz' : 'Retake Diagnostic'}
                </Button>
              )}
              {user?.role === 'teacher' && (
                <>
                  <Button variant="default" onClick={() => navigate('/create-course')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Course
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/create-diagnostic-quiz')}>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Create Diagnostic Quiz
                  </Button>
                </>
              )}
              <ModeToggle />
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {user?.role}
            </Badge>
            {user?.level && (
              <Badge variant="default" className="text-sm">
                Level: {user.level}
              </Badge>
            )}
          </div>
        </div>

        {user?.role === 'student' && (
          <>
            {/* My Courses Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                My Courses
              </h3>
              {enrollments.length === 0 ? (
                <EmptyState
                  icon={<PiBookOpenText />}
                  title="No courses yet"
                  description="Start your learning journey by enrolling in a course that interests you."
                  action={{
                    label: 'Browse Courses',
                    onClick: () => navigate('/courses'),
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrollments.map((enrollment) => (
                    <Card key={enrollment._id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="line-clamp-1">{enrollment.course.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {enrollment.course.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                              {enrollment.progress.completedLessons.length} /{' '}
                              {enrollment.course.lessons.length} lessons
                            </span>
                          </div>
                          <Progress
                            value={
                              (enrollment.progress.completedLessons.length /
                                enrollment.course.lessons.length) *
                              100
                            }
                          />
                        </div>
                        {enrollment.completed ? (
                          <Badge variant="default" className="w-full justify-center">
                            ✓ Completed
                          </Badge>
                        ) : (
                          <Button
                            onClick={() => navigate(`/course/${enrollment.course._id}`)}
                            className="w-full"
                          >
                            Continue Learning
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <Separator className="my-8" />

            {/* My Badges Section */}
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="h-6 w-6" />
                My Badges
              </h3>
              {badges.length === 0 ? (
                <EmptyState
                  icon={<PiTrophy />}
                  title="No badges earned yet"
                  description="Complete courses and pass assessments to earn badges and show off your achievements!"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {badges.map((badge) => (
                    <Card key={badge._id} className="text-center hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6 space-y-3">
                        <div className="text-5xl">🏆</div>
                        <h4 className="font-semibold">{badge.title}</h4>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(badge.issuedAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {user?.role === 'teacher' && (
          <Card>
            <CardHeader>
              <CardTitle>Course Management</CardTitle>
              <CardDescription>Create and manage your courses from here.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/create-course')}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Course
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

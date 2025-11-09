import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Trophy, GraduationCap, Plus, Trash2, Eye, Settings } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { UserMenu } from '@/components/user-menu';
import { EmptyState } from '@/components/empty-state';
import { PiBookOpenText, PiTrophy } from 'react-icons/pi';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<any[]>([]);
  const [teacherQuizzes, setTeacherQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      if (user?.role === 'student') {
        const [enrollmentsRes, badgesRes] = await Promise.all([
          api.get('/enrollments/my-courses'),
          api.get('/badges/my-badges'),
        ]);
        // Filter out enrollments with null courses (deleted courses)
        const validEnrollments = enrollmentsRes.data.filter((e: any) => e.course !== null);
        setEnrollments(validEnrollments);
        setBadges(badgesRes.data);
      } else if (user?.role === 'teacher') {
        const [coursesRes, quizzesRes] = await Promise.all([
          api.get('/courses'),
          api.get('/diagnostic/my-quizzes'),
        ]);
        // Filter courses created by the current teacher
        // Use toString() for safe comparison between ObjectId and string
        const myCourses = coursesRes.data.filter((course: any) => {
          if (!course.teacher) return false;
          const teacherId = typeof course.teacher === 'object' ? course.teacher._id : course.teacher;
          return teacherId?.toString() === user.id?.toString();
        });
        setTeacherCourses(myCourses);
        setTeacherQuizzes(quizzesRes.data);
      }
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone and will affect all enrolled students.`)) {
      return;
    }

    try {
      await api.delete(`/courses/${courseId}`);
      alert('Course deleted successfully!');
      loadData(); // Reload the data
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete course');
    }
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
              <UserMenu />
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
          <>
            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                Meus Cursos
              </h3>
            {teacherCourses.length === 0 ? (
              <EmptyState
                icon={<PiBookOpenText />}
                title="No courses created yet"
                description="Start sharing your knowledge by creating your first course."
                action={{
                  label: 'Create Course',
                  onClick: () => navigate('/create-course'),
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teacherCourses.map((course) => (
                  <Card key={course._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {course.level}
                        </Badge>
                        <Badge variant="outline">{course.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {course.lessons.length} lessons
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/course/${course._id}`)}
                          className="flex-1"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="default"
                          onClick={() => navigate(`/course-management/${course._id}`)}
                          title="Gerenciar alunos"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteCourse(course._id, course.title)}
                          title="Delete course"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            </div>

            <Separator className="my-8" />

            <div>
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <GraduationCap className="h-6 w-6" />
                Minhas Provas Diagnósticas
              </h3>
              {teacherQuizzes.length === 0 ? (
                <EmptyState
                  icon={<PiBookOpenText />}
                  title="Nenhuma prova criada ainda"
                  description="Crie provas diagnósticas para avaliar o nível dos seus alunos."
                  action={{
                    label: 'Criar Prova',
                    onClick: () => navigate('/create-diagnostic-quiz'),
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teacherQuizzes.map((quiz) => (
                    <Card key={quiz._id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="line-clamp-1">{quiz.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {quiz.description || quiz.category}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{quiz.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {quiz.questions?.length || 0} questões
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            onClick={() => navigate(`/diagnostic-management/${quiz._id}`)}
                            className="flex-1"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Gerenciar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, BookOpen, Trash2, Settings, User } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { UserMenu } from '@/components/user-menu';
import { EmptyState } from '@/components/empty-state';
import { PiBookOpen } from 'react-icons/pi';

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [filter, setFilter] = useState({ level: 'all', category: 'all' });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
  }, [filter]);

  const loadCourses = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.level && filter.level !== 'all') params.append('level', filter.level);
      if (filter.category && filter.category !== 'all') params.append('category', filter.category);

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

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/courses/${courseId}`);
      alert('Course deleted successfully!');
      loadCourses(); // Reload the courses list
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete course');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo-notext.png" alt="EduPlatform" className="h-10" />
              <h1 className="text-2xl font-bold">Browse Courses</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <ModeToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <div className="w-full max-w-xs">
            <Select value={filter.level} onValueChange={(value) => setFilter({ ...filter, level: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full max-w-xs">
            <Select value={filter.category} onValueChange={(value) => setFilter({ ...filter, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <EmptyState
            icon={<PiBookOpen />}
            title="No courses found"
            description="There are no courses matching your filters. Try adjusting your search criteria or check back later for new courses."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course._id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <Badge variant="secondary" className="capitalize shrink-0">
                      {course.level}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-3">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="mr-2 h-4 w-4" />
                    {course.teacher?.name}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <BookOpen className="mr-2 h-4 w-4" />
                    {course.lessons.length} lessons
                  </div>
                  <Badge variant="outline" className="mt-2">
                    {course.category}
                  </Badge>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/course/${course._id}`)}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  {user?.role === 'student' && (
                    <Button
                      onClick={() => handleEnroll(course._id)}
                      className="flex-1"
                    >
                      Enroll Now
                    </Button>
                  )}
                  {user?.role === 'teacher' && course.teacher._id === user.id && (
                    <>
                      <Button
                        variant="default"
                        size="icon"
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
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;

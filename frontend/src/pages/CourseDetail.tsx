import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Check, BookOpen } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { LessonContent } from '@/components/lesson-content';

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Course not found</div>
      </div>
    );
  }

  const lesson = course.lessons[currentLesson];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-900 border-r flex flex-col">
        <div className="p-6 border-b">
          <img src="/logo-notext.png" alt="EduPlatform" className="h-10 mb-4" />
          <h2 className="text-xl font-bold mb-2">{course.title}</h2>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <Badge variant="outline" className="w-fit capitalize">
              {course.level}
            </Badge>
            <span>{course.category}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Lessons
          </h3>
          <div className="space-y-2">
            {course.lessons.map((l: any, index: number) => (
              <button
                key={index}
                onClick={() => enrollment && setCurrentLesson(index)}
                disabled={!enrollment}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  currentLesson === index
                    ? 'bg-primary text-primary-foreground border-primary'
                    : enrollment?.progress.completedLessons.includes(index)
                    ? 'bg-green-50 border-green-200'
                    : 'hover:bg-accent'
                }`}
              >
                <div className="flex items-start gap-2">
                  {enrollment?.progress.completedLessons.includes(index) && (
                    <Check className="h-4 w-4 shrink-0 mt-0.5 text-green-600" />
                  )}
                  <span className="text-sm line-clamp-2">{l.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t space-y-2">
          <div className="w-full flex justify-center">
            <ModeToggle />
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-8 py-8 max-w-4xl">
          {!enrollment && user?.role === 'student' ? (
            <Card>
              <CardHeader>
                <CardTitle>Enroll to Start Learning</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={async () => {
                    try {
                      await api.post('/enrollments', { courseId: id });
                      await loadData();
                    } catch (error: any) {
                      alert(error.response?.data?.message || 'Failed to enroll');
                    }
                  }}
                >
                  Enroll Now
                </Button>
              </CardContent>
            </Card>
          ) : showAssessment ? (
            <Card>
              <CardHeader>
                <CardTitle>Final Assessment</CardTitle>
                <CardDescription>Answer all questions to complete the course.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {course.finalAssessment.questions.map((q: any, index: number) => (
                  <div key={index} className="space-y-3">
                    <h3 className="font-semibold">Question {index + 1}</h3>
                    <p className="text-muted-foreground">{q.question}</p>
                    <RadioGroup
                      value={answers[index]?.toString()}
                      onValueChange={(value) => {
                        const newAnswers = [...answers];
                        newAnswers[index] = parseInt(value);
                        setAnswers(newAnswers);
                      }}
                    >
                      {q.options.map((option: string, optIndex: number) => (
                        <div key={optIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={optIndex.toString()} id={`q${index}-opt${optIndex}`} />
                          <Label htmlFor={`q${index}-opt${optIndex}`} className="cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {index < course.finalAssessment.questions.length - 1 && <Separator />}
                  </div>
                ))}
                <Button
                  onClick={submitAssessment}
                  disabled={answers.length !== course.finalAssessment.questions.length}
                  className="w-full"
                >
                  Submit Assessment
                </Button>
              </CardContent>
            </Card>
          ) : enrollment ? (
            <Card>
              <CardHeader>
                <CardTitle>{lesson.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <LessonContent content={lesson.content} />
                <Button onClick={markLessonComplete} className="w-full">
                  {currentLesson < course.lessons.length - 1
                    ? 'Mark Complete & Continue'
                    : 'Complete Lesson & Take Assessment'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Teacher:</strong> {course.teacher?.name}</p>
                <p><strong>Lessons:</strong> {course.lessons.length}</p>
                <Badge variant="outline">{course.category}</Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

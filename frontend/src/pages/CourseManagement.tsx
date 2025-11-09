import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Users, CheckCircle, XCircle, Calendar, TrendingUp } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { UserMenu } from '@/components/user-menu';

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface Enrollment {
  _id: string;
  student: Student;
  progress: {
    completedLessons: number[];
    currentLesson: number;
  };
  finalAssessmentScore?: number;
  finalAssessmentAnswers?: number[];
  completed: boolean;
  enrolledAt: string;
  completedAt?: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  lessons: any[];
  finalAssessment: {
    questions: {
      question: string;
      options: string[];
      correctAnswer: number;
    }[];
    passingScore: number;
  };
}

const CourseManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [courseRes, enrollmentsRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/enrollments/course/${id}`),
      ]);
      setCourse(courseRes.data);
      setEnrollments(enrollmentsRes.data);
    } catch (error) {
      console.error('Failed to load course data', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (enrollment: Enrollment) => {
    if (!course) return 0;
    return (enrollment.progress.completedLessons.length / course.lessons.length) * 100;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo-notext.png" alt="EduPlatform" className="h-10" />
              <div>
                <h1 className="text-2xl font-bold">{course.title}</h1>
                <p className="text-sm text-muted-foreground">Gerenciamento de Alunos</p>
              </div>
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
        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Alunos</p>
                  <p className="text-2xl font-bold">{enrollments.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Concluíram</p>
                  <p className="text-2xl font-bold">
                    {enrollments.filter(e => e.completed).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Em Andamento</p>
                  <p className="text-2xl font-bold">
                    {enrollments.filter(e => !e.completed).length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Média das Notas</p>
                  <p className="text-2xl font-bold">
                    {enrollments.filter(e => e.finalAssessmentScore).length > 0
                      ? (
                          enrollments
                            .filter(e => e.finalAssessmentScore)
                            .reduce((acc, e) => acc + (e.finalAssessmentScore || 0), 0) /
                          enrollments.filter(e => e.finalAssessmentScore).length
                        ).toFixed(0)
                      : '—'}
                    {enrollments.filter(e => e.finalAssessmentScore).length > 0 && '%'}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Students List */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Users className="h-6 w-6" />
              Alunos Matriculados
            </h2>

            {enrollments.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Nenhum aluno matriculado ainda.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enrollment) => (
                  <Card
                    key={enrollment._id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedStudent?._id === enrollment._id
                        ? 'ring-2 ring-primary'
                        : ''
                    }`}
                    onClick={() => setSelectedStudent(enrollment)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{enrollment.student.name}</CardTitle>
                          <CardDescription>{enrollment.student.email}</CardDescription>
                        </div>
                        {enrollment.completed ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Concluído
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Em Andamento</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Matriculado em: {formatDate(enrollment.enrolledAt)}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">
                            {enrollment.progress.completedLessons.length} /{' '}
                            {course.lessons.length} aulas
                          </span>
                        </div>
                        <Progress value={calculateProgress(enrollment)} />
                      </div>

                      {enrollment.finalAssessmentScore !== undefined && (
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm text-muted-foreground">Nota Final</span>
                          <Badge
                            variant={
                              enrollment.finalAssessmentScore >= course.finalAssessment.passingScore
                                ? 'default'
                                : 'destructive'
                            }
                          >
                            {enrollment.finalAssessmentScore.toFixed(0)}%
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Student Details */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Detalhes do Aluno
            </h2>

            {!selectedStudent ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Selecione um aluno para ver os detalhes
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Gerais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Nome</p>
                      <p className="font-medium">{selectedStudent.student.name}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedStudent.student.email}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Matrícula</p>
                      <p className="font-medium">{formatDate(selectedStudent.enrolledAt)}</p>
                    </div>
                    {selectedStudent.completedAt && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm text-muted-foreground">Data de Conclusão</p>
                          <p className="font-medium">{formatDate(selectedStudent.completedAt)}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Progresso das Aulas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {course.lessons.map((lesson, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded border"
                        >
                          <div className="flex items-center gap-2">
                            {selectedStudent.progress.completedLessons.includes(index) ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-300" />
                            )}
                            <span className="text-sm">{lesson.title}</span>
                          </div>
                          <Badge
                            variant={
                              selectedStudent.progress.completedLessons.includes(index)
                                ? 'default'
                                : 'outline'
                            }
                          >
                            {selectedStudent.progress.completedLessons.includes(index)
                              ? 'Concluída'
                              : 'Pendente'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {selectedStudent.finalAssessmentAnswers &&
                  selectedStudent.finalAssessmentAnswers.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Avaliação Final</CardTitle>
                        <CardDescription>
                          Nota: {selectedStudent.finalAssessmentScore?.toFixed(0)}% -{' '}
                          {selectedStudent.finalAssessmentScore! >=
                          course.finalAssessment.passingScore
                            ? 'Aprovado'
                            : 'Reprovado'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {course.finalAssessment.questions.map((question, index) => {
                            const studentAnswer = selectedStudent.finalAssessmentAnswers![index];
                            const isCorrect = studentAnswer === question.correctAnswer;

                            return (
                              <div
                                key={index}
                                className={`p-4 rounded-lg border-2 ${
                                  isCorrect
                                    ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                                    : 'border-red-200 bg-red-50 dark:bg-red-900/20'
                                }`}
                              >
                                <div className="flex items-start gap-2 mb-2">
                                  {isCorrect ? (
                                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                  )}
                                  <div className="flex-1">
                                    <p className="font-medium mb-2">
                                      Questão {index + 1}: {question.question}
                                    </p>
                                    <div className="space-y-1">
                                      {question.options.map((option, optIndex) => {
                                        const isStudentAnswer = studentAnswer === optIndex;
                                        const isCorrectAnswer = question.correctAnswer === optIndex;

                                        return (
                                          <div
                                            key={optIndex}
                                            className={`text-sm p-2 rounded ${
                                              isCorrectAnswer
                                                ? 'bg-green-100 dark:bg-green-800/30 font-medium'
                                                : isStudentAnswer
                                                ? 'bg-red-100 dark:bg-red-800/30'
                                                : ''
                                            }`}
                                          >
                                            {isCorrectAnswer && '✓ '}
                                            {isStudentAnswer && !isCorrectAnswer && '✗ '}
                                            {option}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;

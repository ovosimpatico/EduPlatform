import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Users, CheckCircle, XCircle, Calendar, TrendingUp, Award } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { UserMenu } from '@/components/user-menu';

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface DiagnosticResult {
  _id: string;
  student: Student;
  answers: number[];
  scores: {
    beginner: { correct: number; total: number };
    intermediate: { correct: number; total: number };
    advanced: { correct: number; total: number };
  };
  overallPercentage: number;
  determinedLevel: 'beginner' | 'intermediate' | 'advanced';
  completedAt: string;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface DiagnosticQuiz {
  _id: string;
  title: string;
  category: string;
  description?: string;
  questions: Question[];
  levelThresholds: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

const DiagnosticManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<DiagnosticQuiz | null>(null);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      // Busca o quiz com as respostas corretas (rota para professores) e os resultados
      const [quizRes, resultsRes] = await Promise.all([
        api.get(`/diagnostic/quiz/${id}/full`),
        api.get(`/diagnostic/quiz/${id}/results`),
      ]);
      setQuiz(quizRes.data);
      setResults(resultsRes.data);
    } catch (error) {
      console.error('Failed to load diagnostic data', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-yellow-500';
      case 'intermediate':
        return 'bg-blue-500';
      case 'advanced':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Iniciante';
      case 'intermediate':
        return 'Intermediário';
      case 'advanced':
        return 'Avançado';
      default:
        return level;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'intermediate':
        return 'text-blue-600 dark:text-blue-400';
      case 'advanced':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const calculateAverageScore = () => {
    if (results.length === 0) return 0;
    const sum = results.reduce((acc, r) => acc + r.overallPercentage, 0);
    return (sum / results.length).toFixed(1);
  };

  const getLevelDistribution = () => {
    const dist = { beginner: 0, intermediate: 0, advanced: 0 };
    results.forEach(r => dist[r.determinedLevel]++);
    return dist;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Diagnostic quiz not found</div>
      </div>
    );
  }

  const levelDist = getLevelDistribution();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo-notext.png" alt="EduPlatform" className="h-10" />
              <div>
                <h1 className="text-2xl font-bold">{quiz.title}</h1>
                <p className="text-sm text-muted-foreground">Resultados da Prova Diagnóstica</p>
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Alunos</p>
                  <p className="text-2xl font-bold">{results.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nota Média</p>
                  <p className="text-2xl font-bold">{calculateAverageScore()}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Distribuição de Níveis</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Iniciante:</span>
                    <span className="font-bold">{levelDist.beginner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Intermediário:</span>
                    <span className="font-bold">{levelDist.intermediate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avançado:</span>
                    <span className="font-bold">{levelDist.advanced}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Questões</p>
                  <p className="text-2xl font-bold">{quiz.questions.length}</p>
                </div>
                <Award className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Results List */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Users className="h-6 w-6" />
              Alunos que Fizeram a Prova
            </h2>

            {results.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Nenhum aluno fez esta prova ainda.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <Card
                    key={result._id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedResult?._id === result._id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedResult(result)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{result.student.name}</CardTitle>
                          <CardDescription>{result.student.email}</CardDescription>
                        </div>
                        <Badge className={getLevelColor(result.determinedLevel)}>
                          {getLevelLabel(result.determinedLevel)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Realizado em: {formatDate(result.completedAt)}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-muted rounded">
                          <p className="text-muted-foreground">Nota Geral</p>
                          <p className="font-bold text-lg">{result.overallPercentage.toFixed(1)}%</p>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <p className="text-muted-foreground">Acertos</p>
                          <p className="font-bold text-lg">
                            {result.answers.filter((ans, idx) =>
                              quiz.questions[idx] && ans === quiz.questions[idx].correctAnswer
                            ).length}/{quiz.questions.length}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-yellow-600">Iniciante:</span>
                          <span className="font-medium">
                            {result.scores.beginner.correct}/{result.scores.beginner.total}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">Intermediário:</span>
                          <span className="font-medium">
                            {result.scores.intermediate.correct}/{result.scores.intermediate.total}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-600">Avançado:</span>
                          <span className="font-medium">
                            {result.scores.advanced.correct}/{result.scores.advanced.total}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Result Details */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Detalhes das Respostas</h2>

            {!selectedResult ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Selecione um aluno para ver as respostas detalhadas
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
                      <p className="font-medium">{selectedResult.student.name}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedResult.student.email}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Realização</p>
                      <p className="font-medium">{formatDate(selectedResult.completedAt)}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Nível Determinado</p>
                      <Badge className={getLevelColor(selectedResult.determinedLevel)}>
                        {getLevelLabel(selectedResult.determinedLevel)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Respostas Detalhadas</CardTitle>
                    <CardDescription>
                      Nota: {selectedResult.overallPercentage.toFixed(1)}%
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {quiz.questions.map((question, index) => {
                        const studentAnswer = selectedResult.answers[index];
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
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="font-medium">
                                    Questão {index + 1}
                                  </p>
                                  <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                                    {getLevelLabel(question.difficulty)}
                                  </Badge>
                                </div>
                                <p className="text-sm mb-3">{question.question}</p>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticManagement;

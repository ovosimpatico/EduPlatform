import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GraduationCap, User, ArrowLeft, ChevronRight } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { EmptyState } from '@/components/empty-state';
import { PiExam } from 'react-icons/pi';

const DiagnosticQuizSelection: React.FC = () => {
  const [quizzes, setQuizzes] = useState<any>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const response = await api.get('/diagnostic/quizzes/all');
      setQuizzes(response.data);
    } catch (error) {
      console.error('Failed to load quizzes', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = Object.keys(quizzes);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading quizzes...</div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        <div className="w-full max-w-md">
          <EmptyState
            icon={<PiExam />}
            title="No Diagnostic Quizzes Available"
            description="There are no diagnostic quizzes available yet. Please check back later or contact a teacher."
            action={{
              label: 'Back to Dashboard',
              onClick: () => navigate('/dashboard'),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <img src="/logo-notext.png" alt="EduPlatform" className="h-16" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Diagnostic Quizzes</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Choose a quiz to assess your level and get personalized course recommendations
            </p>
          </div>
        </div>

        {!selectedCategory ? (
          /* Category Selection */
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Select an Area of Interest</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card
                  key={category}
                  className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
                  onClick={() => setSelectedCategory(category)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {category}
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </CardTitle>
                    <CardDescription>
                      {quizzes[category].length} quiz{quizzes[category].length !== 1 ? 'zes' : ''} available
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          /* Quiz Selection for Category */
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">{selectedCategory} Diagnostic Quizzes</h2>
              <Button variant="outline" onClick={() => setSelectedCategory(null)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Categories
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes[selectedCategory].map((quiz: any) => (
                <Card key={quiz._id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-xl">{quiz.title}</CardTitle>
                    {quiz.description && (
                      <CardDescription className="text-base">
                        {quiz.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="mr-2 h-4 w-4" />
                      Created by {quiz.teacher?.name || 'Unknown'}
                    </div>

                    <Separator />

                    <div>
                      <div className="text-sm font-semibold mb-2">Questions by Difficulty:</div>
                      <div className="flex gap-2 flex-wrap">
                        {['beginner', 'intermediate', 'advanced'].map((difficulty) => {
                          const count = quiz.questions?.filter(
                            (q: any) => q.difficulty === difficulty
                          ).length || 0;
                          return count > 0 ? (
                            <Badge key={difficulty} variant="outline" className="capitalize">
                              {difficulty}: {count}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold mb-2">Level Thresholds:</div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {quiz.levelThresholds && (
                          <>
                            <div>Beginner: ≥{quiz.levelThresholds.beginner}%</div>
                            <div>Intermediate: ≥{quiz.levelThresholds.intermediate}%</div>
                            <div>Advanced: ≥{quiz.levelThresholds.advanced}%</div>
                          </>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => navigate(`/diagnostic/${quiz._id}`)}
                      className="w-full"
                    >
                      Take This Quiz
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticQuizSelection;

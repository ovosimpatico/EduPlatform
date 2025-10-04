import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { GraduationCap, TrendingUp } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';
import { EmptyState } from '@/components/empty-state';
import { PiExam } from 'react-icons/pi';

const DiagnosticQuiz: React.FC = () => {
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    try {
      const response = await api.get('/diagnostic/English');
      setQuiz(response.data);
      setAnswers(new Array(response.data.questions.length).fill(-1));
    } catch (error) {
      console.error('Failed to load quiz', error);
      alert('Diagnostic quiz not available yet.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await api.post('/diagnostic/English/submit', { answers });
      setResult(response.data);
      await refreshUser();
    } catch (error) {
      console.error('Failed to submit quiz', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading quiz...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        <div className="w-full max-w-md">
          <EmptyState
            icon={<PiExam />}
            title="Diagnostic Quiz Not Available"
            description="The diagnostic quiz hasn't been set up yet. Please contact an administrator or check back later."
            action={{
              label: 'Back to Dashboard',
              onClick: () => navigate('/dashboard'),
            }}
          />
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src="/logo-notext.png" alt="EduPlatform" className="h-16" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <CardTitle className="text-3xl">Your Level: {result.level}</CardTitle>
            </div>
            <CardDescription>
              Based on your performance, we recommend starting with {result.level} level courses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <Badge variant="outline" className="w-full justify-center py-2">
                  Beginner
                </Badge>
                <div className="text-2xl font-bold">{result.scores.beginner}</div>
              </div>
              <div className="text-center space-y-2">
                <Badge variant="outline" className="w-full justify-center py-2">
                  Intermediate
                </Badge>
                <div className="text-2xl font-bold">{result.scores.intermediate}</div>
              </div>
              <div className="text-center space-y-2">
                <Badge variant="outline" className="w-full justify-center py-2">
                  Advanced
                </Badge>
                <div className="text-2xl font-bold">{result.scores.advanced}</div>
              </div>
            </div>

            <Separator />

            <Button onClick={() => navigate('/courses')} className="w-full">
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="container mx-auto py-8 max-w-3xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src="/logo-notext.png" alt="EduPlatform" className="h-16" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Diagnostic Quiz - English</CardTitle>
            </div>
            <CardDescription>
              This quiz will help determine your current level and recommend appropriate courses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {quiz.questions.map((question: any, index: number) => (
              <div key={index} className="space-y-3">
                <h3 className="font-semibold text-lg">Question {index + 1}</h3>
                <p className="text-muted-foreground">{question.question}</p>
                <RadioGroup
                  value={answers[index]?.toString()}
                  onValueChange={(value) => {
                    const newAnswers = [...answers];
                    newAnswers[index] = parseInt(value);
                    setAnswers(newAnswers);
                  }}
                >
                  {question.options.map((option: string, optIndex: number) => (
                    <div key={optIndex} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={optIndex.toString()}
                        id={`q${index}-opt${optIndex}`}
                      />
                      <Label htmlFor={`q${index}-opt${optIndex}`} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {index < quiz.questions.length - 1 && <Separator />}
              </div>
            ))}

            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={answers.some((a) => a === -1)}
                className="flex-1"
              >
                Submit Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DiagnosticQuiz;

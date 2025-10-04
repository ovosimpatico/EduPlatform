import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Plus, Trash2, GraduationCap } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const CreateDiagnosticQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState({
    title: '',
    category: '',
    description: '',
    questions: [] as Question[],
    levelThresholds: {
      beginner: 40,
      intermediate: 65,
      advanced: 85,
    },
  });
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          difficulty: 'beginner',
        },
      ],
    });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = quiz.questions.filter((_, i) => i !== index);
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...quiz.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...quiz.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!quiz.title || !quiz.category || quiz.questions.length === 0) {
      alert('Please fill in all required fields and add at least one question.');
      return;
    }

    // Validate questions
    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      if (!q.question || q.options.some(opt => !opt)) {
        alert(`Question ${i + 1} is incomplete. Please fill in all fields.`);
        return;
      }
    }

    setLoading(true);
    try {
      await api.post('/diagnostic', quiz);
      alert('Diagnostic quiz created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo-notext.png" alt="EduPlatform" className="h-16" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Create Diagnostic Quiz</h1>
          </div>
          <p className="text-muted-foreground">
            Create a quiz to assess student levels in your subject area
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Information</CardTitle>
              <CardDescription>Basic details about your diagnostic quiz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={quiz.title}
                  onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                  placeholder="e.g., English Grammar Diagnostic Test"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category/Subject *</Label>
                <Input
                  id="category"
                  value={quiz.category}
                  onChange={(e) => setQuiz({ ...quiz, category: e.target.value })}
                  placeholder="e.g., English, Math, Science"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={quiz.description}
                  onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                  placeholder="Describe what this quiz tests and what students can expect"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Level Thresholds */}
          <Card>
            <CardHeader>
              <CardTitle>Level Thresholds</CardTitle>
              <CardDescription>
                Set the minimum percentage scores required for each level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="threshold-beginner">Beginner (%)</Label>
                  <Input
                    id="threshold-beginner"
                    type="number"
                    min="0"
                    max="100"
                    value={quiz.levelThresholds.beginner}
                    onChange={(e) =>
                      setQuiz({
                        ...quiz,
                        levelThresholds: {
                          ...quiz.levelThresholds,
                          beginner: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threshold-intermediate">Intermediate (%)</Label>
                  <Input
                    id="threshold-intermediate"
                    type="number"
                    min="0"
                    max="100"
                    value={quiz.levelThresholds.intermediate}
                    onChange={(e) =>
                      setQuiz({
                        ...quiz,
                        levelThresholds: {
                          ...quiz.levelThresholds,
                          intermediate: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threshold-advanced">Advanced (%)</Label>
                  <Input
                    id="threshold-advanced"
                    type="number"
                    min="0"
                    max="100"
                    value={quiz.levelThresholds.advanced}
                    onChange={(e) =>
                      setQuiz({
                        ...quiz,
                        levelThresholds: {
                          ...quiz.levelThresholds,
                          advanced: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Students scoring at or above these percentages will be assigned the corresponding level.
              </p>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Questions</CardTitle>
              <CardDescription>Add questions to assess different difficulty levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {quiz.questions.map((question, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Question {index + 1}</h3>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Question Text</Label>
                    <Textarea
                      value={question.question}
                      onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                      placeholder="Enter your question"
                      rows={2}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Difficulty Level</Label>
                    <Select
                      value={question.difficulty}
                      onValueChange={(value) => updateQuestion(index, 'difficulty', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Answer Options</Label>
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${index}`}
                          checked={question.correctAnswer === optIndex}
                          onChange={() => updateQuestion(index, 'correctAnswer', optIndex)}
                          className="cursor-pointer"
                        />
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, optIndex, e.target.value)}
                          placeholder={`Option ${optIndex + 1}`}
                          required
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {question.correctAnswer === optIndex && '✓ Correct'}
                        </span>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">
                      Select the radio button to mark the correct answer
                    </p>
                  </div>

                  {index < quiz.questions.length - 1 && <Separator />}
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addQuestion} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Quiz'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDiagnosticQuiz;

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
import { ArrowLeft, Plus, X } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

const CreateCourse: React.FC = () => {
  const navigate = useNavigate();
  const [course, setCourse] = useState({
    title: '',
    description: '',
    level: 'beginner',
    category: 'English',
    lessons: [{ title: '', content: '', order: 0 }],
    finalAssessment: {
      questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }],
      passingScore: 70,
    },
  });

  const addLesson = () => {
    setCourse({
      ...course,
      lessons: [...course.lessons, { title: '', content: '', order: course.lessons.length }],
    });
  };

  const removeLesson = (index: number) => {
    if (course.lessons.length > 1) {
      setCourse({
        ...course,
        lessons: course.lessons.filter((_, i) => i !== index),
      });
    }
  };

  const updateLesson = (index: number, field: string, value: string) => {
    const newLessons = [...course.lessons];
    (newLessons[index] as any)[field] = value;
    setCourse({ ...course, lessons: newLessons });
  };

  const addQuestion = () => {
    setCourse({
      ...course,
      finalAssessment: {
        ...course.finalAssessment,
        questions: [
          ...course.finalAssessment.questions,
          { question: '', options: ['', '', '', ''], correctAnswer: 0 },
        ],
      },
    });
  };

  const removeQuestion = (index: number) => {
    if (course.finalAssessment.questions.length > 1) {
      setCourse({
        ...course,
        finalAssessment: {
          ...course.finalAssessment,
          questions: course.finalAssessment.questions.filter((_, i) => i !== index),
        },
      });
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...course.finalAssessment.questions];
    (newQuestions[index] as any)[field] = value;
    setCourse({
      ...course,
      finalAssessment: { ...course.finalAssessment, questions: newQuestions },
    });
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...course.finalAssessment.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setCourse({
      ...course,
      finalAssessment: { ...course.finalAssessment, questions: newQuestions },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/courses', course);
      alert('Course created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create course');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo-notext.png" alt="EduPlatform" className="h-10" />
              <h1 className="text-2xl font-bold">Create New Course</h1>
            </div>
            <ModeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Information */}
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>Basic details about your course</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={course.title}
                  onChange={(e) => setCourse({ ...course, title: e.target.value })}
                  required
                  placeholder="Enter course title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={course.description}
                  onChange={(e) => setCourse({ ...course, description: e.target.value })}
                  required
                  rows={4}
                  placeholder="Describe your course"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={course.level}
                    onValueChange={(value) => setCourse({ ...course, level: value as any })}
                  >
                    <SelectTrigger id="level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={course.category}
                    onChange={(e) => setCourse({ ...course, category: e.target.value })}
                    required
                    placeholder="e.g., English, Math"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lessons */}
          <Card>
            <CardHeader>
              <CardTitle>Lessons</CardTitle>
              <CardDescription>Add content for each lesson</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {course.lessons.map((lesson, index) => (
                <div key={index}>
                  {index > 0 && <Separator className="my-6" />}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Lesson {index + 1}</h3>
                      {course.lessons.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLesson(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`lesson-title-${index}`}>Title</Label>
                      <Input
                        id={`lesson-title-${index}`}
                        value={lesson.title}
                        onChange={(e) => updateLesson(index, 'title', e.target.value)}
                        required
                        placeholder="Lesson title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`lesson-content-${index}`}>Content</Label>
                      <Textarea
                        id={`lesson-content-${index}`}
                        value={lesson.content}
                        onChange={(e) => updateLesson(index, 'content', e.target.value)}
                        required
                        rows={6}
                        placeholder="Lesson content (HTML supported)"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addLesson} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Lesson
              </Button>
            </CardContent>
          </Card>

          {/* Final Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Final Assessment</CardTitle>
              <CardDescription>Create questions for the final assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={course.finalAssessment.passingScore}
                  onChange={(e) =>
                    setCourse({
                      ...course,
                      finalAssessment: {
                        ...course.finalAssessment,
                        passingScore: parseInt(e.target.value),
                      },
                    })
                  }
                  required
                />
              </div>

              <Separator />

              {course.finalAssessment.questions.map((question, qIndex) => (
                <div key={qIndex}>
                  {qIndex > 0 && <Separator className="my-6" />}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Question {qIndex + 1}</h3>
                      {course.finalAssessment.questions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(qIndex)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`question-${qIndex}`}>Question</Label>
                      <Input
                        id={`question-${qIndex}`}
                        value={question.question}
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                        required
                        placeholder="Enter question"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>Options</Label>
                      {question.options.map((option, oIndex) => (
                        <Input
                          key={oIndex}
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          required
                          placeholder={`Option ${oIndex + 1}`}
                        />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`correct-${qIndex}`}>Correct Answer</Label>
                      <Select
                        value={question.correctAnswer.toString()}
                        onValueChange={(value) =>
                          updateQuestion(qIndex, 'correctAnswer', parseInt(value))
                        }
                      >
                        <SelectTrigger id={`correct-${qIndex}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Option 1</SelectItem>
                          <SelectItem value="1">Option 2</SelectItem>
                          <SelectItem value="2">Option 3</SelectItem>
                          <SelectItem value="3">Option 4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addQuestion} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Course
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;

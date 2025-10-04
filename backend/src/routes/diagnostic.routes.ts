import { Router, Response } from 'express';
import DiagnosticQuiz from '../models/DiagnosticQuiz';
import User from '../models/User';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all diagnostic quizzes (grouped by category)
router.get('/quizzes/all', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quizzes = await DiagnosticQuiz.find()
      .populate('teacher', 'name')
      .select('-questions.correctAnswer')
      .sort({ category: 1, createdAt: -1 });

    // Group by category
    const grouped = quizzes.reduce((acc: any, quiz) => {
      if (!acc[quiz.category]) {
        acc[quiz.category] = [];
      }
      acc[quiz.category].push(quiz);
      return acc;
    }, {});

    res.json(grouped);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get diagnostic quiz by ID (for taking the quiz)
router.get('/quiz/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quiz = await DiagnosticQuiz.findById(req.params.id)
      .populate('teacher', 'name');

    if (!quiz) {
      res.status(404).json({ message: 'Diagnostic quiz not found' });
      return;
    }

    // Don't send correct answers to client
    const quizData = {
      _id: quiz._id,
      title: quiz.title,
      category: quiz.category,
      description: quiz.description,
      teacher: quiz.teacher,
      questions: quiz.questions.map(q => ({
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
      })),
    };

    res.json(quizData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Submit diagnostic quiz
router.post('/quiz/:id/submit', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { answers } = req.body;
    const quiz = await DiagnosticQuiz.findById(req.params.id);

    if (!quiz) {
      res.status(404).json({ message: 'Diagnostic quiz not found' });
      return;
    }

    // Calculate score by difficulty
    const scores = {
      beginner: { correct: 0, total: 0 },
      intermediate: { correct: 0, total: 0 },
      advanced: { correct: 0, total: 0 },
    };

    let totalCorrect = 0;
    quiz.questions.forEach((question, index) => {
      const difficulty = question.difficulty;
      scores[difficulty].total++;

      if (answers[index] === question.correctAnswer) {
        scores[difficulty].correct++;
        totalCorrect++;
      }
    });

    // Calculate overall percentage
    const overallPercentage = (totalCorrect / quiz.questions.length) * 100;

    // Determine level based on custom thresholds
    let level: 'beginner' | 'intermediate' | 'advanced' = 'beginner';

    if (overallPercentage >= quiz.levelThresholds.advanced) {
      level = 'advanced';
    } else if (overallPercentage >= quiz.levelThresholds.intermediate) {
      level = 'intermediate';
    } else if (overallPercentage >= quiz.levelThresholds.beginner) {
      level = 'beginner';
    }

    // Update user level
    await User.findByIdAndUpdate(req.user?._id, { level });

    res.json({
      level,
      overallPercentage: overallPercentage.toFixed(1),
      scores: {
        beginner: `${scores.beginner.correct}/${scores.beginner.total}`,
        intermediate: `${scores.intermediate.correct}/${scores.intermediate.total}`,
        advanced: `${scores.advanced.correct}/${scores.advanced.total}`,
      },
      thresholds: quiz.levelThresholds,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Create diagnostic quiz (teacher only)
router.post('/', authenticate, authorize('teacher'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, category, description, questions, levelThresholds } = req.body;

    const quiz = new DiagnosticQuiz({
      title,
      category,
      description,
      teacher: req.user?._id,
      questions,
      levelThresholds: levelThresholds || {
        beginner: 40,
        intermediate: 65,
        advanced: 85,
      },
    });

    await quiz.save();
    await quiz.populate('teacher', 'name');
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get quizzes created by the authenticated teacher
router.get('/my-quizzes', authenticate, authorize('teacher'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quizzes = await DiagnosticQuiz.find({ teacher: req.user?._id })
      .populate('teacher', 'name')
      .sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update diagnostic quiz (teacher only, own quizzes)
router.put('/:id', authenticate, authorize('teacher'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quiz = await DiagnosticQuiz.findById(req.params.id);

    if (!quiz) {
      res.status(404).json({ message: 'Diagnostic quiz not found' });
      return;
    }

    if (quiz.teacher.toString() !== (req.user as any)?._id.toString()) {
      res.status(403).json({ message: 'Not authorized to update this quiz' });
      return;
    }

    const { title, category, description, questions, levelThresholds } = req.body;

    quiz.title = title || quiz.title;
    quiz.category = category || quiz.category;
    quiz.description = description !== undefined ? description : quiz.description;
    quiz.questions = questions || quiz.questions;
    quiz.levelThresholds = levelThresholds || quiz.levelThresholds;

    await quiz.save();
    await quiz.populate('teacher', 'name');
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete diagnostic quiz (teacher only, own quizzes)
router.delete('/:id', authenticate, authorize('teacher'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quiz = await DiagnosticQuiz.findById(req.params.id);

    if (!quiz) {
      res.status(404).json({ message: 'Diagnostic quiz not found' });
      return;
    }

    if (quiz.teacher.toString() !== (req.user as any)?._id.toString()) {
      res.status(403).json({ message: 'Not authorized to delete this quiz' });
      return;
    }

    await quiz.deleteOne();
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;

import { Router, Response } from 'express';
import DiagnosticQuiz from '../models/DiagnosticQuiz';
import User from '../models/User';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Get diagnostic quiz by category
router.get('/:category', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const quiz = await DiagnosticQuiz.findOne({ category: req.params.category });

    if (!quiz) {
      res.status(404).json({ message: 'Diagnostic quiz not found' });
      return;
    }

    // Don't send correct answers to client
    const quizData = {
      _id: quiz._id,
      category: quiz.category,
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
router.post('/:category/submit', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { answers } = req.body;
    const quiz = await DiagnosticQuiz.findOne({ category: req.params.category });

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

    quiz.questions.forEach((question, index) => {
      const difficulty = question.difficulty;
      scores[difficulty].total++;

      if (answers[index] === question.correctAnswer) {
        scores[difficulty].correct++;
      }
    });

    // Determine level
    let level: 'beginner' | 'intermediate' | 'advanced' = 'beginner';

    const advancedPercentage = scores.advanced.total > 0
      ? (scores.advanced.correct / scores.advanced.total) * 100
      : 0;
    const intermediatePercentage = scores.intermediate.total > 0
      ? (scores.intermediate.correct / scores.intermediate.total) * 100
      : 0;
    const beginnerPercentage = scores.beginner.total > 0
      ? (scores.beginner.correct / scores.beginner.total) * 100
      : 0;

    if (advancedPercentage >= 70) {
      level = 'advanced';
    } else if (intermediatePercentage >= 70) {
      level = 'intermediate';
    } else {
      level = 'beginner';
    }

    // Update user level
    await User.findByIdAndUpdate(req.user?._id, { level });

    res.json({
      level,
      scores: {
        beginner: `${scores.beginner.correct}/${scores.beginner.total}`,
        intermediate: `${scores.intermediate.correct}/${scores.intermediate.total}`,
        advanced: `${scores.advanced.correct}/${scores.advanced.total}`,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Create/Update diagnostic quiz (admin only)
router.post('/', authenticate, authorize('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, questions } = req.body;

    const existingQuiz = await DiagnosticQuiz.findOne({ category });

    if (existingQuiz) {
      existingQuiz.questions = questions;
      await existingQuiz.save();
      res.json(existingQuiz);
    } else {
      const quiz = new DiagnosticQuiz({ category, questions });
      await quiz.save();
      res.status(201).json(quiz);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;

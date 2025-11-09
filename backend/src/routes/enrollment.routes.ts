import { Router, Response } from 'express';
import Enrollment from '../models/Enrollment';
import Course from '../models/Course';
import Badge from '../models/Badge';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Enroll in a course
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user?._id,
      course: courseId,
    });

    if (existingEnrollment) {
      res.status(400).json({ message: 'Already enrolled in this course' });
      return;
    }

    const enrollment = new Enrollment({
      student: req.user?._id,
      course: courseId,
    });

    await enrollment.save();
    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get user's enrollments
router.get('/my-courses', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const enrollments = await Enrollment.find({ student: req.user?._id })
      .populate('course');

    // Filter out enrollments where course has been deleted
    const validEnrollments = enrollments.filter(e => e.course !== null);

    res.json(validEnrollments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get enrollments for a specific course (teachers only)
router.get('/course/:courseId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    // Check if course exists and user is the teacher
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Only the course teacher or admin can view enrollments
    if (course.teacher.toString() !== req.user?._id?.toString() && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const enrollments = await Enrollment.find({ course: courseId })
      .populate('student', 'name email')
      .sort({ enrolledAt: -1 });

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get enrollment by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('course')
      .populate('student', 'name email');

    if (!enrollment) {
      res.status(404).json({ message: 'Enrollment not found' });
      return;
    }

    // Check if user is the student or teacher/admin
    if (enrollment.student._id.toString() !== req.user?._id?.toString() &&
        req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update progress
router.put('/:id/progress', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.body;
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      res.status(404).json({ message: 'Enrollment not found' });
      return;
    }

    if (enrollment.student.toString() !== req.user?._id?.toString()) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    if (!enrollment.progress.completedLessons.includes(lessonId)) {
      enrollment.progress.completedLessons.push(lessonId);
      enrollment.progress.currentLesson = lessonId + 1;
      await enrollment.save();
    }

    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Submit final assessment
router.post('/:id/assessment', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { answers } = req.body;
    const enrollment = await Enrollment.findById(req.params.id).populate('course');

    if (!enrollment) {
      res.status(404).json({ message: 'Enrollment not found' });
      return;
    }

    if (enrollment.student.toString() !== req.user?._id?.toString()) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const course = enrollment.course as any;
    const questions = course.finalAssessment.questions;

    // Calculate score
    let correctAnswers = 0;
    questions.forEach((q: any, index: number) => {
      if (answers[index] === q.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / questions.length) * 100;
    enrollment.finalAssessmentScore = score;
    enrollment.finalAssessmentAnswers = answers;

    // Check if passed
    if (score >= course.finalAssessment.passingScore) {
      enrollment.completed = true;
      enrollment.completedAt = new Date();

      // Create badge
      const badge = new Badge({
        user: req.user?._id,
        course: course._id,
        title: `${course.title} Completion`,
        description: `Completed ${course.title} with ${score.toFixed(0)}% score`,
      });

      await badge.save();

      // Add badge to user
      await User.findByIdAndUpdate(req.user?._id, {
        $push: { badges: badge._id },
      });
    }

    await enrollment.save();

    res.json({
      score,
      passed: score >= course.finalAssessment.passingScore,
      enrollment,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;

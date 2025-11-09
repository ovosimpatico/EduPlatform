import { Router, Response } from 'express';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import Badge from '../models/Badge';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all courses
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { level, category } = req.query;
    const filter: any = {};

    if (level) filter.level = level;
    if (category) filter.category = category;

    const courses = await Course.find(filter).populate('teacher', 'name email');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get course by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id).populate('teacher', 'name email');

    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Create course (teachers only)
router.post('/', authenticate, authorize('teacher', 'admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, level, category, lessons, finalAssessment } = req.body;

    const course = new Course({
      title,
      description,
      level,
      category,
      teacher: req.user?._id,
      lessons,
      finalAssessment,
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update course
router.put('/:id', authenticate, authorize('teacher', 'admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Check if user is the teacher of the course or admin
    if (course.teacher.toString() !== req.user?._id?.toString() && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const { title, description, level, category, lessons, finalAssessment } = req.body;

    if (title) course.title = title;
    if (description) course.description = description;
    if (level) course.level = level;
    if (category) course.category = category;
    if (lessons) course.lessons = lessons;
    if (finalAssessment) course.finalAssessment = finalAssessment;

    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete course
router.delete('/:id', authenticate, authorize('teacher', 'admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    // Check if user is the teacher of the course or admin
    if (course.teacher.toString() !== req.user?._id?.toString() && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Delete all enrollments associated with this course
    await Enrollment.deleteMany({ course: req.params.id });

    // Delete all badges associated with this course
    await Badge.deleteMany({ course: req.params.id });

    // Delete the course
    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;

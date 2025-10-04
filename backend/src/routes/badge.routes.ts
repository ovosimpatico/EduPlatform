import { Router, Response } from 'express';
import Badge from '../models/Badge';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get user's badges
router.get('/my-badges', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const badges = await Badge.find({ user: req.user?._id })
      .populate('course', 'title level');

    res.json(badges);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get badge by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const badge = await Badge.findById(req.params.id)
      .populate('course', 'title level description')
      .populate('user', 'name email');

    if (!badge) {
      res.status(404).json({ message: 'Badge not found' });
      return;
    }

    res.json(badge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;

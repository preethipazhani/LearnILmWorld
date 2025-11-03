import express from 'express';
import Review from '../models/Review.js';
import User from '../models/User.js';
import Session from '../models/Session.js';
import Booking from '../models/Booking.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Create review (student only)
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can create reviews' });
    }

    const { sessionId, trainerId, bookingId, rating, comment } = req.body;

    // Verify session exists and is completed
    const session = await Session.findById(sessionId);
    if (!session || session.status !== 'completed') {
      return res.status(400).json({ message: 'Session must be completed to leave a review' });
    }

    // Verify student was part of this session
    if (!session.students.includes(req.user._id)) {
      return res.status(403).json({ message: 'You can only review sessions you attended' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      student: req.user._id,
      session: sessionId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this session' });
    }

    // Create review
    const review = new Review({
      student: req.user._id,
      trainer: trainerId,
      session: sessionId,
      booking: bookingId,
      rating,
      comment,
      studentName: req.user.name
    });

    await review.save();
    await review.populate(['student', 'trainer', 'session']);

    // Update trainer's average rating
    const trainerReviews = await Review.find({ trainer: trainerId });
    const averageRating = trainerReviews.reduce((sum, r) => sum + r.rating, 0) / trainerReviews.length;

    await User.findByIdAndUpdate(trainerId, {
      'stats.rating': Math.round(averageRating * 10) / 10,
      'profile.averageRating': Math.round(averageRating * 10) / 10
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get reviews for a trainer
router.get('/trainer/:trainerId', async (req, res) => {
  try {
    const reviews = await Review.find({ trainer: req.params.trainerId })
      .populate('student', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reviews by student
router.get('/my-reviews', authenticate, async (req, res) => {
  try {
    const reviews = await Review.find({ student: req.user._id })
      .populate('trainer', 'name')
      .populate('session', 'title')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get trainer's received reviews
router.get('/trainer-reviews', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'trainer') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const reviews = await Review.find({ trainer: req.user._id })
      .populate('student', 'name')
      .populate('session', 'title')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get review counts per trainer (for cards)
router.get('/counts', async (req, res) => {
  try {
    const counts = await Review.aggregate([
      { $group: { _id: '$trainer', count: { $sum: 1 } } }
    ])
    const result = {}
    counts.forEach(c => (result[c._id] = c.count))
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})


// Update review
router.put('/:id', authenticate, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own reviews' });
    }

    const { rating, comment } = req.body;
    review.rating = rating;
    review.comment = comment;

    await review.save();
    await review.populate(['student', 'trainer', 'session']);

    // Recalculate trainer's average rating
    const trainerReviews = await Review.find({ trainer: review.trainer._id });
    const averageRating = trainerReviews.reduce((sum, r) => sum + r.rating, 0) / trainerReviews.length;

    await User.findByIdAndUpdate(review.trainer._id, {
      'stats.rating': Math.round(averageRating * 10) / 10,
      'profile.averageRating': Math.round(averageRating * 10) / 10
    });

    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete review
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    const trainerId = review.trainer;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate trainer's average rating
    const trainerReviews = await Review.find({ trainer: trainerId });
    const averageRating = trainerReviews.length > 0
      ? trainerReviews.reduce((sum, r) => sum + r.rating, 0) / trainerReviews.length
      : 5.0;

    await User.findByIdAndUpdate(trainerId, {
      'stats.rating': Math.round(averageRating * 10) / 10,
      'profile.averageRating': Math.round(averageRating * 10) / 10
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
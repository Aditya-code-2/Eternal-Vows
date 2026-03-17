const express = require('express');
const { body, validationResult } = require('express-validator');
const Inquiry = require('../models/Inquiry');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/inquiries
router.post(
  '/',
  optionalAuth,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('eventDate').notEmpty().withMessage('Event date is required'),
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
    body('vendor').notEmpty().withMessage('Vendor ID is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
      const { vendor, name, email, phone, eventDate, eventType, guestCount, budget, message } = req.body;
      const inquiry = await Inquiry.create({
        user: req.user ? req.user._id : null,
        vendor,
        name,
        email,
        phone,
        eventDate,
        eventType,
        guestCount,
        budget,
        message,
      });
      await inquiry.populate('vendor', 'name category');
      res.status(201).json({ inquiry });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// GET /api/inquiries/my — user's inquiries
router.get('/my', protect, async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ user: req.user._id })
      .populate('vendor', 'name category coverImage city')
      .sort({ createdAt: -1 });
    res.json({ inquiries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

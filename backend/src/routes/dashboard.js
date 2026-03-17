const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Inquiry = require('../models/Inquiry');
const Vendor = require('../models/Vendor');

const router = express.Router();

// GET /api/dashboard/overview
router.get('/overview', protect, async (req, res) => {
  try {
    const [user, inquiries, savedVendors] = await Promise.all([
      User.findById(req.user._id).populate('savedVendors', 'name category coverImage city averageRating'),
      Inquiry.find({ user: req.user._id })
        .populate('vendor', 'name category coverImage city')
        .sort({ createdAt: -1 })
        .limit(5),
      User.findById(req.user._id).populate('savedVendors', 'name category coverImage city averageRating priceRange'),
    ]);

    const totalInquiries = await Inquiry.countDocuments({ user: req.user._id });
    const pendingInquiries = await Inquiry.countDocuments({ user: req.user._id, status: 'pending' });

    res.json({
      user,
      recentInquiries: inquiries,
      savedVendors: savedVendors.savedVendors,
      stats: {
        totalInquiries,
        pendingInquiries,
        savedVendors: user.savedVendors.length,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

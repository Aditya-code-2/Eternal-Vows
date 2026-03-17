const express = require('express');
const Vendor = require('../models/Vendor');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/vendors  — list with filters
router.get('/', async (req, res) => {
  try {
    const { category, city, search, featured, page = 1, limit = 12 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (featured === 'true') filter.featured = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [vendors, total] = await Promise.all([
      Vendor.find(filter).skip(skip).limit(Number(limit)).sort({ featured: -1, averageRating: -1 }),
      Vendor.countDocuments(filter),
    ]);

    res.json({
      vendors,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/vendors/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Vendor.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/vendors/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json({ vendor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/vendors/:id/reviews
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    const { rating, comment } = req.body;
    vendor.reviews.push({ user: req.user._id, userName: req.user.name, rating, comment });
    vendor.calculateAverageRating();
    await vendor.save();

    res.status(201).json({ vendor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/vendors/:id/save — toggle save
router.post('/:id/save', protect, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    const vendorId = req.params.id;
    const isSaved = user.savedVendors.includes(vendorId);

    if (isSaved) {
      user.savedVendors = user.savedVendors.filter((id) => id.toString() !== vendorId);
    } else {
      user.savedVendors.push(vendorId);
    }
    await user.save();
    res.json({ saved: !isSaved, savedVendors: user.savedVendors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

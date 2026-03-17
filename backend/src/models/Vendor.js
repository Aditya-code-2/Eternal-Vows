const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Photography',
        'Videography',
        'Catering',
        'Venue',
        'Florist',
        'Music & DJ',
        'Bridal Wear',
        'Decor',
        'Makeup & Beauty',
        'Wedding Planner',
        'Jewellery',
        'Transport',
      ],
    },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true },
    location: { type: String, required: true },
    city: { type: String, required: true },
    priceRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
    },
    coverImage: { type: String, required: true },
    gallery: [String],
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    website: String,
    instagram: String,
    tags: [String],
    featured: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    reviews: [reviewSchema],
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    servicesOffered: [String],
    yearsOfExperience: { type: Number, default: 0 },
    eventsCompleted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Calculate average rating on review save
vendorSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
    this.totalReviews = this.reviews.length;
  }
};

module.exports = mongoose.model('Vendor', vendorSchema);

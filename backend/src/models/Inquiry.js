const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    eventDate: { type: Date, required: true },
    eventType: {
      type: String,
      enum: ['Wedding', 'Engagement', 'Pre-Wedding', 'Reception', 'Other'],
      default: 'Wedding',
    },
    guestCount: { type: Number, default: 0 },
    budget: { type: String, default: '' },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'viewed', 'replied', 'closed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inquiry', inquirySchema);

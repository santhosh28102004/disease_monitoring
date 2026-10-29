const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    disease: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Disease',
      required: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
    },
    caseCount: {
      type: Number,
      required: true,
      default: 0,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'],
      default: 'ACTIVE',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);

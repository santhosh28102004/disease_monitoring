const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    disease: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Disease',
      required: true,
    },
    symptoms: {
      type: [String],
      required: true,
    },
    affectedPeople: {
      type: Number,
      required: true,
      min: 1,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    dateObserved: {
      type: Date,
      required: true,
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'ACTIVE', 'MONITORING', 'RESOLVED'],
      default: 'PENDING',
    },
    verificationNotes: {
      type: String,
      default: '',
    },
    followUpDate: {
      type: Date,
    },
    statusHistory: [{
      status: {
        type: String,
        enum: ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'ACTIVE', 'MONITORING', 'RESOLVED'],
        required: true,
      },
      notes: {
        type: String,
        default: '',
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);

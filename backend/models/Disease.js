const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema(
  {
    diseaseName: {
      type: String,
      required: [true, 'Disease name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['VIRAL', 'BACTERIAL', 'FUNGAL', 'PARASITIC', 'OTHER'],
      required: true,
    },
    symptoms: {
      type: [String],
      required: true,
    },
    prevention: {
      type: [String],
      required: true,
    },
    severityLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Disease', diseaseSchema);

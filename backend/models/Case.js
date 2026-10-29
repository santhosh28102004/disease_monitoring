const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema(
  {
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      required: true,
    },
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
    status: {
      type: String,
      enum: ['ACTIVE', 'MONITORING', 'RESOLVED'],
      default: 'ACTIVE',
    },
    observations: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Observation',
      default: [],
    },
    followUpDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Case', caseSchema);

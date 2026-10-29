const Case = require('../models/Case');
const Observation = require('../models/Observation');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');

exports.getAllCases = async (req, res, next) => {
  try {
    const { disease, location, status } = req.query;
    const filter = {};

    if (disease) filter.disease = disease;
    if (location) filter.location = location;
    if (status) filter.status = status;

    const cases = await Case.find(filter)
      .populate(['report', 'disease', 'location', 'observations']);

    res.json(cases);
  } catch (error) {
    next(error);
  }
};

exports.getCaseById = async (req, res, next) => {
  try {
    const caseData = await Case.findById(req.params.id)
      .populate(['report', 'disease', 'location', 'observations']);

    if (!caseData) {
      return res.status(404).json({ message: 'Case not found' });
    }

    res.json(caseData);
  } catch (error) {
    next(error);
  }
};

exports.updateCaseStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const normalizedStatus = String(status || '').toUpperCase();
    if (!['ACTIVE', 'MONITORING', 'RESOLVED'].includes(normalizedStatus)) {
      return res.status(400).json({ message: 'Status must be Active, Monitoring (acknowledged), or Resolved.' });
    }

    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: 'Case not found.' });

    caseData.status = normalizedStatus;
    await caseData.save();

    const reportStatus = normalizedStatus;
    const report = await Report.findById(caseData.report);
    if (!report) return res.status(404).json({ message: 'Linked report not found.' });
    const notes = typeof req.body.notes === 'string' ? req.body.notes.trim() : '';
    report.status = reportStatus;
    if (notes) report.verificationNotes = notes;
    report.statusHistory.push({
      status: reportStatus,
      notes: notes || `Case status changed to ${normalizedStatus === 'MONITORING' ? 'acknowledged' : normalizedStatus.toLowerCase()}.`,
      updatedBy: req.user.userId,
    });
    await report.save();

    await caseData.populate(['report', 'disease', 'location', 'observations']);
    await report.populate(['disease', 'location', 'reporter']);

    await AuditLog.create({
      user: req.user.userId,
      action: 'UPDATE_STATUS',
      entity: 'Case',
      entityId: req.params.id,
    });

    res.json({ message: 'Case status updated', case: caseData, report });
  } catch (error) {
    next(error);
  }
};

exports.deleteCase = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid case ID.' });
    }

    const caseData = await Case.findById(req.params.id);
    if (!caseData) return res.status(404).json({ message: 'Case not found.' });

    const report = await Report.findById(caseData.report);
    if (!report) return res.status(404).json({ message: 'Linked report not found.' });

    report.status = 'VERIFIED';
    const note = 'Case tracking was removed; the original report remains in report history.';
    report.verificationNotes = note;
    report.statusHistory.push({ status: 'VERIFIED', notes: note, updatedBy: req.user.userId });
    await report.save();
    await caseData.deleteOne();

    await AuditLog.create({
      user: req.user.userId,
      action: 'DELETE_CASE',
      entity: 'Case',
      entityId: caseData._id,
    });

    const populatedReport = await Report.findById(report._id).populate(['disease', 'location', 'reporter']);
    res.json({ message: 'Case tracking removed; the citizen report was kept.', report: populatedReport });
  } catch (error) {
    next(error);
  }
};

exports.addObservation = async (req, res, next) => {
  try {
    const { observation, notes, followUpDate } = req.body;

    const obs = new Observation({
      case: req.params.id,
      healthcareWorker: req.user.userId,
      observation,
      notes,
      followUpDate,
    });

    await obs.save();

    const caseData = await Case.findById(req.params.id);
    caseData.observations.push(obs._id);
    await caseData.save();

    await AuditLog.create({
      user: req.user.userId,
      action: 'ADD_OBSERVATION',
      entity: 'Case',
      entityId: req.params.id,
    });

    res.status(201).json({
      message: 'Observation added successfully',
      observation: obs,
    });
  } catch (error) {
    next(error);
  }
};

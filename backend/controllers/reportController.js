const Report = require('../models/Report');
const Case = require('../models/Case');
const Observation = require('../models/Observation');
const AuditLog = require('../models/AuditLog');
const Disease = require('../models/Disease');
const Location = require('../models/Location');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.createReport = async (req, res, next) => {
  try {
    const { disease, symptoms, affectedPeople, location, dateObserved, severity, description } = req.body;
    const diseaseName = typeof disease === 'string' ? disease.trim() : '';
    const area = typeof location === 'string' ? location.trim() : '';
    if (!diseaseName || !area) {
      return res.status(400).json({ message: 'Disease/symptom category and location are required.' });
    }

    let diseaseRecord = await Disease.findOne({
      diseaseName: new RegExp(`^${escapeRegExp(diseaseName)}$`, 'i'),
    });
    if (!diseaseRecord) {
      diseaseRecord = new Disease({
        diseaseName,
        description: 'Added from a user-submitted health report.',
        category: 'OTHER',
        symptoms: Array.isArray(symptoms) ? symptoms : [],
        prevention: [],
      });
      await diseaseRecord.save();
    }

    let locationRecord = await Location.findOne({
      area: new RegExp(`^${escapeRegExp(area)}$`, 'i'),
    });
    if (!locationRecord) {
      locationRecord = new Location({ area });
      await locationRecord.save();
    }

    const report = new Report({
      reporter: req.user.userId,
      disease: diseaseRecord._id,
      symptoms,
      affectedPeople,
      location: locationRecord._id,
      dateObserved,
      severity,
      description,
      status: 'PENDING',
      statusHistory: [{ status: 'PENDING', notes: 'Report submitted.' }],
    });

    await report.save();
    await report.populate(['disease', 'location', 'reporter']);

    await AuditLog.create({
      user: req.user.userId,
      action: 'CREATE',
      entity: 'Report',
      entityId: report._id,
    });

    res.status(201).json({
      message: 'Report submitted successfully',
      report,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllReports = async (req, res, next) => {
  try {
    const { disease, location, severity, status, search } = req.query;
    const filter = {};

    if (disease) filter.disease = disease;
    if (location) filter.location = location;
    if (severity) filter.severity = severity;
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .populate(['disease', 'location', 'reporter'])
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    next(error);
  }
};

exports.getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id).populate(['disease', 'location', 'reporter']);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    next(error);
  }
};

exports.getUserReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ reporter: req.user.userId })
      .populate(['disease', 'location', 'reporter'])
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    next(error);
  }
};

exports.updateReport = async (req, res, next) => {
  try {
    const { disease, location, symptoms } = req.body;
    if (typeof disease !== 'string' || !disease.trim()
      || typeof location !== 'string' || !location.trim()
      || !Array.isArray(symptoms) || symptoms.length === 0
      || symptoms.some((symptom) => typeof symptom !== 'string' || !symptom.trim())) {
      return res.status(400).json({ message: 'Disease, location, and at least one symptom are required.' });
    }

    const [diseaseRecord, locationRecord] = await Promise.all([
      Disease.findOne({ diseaseName: new RegExp(`^${disease.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }),
      Location.findOne({ area: new RegExp(`^${location.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }),
    ]);
    if (!diseaseRecord) return res.status(400).json({ message: 'Selected disease was not found.' });
    if (!locationRecord) return res.status(400).json({ message: 'Selected location was not found.' });

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found.' });

    report.disease = diseaseRecord._id;
    report.location = locationRecord._id;
    report.symptoms = symptoms.map((symptom) => symptom.trim()).filter(Boolean);
    await report.save();
    await Case.updateMany(
      { report: report._id },
      { $set: { disease: diseaseRecord._id, location: locationRecord._id } }
    );
    await report.populate(['disease', 'location', 'reporter']);

    await AuditLog.create({
      user: req.user.userId,
      action: 'UPDATE',
      entity: 'Report',
      entityId: report._id,
    });

    res.json({ message: 'Report updated successfully.', report });
  } catch (error) {
    next(error);
  }
};

exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found.' });

    const linkedCases = await Case.find({ report: report._id }).select('_id');
    const caseIds = linkedCases.map((caseData) => caseData._id);
    if (caseIds.length > 0) {
      await Observation.deleteMany({ case: { $in: caseIds } });
      await Case.deleteMany({ _id: { $in: caseIds } });
    }
    await report.deleteOne();

    await AuditLog.create({
      user: req.user.userId,
      action: 'DELETE',
      entity: 'Report',
      entityId: report._id,
    });

    res.json({ message: 'Report and linked case tracking deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.verifyReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    report.status = 'VERIFIED';
    report.verificationNotes = req.body.verificationNotes ?? report.verificationNotes;
    report.followUpDate = req.body.followUpDate || undefined;
    report.statusHistory.push({
      status: 'VERIFIED',
      notes: req.body.verificationNotes ?? '',
      updatedBy: req.user.userId,
    });
    await report.save();
    await Case.findOneAndUpdate(
      { report: report._id },
      { $setOnInsert: { report: report._id, disease: report.disease, location: report.location, status: 'ACTIVE' } },
      { upsert: true, new: true }
    );
    await report.populate(['disease', 'location', 'reporter']);

    await AuditLog.create({
      user: req.user.userId,
      action: 'VERIFY',
      entity: 'Report',
      entityId: req.params.id,
    });

    res.json({ message: 'Report verified successfully', report });
  } catch (error) {
    next(error);
  }
};

exports.rejectReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    report.status = 'REJECTED';
    report.verificationNotes = req.body.verificationNotes ?? report.verificationNotes;
    report.statusHistory.push({
      status: 'REJECTED',
      notes: req.body.verificationNotes ?? '',
      updatedBy: req.user.userId,
    });
    await report.save();
    await report.populate(['disease', 'location', 'reporter']);

    await AuditLog.create({
      user: req.user.userId,
      action: 'REJECT',
      entity: 'Report',
      entityId: req.params.id,
    });

    res.json({ message: 'Report rejected', report });
  } catch (error) {
    next(error);
  }
};

exports.updateReportStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const normalizedStatus = String(status || '').toUpperCase().replace(/ /g, '_');
    const allowedStatuses = ['UNDER_REVIEW', 'VERIFIED', 'REJECTED'];
    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ message: 'Status must be Under Review, Verified, or Rejected.' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found.' });

    report.status = normalizedStatus;
    report.verificationNotes = req.body.verificationNotes ?? report.verificationNotes;
    report.followUpDate = req.body.followUpDate || undefined;
    report.statusHistory.push({
      status: normalizedStatus,
      notes: req.body.verificationNotes ?? '',
      updatedBy: req.user.userId,
    });
    await report.save();

    if (normalizedStatus === 'VERIFIED') {
      await Case.findOneAndUpdate(
        { report: report._id },
        {
          $setOnInsert: {
            report: report._id,
            disease: report.disease,
            location: report.location,
            status: 'ACTIVE',
          },
        },
        { upsert: true, new: true }
      );
    }

    const populatedReport = await Report.findById(report._id).populate(['disease', 'location', 'reporter']);

    await AuditLog.create({
      user: req.user.userId,
      action: 'UPDATE_STATUS',
      entity: 'Report',
      entityId: req.params.id,
    });

    res.json({ message: 'Report status updated', report: populatedReport });
  } catch (error) {
    next(error);
  }
};

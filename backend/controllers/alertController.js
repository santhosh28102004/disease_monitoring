const Alert = require('../models/Alert');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');

exports.getAllAlerts = async (req, res, next) => {
  try {
    const { disease, location, riskLevel, status } = req.query;
    const filter = {};

    if (disease) filter.disease = disease;
    if (location) filter.location = location;
    if (riskLevel) filter.riskLevel = riskLevel;
    if (status) filter.status = status;

    const alerts = await Alert.find(filter)
      .populate(['disease', 'location', 'createdBy'])
      .sort({ createdAt: -1 });

    res.json(alerts);
  } catch (error) {
    next(error);
  }
};

exports.getAlertById = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate(['disease', 'location', 'createdBy']);

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json(alert);
  } catch (error) {
    next(error);
  }
};

exports.createAlert = async (req, res, next) => {
  try {
    const { disease, location, riskLevel, caseCount, message } = req.body;

    const alert = new Alert({
      disease,
      location,
      riskLevel,
      caseCount,
      message,
      status: 'ACTIVE',
      createdBy: req.user.userId,
    });

    await alert.save();
    await alert.populate(['disease', 'location', 'createdBy']);

    await AuditLog.create({
      user: req.user.userId,
      action: 'CREATE',
      entity: 'Alert',
      entityId: alert._id,
    });

    res.status(201).json({
      message: 'Alert created successfully',
      alert,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAlert = async (req, res, next) => {
  try {
    const { status, riskLevel, caseCount, message } = req.body;
    const updates = {};

    if (status) updates.status = status;
    if (riskLevel) updates.riskLevel = riskLevel;
    if (caseCount !== undefined) updates.caseCount = caseCount;
    if (message) updates.message = message;

    const alert = await Alert.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate(['disease', 'location', 'createdBy']);

    await AuditLog.create({
      user: req.user.userId,
      action: 'UPDATE',
      entity: 'Alert',
      entityId: req.params.id,
    });

    res.json({ message: 'Alert updated successfully', alert });
  } catch (error) {
    next(error);
  }
};

exports.deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      user: req.user.userId,
      action: 'DELETE',
      entity: 'Alert',
      entityId: req.params.id,
    });

    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.acknowledgeAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: 'ACKNOWLEDGED' },
      { new: true }
    ).populate(['disease', 'location', 'createdBy']);

    res.json({ message: 'Alert acknowledged', alert });
  } catch (error) {
    next(error);
  }
};

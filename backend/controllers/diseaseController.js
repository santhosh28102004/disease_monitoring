const Disease = require('../models/Disease');
const AuditLog = require('../models/AuditLog');

exports.getAllDiseases = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;

    const diseases = await Disease.find(filter);
    res.json(diseases);
  } catch (error) {
    next(error);
  }
};

exports.getDiseaseById = async (req, res, next) => {
  try {
    const disease = await Disease.findById(req.params.id);
    if (!disease) {
      return res.status(404).json({ message: 'Disease not found' });
    }

    res.json(disease);
  } catch (error) {
    next(error);
  }
};

exports.createDisease = async (req, res, next) => {
  try {
    const { diseaseName, description, category, symptoms, prevention, severityLevel, status } = req.body;

    const disease = new Disease({
      diseaseName,
      description,
      category,
      symptoms,
      prevention,
      severityLevel,
      status: status || 'ACTIVE',
    });

    await disease.save();

    await AuditLog.create({
      user: req.user.userId,
      action: 'CREATE',
      entity: 'Disease',
      entityId: disease._id,
    });

    res.status(201).json({
      message: 'Disease created successfully',
      disease,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateDisease = async (req, res, next) => {
  try {
    const { diseaseName, description, category, symptoms, prevention, severityLevel, status } = req.body;
    const updates = {};

    if (diseaseName) updates.diseaseName = diseaseName;
    if (description) updates.description = description;
    if (category) updates.category = category;
    if (symptoms) updates.symptoms = symptoms;
    if (prevention) updates.prevention = prevention;
    if (severityLevel) updates.severityLevel = severityLevel;
    if (status) updates.status = status;

    const disease = await Disease.findByIdAndUpdate(req.params.id, updates, { new: true });

    await AuditLog.create({
      user: req.user.userId,
      action: 'UPDATE',
      entity: 'Disease',
      entityId: req.params.id,
    });

    res.json({ message: 'Disease updated successfully', disease });
  } catch (error) {
    next(error);
  }
};

exports.deleteDisease = async (req, res, next) => {
  try {
    const disease = await Disease.findByIdAndDelete(req.params.id);
    if (!disease) {
      return res.status(404).json({ message: 'Disease not found' });
    }

    await AuditLog.create({
      user: req.user.userId,
      action: 'DELETE',
      entity: 'Disease',
      entityId: req.params.id,
    });

    res.json({ message: 'Disease deleted successfully' });
  } catch (error) {
    next(error);
  }
};

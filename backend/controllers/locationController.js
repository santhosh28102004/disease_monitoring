const Location = require('../models/Location');
const AuditLog = require('../models/AuditLog');

exports.getAllLocations = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) filter.status = status;

    const locations = await Location.find(filter);
    res.json(locations);
  } catch (error) {
    next(error);
  }
};

exports.getLocationById = async (req, res, next) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.json(location);
  } catch (error) {
    next(error);
  }
};

exports.createLocation = async (req, res, next) => {
  try {
    const { area, city, district, state } = req.body;

    const location = new Location({
      area,
      city,
      district,
      state,
    });

    await location.save();

    await AuditLog.create({
      user: req.user.userId,
      action: 'CREATE',
      entity: 'Location',
      entityId: location._id,
    });

    res.status(201).json({
      message: 'Location created successfully',
      location,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateLocation = async (req, res, next) => {
  try {
    const { area, city, district, state, status } = req.body;
    const updates = {};

    if (area) updates.area = area;
    if (city) updates.city = city;
    if (district) updates.district = district;
    if (state) updates.state = state;
    if (status) updates.status = status;

    const location = await Location.findByIdAndUpdate(req.params.id, updates, { new: true });

    await AuditLog.create({
      user: req.user.userId,
      action: 'UPDATE',
      entity: 'Location',
      entityId: req.params.id,
    });

    res.json({ message: 'Location updated successfully', location });
  } catch (error) {
    next(error);
  }
};

exports.deleteLocation = async (req, res, next) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    await AuditLog.create({
      user: req.user.userId,
      action: 'DELETE',
      entity: 'Location',
      entityId: req.params.id,
    });

    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    next(error);
  }
};

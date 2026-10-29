const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, location, isActive } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (location) filter.location = location;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter).populate('location');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('location');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { fullName, phone, location, role, isActive } = req.body;
    const updates = {};

    if (fullName) updates.fullName = fullName;
    if (phone) updates.phone = phone;
    if (location) updates.location = location;
    if (role) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('location');

    await AuditLog.create({
      user: req.user.userId,
      action: 'UPDATE',
      entity: 'User',
      entityId: req.params.id,
    });

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await AuditLog.create({
      user: req.user.userId,
      action: 'DELETE',
      entity: 'User',
      entityId: req.params.id,
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

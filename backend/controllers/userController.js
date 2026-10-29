const User = require('../models/User');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');

exports.getRegistrationOverview = async (req, res, next) => {
  try {
    const [users, reportCounts] = await Promise.all([
      User.find({ role: 'CITIZEN' })
        .select('fullName location')
        .populate({ path: 'location', select: 'area' })
        .sort({ fullName: 1 })
        .lean(),
      Report.aggregate([
        { $group: { _id: '$reporter', reportCount: { $sum: 1 } } },
      ]),
    ]);

    const reportsByUser = new Map(
      reportCounts.map((item) => [String(item._id), item.reportCount])
    );
    const userSummaries = users.map((user) => ({
      id: String(user._id),
      name: user.fullName,
      location: user.location?.area || 'Location not set',
      reportCount: reportsByUser.get(String(user._id)) || 0,
    }));
    const locationCounts = new Map();
    userSummaries.forEach((user) => {
      locationCounts.set(user.location, (locationCounts.get(user.location) || 0) + 1);
    });

    res.json({
      registeredUserCount: userSummaries.length,
      users: userSummaries,
      locations: Array.from(locationCounts, ([location, userCount]) => ({ location, userCount }))
        .sort((a, b) => a.location.localeCompare(b.location)),
    });
  } catch (error) {
    next(error);
  }
};

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
